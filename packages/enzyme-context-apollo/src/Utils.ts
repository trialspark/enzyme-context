import { IMocks, IMockFn } from 'graphql-tools';

/**
 * Checks if a provided value is a collection of mock resolvers. Mock resolvers are
 * infered as being an object where every value is a function.
 *
 * @param mock the value to test
 */
function isMock(mock: any): mock is IMocks {
  if (mock && typeof mock === 'object') {
    return Object.values(mock).every(value => typeof value === 'function');
  }

  return false;
}

/**
 * Merges two apollo mock resolvers together into one resolver.
 *
 * @param mocks the base mocks
 * @param defaults mocks that are only applied if they don't exist on `mocks`
 */
export function defaultMocks(mocks: IMocks, defaults: IMocks): IMocks {
  // Get the superset of keys between the two objects. For example, if
  // mocks = { a, b, c } and defaults = { c, d, e } then the result is [a, b, c, d, e]
  const allKeys = Array.from(new Set([...Object.keys(mocks), ...Object.keys(defaults)]));

  return allKeys.reduce(
    (acc, key) =>
      Object.assign(acc, {
        // Create a new function for every key
        [key]: ((source, args, context, info) => {
          const resolver = mocks[key];
          const defaultResolver = defaults[key];

          // This means there is a "conflict" (we have a base mock _and_ default mock defined)
          if (resolver && defaultResolver) {
            // Call _both_ resolvers
            const value = resolver(source, args, context, info);
            const defaultValue = defaultResolver(source, args, context, info);

            // If both the base mock and the default mock return a deeper level of mocks,
            // call this function recursively to merge their mocks together.
            if (isMock(value) && isMock(defaultValue)) {
              return defaultMocks(value, defaultValue);
            }

            // Otherwise, always return the base mock's value, not the default's
            return value;
          }

          // Call the base mock's resolver first
          if (resolver) {
            return resolver(source, args, context, info);
          }

          // Fallback to the default
          if (defaultResolver) {
            return defaultResolver(source, args, context, info);
          }
        }) as IMockFn,
      }),
    {},
  );
}
