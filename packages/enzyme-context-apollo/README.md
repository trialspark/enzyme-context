# enzyme-context-redux

## Introduction

This plugin sets up an apollo client with a mock graphql backend to test components that fetch data via graphql.

## Installation

1. Setup required peer dependencies: [apollo-cache-inmemory](https://github.com/apollographql/apollo-client/tree/master/packages/apollo-cache-inmemory#installation), [apollo-client](https://www.apollographql.com/docs/react/advanced/boost-migration.html#after), [enzyme](https://airbnb.io/enzyme/docs/installation/), [react](https://reactjs.org/docs/getting-started.html), and [react-apollo](https://github.com/apollographql/react-apollo#installation).

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
  let component;
  let client;

  beforeEach(async () => {
    ({ component, store } = mount(<MyComponent />));
    // Reseting the apollo store does two things:
    //  1. Abort any in-flight requests that may have been leftover from the last spec
    //  2. Return a Promise that allows us to deterministically wait until all of our
    //     component's queries have loaded before proceeding with our tests.
    await client.resetStore();
    // Update the Enzyme wrapper after the queries have loaded
    component.update();
  });

  it('renders data from an apollo query', () => {
    expect(component.text()).toContain('Viewer: Joe Dart');
  });
});
```

## Configuration API

### `apolloContext(options) => EnzymePlugin`

#### Arguments

1.  `options` (`Object`):

    - `options.schema` (`IExecutableSchemaDefinition`): the same object passed to [`graphql-tools`'s `makeExecutableSchema`](https://www.apollographql.com/docs/graphql-tools/generate-schema.html#makeExecutableSchema).
    - `options.fragmentMatcher` (`FragmentMatcherInterface` [optional]): Useful if your app is using fragments on unions and interfaces. Example:

      ```javascript
      import { createMount } from 'enzyme-context';
      import { apolloContext } from 'enzyme-context-apollo';
      import { IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';
      // Path to JSON returned from a gql introspection query
      // (https://gist.github.com/craigbeck/b90915d49fda19d5b2b17ead14dcd6da)
      import introspectionJSON from './schemaIntrospectionJSON.json';

      const fragmentMatcher = new IntrospectionFragmentMatcher({
        introspectionQueryResultData: introspectionJSON,
      });

      export const mount = createMount({
        client: apolloContext({
          fragmentMatcher,
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
     ({ component, client } = mount(<MyComponent />, {
       apolloMocks: {
         Query: () => ({
           viewer: () => ({
             id: '44',
             name: 'Woody Goss',
             instrument: 'Keys',
           }),
         }),
       },
     }));
     ```
