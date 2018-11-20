import React from 'react';
import { Router, Route } from 'react-router';
import { History } from 'history';

const NoopComponent: React.SFC = () => null;

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
