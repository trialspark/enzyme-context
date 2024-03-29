# Deprecated

This repositiory is deprecated and will not be maintained. It will soon be archived.

# enzyme-context

[![Build Status](https://travis-ci.com/trialspark/enzyme-context.svg?branch=master)](https://travis-ci.com/trialspark/enzyme-context) [![Coverage Status](https://coveralls.io/repos/github/trialspark/enzyme-context/badge.svg?branch=master)](https://coveralls.io/github/trialspark/enzyme-context?branch=master)

Enzyme Context is a pluggable library which simplifies the process of testing components that rely
on [react context](https://reactjs.org/docs/legacy-context.html).

## Basic Usage

**test-utils/enzyme.ts**

```javascript
import { createMount, createShallow } from 'enzyme-context';
import { reduxContext } from 'enzyme-context-redux';
import { routerContext } from 'enzyme-context-react-router-4';
import { createStore } from 'redux';
import reducer from './reducer'; // this is _your_ app's main reducer

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
import { mount } from '../test-utils/enzyme'; // import from the module defined above
import MyComponent from './MyComponent';

// this example uses jest, but that isn't required!
describe('MyComponent', () => {
  let component;
  let store;
  let history;

  beforeEach(() => {
    // mount() returns an object with the mounted EnzymeWrapper component and each of the specified plugins.
    // In this example, it returns:
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

  it('responds to location changes', () => {
    history.push('/my/new/url');
    component.update();
    expect(component.text()).toBe('...');
  });
});
```

## Official Plugins

Enzyme Context maintains a few official plugins for some popular react libraries:

- [enzyme-context-redux](/packages/enzyme-context-redux/README.md) for [react-redux](https://react-redux.js.org/)
- [enzyme-context-react-router-3](/packages/enzyme-context-react-router-3/README.md) for [react-router (v3)](https://github.com/ReactTraining/react-router/tree/v3/docs)
- [enzyme-context-react-router-4](/packages/enzyme-context-react-router-4/README.md) for [react-router (v4)](https://reacttraining.com/react-router/)
- [enzyme-context-apollo](/packages/enzyme-context-apollo/README.md) for [react-apollo](https://github.com/apollographql/react-apollo)
