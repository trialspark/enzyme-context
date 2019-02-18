import React from 'react';
import { createMount, GetContextWrapper } from 'enzyme-context';
import { ReactWrapper } from 'enzyme';
import { createStore, Reducer, ActionCreator, Action } from 'redux';
import { connect, MapStateToProps } from 'react-redux';
import { reduxContext } from '.';

const MyComponent: React.SFC<ComponentReduxProps> = props => {
  return <div>debug is: {String(props.debug)}</div>;
};
type ComponentReduxProps = {
  debug: ReduxState['test']['debug'];
};
const mapStateToProps: MapStateToProps<ComponentReduxProps, {}, ReduxState> = state => {
  return {
    debug: state.test.debug,
  };
};
const ConnectedComponent = connect(
  mapStateToProps,
  {},
)(MyComponent);

interface ReduxState {
  test: {
    debug: boolean;
  };
}

interface SetDebugAction extends Action<'SET_DEBUG'> {
  payload: boolean;
}
const setDebug: ActionCreator<SetDebugAction> = (value: boolean) => ({
  type: 'SET_DEBUG',
  payload: value,
});

const reducer: Reducer<ReduxState, SetDebugAction> = (
  state = { test: { debug: false } },
  action,
) => {
  switch (action.type) {
    case 'SET_DEBUG':
      return {
        ...state,
        test: {
          ...state.test,
          debug: action.payload,
        },
      };
    default:
      return state;
  }
};

describe('enzyme-context-redux', () => {
  let component: GetContextWrapper<ReactWrapper, Plugins>;

  type Plugins = {
    store: ReturnType<typeof reduxContext>;
  };

  beforeEach(() => {
    const mount = createMount({
      store: reduxContext({
        createStore: () => createStore<ReduxState, any, {}, {}>(reducer),
      }),
    });
    component = mount(<ConnectedComponent />);
  });

  it('renders the component', () => {
    expect(component.exists()).toBe(true);
    expect(component.text()).toBe('debug is: false');
  });

  it('returns the store as a controller', () => {
    component.store.dispatch(setDebug(true));
    component.update();
    expect(component.text()).toBe('debug is: true');
  });

  it('supports dispatching initial actions', () => {
    const mount = createMount({
      store: reduxContext({
        createStore: () => createStore<ReduxState, any, {}, {}>(reducer),
      }),
    });
    component = mount(<ConnectedComponent />, {
      initialActions: [setDebug(true)],
    });
    expect(component.text()).toBe('debug is: true');
  });
});
