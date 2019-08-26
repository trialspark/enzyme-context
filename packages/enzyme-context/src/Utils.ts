import { ReactElement } from 'react';
import { EnzymePlugin } from 'enzyme-context-utils';
import { ReactWrapper, ShallowWrapper } from 'enzyme';
import once from 'once';
import merge from 'lodash.merge';
import { EnzymePlugins, GetOptions, GetControllers, GetContextWrapper } from './Types';

type UpdaterFns = NonNullable<ReturnType<EnzymePlugin<any, any>>['updater']>[];

type PluginReturns<P extends EnzymePlugins, O extends GetOptions<any, P>> = {
  node: ReactElement<any>;
  options: NonNullable<O>;
  controllers: GetControllers<P>;
  updaters: UpdaterFns;
};

/**
 * Call each plugin (enzyme-context plugins are functions) and aggregate each plugin's results
 * into a single object.
 *
 * @param plugins a mapping of user-supplied name to plugin
 * @param node the react element being mounted
 * @param options enzyme mount/shallow options (plus any additional plugin-defined options)
 */
export function executePlugins<P extends EnzymePlugins, O extends GetOptions<any, P>>(
  plugins: P,
  node: ReactElement<any>,
  options: NonNullable<O>,
): PluginReturns<P, O> {
  // The returned controller are a function of the supplied plugins
  type Controllers = GetControllers<P>;

  return Object.entries(plugins).reduce(
    (previous, [key, plugin]) => {
      const result = plugin(previous.node, previous.options);

      return {
        node: result.node,
        options: merge({}, previous.options, result.options),
        controllers: {
          ...(previous.controllers as object),
          [key]: result.controller,
        },
        updaters: previous.updaters.concat(result.updater ? [result.updater] : []),
      } as PluginReturns<P, O>;
    },
    {
      node,
      options,
      controllers: {} as Controllers,
      updaters: [] as UpdaterFns,
    },
  );
}

/**
 * Keeps track of `updater` functions of the plugins. Calls them on mount(). Calls the
 * unmounter functions they return on unmount.
 */
class LifecycleTracker {
  private unmounters: ReturnType<UpdaterFns[number]>[] = [];

  constructor(private wrapper: ReactWrapper | ShallowWrapper, private updaters: UpdaterFns) {}

  mount() {
    this.unmounters = this.updaters.map(updater => updater(this.wrapper));
  }

  unmount() {
    this.unmounters.forEach(unmounter => unmounter());
  }
}

/**
 * First, calls every plugin's [`updater` function](https://github.com/trialspark/enzyme-context/blob/aa66183f78eb3e80f8712d1aa8a2736307cabe02/docs/authoring-plugins.md#returns). Then, it patches the enzyme ReactWrapper/ShallowWrapper to call every plugin's unmount handler when unount() is called.
 *
 * @param pluginResults the data returned by calling `executePlugins`
 * @param wrapper an enzyme wrapper
 */
export function hookIntoLifecycle<
  PR extends PluginReturns<any, any>,
  W extends ReactWrapper | ShallowWrapper
>(pluginResults: PR, wrapper: W): void {
  const unmount = wrapper.unmount;
  const mount = wrapper instanceof ReactWrapper ? wrapper.mount : null;
  const lifecycle = new LifecycleTracker(wrapper, pluginResults.updaters);

  lifecycle.mount();

  /**
   * This function will replace enzyme's .unmount(). It calls the unmounter functions before
   * unmounting the enzyme wrapper.
   */
  function patchedUnmount(this: W) {
    const isMounted = this.exists();

    if (isMounted) {
      lifecycle.unmount();
    }

    // Call through to enzyme
    return unmount.call(this);
  }

  /**
   * This function will replace enzyme's .mount(). It calls the updater functions after
   * mounting the enzyme wrapper.
   */
  function patchedMount(this: ReactWrapper) {
    const wasUnmounted = !this.exists();
    // Call through to enzyme
    const result = mount!.call(this);

    if (wasUnmounted) {
      lifecycle.mount();
    }

    return result;
  }

  wrapper.unmount = patchedUnmount;

  if (wrapper instanceof ReactWrapper) {
    wrapper.mount = patchedMount;
  }
}

const warnAboutAccessingComponent = once(() => {
  /* tslint:disable no-console */
  console.warn(
    `
Accessing the \`component\` attribute of the object \`mount()\` and \`shallow()\`
returns is deprecated and will be removed in the next major release. Enzyme-Context
\`mount()\` and \`shallow()\` now return an enzyme wrapper instead of an object with
a \`component\` attribute.

Before:
  const { component, store, history } = mount(<MyComponent />);

After:
  const component = mount(<MyComponent />);
  component.store;
  component.history;
    `.trim(),
  );
});

/**
 * Adds all of the plugins' controllers as attributes of the Enzyme wrapper.
 * It also adds the deprecated `controller` attribute, but logs to tell the user
 * it is deprecated.
 *
 * @param wrapper The `ReactWrapper` or `ShallowWrapper` to decorate
 * @param plugins All the executed plugins
 */
export function decorateEnzymeWrapper<
  EW extends ReactWrapper<any, any, any> | ShallowWrapper<any, any, any>,
  P extends EnzymePlugins
>(wrapper: EW, plugins: PluginReturns<P, any>): GetContextWrapper<EW, P> {
  return Object.defineProperties(Object.assign(wrapper, plugins.controllers), {
    component: {
      get: () => {
        warnAboutAccessingComponent();
        return wrapper;
      },
    },
  });
}
