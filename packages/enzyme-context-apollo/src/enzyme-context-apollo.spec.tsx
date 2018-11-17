import React from 'react';
import gql from 'graphql-tag';
import { ReactWrapper } from 'enzyme';
import { createMount } from 'enzyme-context';
import { makeExecutableSchema } from 'graphql-tools';
import { getIntrospectionQuery, execute, parse, IntrospectionQuery } from 'graphql';
import { IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { Query } from 'react-apollo';
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
      {({ data }) => (
        <div>
          Street: {data && data.address && data.address.street}
          <br />
          Company: {data && data.company && data.company.name}
        </div>
      )}
    </Query>
  );
};

const introspectionJSON = describe('enzyme-context-apollo', () => {
  let mount: ReturnType<typeof createMount>;
  let component: ReactWrapper;
  let client: ApolloClient<any>;

  beforeEach(async () => {
    const introspectionQuery = getIntrospectionQuery();
    const introspectionResult = await execute<IntrospectionQuery>(
      makeExecutableSchema({ typeDefs: GraphQLSchema }),
      parse(introspectionQuery),
    );
    const fragmentMatcher = new IntrospectionFragmentMatcher({
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
            address: () => ({
              street: '45 West 11th',
              city: 'New York',
              state: 'NY',
              zip: '10011',
            }),
            company: () => ({
              name: 'TrialSpark',
              age: null,
            }),
          }),
        },
      }),
    });
    mount = _mount;
    ({ component, client } = mount(<MyComponent />));
    await client.resetStore();
    component.update();
  });

  it('exists', () => {
    expect(component.exists()).toBe(true);
    expect(component.text()).toContain('Street: 45 West 11th');
    expect(component.text()).toContain('Company: TrialSpark');
  });

  it('supports overriding the default mocks', async () => {
    ({ component, client } = mount(<MyComponent />, {
      apolloMocks: {
        Query: () => ({
          company: () => ({
            name: 'Cool Co.',
            age: null,
          }),
        }),
      },
    }));
    await client.resetStore();
    component.update();
    expect(component.text()).toContain('Street: 45 West 11th');
    expect(component.text()).toContain('Company: Cool Co.');
  });
});
