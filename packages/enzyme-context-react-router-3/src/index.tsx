import React from 'react';
import { EnzymePlugin, ContextWatcher, bindContextToWrapper } from 'enzyme-context-utils';
import { History, HistoryOptions, MemoryHistoryOptions } from 'history';
import { RouterContext, Router, Route, createMemoryHistory } from 'react-router';
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
        {/* Set path to "*" so that the Watcher component always renders */}
        {/* Cast to `any` because react-router v3 is using an older version of react types */}
        <Route path="*" component={Watcher as any} />
      </Router>
    ),
    RouterContext.childContextTypes,
  );

  return {
    node: wrapRoute(node, history),
    options: {
      context: {
        ...context.value,
      },
      childContextTypes: {
        ...RouterContext.childContextTypes,
      },
    },
    controller: history,
    updater: bindContextToWrapper(context),
  };
};
