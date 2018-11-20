import { ReactElement } from 'react';
import { EnzymePlugin } from 'enzyme-context-utils';
import { ReactWrapper, ShallowWrapper } from 'enzyme';
import merge from 'lodash.merge';
import { EnzymePlugins, GetOptions, GetControllers } from './Types';

type UpdaterFns = NonNullable<ReturnType<EnzymePlugin<any, any>>['updater']>[];

type PluginReturns<P extends EnzymePlugins, O extends GetOptions<any, P>> = {
  node: ReactElement<any>;
  options: O;
  controllers: GetControllers<P>;
  updaters: UpdaterFns;
};

export function executePlugins<P extends EnzymePlugins, O extends GetOptions<any, P>>(
  plugins: P,
  node: ReactElement<any>,
  options: NonNullable<O>,
): PluginReturns<P, O> {
  type Controllers = GetControllers<P>;

  return Object.entries(plugins).reduce(
    (previous, [key, plugin]) => {
      const result = plugin(previous.node, options);

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
      options: (options || {}) as O,
      controllers: {} as Controllers,
      updaters: [] as UpdaterFns,
    },
  );
}

export function patchUnmount<
  PR extends PluginReturns<any, any>,
  W extends ReactWrapper | ShallowWrapper
>(pluginResults: PR, wrapper: W): void {
  const unmount = wrapper.unmount;
  const unmounters = pluginResults.updaters.map(updater => updater(wrapper));

  function patchedUnmount(this: W) {
    unmounters.forEach(unmounter => unmounter());
    return unmount.call(this);
  }

  wrapper.unmount = patchedUnmount;
}
