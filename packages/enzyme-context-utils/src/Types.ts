import { ReactElement } from 'react';
import { MountRendererProps, ShallowRendererProps, ReactWrapper, ShallowWrapper } from 'enzyme';

export type EnzymePlugin<O extends object, C> = (
  node: ReactElement<any>,
  options: O & Partial<MountRendererProps | ShallowRendererProps>,
) => {
  node: typeof node;
  controller: C;
  options: Partial<MountRendererProps | ShallowRendererProps>;
  updater?: (wrapper: ReactWrapper | ShallowWrapper) => () => void;
};
