import { EnzymePlugin } from 'enzyme-context-utils';

export type SecondArgument<F> = F extends (arg1: any, arg2: infer T, ...args: any[]) => any
  ? T
  : never;

export type EnzymePlugins = {
  [plugin: string]: EnzymePlugin<any, any>;
};

export type GetControllers<P extends EnzymePlugins> = {
  [PluginName in keyof P]: ReturnType<P[PluginName]>['controller']
};

export type GetTestObjects<EW, P extends EnzymePlugins> = {
  component: EW;
} & GetControllers<P>;

export type GetOptions<RP, P extends EnzymePlugins> = RP &
  { [PluginName in keyof P]: SecondArgument<P[PluginName]> }[keyof P];
