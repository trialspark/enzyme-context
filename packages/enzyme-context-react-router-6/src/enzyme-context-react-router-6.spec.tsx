import React from 'react';
import { createMount, GetContextWrapper } from 'enzyme-context';
import { ReactWrapper } from 'enzyme';
import { Route, Routes, useParams } from 'react-router-dom';
import { routerContext } from '.';
import { act } from 'react-dom/test-utils';

const MyComponent: React.FC = () => {
  const { id } = useParams();
  return <div>id is: {id}</div>;
};

describe('enzyme-context-react-router-6', () => {
  let wrapper: GetContextWrapper<ReactWrapper, Plugins>;

  type Plugins = {
    history: ReturnType<typeof routerContext>;
  };

  const page = () => wrapper.find(MyComponent);

  beforeEach(() => {
    const mount = createMount({
      history: routerContext(),
    });
    wrapper = mount(
      <Routes>
        <Route path="/my/url/:id" element={<MyComponent />} />
      </Routes>,
    );
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('exists', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('returns history as a controller', () => {
    expect(page().exists()).toBe(false);

    act(() => {
      wrapper.history.push('/my/url/1612');
    });
    wrapper.update();
    expect(page().text()).toBe('id is: 1612');
  });

  it('responds to history after the component is remounted', () => {
    wrapper.unmount();
    wrapper.mount();
    expect(page().exists()).toBe(false);

    act(() => {
      wrapper.history.push('/my/url/1612');
    });
    wrapper.update();
    expect(page().exists()).toBe(true);
  });

  it('allows configuration to be passed', () => {
    const mount = createMount({
      history: routerContext(),
    });
    wrapper = mount(
      <Routes>
        <Route path="/my/url/:id" element={<MyComponent />} />
      </Routes>,
      {
        routerConfig: {
          initialEntries: ['/my/url/44'],
        },
      },
    );
    expect(page().text()).toBe('id is: 44');
  });
});
