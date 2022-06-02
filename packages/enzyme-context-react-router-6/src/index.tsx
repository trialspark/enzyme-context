import React, { useState, useEffect } from 'react';
import { EnzymePlugin, composeWrappingComponents } from 'enzyme-context-utils';
import { Router } from 'react-router';
import { createMemoryHistory, Location, MemoryHistory, MemoryHistoryOptions } from 'history';

export type RouterPluginMountOptions = {
  routerConfig?: MemoryHistoryOptions;
  location?: Location | string;
};

export const routerContext: () => EnzymePlugin<RouterPluginMountOptions, MemoryHistory> = () => (
  node,
  options,
) => {
  const history = createMemoryHistory(options.routerConfig);
  const RouterContextProvider: React.FC = ({ children }) => {
    const [currentLocation, setCurrentLocation] = useState(options.location || history.location);

    useEffect(() => {
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
