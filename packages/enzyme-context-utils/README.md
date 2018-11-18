# Enzyme Context Utils

The module exports some utilities that improve the ease of authoring `enzyme-context` plugins:

### `getContextFromProvider(provider: React.CElement) => any`

Given a provider component (one that provides context to its children via `getChildContext()`), return all the context that component provides.

#### Arguments

1. `provider` (`React.CElement`): a react element representing a provider component

#### Returns

`any`: the context the provider provides to its children

#### Example

```javascript
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { getContextFromProvider } from 'enzyme-context-utils';

const store = createStore(() => ({}));
const provider = <Provider store={store} />;
const context = getContextFromProvider(provider);

expect(context).toEqual({ store });
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
