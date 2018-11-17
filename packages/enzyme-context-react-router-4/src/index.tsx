import React, { cloneElement, Component } from 'react';
import { EnzymePlugin, getContextFromProvider } from 'enzyme-context-utils';
import { Router } from 'react-router';
import { createMemoryHistory, MemoryHistory, MemoryHistoryBuildOptions } from 'history';
import { render, unmountComponentAtNode } from 'react-dom';
import { MountRendererProps } from 'enzyme';

export type RouterPluginMountOptions = {
  routerConfig?: MemoryHistoryBuildOptions;
};

export const routerContext: () => EnzymePlugin<RouterPluginMountOptions, MemoryHistory> = () => (
  node,
  options = {},
) => {
  const history = createMemoryHistory(options.routerConfig);
  const provider = <Router history={history} />;
  const context = getContextFromProvider(provider);
  const childContextTypes = (provider as React.CElement<any, any>).type.childContextTypes;

  return {
    node,
    controller: history,
    options: {
      ...options,
      context: {
        ...options.context,
        ...context,
      },
      childContextTypes: {
        ...(options as MountRendererProps).childContextTypes,
        ...childContextTypes,
      },
    },
    updater: wrapper => {
      const root = document.createElement('div');

      class ContextListener extends Component {
        static contextTypes = childContextTypes;

        componentDidUpdate() {
          wrapper.setContext(this.context);
        }

        render() {
          return null;
        }
      }

      render(cloneElement(provider, undefined, <ContextListener />), root);

      return () => unmountComponentAtNode(root);
    },
  };
};
