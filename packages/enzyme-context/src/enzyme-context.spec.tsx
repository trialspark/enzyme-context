import React, { Component, cloneElement } from 'react';
import PropTypes from 'prop-types';
import { ReactWrapper, ShallowWrapper } from 'enzyme';
import { EnzymePlugin, composeWrappingComponents } from 'enzyme-context-utils';
import { createMount, createShallow, GetContextWrapper } from '.';

jest.mock('once', () => (fn: (...args: any[]) => any) => (...args: any[]) => fn(...args));

type MyComponentProps = { foo: string; bar: string };
const MyComponent: React.SFC<MyComponentProps> = () => {
  return <div />;
};

class ControllerA {
  constructor(public name: string) {}

  sayHello() {
    return `Hello ${this.name}!`;
  }
}
class ControllerB {
  constructor(public age: number) {}

  sayHappyBirthday() {
    return `Happy ${this.age}th birthday!`;
  }
}
interface PluginAOptions {
  name: string;
}
interface PluginBOptions {
  age: number;
}

class ContextualComponent extends Component {
  controllerA: ControllerA | null = null;
  controllerB: ControllerB | null = null;

  static contextTypes = {
    controllerA: PropTypes.any,
    controllerB: PropTypes.any,
  };

  render() {
    this.controllerA = this.context.controllerA;
    this.controllerB = this.context.controllerB;

    return <div {...this.props} />;
  }
}

const WrappingComponentA: React.FC = ({ children }) => <>{children}</>;

const WrappingComponentB: React.FC = ({ children }) => <>{children}</>;

const createPluginA = () => {
  const unmounter = jest.fn();
  const updater = jest.fn().mockReturnValue(unmounter);

  const plugin: EnzymePlugin<PluginAOptions, ControllerA> = (node, options) => {
    const controller = new ControllerA(options!.name);

    return {
      controller,
      updater,
      node: cloneElement(node, { hasa: 'true' }),
      options: {
        context: {
          controllerA: controller,
        },
        wrappingComponent: composeWrappingComponents(options.wrappingComponent, WrappingComponentA),
      },
    };
  };

  return { plugin, updater, unmounter };
};

const createPluginB = () => {
  const plugin: EnzymePlugin<PluginBOptions, ControllerB> = (node, options) => {
    const controller = new ControllerB(options!.age);

    return {
      controller,
      node: cloneElement(node, { hasb: 'true' }),
      options: {
        context: {
          controllerB: controller,
        },
        wrappingComponent: composeWrappingComponents(options.wrappingComponent, WrappingComponentB),
      },
    };
  };

  return { plugin };
};

describe('enzyme-context', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    // tslint:disable-next-line no-console
    (console.warn as jest.Mock).mockRestore();
  });
  describe('createMount()', () => {
    let component: GetContextWrapper<ReactWrapper<MyComponentProps>, {}>;

    beforeEach(() => {
      const mount = createMount({});
      component = mount(<MyComponent foo="hello" bar="world" />);
    });

    it('mounts the component using enzyme', () => {
      expect(component.exists()).toBe(true);
      expect(component.type()).toBe(MyComponent);
      expect(component.props()).toEqual({ foo: 'hello', bar: 'world' });
    });

    describe('with plugins', () => {
      let component: GetContextWrapper<
        ReactWrapper<{}, {}, ContextualComponent>,
        {
          a: EnzymePlugin<PluginAOptions, ControllerA>;
          b: EnzymePlugin<PluginBOptions, ControllerB>;
        }
      >;
      let pluginA: ReturnType<typeof createPluginA>;
      let pluginB: ReturnType<typeof createPluginB>;

      beforeEach(() => {
        pluginA = createPluginA();
        pluginB = createPluginB();

        const mount = createMount({
          a: pluginA.plugin,
          b: pluginB.plugin,
        });
        component = mount(<ContextualComponent />, {
          name: 'Julie',
          age: 40,
        });
      });

      it('mounts the component', () => {
        expect(component.type()).toBe(ContextualComponent);
      });

      it('can be used via destructuring', () => {
        let component: ReactWrapper<{}, {}, ContextualComponent>;
        let a: ControllerA;
        let b: ControllerB;
        const mount = createMount({
          a: pluginA.plugin,
          b: pluginB.plugin,
        });
        const warn = jest.spyOn(console, 'warn').mockReturnValue(undefined);
        warn.mockClear();
        ({ component, a, b } = mount(<ContextualComponent />, {
          name: 'Julie',
          age: 40,
        }));
        expect(component.exists()).toBe(true);
        expect(component.instance().controllerA).toBe(a);
        expect(component.instance().controllerB).toBe(b);
        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls[0]).toMatchInlineSnapshot(`
Array [
  "Accessing the \`component\` attribute of the object \`mount()\` and \`shallow()\`
returns is deprecated and will be removed in the next major release. Enzyme-Context
\`mount()\` and \`shallow()\` now return an enzyme wrapper instead of an object with
a \`component\` attribute.

Before:
  const { component, store, history } = mount(<MyComponent />);

After:
  const component = mount(<MyComponent />);
  component.store;
  component.history;",
]
`);
      });

      it("merges in the plugin's options", () => {
        expect(component.instance().controllerA).toBe(component.a);
        expect(component.instance().controllerB).toBe(component.b);
      });

      it('allows composition of wrapping components', () => {
        expect(
          component
            .getWrappingComponent()
            .find(WrappingComponentA)
            .exists(),
        ).toBe(true);
        expect(
          component
            .getWrappingComponent()
            .find(WrappingComponentB)
            .exists(),
        ).toBe(true);
      });

      it('returns controllers', () => {
        expect(component.a.sayHello()).toBe('Hello Julie!');
        expect(component.b.sayHappyBirthday()).toBe('Happy 40th birthday!');
      });

      it('allows node decoration', () => {
        expect(component.prop('hasa')).toBe('true');
        expect(component.prop('hasb')).toBe('true');
      });

      it('calls the plugin updater', () => {
        expect(pluginA.updater).toHaveBeenCalledWith(component);
      });

      it('calls the unmount function when the component is unmounted', () => {
        expect(pluginA.unmounter).not.toHaveBeenCalled();
        component.unmount();
        expect(component.exists()).toBe(false);
        expect(pluginA.unmounter).toHaveBeenCalled();
      });

      it('does nothing if mount() is called when the component is already mounted', () => {
        pluginA.updater.mockClear();
        component.mount();
        expect(pluginA.updater).not.toHaveBeenCalled();
      });

      it('calls the plugin updaters again if the component is unmounted and then mounted', () => {
        pluginA.updater.mockClear();
        const unmounter = jest.fn();
        pluginA.updater.mockReturnValue(unmounter);

        component.unmount();
        pluginA.unmounter.mockClear();
        expect(pluginA.updater).not.toHaveBeenCalled();
        component.mount();
        expect(pluginA.updater).toHaveBeenCalledWith(component);

        expect(unmounter).not.toHaveBeenCalled();
        component.unmount();
        try {
          component.unmount();
        } catch (e) {}
        expect(pluginA.unmounter).not.toHaveBeenCalled();
        expect(unmounter).toHaveBeenCalledTimes(1);

        pluginA.updater.mockClear();
        component.mount();
        component.mount();
        expect(pluginA.updater).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('makeShallow()', () => {
    let component: GetContextWrapper<ShallowWrapper, {}>;

    beforeEach(() => {
      const shallow = createShallow({});
      component = shallow(<MyComponent foo="hello" bar="world" />);
    });

    it('shallow renders the component', () => {
      expect(component.exists()).toBe(true);
      expect(component.type()).toBe('div');
    });

    describe('with plugins', () => {
      let component: GetContextWrapper<
        ShallowWrapper<{}, {}, ContextualComponent>,
        {
          a: EnzymePlugin<PluginAOptions, ControllerA>;
          b: EnzymePlugin<PluginBOptions, ControllerB>;
        }
      >;
      let pluginA: ReturnType<typeof createPluginA>;
      let pluginB: ReturnType<typeof createPluginB>;

      beforeEach(() => {
        pluginA = createPluginA();
        pluginB = createPluginB();

        const shallow = createShallow({
          a: pluginA.plugin,
          b: pluginB.plugin,
        });
        component = shallow(<ContextualComponent />, {
          name: 'Julie',
          age: 40,
        });
      });

      it("merges in the plugin's options", () => {
        expect(component.instance().controllerA).toBe(component.a);
        expect(component.instance().controllerB).toBe(component.b);
      });

      it('can be used via destructuring', () => {
        let component: ShallowWrapper<{}, {}, ContextualComponent>;
        let a: ControllerA;
        let b: ControllerB;
        const shallow = createShallow({
          a: pluginA.plugin,
          b: pluginB.plugin,
        });
        const warn = jest.spyOn(console, 'warn').mockReturnValue(undefined);
        warn.mockClear();
        ({ component, a, b } = shallow(<ContextualComponent />, {
          name: 'Julie',
          age: 40,
        }));
        expect(component.exists()).toBe(true);
        expect(component.instance().controllerA).toBe(a);
        expect(component.instance().controllerB).toBe(b);
        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls[0]).toMatchInlineSnapshot(`
Array [
  "Accessing the \`component\` attribute of the object \`mount()\` and \`shallow()\`
returns is deprecated and will be removed in the next major release. Enzyme-Context
\`mount()\` and \`shallow()\` now return an enzyme wrapper instead of an object with
a \`component\` attribute.

Before:
  const { component, store, history } = mount(<MyComponent />);

After:
  const component = mount(<MyComponent />);
  component.store;
  component.history;",
]
`);
      });

      it('returns controllers', () => {
        expect(component.a.sayHello()).toBe('Hello Julie!');
        expect(component.b.sayHappyBirthday()).toBe('Happy 40th birthday!');
      });

      it('allows node decoration', () => {
        expect(component.prop('hasa')).toBe('true');
        expect(component.prop('hasb')).toBe('true');
      });

      it('calls the plugin updater', () => {
        expect(pluginA.updater).toHaveBeenCalledWith(component);
      });

      it('calls the unmount function when the component is unmounted', () => {
        expect(pluginA.unmounter).not.toHaveBeenCalled();
        component.unmount();
        expect(pluginA.unmounter).toHaveBeenCalled();
      });
    });
  });
});
