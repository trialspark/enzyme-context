import React from 'react';
import { EnzymePlugin, getContextFromProvider } from 'enzyme-context-utils';
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
import ApolloClient from 'apollo-client';
import { SchemaLink } from 'apollo-link-schema';
import { MountRendererProps } from 'enzyme';
import { ApolloProvider } from 'react-apollo';
import { defaultMocks } from './Utils';

export type ApolloPluginConfig = {
  fragmentMatcher?: FragmentMatcherInterface;
  schema: IExecutableSchemaDefinition;
  defaultMocks?: IMocks;
};

export type ApolloPluginMountOptions = {
  apolloMocks?: IMocks;
};

export const apolloContext: (
  config: ApolloPluginConfig,
) => EnzymePlugin<ApolloPluginMountOptions, ApolloClient<NormalizedCacheObject>> = config => (
  node,
  options = {},
) => {
  const schema = makeExecutableSchema(config.schema);
  addMockFunctionsToSchema({
    schema,
    mocks: defaultMocks(options.apolloMocks || {}, config.defaultMocks || {}),
    preserveResolvers: true,
  });
  const client = new ApolloClient({
    link: new SchemaLink({ schema }),
    cache: new InMemoryCache({ fragmentMatcher: config.fragmentMatcher }),
  });
  const provider = (
    <ApolloProvider client={client}>
      <div />
    </ApolloProvider>
  );
  const context = getContextFromProvider(provider);
  const childContextTypes = (provider as React.CElement<any, any>).type.childContextTypes;

  return {
    node,
    controller: client,
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
  };
};
