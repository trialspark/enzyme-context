import React from 'react';
import { EnzymePlugin, ContextWatcher, bindContextToWrapper } from 'enzyme-context-utils';
import { History, createMemoryHistory, HistoryOptions, MemoryHistoryOptions } from 'history';
import { RouterContext, Router, Route } from 'react-router';
import { MountRendererProps } from 'enzyme';
import { wrapRoute } from './Utils';

export interface RouterPluginMountOptions {
  routerConfig?: HistoryOptions & MemoryHistoryOptions;
}

export const routerContext: () => EnzymePlugin<RouterPluginMountOptions, History> = () => (
  node,
  options,
) => {
  const history = createMemoryHistory(options.routerConfig);
  const context = new ContextWatcher(
    Watcher => (
      <Router history={history}>
        <Route path="*" component={Watcher} />
      </Router>
    ),
    RouterContext.childContextTypes,
  );

  return {
    node: wrapRoute(node, history),
    options: {
      ...options,
      context: {
        ...options.context,
        ...context.value,
      },
      childContextTypes: {
        ...(options as MountRendererProps).childContextTypes,
        ...RouterContext.childContextTypes,
      },
    },
    controller: history,
    updater: bindContextToWrapper(context),
  };
};
