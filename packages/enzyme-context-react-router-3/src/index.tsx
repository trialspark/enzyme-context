import { EnzymePlugin } from 'enzyme-context-utils';
import { History, createMemoryHistory, HistoryOptions, MemoryHistoryOptions } from 'history';
import { RouterContext } from 'react-router';
import { MountRendererProps } from 'enzyme';
import { RouterContextListener, wrapRoute } from './Utils';

export interface RouterPluginMountOptions {
  routerConfig?: HistoryOptions & MemoryHistoryOptions;
}

export const routerContext: () => EnzymePlugin<RouterPluginMountOptions, History> = () => (
  node,
  options,
) => {
  const history = createMemoryHistory(options.routerConfig);
  const listener = new RouterContextListener(history);

  return {
    node: wrapRoute(node, history),
    options: {
      ...options,
      context: {
        ...options.context,
        ...listener.context,
      },
      childContextTypes: {
        ...(options as MountRendererProps).childContextTypes,
        ...RouterContext.childContextTypes,
      },
    },
    controller: history,
    updater: wrapper => {
      listener.on('contextUpdated', context => {
        wrapper.setContext(context);
      });

      return () => listener.destroy();
    },
  };
};
