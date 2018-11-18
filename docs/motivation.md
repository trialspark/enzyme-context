# Motivation

## Why does this library exist?

React components appear incredibly simple to test at first glance. After all, they're just functions of their state and props, right?

```javascript
function MyComponent(props) {
  return (
    <div>
      I have worked for {props.company} for {props.years} years.
    </div>
  );
}

const component = mount(<MyComponent company="TrialSpark" years={2} />);
expect(component.text()).toBe('I have worked at TrialSpark for 2 years.');

component.setProps({ company: 'Facebook', years: 0 });
expect(component.text()).toBe('I have worked at Facebook for 0 years.');
```

**Wrong!** And there's a _single_ react feature we can blame for this: context. Context allows components to provide data that _all_ its ancestors access _without_ passing that data down as props. In practice, this is a helpful feature, and it powers some of the most popular libraries out there today: `react-redux`, `react-router`, `react-apollo`, to just name a few.

However, it creates some real chalenges when we go to test our components:

```javascript
let MyComponent = function MyComponent(props) {
  return <div>My name is {props.name}.</div>;
};
const mapStateToProps = state => ({
  name: state.user.name,
});
MyComponent = connect(mapStateToProps)(MyComponent);

// Error: store missing in context
const component = mount(<MyComponent />);
```

One common way to solve this problem is to render your component inside of a provider:

```javascript
import { Provider } from 'react-redux';
import store from './myStore';

const component = mount(
  <Provider store={store}>
    <MyComponent />
  </Provider>,
);
```

However, this doesn't play very nicely with enzyme:

```javascript
component.type(); // Provider, not MyComponent
component.setProps({}); // Setting props on the Provider, not MyComponent
component.instance(); // Instance of Provider, not MyComponent
```

Thankfully, `enzyme` allows us to pass context to our components when we mount this:

```javascript
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import store from './myStore';

const component = mount(<MyComponent />, {
  context: {
    store,
  },
  childContextTypes: {
    store: PropTypes.any,
  },
});

component.type(); // MyComponent
```

## The problems with passing context to enzyme

While the above solution works, its imperfect for a couple of reasons:

#### 1) Context is global to the app, but we have to pass it in _every test_

Contexts are usually global to our app. For example, an app typically has one store, one router, etc. However, passing context to enzyme requires us to setup our global context _every time_ we mount a component. This leads to a lot of boilerplate when writing tests, and allows for the possibility of not bootstrapping context correctly, making our tests potentially less effective. This becomes more of a problem as we add more libraries that use context to our app.

#### 2) More importantly, passing context to enzyme requires us to know about private APIs

Libraries like `react-redux` do a good job of shielding us from context. It's API consists entirely of components: just wrap your whole app in a `<Provider />` and you're off to the races! However, to pass context to enzyme correctly, we need to know about the _implementation_ of the `react-redux` provider—what context does it provide to its children?

`React-redux` is pretty simple. It just passes a `store` as context. Other libraries are more complicated. And, like before, the more libraries we add, the more internals we must know about.

## How does enzyme-context solve this?

Enzyme Context solves this problem by allowing you to _create_ a custom `mount`/`shallow` function for your app that has all of your app's context set up for you already! It is built on top of a plugin system so you can add as many plugins as are necessary for the libraries in your app. This way, the _plugins_ can worry about the interals of the libraries they are supporting, and you can focus on testing your application.
