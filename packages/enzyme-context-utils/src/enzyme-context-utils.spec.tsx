import { EventEmitter } from 'events';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ReactWrapper, mount } from 'enzyme';
import { ContextWatcher, bindContextToWrapper } from '.';

type ContextTypes = {
  myStuff: {
    foo: string;
    bar: string;
  };
  debug: boolean;
};

interface MyProviderProps {
  foo: string;
  bar: string;
  debug: EventEmitter;
}

interface MyProviderState {
  debug: boolean;
}

class MyProvider extends Component<MyProviderProps, MyProviderState> {
  static childContextTypes = {
    myStuff: PropTypes.shape({
      foo: PropTypes.string,
      bar: PropTypes.string,
    }),
    debug: PropTypes.bool,
  };

  state: MyProviderState = {
    debug: false,
  };

  private handleDebug = (value: boolean) => {
    this.setState({ debug: value });
  };

  componentDidMount() {
    this.props.debug.on('debug', this.handleDebug);
  }

  componentWillUnmount() {
    this.props.debug.removeListener('debug', this.handleDebug);
  }

  getChildContext(): ContextTypes {
    return {
      myStuff: {
        foo: this.props.foo,
        bar: this.props.bar,
      },
      debug: this.state.debug,
    };
  }

  render() {
    return <>{this.props.children}</>;
  }
}

describe('enzyme-context-utils', () => {
  describe('ContextWatcher', () => {
    let watcher: ContextWatcher;
    let listener: jest.Mock;
    let debug: EventEmitter;

    beforeEach(() => {
      debug = new EventEmitter();
      listener = jest.fn();
      watcher = new ContextWatcher(WatcherComponent => (
        <MyProvider foo="hello" bar="world" debug={debug}>
          <WatcherComponent />
        </MyProvider>
      ));
      watcher.listen(listener);
    });

    it('gets the context from a provider', () => {
      expect(watcher.value).toEqual({
        myStuff: {
          foo: 'hello',
          bar: 'world',
        },
        debug: false,
      });
    });

    it('handles changing context', () => {
      expect(listener).not.toHaveBeenCalled();
      debug.emit('debug', true);
      expect(listener).toHaveBeenCalledWith({
        myStuff: {
          foo: 'hello',
          bar: 'world',
        },
        debug: true,
      });
    });

    it('stops listening', () => {
      watcher.stop();
      debug.emit('debug', true);
    });

    it('supports passing childContextTypes directly', () => {
      const Wrapper: React.SFC = ({ children }) => {
        return (
          <MyProvider foo="foo" bar="bar" debug={debug}>
            {children}
          </MyProvider>
        );
      };
      const watcher = new ContextWatcher(
        WatcherComponent => (
          <Wrapper>
            <WatcherComponent />
          </Wrapper>
        ),
        MyProvider.childContextTypes,
      );

      expect(watcher.value).toEqual({
        myStuff: {
          foo: 'foo',
          bar: 'bar',
        },
        debug: false,
      });
    });

    it('throws an error if no childContextTypes are provided', () => {
      const Wrapper: React.SFC = ({ children }) => <>{children}</>;

      expect(
        () =>
          new ContextWatcher(Watcher => (
            <Wrapper>
              <Watcher />
            </Wrapper>
          )),
      ).toThrowErrorMatchingInlineSnapshot(
        `"Provider contextTypes unknown. Either pass a component that defines childContextTypes or pass childContextTypes as the second argument when instantiating ContextWatcher."`,
      );
      expect(
        () =>
          new ContextWatcher(Watcher => (
            <div>
              <Watcher />
            </div>
          )),
      ).toThrowErrorMatchingInlineSnapshot(
        `"Provider contextTypes unknown. Either pass a component that defines childContextTypes or pass childContextTypes as the second argument when instantiating ContextWatcher."`,
      );
    });
  });

  describe('bindContextToWrapper()', () => {
    let debug: EventEmitter;
    let context: ContextWatcher;
    let wrapper: ReactWrapper;
    let unsubscribe: () => void;

    const DebugComponent: React.SFC = (_, context) => <div>{String(context.debug)}</div>;
    DebugComponent.contextTypes = MyProvider.childContextTypes;

    beforeEach(() => {
      debug = new EventEmitter();
      context = new ContextWatcher(Watcher => (
        <MyProvider foo="foo" bar="bar" debug={debug}>
          <Watcher />
        </MyProvider>
      ));
      const updater = bindContextToWrapper(context);
      wrapper = mount(<DebugComponent />, {
        context: {
          ...context.value,
        },
        childContextTypes: {
          ...MyProvider.childContextTypes,
        },
      });
      unsubscribe = updater(wrapper);
    });

    it('updates the wrapper when the context changes', () => {
      expect(wrapper.text()).toBe('false');
      debug.emit('debug', true);
      expect(wrapper.text()).toBe('true');
    });

    it('handles unsubscribing', () => {
      unsubscribe();
      debug.emit('debug', true);
      expect(wrapper.text()).toBe('false');
    });

    it('updates context if the wrapper changes context on mount', () => {
      class InstaChangeProvider extends Component {
        static childContextTypes = {
          data: PropTypes.shape({ foo: PropTypes.string, bar: PropTypes.string }),
          getExcited: PropTypes.func,
        };

        state = {
          data: {
            foo: 'hello',
            bar: 'world',
          },
        };

        getChildContext() {
          return {
            data: this.state.data,
            getExcited: () =>
              this.setState({
                data: { foo: 'hello!', bar: 'world!' },
              }),
          };
        }

        render() {
          return this.props.children;
        }
      }
      class Checker extends Component {
        static contextTypes = InstaChangeProvider.childContextTypes;

        componentDidMount() {
          this.context.getExcited();
        }

        render() {
          return (
            <div>
              {this.context.data.foo} {this.context.data.bar}
            </div>
          );
        }
      }
      context = new ContextWatcher(Watcher => (
        <InstaChangeProvider>
          <Watcher />
        </InstaChangeProvider>
      ));
      const updater = bindContextToWrapper(context);
      wrapper = mount(<Checker />, {
        context: {
          ...context.value,
        },
        childContextTypes: {
          ...InstaChangeProvider.childContextTypes,
        },
      });
      updater(wrapper);
      wrapper.update();

      expect(wrapper.text()).toBe('hello! world!');
    });
  });
});
