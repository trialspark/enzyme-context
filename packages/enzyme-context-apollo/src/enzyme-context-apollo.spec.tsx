import React, { ReactElement } from 'react';
import gql from 'graphql-tag';
import { ReactWrapper, MountRendererProps } from 'enzyme';
import { createMount, GetContextWrapper, GetOptions } from 'enzyme-context';
import { makeExecutableSchema } from 'graphql-tools';
import { getIntrospectionQuery, execute, parse, IntrospectionQuery } from 'graphql';
import { IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';
import { Query } from 'react-apollo';
import { act } from 'react-dom/test-utils';
import { apolloContext } from '.';

const GraphQLSchema = gql`
  type Address {
    street: String!
    city: String!
    state: String!
    zip: String!
  }

  type Company {
    name: String!
    age: Int
  }

  type Query {
    address: Address!
    company: Company!
  }

  schema {
    query: Query
  }
`.loc.source.body;

const TestQuery = gql`
  query TestQuery {
    address {
      street
    }
    company {
      name
    }
  }
`;

const MyComponent: React.SFC = () => {
  return (
    <Query query={TestQuery}>
      {({ data }: any) => (
        <div>
          Street: {data && data.address && data.address.street}
          <br />
          Company: {data && data.company && data.company.name}
        </div>
      )}
    </Query>
  );
};

describe('enzyme-context-apollo', () => {
  let fragmentMatcher: IntrospectionFragmentMatcher;
  let mount: (
    node: ReactElement<any>,
    options?: GetOptions<MountRendererProps, Plugins>,
  ) => GetContextWrapper<ReactWrapper, Plugins>;
  let component: GetContextWrapper<ReactWrapper, Plugins>;

  type Plugins = {
    client: ReturnType<typeof apolloContext>;
  };

  const defaultCompanyResolver = () => ({
    name: 'TrialSpark',
    age: null,
  });
  const defaultAddressResolver = () => ({
    street: '45 West 11th',
    city: 'New York',
    state: 'NY',
    zip: '10011',
  });

  beforeEach(async () => {
    const introspectionQuery = getIntrospectionQuery();
    const introspectionResult = await execute<IntrospectionQuery>(
      makeExecutableSchema({ typeDefs: GraphQLSchema }),
      parse(introspectionQuery),
    );
    fragmentMatcher = new IntrospectionFragmentMatcher({
      introspectionQueryResultData: introspectionResult.data as any,
    });

    const _mount = createMount({
      client: apolloContext({
        fragmentMatcher,
        schema: {
          typeDefs: GraphQLSchema,
        },
        defaultMocks: {
          Query: () => ({
            address: defaultAddressResolver,
            company: defaultCompanyResolver,
          }),
        },
      }),
    });
    mount = _mount;
    component = mount(<MyComponent />);
    await act(async () => {
      await component.client.resetStore();
    });
  });

  it('exists', () => {
    expect(component.exists()).toBe(true);
    expect(component.text()).toContain('Street: 45 West 11th');
    expect(component.text()).toContain('Company: TrialSpark');
  });

  it('supports overriding the default mocks', async () => {
    component = mount(<MyComponent />, {
      apolloMocks: {
        Query: () => ({
          company: () => ({
            name: 'Cool Co.',
            age: null,
          }),
        }),
      },
    });
    await act(async () => {
      await component.client.resetStore();
    });
    expect(component.text()).toContain('Street: 45 West 11th');
    expect(component.text()).toContain('Company: Cool Co.');
  });

  it('returns the result of a custom resolver if the default resolver throws an error', async () => {
    const defaultResolverWithError = () => {
      throw new Error('Default mock not found!');
    };
    mount = createMount({
      client: apolloContext({
        fragmentMatcher,
        defaultMocks: {
          Query: () => ({
            address: defaultResolverWithError,
            company: defaultCompanyResolver,
          }),
        },
        schema: {
          typeDefs: GraphQLSchema,
        },
      }),
    });
    component = mount(<MyComponent />, {
      apolloMocks: {
        Query: () => ({
          address: () => ({
            street: '45 West 11th',
            city: 'New York',
            state: 'NY',
            zip: '10011',
          }),
        }),
      },
    });
    await act(async () => {
      await component.client.resetStore();
    });
    expect(component.text()).toContain('Street: 45 West 11th');
  });

  it('throws the error from the default resolver if there is no custom resolver', async () => {
    const errorMessage = 'Default mock not found!';
    const defaultResolverWithError = () => {
      throw new Error(errorMessage);
    };
    mount = createMount({
      client: apolloContext({
        fragmentMatcher,
        defaultMocks: {
          Query: () => ({
            address: defaultResolverWithError,
            company: defaultCompanyResolver,
          }),
        },
        schema: {
          typeDefs: GraphQLSchema,
        },
      }),
    });
    component = mount(<MyComponent />);
    await expect(
      act(async () => {
        await component.client.resetStore();
      }),
    ).rejects.toThrowError(errorMessage);
  });
});
