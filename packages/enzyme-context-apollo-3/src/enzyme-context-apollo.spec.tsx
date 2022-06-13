import { Query } from '@apollo/client/react/components';
import React, { ReactElement } from 'react';
import gql from 'graphql-tag';
import { ReactWrapper, MountRendererProps } from 'enzyme';
import { createMount, GetContextWrapper, GetOptions } from 'enzyme-context';
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
`.loc!.source.body;

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
  let mount: (
    node: ReactElement<any>,
    options?: GetOptions<MountRendererProps, Plugins>,
  ) => GetContextWrapper<ReactWrapper, Plugins>;
  let component: GetContextWrapper<ReactWrapper, Plugins>;

  type Plugins = {
    client: ReturnType<typeof apolloContext>;
  };

  beforeEach(async () => {
    const _mount = createMount({
      client: apolloContext({
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
    component = mount(<MyComponent />);
    await component.client.resetStore();
    component.update();
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
    await component.client.resetStore();
    component.update();
    expect(component.text()).toContain('Street: 45 West 11th');
    expect(component.text()).toContain('Company: Cool Co.');
  });
});
