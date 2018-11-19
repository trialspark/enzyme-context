# enzyme-context

[![Build Status](https://travis-ci.com/trialspark/enzyme-context.svg?branch=master)](https://travis-ci.com/trialspark/enzyme-context)

Enzyme Context is library that simplifies the process of testing components that rely
on [react context](https://reactjs.org/docs/legacy-context.html) using plugins.

## Basic Usage

**test-utils/enzyme.ts**

```javascript
import { createMount, createShallow } from 'enzyme-context';
import { reduxContext } from 'enzyme-context-redux';
import { routerContext } from 'enzyme-context-react-router-4';
import { createStore } from 'redux';
import reducer from './reducer'; // this is _your_ app's reducer

const plugins = {
  store: reduxContext({
    createStore: () => createStore(reducer),
  }),
  history: routerContext(),
};

export const mount = createMount(plugins);
export const shallow = createShallow(plugins);
```

**MyComponent.spec.tsx**

```javascript
import { mount } from 'test-utils/enzyme'; // import from the module defined above
import MyComponent from './MyComponent';

// this example uses jest, but that isn't required!
describe('MyComponent', () => {
  let component;
  let store;
  let history;

  beforeEach(() => {
    // mount() returns an object with:
    //   - component: the mounted EnzymeWrapper
    //   - store: provided by the reduxContext plugin, a redux store
    //   - history: provided by the routerContext plugin, a history object for URL manipulation
    ({ component, store, history } = mount(<MyComponent />));
  });

  it('responds to redux state changes', () => {
    store.dispatch({ type: 'SOME_ACTION' });
    component.update();
    expect(component.text()).toBe('...');
  });

  it('responses to location changes', () => {
    history.push('/my/new/url');
    component.update();
    expect(component.text()).toBe('...');
  });
});
```

## Official Plugins

Enzyme Context maintains a few official plugins for some popular react libraries:

- [enzyme-context-redux](/packages/enzyme-context-redux/README.md) for [react-redux](https://react-redux.js.org/)
- [enzyme-context-react-router-4](/packages/enzyme-context-react-router-4/README.md) for [react-router (v4)](https://reacttraining.com/react-router/)
- [enzyme-context-apollo](/packages/enzyme-context-apollo/README.md) for [react-apollo](https://github.com/apollographql/react-apollo)
