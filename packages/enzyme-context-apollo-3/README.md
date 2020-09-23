# enzyme-context-apollo-3

## Introduction

This plugin sets up an apollo client with a mock graphql backend to test components that fetch data via graphql.

## Installation

1. Setup required peer dependencies: [@apollo/client](https://www.apollographql.com/docs/react/get-started/), [enzyme](https://airbnb.io/enzyme/docs/installation/), [react](https://reactjs.org/docs/getting-started.html), and [react-test-renderer](https://reactjs.org/docs/test-renderer.html).

2. Install via yarn or npm

   ```bash
   $> yarn add -D enzyme-context enzyme-context-apollo
   ```

3. Add to plugins:

   ```javascript
   import fs from 'fs';
   import path from 'path';
   import { createMount, createShallow } from 'enzyme-context';
   import { apolloContext } from 'enzyme-context-apollo';

   // path to a .graphql/.gql schema definition for your backend
   const typeDefs = fs.readFileSync(path.resolve(__dirname), './schema.graphql');

   const plugins = {
     client: apolloContext({
       schema: {
         typeDefs,
       },
       defaultMocks: {
         Query: () => ({
           viewer: () => ({
             id: '1612',
             name: 'Joe Dart',
             instrument: 'Custom Music Man Bass',
           }),
         }),
       },
     }),
   };

   export const mount = createMount(plugins);
   export const shallow = createShallow(plugins);
   ```

## Usage

After adding the plugin to your `mount`/`shallow`, it can be used in your tests like so:

```javascript
import { mount } from './test-utils/enzyme'; // import the mount created with enzyme-context
import MyComponent from './MyComponent';

describe('<MyComponent />', () => {
  let wrapper;

  beforeEach(async () => {
    wrapper = mount(<MyComponent />);
    // Reseting the apollo store does two things:
    //  1. Abort any in-flight requests that may have been leftover from the last spec
    //  2. Return a Promise that allows us to deterministically wait until all of our
    //     component's queries have loaded before proceeding with our tests.
    await wrapper.client.resetStore();
    // Update the Enzyme wrapper after the queries have loaded
    wrapper.update();
  });

  it('renders data from an apollo query', () => {
    expect(wrapper.text()).toContain('Viewer: Joe Dart');
  });
});
```

## Configuration API

### `apolloContext(options) => EnzymePlugin`

#### Arguments

1.  `options` (`Object`):

    - `options.schema` (`IExecutableSchemaDefinition`): the same object passed to [`graphql-tools`'s `makeExecutableSchema`](https://www.apollographql.com/docs/graphql-tools/generate-schema.html#makeExecutableSchema).
    - `options.possibleTypes` (`PossibleTypesMap` [optional]): Useful if your app is using fragments on unions and interfaces. Example:

      ```javascript
      import { createMount } from 'enzyme-context';
      import { apolloContext } from 'enzyme-context-apollo';
      import { IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';
      import possibleTypes from './possibleTypes';

      export const mount = createMount({
        client: apolloContext({
          possibleTypes,
        }),
      });
      ```

    - `options.defaultMocks` (`IMocks` [optional]): default resolvers for the mock graphql backend. These objects are the same as the ones outlined in the [Customizing mocks section of `graphql-tools`'s docs](https://www.apollographql.com/docs/graphql-tools/mocking.html#Customizing-mocks).

#### Returns

`EnzymePlugin`: The plugin which can be passed to `createMount`/`createShallow`.

#### Example:

```javascript
import fs from 'fs';
import path from 'path';
import { createMount, createShallow } from 'enzyme-context';
import { apolloContext } from 'enzyme-context-apollo';

// path to a .graphql/.gql schema definition for your backend
const typeDefs = fs.readFileSync(path.resolve(__dirname), './schema.graphql');

const plugins = {
  client: apolloContext({
    schema: {
      typeDefs,
    },
    defaultMocks: {
      Query: () => ({
        viewer: () => ({
          id: '1612',
          name: 'Joe Dart',
          instrument: 'Custom Music Man Bass',
        }),
      }),
    },
  }),
};

export const mount = createMount(plugins);
export const shallow = createShallow(plugins);
```

## Mount/Shallow API

This plugin also allows some configuration to be passed at mount-time:

1. `apolloMocks` (`IMocks` [optional]): resolvers for the mock graphql backend. These objects are the same as the ones outlined in the [Customizing mocks section of `graphql-tools`'s docs](https://www.apollographql.com/docs/graphql-tools/mocking.html#Customizing-mocks). The mocks defined here will be deeply merged with the ones defined at plugin configuration time.

   - Example:

     ```javascript
     const wrapper = mount(<MyComponent />, {
       apolloMocks: {
         Query: () => ({
           viewer: () => ({
             id: '44',
             name: 'Woody Goss',
             instrument: 'Keys',
           }),
         }),
       },
     });
     ```

## FAQ / Tips

**Help! My mocks don't seem to be working.**

We've found there are a few typical reasons that mocks fail. Let's assume we're working with a very simple GraphQL schema like this:

```
schema {
  query: Query
  mutation: Mutation
}

type Query {
  id: String!
}

type Mutation {
  logoutUser(user: String!): Boolean!
}
```

What are the main causes of mocks not working?

1. Mock names don't align with schema names

   You need to make sure that the type name and field name you're trying to mock exactly match your schema.
   Here's an example of how this problem might arise:

   ```javascript
   const wrapper = mount(<MyComponent />, {
     apolloMocks: {
       // Type name in the GraphQL schema is `Mutation`, so this won't work
       Mutations: () => ({
         logoutUser: someMockImplementationFunction,
       }),
     },
   });
   ```

2. Wrong data types

   If you call a mutation or pass arguments to a query,
   you need to make sure that the data passed in matches the schema data types,
   otherwise your mock function won't get called.
   For example, if you pass in a null argument where your schema is expecting a defined value,
   the call will fail and your mock won't get run.

3. Not waiting for results

   The apollo client / mock GraphQL backend operate asynchronously, so when a new query or mutation is made,
   you can't expect it to be sychronously completed and must instead wait for it to finish.

   Ideally, your component has a prop that returns a promise that is completed when your mutation completes.
   In that case, you can simply `await` that promise:

   ```ts
   await component.prop('onLogoutClick')();
   // now assert something here
   ```

   However, sometimes you might not be able to get a handle to a promise.
   In that case you can typically just wait a tick and the async operations will be resolved:

   ```ts
   const sleep = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

   component.find('button').simulate('click');
   await sleep();
   // now assert something
   ```
