# Getting Started

## 1) Install

**Enzyme Context has peer dependencies on [`react`](https://reactjs.org/docs/getting-started.html) and [`enzyme`](https://airbnb.io/enzyme/docs/installation/). Make sure they are installed and set up correctly before proceeding.**

Enzyme Context loves `yarn`:

```bash
$> yarn add -D enzyme-context
```

But `npm` is fine too:

```bash
$> npm install --dev enzyme-context
```

## 2) Create mount() and shallow()

At TrialSpark, we do this in a module called `test-utils/enzyme`, but you can put yours wherever you like:

```javascript
import { createMount, createShallow } from 'enzyme-context';

export const mount = createMount({});
export const shallow = createShallow({});
```

## 3) Use the mount/shallow we just created in place of enzyme's

```javascript
import { mount } from 'test-utils/enzyme';
import MyComponent from './MyComponent';

describe('<MyComponent />', () => {
  let wrapper;

  beforeEach(() => {
    // shallow()/mount() your component like usual!
    wrapper = mount(<MyComponent />);
  });
});
```

## 4) Add some plugins!

The `mount`/`shallow` we created in step two doesn't really do anything that enzyme doesn't already do out-of-the-box. The next thing you should do is [install some plugins](official-plugins.md).
