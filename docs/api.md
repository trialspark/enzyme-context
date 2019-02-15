# API

## `createMount(plugins) => (node: React.ReactElement, options? Object) => ContextReactWrapper`

#### Arguments

1. `plugins` (`Object`): an object where the keys are names of your choice and the values are `enzyme-context` [`MountPlugin`](https://github.com/trialspark/enzyme-context/blob/007022a7bddb7e843a27563f7918276af2ebb707/packages/enzyme-context-utils/src/Types.ts#L4-L12)s.

#### Returns

A mount function: `(node: React.ReactElement, options?: Object) => ContextReactWrapper`: A function that takes the same arguments as [mount](https://airbnb.io/enzyme/docs/api/mount.html#mountnode-options--reactwrapper) but can also accept additional `options` (as specified by the provided `plugins`.)

- **Arguments**
  1. `node` (`React.ReactElement`): The node to render
  2. `options` (`Object` [optional]): The same options that can be passed to [enzyme's mount](https://airbnb.io/enzyme/docs/api/mount.html#mountnode-options--reactwrapper) _plus_ any options the plugins you've added handle.
- **Returns**
  - A `ReactWrapper` with the following attributes:
    - `[keyof plugins]: EnzymePlugin['controller']`: the returned `ReactWrapper` will have a key that matches each key in the `plugins` you provide. The value will be whatever [`controller`](https://github.com/trialspark/enzyme-context/blob/007022a7bddb7e843a27563f7918276af2ebb707/packages/enzyme-context-utils/src/Types.ts#L9) the plugin provides. For example, the `enzyme-context-redux` plugin provides a `Store`; the `enzyme-context-react-router-4` plugin provides a `History`.

#### Example

**test-utils/enzyme.ts**

```javascript
import { createMount } from 'enzyme-context';
import { reduxContext } from 'enzyme-context-redux';
import { routerContext } from 'enzyme-context-react-router-4';
import { createStore } from 'redux';
import reducer from './reducer'; // this is _your_ app's main reducer

export const mount = createMount({
  store: reduxContext({
    createStore: () => createStore(reducer),
  }),
  history: routerContext(),
});
```

**MyComponent.spec.tsx**

```javascript
import { mount } from '../test-utils/enzyme'; // import from the module defined above
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(<MyComponent />);
  });

  it('responds to redux state changes', () => {
    wrapper.store.dispatch({ type: 'SOME_ACTION' });
    wrapper.update();
    expect(wrapper.text()).toBe('...');
  });

  it('responds to location changes', () => {
    wrapper.history.push('/my/new/url');
    wrapper.update();
    expect(wrapper.text()).toBe('...');
  });
});
```

## `createShallow(plugins) => (node: React.ReactElement, options? Object) => ContextShallowWrapper`

#### Arguments

1. `plugins` (`Object`): an object where the keys are names of your choice and the values are `enzyme-context` [`MountPlugin`](https://github.com/trialspark/enzyme-context/blob/007022a7bddb7e843a27563f7918276af2ebb707/packages/enzyme-context-utils/src/Types.ts#L4-L12)s.

#### Returns

A shallow function: `(node: React.ReactElement, options?: Object) => ContextShallowWrapper`: A function that takes the same arguments as [shallow](https://airbnb.io/enzyme/docs/api/shallow.html#shallownode-options--shallowwrapper) but can also accept additional `options` (as specified by the provided `plugins`.)

- **Arguments**
  1. `node` (`React.ReactElement`): The node to render
  2. `options` (`Object` [optional]): The same options that can be passed to [enzyme's shallow](https://airbnb.io/enzyme/docs/api/shallow.html#shallownode-options--shallowwrapper) _plus_ any options the plugins you've added handle.
- **Returns**
  - An `ShallowWrapper` with the following attributes:
    - `[keyof plugins]: EnzymePlugin['controller']`: the returned object will have a key that matches each key in the `plugins` you provide. The value will be whatever [`controller`](https://github.com/trialspark/enzyme-context/blob/007022a7bddb7e843a27563f7918276af2ebb707/packages/enzyme-context-utils/src/Types.ts#L9) the plugin provides. For example, the `enzyme-context-redux` plugin provides a `Store`; the `enzyme-context-react-router-4` plugin provides a `History`.

#### Example

**test-utils/enzyme.ts**

```javascript
import { createShallow } from 'enzyme-context';
import { reduxContext } from 'enzyme-context-redux';
import { routerContext } from 'enzyme-context-react-router-4';
import { createStore } from 'redux';
import reducer from './reducer'; // this is _your_ app's main reducer

export const shallow = createShallow({
  store: reduxContext({
    createStore: () => createStore(reducer),
  }),
  history: routerContext(),
});
```

**MyComponent.spec.tsx**

```javascript
import { shallow } from '../test-utils/enzyme'; // import from the module defined above
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<MyComponent />);
  });

  it('responds to redux state changes', () => {
    wrapper.store.dispatch({ type: 'SOME_ACTION' });
    wrapper.update();
    expect(wrapper.text()).toBe('...');
  });

  it('responds to location changes', () => {
    wrapper.history.push('/my/new/url');
    wrapper.update();
    expect(wrapper.text()).toBe('...');
  });
});
```
