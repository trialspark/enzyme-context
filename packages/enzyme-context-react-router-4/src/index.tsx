import React from 'react';
import { EnzymePlugin, composeWrappingComponents } from 'enzyme-context-utils';
import { Router } from 'react-router';
import { createMemoryHistory, MemoryHistory, MemoryHistoryBuildOptions } from 'history';

export type RouterPluginMountOptions = {
  routerConfig?: MemoryHistoryBuildOptions;
};

export const routerContext: () => EnzymePlugin<RouterPluginMountOptions, MemoryHistory> = () => (
  node,
  options,
) => {
  const history = createMemoryHistory(options.routerConfig);
  const RouterContextProvider: React.FC = ({ children }) => (
    <Router history={history}>{children}</Router>
  );

  return {
    node,
    controller: history,
    options: {
      wrappingComponent: composeWrappingComponents(
        options.wrappingComponent,
        RouterContextProvider,
      ),
    },
  };
};
