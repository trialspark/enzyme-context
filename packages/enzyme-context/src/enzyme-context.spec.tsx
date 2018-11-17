import React, { Component, cloneElement } from 'react';
import PropTypes from 'prop-types';
import { ReactWrapper, MountRendererProps, ShallowWrapper, shallow } from 'enzyme';
import { EnzymePlugin } from 'enzyme-context-utils';
import { createMount, createShallow } from '.';

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
        ...options,
        context: {
          ...options.context,
          controllerA: controller,
        },
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
        ...options,
        context: {
          ...options.context,
          controllerB: controller,
        },
      },
    };
  };

  return { plugin };
};

describe('enzyme-context', () => {
  describe('createMount()', () => {
    let component: ReactWrapper<MyComponentProps>;

    beforeEach(() => {
      const mount = createMount({});
      ({ component } = mount(<MyComponent foo="hello" bar="world" />));
    });

    it('mounts the component using enzyme', () => {
      expect(component.exists()).toBe(true);
      expect(component.type()).toBe(MyComponent);
      expect(component.props()).toEqual({ foo: 'hello', bar: 'world' });
    });

    describe('with plugins', () => {
      let component: ReactWrapper<{}, {}, ContextualComponent>;
      let pluginA: ReturnType<typeof createPluginA>;
      let pluginB: ReturnType<typeof createPluginB>;
      let a: ControllerA;
      let b: ControllerB;

      beforeEach(() => {
        pluginA = createPluginA();
        pluginB = createPluginB();

        const mount = createMount({
          a: pluginA.plugin,
          b: pluginB.plugin,
        });
        ({ component, a, b } = mount(<ContextualComponent />, {
          name: 'Julie',
          age: 40,
        }));
      });

      it('mounts the component', () => {
        expect(component.type()).toBe(ContextualComponent);
      });

      it("merges in the plugin's options", () => {
        expect(component.instance().controllerA).toBe(a);
        expect(component.instance().controllerB).toBe(b);
      });

      it('returns controllers', () => {
        expect(a.sayHello()).toBe('Hello Julie!');
        expect(b.sayHappyBirthday()).toBe('Happy 40th birthday!');
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
    });
  });

  describe('makeShallow()', () => {
    let component: ShallowWrapper;

    beforeEach(() => {
      const shallow = createShallow({});
      ({ component } = shallow(<MyComponent foo="hello" bar="world" />));
    });

    it('shallow renders the component', () => {
      expect(component.exists()).toBe(true);
      expect(component.type()).toBe('div');
    });

    describe('with plugins', () => {
      let component: ShallowWrapper<{}, {}, ContextualComponent>;
      let pluginA: ReturnType<typeof createPluginA>;
      let pluginB: ReturnType<typeof createPluginB>;
      let a: ControllerA;
      let b: ControllerB;

      beforeEach(() => {
        pluginA = createPluginA();
        pluginB = createPluginB();

        const shallow = createShallow({
          a: pluginA.plugin,
          b: pluginB.plugin,
        });
        ({ component, a, b } = shallow(<ContextualComponent />, {
          name: 'Julie',
          age: 40,
        }));
      });

      it("merges in the plugin's options", () => {
        expect(component.instance().controllerA).toBe(a);
        expect(component.instance().controllerB).toBe(b);
      });

      it('returns controllers', () => {
        expect(a.sayHello()).toBe('Hello Julie!');
        expect(b.sayHappyBirthday()).toBe('Happy 40th birthday!');
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
