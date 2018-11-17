import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getContextFromProvider } from './index';

describe('enzyme-context-utils', () => {
  describe('getContextForProvider()', () => {
    type ContextTypes = {
      myStuff: {
        foo: string;
        bar: string;
      };
      debug: boolean;
    };

    interface MyProviderProps {
      foo: string;
      bar: string;
    }

    class MyProvider extends Component<MyProviderProps> {
      static childContextTypes = {
        myStuff: PropTypes.shape({
          foo: PropTypes.string,
          bar: PropTypes.string,
        }),
        debug: PropTypes.bool,
      };

      getChildContext(): ContextTypes {
        return {
          myStuff: {
            foo: this.props.foo,
            bar: this.props.bar,
          },
          debug: false,
        };
      }

      render() {
        return <>{this.props.children}</>;
      }
    }

    it('gets the context from a provider', () => {
      expect(getContextFromProvider(<MyProvider foo="hello" bar="world" />)).toEqual({
        myStuff: {
          foo: 'hello',
          bar: 'world',
        },
        debug: false,
      });
    });

    it('throws an error if an html element or functional component is passed', () => {
      const FuncComp: React.SFC = () => null;

      expect(() => getContextFromProvider(<span />)).toThrowErrorMatchingInlineSnapshot(
        `"A React.ComponentClass element must be passed."`,
      );
      expect(() => getContextFromProvider(<FuncComp />)).toThrowErrorMatchingInlineSnapshot(
        `"A React.ComponentClass element must be passed."`,
      );
    });
  });
});
