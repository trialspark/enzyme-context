import { IMocks, IMockFn } from 'graphql-tools';

function isMock(mock: any): mock is IMocks {
  if (mock && typeof mock === 'object') {
    return Object.values(mock).every(value => typeof value === 'function');
  }

  return false;
}

export function defaultMocks(mocks: IMocks, defaults: IMocks): IMocks {
  const allKeys = Array.from(new Set([...Object.keys(mocks), ...Object.keys(defaults)]));

  return allKeys.reduce(
    (acc, key) =>
      Object.assign(acc, {
        [key]: ((source, args, context, info) => {
          const resolver = mocks[key];
          const defaultResolver = defaults[key];

          if (resolver && defaultResolver) {
            const value = resolver(source, args, context, info);
            const defaultValue = defaultResolver(source, args, context, info);

            if (isMock(value) && isMock(defaultValue)) {
              return defaultMocks(value, defaultValue);
            }

            return value;
          }

          if (resolver) {
            return resolver(source, args, context, info);
          }

          if (defaultResolver) {
            return defaultResolver(source, args, context, info);
          }
        }) as IMockFn,
      }),
    {},
  );
}
