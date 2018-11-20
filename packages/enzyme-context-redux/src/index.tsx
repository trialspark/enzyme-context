import React from 'react';
import { EnzymePlugin, ContextWatcher, bindContextToWrapper } from 'enzyme-context-utils';
import { Store, AnyAction } from 'redux';
import { Provider } from 'react-redux';
import { MountRendererProps } from 'enzyme';

export type ReduxPluginConfig<S extends Store = Store> = {
  createStore: () => S;
};

export type ReduxPluginMountOptions = {
  initialActions?: AnyAction[];
};

export const reduxContext: <S extends Store>(
  config: ReduxPluginConfig<S>,
) => EnzymePlugin<ReduxPluginMountOptions, S> = config => (node, options) => {
  const store = config.createStore();
  const context = new ContextWatcher(Watcher => (
    <Provider store={store}>
      <Watcher />
    </Provider>
  ));

  (options.initialActions || []).forEach(action => store.dispatch(action));

  return {
    node,
    controller: store,
    options: {
      ...options,
      context: {
        ...options.context,
        ...context.value,
      },
      childContextTypes: {
        ...(options as MountRendererProps).childContextTypes,
        ...(Provider as any).childContextTypes,
      },
    },
    updater: bindContextToWrapper(context),
  };
};
