import React from 'react';
import { EnzymePlugin, ContextWatcher, bindContextToWrapper } from 'enzyme-context-utils';
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
  const context = new ContextWatcher(Watcher => (
    <Router history={history}>
      <Watcher />
    </Router>
  ));

  return {
    node,
    controller: history,
    options: {
      context: {
        ...context.value,
      },
      childContextTypes: {
        ...(Router as any).childContextTypes,
      },
    },
    updater: bindContextToWrapper(context),
  };
};
