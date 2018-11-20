# enzyme-context-redux

## Introduction

This plugin sets up `react-redux` context to test components that are `connect()`ed to redux.

## Installation

1. Setup required peer dependencies: [enzyme](https://airbnb.io/enzyme/docs/installation/), [react](https://reactjs.org/docs/getting-started.html), [react-redux](https://react-redux.js.org/docs/introduction/quick-start), [react-test-renderer](https://reactjs.org/docs/test-renderer.html), and [redux](https://redux.js.org/#installation).

2. Install via yarn or npm

   ```bash
   $> yarn add -D enzyme-context enzyme-context-redux
   ```

3. Add to plugins:

   ```javascript
   import { createMount, createShallow } from 'enzyme-context';
   import { reduxContext } from 'enzyme-context-redux';
   import { createStore } from 'redux';
   import reducer from './reducer';

   const plugins = {
     store: reduxContext({ createStore: () => createStore(reducer) }),
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
  let store;

  beforeEach(() => {
    ({ component, store } = mount(<MyComponent />));
  });

  it('responds to state updates', () => {
    store.dispatch({ type: 'MY_ACTION' });
    component.update();
    expect(component.text()).toBe('...');
  });
});
```

## Configuration API

### `reduxContext(options) => EnzymePlugin`

#### Arguments

1. `options` (`Object`):

   - `options.createStore` (`() => Store`): a function which must return a redux store

#### Returns

`EnzymePlugin`: The plugin which can be passed to `createMount`/`createShallow`.

#### Example:

```javascript
import { createMount, createShallow } from 'enzyme-context';
import { reduxContext } from 'enzyme-context-redux';
import { createStore } from 'redux';
import reducer from './reducer';

const plugins = {
  store: reduxContext({ createStore: () => createStore(reducer) }),
};

export const mount = createMount(plugins);
export const shallow = createShallow(plugins);
```

## Mount/Shallow API

This plugin also allows some configuration to be passed at mount-time:

1. `initialActions` (`Action[]` [optional]): an array of initial actions to be dispatched _before_ the component is mounted. Useful to get the redux state into a desired form before the component initializes.
   - Example:
     ```javascript
     ({ component, store } = mount(<MyComponent />, {
       initialActions: [{ type: 'MY_ACTION' }],
     }));
     ```
