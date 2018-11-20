import { ReactElement, Component } from 'react';
import {
  mount as baseMount,
  shallow as baseShallow,
  ReactWrapper,
  ShallowWrapper,
  MountRendererProps,
  ShallowRendererProps,
} from 'enzyme';
import { EnzymePlugins, GetTestObjects, GetOptions } from './Types';
import { executePlugins, patchUnmount } from './Utils';

export function createMount<P extends EnzymePlugins>(plugins: P) {
  type TestObjects<RW> = GetTestObjects<RW, P>;
  type Options = GetOptions<MountRendererProps, P>;

  function mount<C extends Component, P = C['props'], S = C['state']>(
    node: ReactElement<P>,
    options?: Options,
  ): TestObjects<ReactWrapper<P, S, C>>;
  function mount<P>(node: ReactElement<P>, options?: Options): TestObjects<ReactWrapper<P, any>>;
  function mount<P, S>(node: ReactElement<P>, options?: Options): TestObjects<ReactWrapper<P, S>> {
    const pluginResults = executePlugins(plugins, node, options || {});
    const component = baseMount(pluginResults.node, pluginResults.options);

    patchUnmount(pluginResults, component);

    return {
      ...(pluginResults.controllers as object),
      component,
    } as TestObjects<any>;
  }

  return mount;
}

export function createShallow<P extends EnzymePlugins>(plugins: P) {
  type TestObjects<SW> = GetTestObjects<SW, P>;
  type Options = GetOptions<ShallowRendererProps, P>;

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
    const component = baseShallow(pluginResults.node, pluginResults.options);

    patchUnmount(pluginResults, component);

    return {
      ...(pluginResults.controllers as object),
      component,
    } as TestObjects<any>;
  }

  return shallow;
}
