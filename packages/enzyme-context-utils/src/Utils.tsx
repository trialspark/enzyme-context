import React, { cloneElement } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { ValidationMap } from 'prop-types';

function isComponentElement(element: React.ReactElement<any>): element is React.CElement<any, any> {
  if (typeof element.type === 'string') {
    return false;
  }

  return typeof element.type !== 'string' && !!(element.type as any).prototype.render;
}

export function getContextFromProvider(
  provider: React.ReactElement<any>,
  childContextTypes?: ValidationMap<any>,
): any {
  let context: any;

  if (!childContextTypes && !isComponentElement(provider)) {
    throw new Error('A React.ComponentClass element must be passed.');
  }

  const root = document.createElement('div');
  const ContextGetter: React.SFC = (_, c) => {
    context = c;
    return null;
  };
  ContextGetter.contextTypes = isComponentElement(provider)
    ? provider.type.childContextTypes
    : childContextTypes;
  render(cloneElement(provider, {}, <ContextGetter />), root);
  unmountComponentAtNode(root);

  return context;
}
