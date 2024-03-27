import React, { ReactElement } from 'react';
import { createMount, GetContextWrapper } from 'enzyme-context';
import { ReactWrapper, MountRendererProps } from 'enzyme';
import { withRouter, WithRouterProps, Route, hashHistory } from 'react-router';
import { routerContext } from '.';
import { GetOptions } from 'enzyme-context/src';

const Component: React.SFC<WithRouterProps> = props => {
  return <div>Path is: {props.location.pathname}</div>;
};
const ComponentWithRouter = withRouter<{}>(Component as any);

describe('enzyme-context-react-router-3', () => {
  let mount: (
    node: ReactElement<any>,
    options?: GetOptions<MountRendererProps, Plugins>,
  ) => GetContextWrapper<ReactWrapper, Plugins>;
  let component: GetContextWrapper<ReactWrapper, Plugins>;

  type Plugins = {
    history: ReturnType<typeof routerContext>;
  };

  beforeEach(() => {
    const _mount = createMount({
      history: routerContext(),
    });

    mount = _mount;

    component = _mount(<ComponentWithRouter />);
  });

  afterEach(() => {
    component.unmount();
  });

  it('renders the component', () => {
    expect(component.exists()).toBe(true);
    expect(component.text()).toBe('Path is: /');
  });

  it('responds to changing routes', () => {
    component.history.push('/foo/bar');
    component.update();
    expect(component.text()).toBe('Path is: /foo/bar');

    component.history.push('/bar/baz');
    component.update();
    expect(component.text()).toBe('Path is: /bar/baz');
  });

  it('supports rendering a <Route /> directly', () => {
    component = mount(<Route path="/foo/bar" component={Component as any} />);

    expect(component.exists()).toBe(true);
    expect(component.find(Component).exists()).toBe(false);

    component.history.push('/foo/bar');
    component.update();
    expect(component.find(Component).exists()).toBe(true);
  });

  it('allows memory history options to be passed', () => {
    component = mount(<Route path="/foo/bar" component={Component as any} />, {
      routerConfig: { entries: ['/foo/bar'] },
    });
    expect(component.find(Component).exists()).toBe(true);
  });

  it('supports accessing locations query', () => {
    component = mount(
      <Route path="/foo/bar" component={props => <div>{props.location.query.test}</div>} />,
      {
        routerConfig: { entries: ['/foo/bar?test=1'] },
      },
    );
    expect(component.text()).toBe('1');
  });

  it('allows to use history from config', () => {
    const hashHistoryMount = createMount({
      history: routerContext({
        history: hashHistory,
      }),
    });

    const hashHistoryComponent = hashHistoryMount(<ComponentWithRouter />);

    expect(hashHistoryComponent.exists()).toBe(true);
    expect(hashHistoryComponent.text()).toBe('Path is: /');

    hashHistory.push('/foo/bar');

    expect(hashHistoryComponent.text()).toBe('Path is: /foo/bar');

    hashHistoryComponent.unmount();
  });
});
