import { EventEmitter } from 'events';
import React, { Component } from 'react';
import { Router, RouterContext, Route } from 'react-router';
import { render, unmountComponentAtNode } from 'react-dom';
import { History } from 'history';

const NoopComponent: React.SFC = () => null;

export class RouterContextListener extends EventEmitter {
  public context: any;
  private root = document.createElement('div');

  constructor(history: History) {
    super();

    const emitter = this; // tslint:disable-line no-this-assignment

    this.on('contextUpdated', context => {
      this.context = context;
    });

    class GetContext extends Component {
      static contextTypes = RouterContext.childContextTypes;

      componentDidMount() {
        emitter.emit('contextUpdated', this.context);
      }

      componentDidUpdate() {
        emitter.emit('contextUpdated', this.context);
      }

      render() {
        return null;
      }
    }

    render(
      <Router history={history}>
        <Route path="*" component={GetContext} />
      </Router>,
      this.root,
    );
  }

  destroy() {
    this.removeAllListeners();
    unmountComponentAtNode(this.root);
  }
}

export function wrapRoute(node: React.ReactElement<any>, history: History) {
  if (node.type !== Route) {
    return node;
  }

  return (
    <Router history={history}>
      {node}
      <Route path="*" component={NoopComponent} />
    </Router>
  );
}
