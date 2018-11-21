import React, { Component, ComponentClass } from 'react';
import TestRenderer from 'react-test-renderer';
import { ValueWatcher, Listener } from './ValueWatcher';
import { ReactWrapper, ShallowWrapper } from 'enzyme';

/**
 * Determines if this element represents a react Component (class).
 *
 * @param element the react node to check
 */
function isComponentElement(element: React.ReactElement<any>): element is React.CElement<any, any> {
  if (typeof element.type === 'string') {
    return false;
  }

  return typeof element.type !== 'string' && !!(element.type as any).prototype.render;
}

/**
 * A class that gets the context of a Provider and notifies listeners when the context changes.
 */
export class ContextWatcher extends ValueWatcher<any> {
  private renderer: TestRenderer.ReactTestRenderer | null;
  private element: React.ReactElement<any>;

  /**
   * @param render a function that accepts a react component as its only argument and must return
   * some JSX that renders that react component as a child of a Provider.
   *
   * @param childContextTypes the `childContextTypes` of the provider. This argument only
   * needs to be passed if the root component returned by `render` does not define `childContextTypes`.
   */
  constructor(
    render: (WatcherComponent: React.ComponentClass) => React.ReactElement<any>,
    childContextTypes?: ComponentClass['childContextTypes'],
  ) {
    /**
     * A react component that will update the context watcher whenever context changes.
     */
    class WatcherComponent extends Component {
      static contextTypes = childContextTypes;

      componentDidMount() {
        watcher.set(this.context);
      }

      componentDidUpdate() {
        watcher.set(this.context);
      }

      render() {
        return null;
      }
    }

    super();

    const watcher = this; // tslint:disable-line no-this-assignment
    const element = render(WatcherComponent);

    // childContextTypes was not passed explicitly; try to infer it by looking at the root
    // element returned by `render()`.
    if (!WatcherComponent.contextTypes && isComponentElement(element)) {
      WatcherComponent.contextTypes = element.type.childContextTypes;
    }

    // This means we could not infer the `childContextTypes` and it was not passed.
    if (!WatcherComponent.contextTypes) {
      throw new Error(
        'Provider contextTypes unknown. Either pass a component that defines childContextTypes ' +
          'or pass childContextTypes as the second argument when instantiating ContextWatcher.',
      );
    }

    this.element = element;
    this.renderer = TestRenderer.create(this.element);
  }

  /**
   * Registers a listener for context changes.
   *
   * @param listener the function to be called with the new context when it changes
   */
  listen(listener: Listener<any>) {
    // If we stopped listening previously, set up the context listener component
    // again.
    if (!this.renderer) {
      this.renderer = TestRenderer.create(this.element);
    }

    return super.listen(listener);
  }

  /**
   * Stops listening for context changes.
   */
  stop() {
    if (this.renderer) {
      this.renderer.unmount();
    }

    this.renderer = null;

    return super.stop();
  }
}

/**
 * A utility that binds a `ContextWatcher` to a given enzyme wrapper, updating its context
 * whenever the watcher's context changes.
 *
 * @param context the `ContextWatcher` to watch
 * @param wrapper the enzyme wrapper to bind to
 * @returns a function that will stop listening
 */
export const bindContextToWrapper = (context: ContextWatcher) => {
  const initialContext = context.value;

  return (wrapper: ReactWrapper | ShallowWrapper) => {
    context.listen(updatedContext => {
      wrapper.setContext(updatedContext);
    });

    // This means that context changed while the component was mounting; we need to make sure the
    // wrapper gets updated too.
    if (context.value !== initialContext) {
      wrapper.setContext(context.value);
    }

    return () => context.stop();
  };
};
