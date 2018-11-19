import React from 'react';
import { createMount } from 'enzyme-context';
import { ReactWrapper } from 'enzyme';
import { History } from 'history';
import { withRouter, WithRouterProps, Route } from 'react-router';
import { routerContext } from '.';

const Component: React.SFC<WithRouterProps> = props => {
  return <div>Path is: {props.location.pathname}</div>;
};
const ComponentWithRouter = withRouter<{}>(Component);

describe('enzyme-context-react-router-3', () => {
  let mount: ReturnType<typeof createMount>;
  let history: History;
  let component: ReactWrapper;

  beforeEach(() => {
    const _mount = createMount({
      history: routerContext(),
    });

    mount = _mount;

    ({ component, history } = _mount(<ComponentWithRouter />));
  });

  afterEach(() => {
    component.unmount();
  });

  it('renders the component', () => {
    expect(component.exists()).toBe(true);
    expect(component.text()).toBe('Path is: /');
  });

  it('responds to changing routes', () => {
    history.push('/foo/bar');
    component.update();
    expect(component.text()).toBe('Path is: /foo/bar');

    history.push('/bar/baz');
    component.update();
    expect(component.text()).toBe('Path is: /bar/baz');
  });

  it('supports rendering a <Route /> directly', () => {
    ({ component, history } = mount(<Route path="/foo/bar" component={Component} />));

    expect(component.exists()).toBe(true);
    expect(component.find(Component).exists()).toBe(false);

    history.push('/foo/bar');
    component.update();
    expect(component.find(Component).exists()).toBe(true);
  });

  it('allows memory history options to be passed', () => {
    ({ component } = mount(<Route path="/foo/bar" component={Component} />, {
      routerConfig: { entries: ['/foo/bar'] },
    }));
    expect(component.find(Component).exists()).toBe(true);
  });
});
