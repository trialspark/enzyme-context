# Authoring Plugins

Creating a plugin for `enzyme-context` is relatively straightforward because an `enzyme-context` plugin is just a function!

## Anatomy of a Plugin

**`(node, options) => PluginReturns`**

#### Arguments

1. `node` (`React.ReactElement`): The react element passed to `mount`/`shallow`
2. `options` (`Object`): The options passed to `mount`/`shallow` (inclduing any custom options that your plugin wants to handle.)

#### Returns

- An Object with the following attributes

  - `node` (`React.ReactElement`): the react element to mount
  - `controller` (`any`): the object this plugin wants to attach to the Enzyme wrapper. For example:

    ```javascript
    class Person {
      sayHello() {
        return 'Hello!';
      }
    }

    const myPlugin = (node, options) => {
      const person = new Person();

      return {
        node,
        options,
        controller: person,
      };
    };

    const mount = createMount({
      p: myPlugin,
    });
    const wrapper = mount(<MyComponent />);

    wrapper.p.sayHello();
    ```

  - `options` (`Object`): options to feed into `mount()`/`enzyme()`. This is how plugins provide context. For example:

    ```javascript
    const myPlugin = (node, options) => {
      const person = new Person();

      return {
        node,
        controller: person,
        options: {
          ...options,
          context: {
            ...options.context,
            person,
          },
        },
      };
    };
    const mount = createMount({ p: myPlugin });

    function MyComponent(props, context) {
      return <button onClick={() => context.person.sayHello()}>Say Hello</button>;
    }
    MyComponent.childContextTypes = { person: PropTypes.instanceOf(Person) };

    const wrapper = mount(<MyComponent />);

    wrapper.find('button').simulate('click');
    ```

  - `updater` (`(wrapper: ReactWrapper | ShallowWrapper) => () => void` [optional]): This function will be called immediately after the enzyme wrapper is created. It can be used to setup listeners that update the wrapper after it has been created. For example, if our plugin was supplying context that contained a list of all the `window.postMessage` events we've received, we could do something like this:

    ```javascript
    const postMessagePlugin = (node, options) => {
      return {
        node,
        controller: null,
        options: {
          ...options,
          context: {
            ...options.context,
            messages: [],
          },
        },
        updater: wrapper => {
          const listener = event => {
            wrapper.setContext({
              messages: wrapper.context('messages').concat([event.data]),
            });
          };

          // listen for message events and update the enzyme wrapper when they are
          // received.
          window.addEventListener('message', listener, false);

          // Return a function that will get called when the component is unmounted.
          return () => {
            // Clean up the listener on unmount to avoid a memory leak!
            window.removeEventListener('message', listener, false);
          };
        },
      };
    };
    ```

## Best Practice: Export a Factory

Sometimes it is useful for your plugin to accept _global_ (as opposed to passed to `mount`/`shallow`) configuration. This can be accomplished simply by exporting a _factory_ for your plugin from your module:

**Before:**

```javascript
const myPlugin = (node, options) => {
  const controller = new Controller(/* how do we pass global config here?? */);

  return {
    node,
    options,
    controller,
  };
};

const mount = createMount({ plugin: myPlugin });
```

**After**

```javascript
const myPlugin = config => (node, options) => {
  const controller = new Controller(config);

  return {
    node,
    options,
    controller,
  };
};

const mount = createMount({ plugin: myPlugin({ some: 'config' }) });
```

I would even recommend that you export a factory for your plugin **even if it doesn't accept any configuration**. Then, if you need to accept configuration in the future, you can do so without introducing a breaking change to your API.

## Authoring Utilities

Enzyme Context has published a library called [enzyme-context-utils](/packages/enzyme-context-utils/README.md) with some helpful utilities for authoring enzyme-context plugins.
