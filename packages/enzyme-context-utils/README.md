# Enzyme Context Utils

The module exports some utilities that improve the ease of authoring `enzyme-context` plugins:

### `ContextWatcher()`

A class that gets the context of a Provider and notifies listeners when the context changes.

#### Arguments

1. `render` (`(WatcherComponent: React.ComponentClass) => React.ReactElement`): a function that accepts a react component as its only argument and must return some JSX that renders that react component as a child of a Provider.
2. `childContextTypes` (`ValidationMap` ([optional])): the `childContextTypes` of the provider. This argument only needs to be passed if the root component returned by `render` does not define `childContextTypes`.

#### Attributes

- `value` (`any`): the context of the provider

#### Methods

- `listen(listener: (context: any) => void)`: registers a listener to be notified of context changes

  - **Arguments**
    1. `listener`: (`(context: any) => void`): the listener function that will be called with the context whenever it changes

- `stop()`: stops listening for changes and cleans up any mounted components

#### Example

```javascript
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { getContextFromProvider } from 'enzyme-context-utils';

const store = createStore(() => ({}));
const context = new ContextWatcher(Watcher => (
  <Provider store={store}>
    <Watcher />
  </Provider>
));

expect(context.value).toEqual({ store });
context.listen(newContext => {
  // called whenever context changes
});
```

### `bindContextToWrapper(context: ContextWatcher) => (wrapper: ReactWrapper | ShallowWrapper) => () => void;`

A utility that binds a `ContextWatcher` to a given enzyme wrapper, updating its context whenever the watcher's context changes.

#### Arguments

1. `context` (`ContextWatcher`): the context to watch

#### Returns

- `(wrapper: ReactWrapper | ShallowWrapper) => () => void`: a function that accepts the enzyme wrapper to bind to
  - **Arguments**
    1. `wrapper` (`ReactWrapper | ShallowWrapper`): the enzyme wrapper to bind to
  - **Returns**: `() => void`: a function that will stop listening for context changes when called

#### Example

This method is useful for setting the `updater` attributes of an `enzyme-context` plugin return:

```javascript
const myPlugin = (node, options) => {
  const store = createStore(() => ({}));
  const context = new ContextWatcher(Watcher => (
    <Provider store={store}>
      <Watcher />
    </Provider>
  ));

  return {
    node,
    options,
    controller: store,
    updater: bindContextToWrapper(context),
  };
};
```

### `EnzymePlugin<O extends object, C>`

A TypeScript interface defining an enzyme-context plugin.

#### Arguments

1. `O` (`extends object`): the shape of the custom parameters users may pass to `mount`/`shallow` when this plugin is enabled.
2. `C`: the type of the `controller` that will be returned.

#### Example

```typescript
import { EnzymePlugin } from 'enzyme-context-utils';
import { createStore, Store, AnyAction } from 'redux';

interface ReduxPluginMountOptions {
  initialActions?: AnyAction[];
}

const reduxPlugin: EnzymePlugin<ReduxPluginMountOptions, Store> = (node, options) => {
  const store = createStore(() => ({}));

  return {
    node,
    options: {
      ...options,
      context: {
        ...options.context,
        store,
      },
    },
    controller: store,
  };
};
```
