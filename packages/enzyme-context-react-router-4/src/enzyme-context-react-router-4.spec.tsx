import React from 'react';
import { createMount } from 'enzyme-context';
import { ReactWrapper } from 'enzyme';
import { RouteComponentProps } from 'react-router';
import { Route } from 'react-router-dom';
import { MemoryHistory } from 'history';
import { routerContext } from '.';

const MyComponent: React.SFC<RouteComponentProps<{ id: string }>> = props => {
  return <div>id is: {props.match.params.id}</div>;
};

describe('enzyme-context-react-router-4', () => {
  let component: ReactWrapper;
  let history: MemoryHistory;

  const page = () => component.find(MyComponent);

  beforeEach(() => {
    const mount = createMount({
      history: routerContext(),
    });
    ({ component, history } = mount(<Route path="/my/url/:id" component={MyComponent} />));
  });

  afterEach(() => {
    component.unmount();
  });

  it('exists', () => {
    expect(component.exists()).toBe(true);
  });

  it('returns history as a controller', () => {
    expect(page().exists()).toBe(false);
    history.push('/my/url/1612');
    component.update();
    expect(page().text()).toBe('id is: 1612');
  });

  it('responds to history after the component is remounted', () => {
    component.unmount();
    component.mount();
    expect(page().exists()).toBe(false);

    history.push('/my/url/1612');
    component.update();
    expect(page().exists()).toBe(true);
  });

  it('allows configuration to be passed', () => {
    const mount = createMount({
      history: routerContext(),
    });
    ({ component } = mount(<Route path="/my/url/:id" component={MyComponent} />, {
      routerConfig: {
        initialEntries: ['/my/url/44'],
      },
    }));
    expect(page().text()).toBe('id is: 44');
  });
});
