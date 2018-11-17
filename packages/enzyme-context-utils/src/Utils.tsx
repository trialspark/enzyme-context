import React, { cloneElement } from 'react';
import { render } from 'react-dom';

function isComponentElement(element: React.ReactElement<any>): element is React.CElement<any, any> {
  if (typeof element.type === 'string') {
    return false;
  }

  return typeof element.type !== 'string' && !!(element.type as any).prototype.render;
}

export function getContextFromProvider(provider: React.ReactElement<any>): any {
  let context: any;

  if (!isComponentElement(provider)) {
    throw new Error('A React.ComponentClass element must be passed.');
  }

  const ContextGetter: React.SFC = (_, c) => {
    context = c;
    return null;
  };
  ContextGetter.contextTypes = provider.type.childContextTypes;
  render(cloneElement(provider, {}, <ContextGetter />), document.createElement('div'));

  return context;
}
