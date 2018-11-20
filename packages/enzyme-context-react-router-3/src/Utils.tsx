import React from 'react';
import { Router, Route } from 'react-router';
import { History } from 'history';

const NoopComponent: React.SFC = () => null;

/**
 * If the supplied node is a <Route />, wrap it in a <Router /> so that it
 * can render its `component`.
 *
 * @param node the react element to test
 * @param history the created memory history
 */
export function wrapRoute(node: React.ReactElement<any>, history: History) {
  if (node.type !== Route) {
    return node;
  }

  return (
    <Router history={history}>
      {node}
      {/* render a noop if the path doesn't match so that react-router does not complain */}
      <Route path="*" component={NoopComponent} />
    </Router>
  );
}
