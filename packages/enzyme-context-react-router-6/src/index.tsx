import React, { useState, useLayoutEffect } from 'react';
import { EnzymePlugin, composeWrappingComponents } from 'enzyme-context-utils';
import { Router } from 'react-router';
import { createMemoryHistory, MemoryHistory, MemoryHistoryOptions } from 'history';

export type RouterPluginMountOptions = {
  routerConfig?: MemoryHistoryOptions;
};

export const routerContext: () => EnzymePlugin<RouterPluginMountOptions, MemoryHistory> = () => (
  node,
  options,
) => {
  const history = createMemoryHistory(options.routerConfig);
  const RouterContextProvider: React.FC = ({ children }) => {
    const [currentLocation, setCurrentLocation] = useState(history.location);

    useLayoutEffect(() => {
      const unlisten = history.listen(({ location }) => {
        setCurrentLocation(location);
      });
      return () => unlisten();
    }, []);

    return (
      <Router location={currentLocation} navigator={history}>
        {children}
      </Router>
    );
  };

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
