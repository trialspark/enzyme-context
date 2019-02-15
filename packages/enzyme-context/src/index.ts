import { ReactElement, Component } from 'react';
import {
  mount as baseMount,
  shallow as baseShallow,
  ReactWrapper,
  ShallowWrapper,
  MountRendererProps,
  ShallowRendererProps,
} from 'enzyme';
import { EnzymePlugins, GetContextWrapper, GetOptions } from './Types';
import { executePlugins, hookIntoLifecycle, decorateEnzymeWrapper } from './Utils';

export { GetContextWrapper, GetOptions };

/**
 * Creates a specialized enzyme mount() function with context set up.
 *
 * @param plugins an object where the keys are names of your choice and the values are `enzyme-context` [`MountPlugin`](https://github.com/trialspark/enzyme-context/blob/007022a7bddb7e843a27563f7918276af2ebb707/packages/enzyme-context-utils/src/Types.ts#L4-L12)s.
 */
export function createMount<P extends EnzymePlugins>(plugins: P) {
  // The values returned are a function of the enzyme ReactWrapper and the supplied plugins
  type TestObjects<RW> = GetContextWrapper<RW, P>;
  // The options accepted are a function of the enzyme options and the supplied plugins
  type Options = GetOptions<MountRendererProps, P>;

  // These function signatures for mount are identical to those defined by enzyme
  function mount<C extends Component, P = C['props'], S = C['state']>(
    node: ReactElement<P>,
    options?: Options,
  ): TestObjects<ReactWrapper<P, S, C>>;
  function mount<P>(node: ReactElement<P>, options?: Options): TestObjects<ReactWrapper<P, any>>;
  function mount<P, S>(node: ReactElement<P>, options?: Options): TestObjects<ReactWrapper<P, S>> {
    const pluginResults = executePlugins(plugins, node, options || {});
    const component = baseMount(pluginResults.node, pluginResults.options) as TestObjects<
      ReactWrapper<any, any, any>
    >;

    hookIntoLifecycle(pluginResults, component);

    return decorateEnzymeWrapper(component, pluginResults);
  }

  return mount;
}

/**
 * Creates a specialized enzyme shallow() function with context set up.
 *
 * @param plugins an object where the keys are names of your choice and the values are `enzyme-context` [`MountPlugin`](https://github.com/trialspark/enzyme-context/blob/007022a7bddb7e843a27563f7918276af2ebb707/packages/enzyme-context-utils/src/Types.ts#L4-L12)s.
 */
export function createShallow<P extends EnzymePlugins>(plugins: P) {
  // The values returned are a function of the enzyme ShallowWrapper and the supplied plugins
  type TestObjects<SW> = GetContextWrapper<SW, P>;
  // The options accepted are a function of the enzyme options and the supplied plugins
  type Options = GetOptions<ShallowRendererProps, P>;

  // These function signatures for shallow are identical to those defined by enzyme
  function shallow<C extends Component, P = C['props'], S = C['state']>(
    node: ReactElement<P>,
    options?: Options,
  ): TestObjects<ShallowWrapper<P, S, C>>;
  function shallow<P>(
    node: ReactElement<P>,
    options?: Options,
  ): TestObjects<ShallowWrapper<P, any>>;
  function shallow<P, S>(
    node: ReactElement<P>,
    options?: Options,
  ): TestObjects<ShallowWrapper<P, S>> {
    const pluginResults = executePlugins(plugins, node, options || {});
    const component = baseShallow(pluginResults.node, pluginResults.options) as TestObjects<
      ShallowWrapper<any, any, any>
    >;

    hookIntoLifecycle(pluginResults, component);

    return decorateEnzymeWrapper(component, pluginResults);
  }

  return shallow;
}
