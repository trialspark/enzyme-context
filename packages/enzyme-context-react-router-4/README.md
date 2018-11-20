# enzyme-context-react-router-4

## Introduction

This plugin sets up the context required for `react-router` (v4) and exposes a `history` instance so that tests can manipulate the URL. With this plugin enabled, it is possible to mount all `react-router` components in your test, including `<Link />`, `<Route />`, etc.

## Installation

1. Setup required peer dependencies: [enzyme](https://airbnb.io/enzyme/docs/installation/), [react](https://reactjs.org/docs/getting-started.html), [react-router v4](https://reacttraining.com/react-router/web/guides/quick-start), and [react-test-renderer](https://reactjs.org/docs/test-renderer.html).

2. Install via yarn or npm

   ```bash
   $> yarn add -D enzyme-context enzyme-context-react-router-4
   ```

3. Add to plugins:

   ```javascript
   import { createMount, createShallow } from 'enzyme-context';
   import { routerContext } from 'enzyme-context-react-router-4';

   const plugins = {
     history: routerContext(),
   };

   export const mount = createMount(plugins);
   export const shallow = createShallow(plugins);
   ```

## Usage

After adding the plugin to your `mount`/`shallow`, it can be used in your tests like so:

```javascript
import { mount } from './test-utils/enzyme'; // import the mount created with enzyme-context
import { Route } from 'react-router-dom';
import MyComponent from './MyComponent';

describe('<MyComponent />', () => {
  let component;
  let history;

  beforeEach(() => {
    ({ component, history } = mount(<Route path="/my/path" component={MyComponent} />));
  });

  it('renders when active', () => {
    expect(component.find(MyComponent).exists()).toBe(false);
    history.push('/my/path');
    component.update();
    expect(component.find(MyComponent).exists()).toBe(true);
  });
});
```

## Configuration API

### `routerContext() => EnzymePlugin`

#### Returns

`EnzymePlugin`: The plugin which can be passed to `createMount`/`createShallow`.

#### Example:

```javascript
import { createMount, createShallow } from 'enzyme-context';
import { routerContext } from 'enzyme-context-react-router-4';

const plugins = {
  history: routerContext(),
};

export const mount = createMount(plugins);
export const shallow = createShallow(plugins);
```

## Mount/Shallow API

This plugin also allows some configuration to be passed at mount-time:

1. `routerConfig` (`Object` [optional]): any of the configuration [options of `history`'s `createMemoryHistory()`](https://github.com/ReactTraining/history#usage). For example, we can set the URL _before_ our component mounts like so:
   ```javascript
   ({ component, history } = mount(<MyComponent />, {
     initialEntries: ['/my/url'],
   }));
   ```
