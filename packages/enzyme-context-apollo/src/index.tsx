import React from 'react';
import { EnzymePlugin, composeWrappingComponents } from 'enzyme-context-utils';
import {
  FragmentMatcherInterface,
  InMemoryCache,
  NormalizedCacheObject,
} from 'apollo-cache-inmemory';
import {
  makeExecutableSchema,
  IExecutableSchemaDefinition,
  IMocks,
  addMockFunctionsToSchema,
} from 'graphql-tools';
import ApolloClient, { DefaultOptions } from 'apollo-client';
import { SchemaLink } from 'apollo-link-schema';
import { ApolloProvider } from 'react-apollo';
import { defaultMocks } from 'enzyme-context-apollo-utils';

export type ApolloPluginConfig = {
  fragmentMatcher?: FragmentMatcherInterface;
  schema: IExecutableSchemaDefinition;
  defaultMocks?: IMocks;
  defaultOptions?: DefaultOptions;
};

export type ApolloPluginMountOptions = {
  apolloMocks?: IMocks;
};

export const apolloContext: (
  config: ApolloPluginConfig,
) => EnzymePlugin<ApolloPluginMountOptions, ApolloClient<NormalizedCacheObject>> = config => (
  node,
  options,
) => {
  const schema = makeExecutableSchema(config.schema);
  addMockFunctionsToSchema({
    schema,
    // Mocks passed at mount-time and config-time are merged together
    mocks: defaultMocks(options.apolloMocks || {}, config.defaultMocks || {}),
    preserveResolvers: true,
  });
  const client = new ApolloClient({
    link: new SchemaLink({ schema }),
    cache: new InMemoryCache({ fragmentMatcher: config.fragmentMatcher }),
    defaultOptions: config.defaultOptions,
  });
  const ApolloContextProvider: React.FC = ({ children }) => (
    <ApolloProvider client={client}>{children}</ApolloProvider>
  );

  return {
    node,
    controller: client,
    options: {
      wrappingComponent: composeWrappingComponents(
        options.wrappingComponent,
        ApolloContextProvider,
      ),
    },
  };
};
