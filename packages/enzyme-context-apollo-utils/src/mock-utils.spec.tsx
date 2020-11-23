import { GraphQLResolveInfo } from 'graphql';
import { IMocks } from 'graphql-tools';
import { defaultMocks } from '.';

describe('mock-utils', () => {
  const defaultMockResolvers = {
    address: () => ({
      street: '45 West 11th',
      city: 'New York',
      state: 'NY',
      zip: '10011',
    }),
    company: () => ({
      name: 'TrialSpark',
      age: null,
    }),
  };
  const customAddress = {
    street: '45 East 12th',
    city: 'New York',
    state: 'NY',
    zip: '10014',
  };
  const customCompany = {
    name: 'Cool Co.',
    age: null,
  };
  const customMocks = {
    address: () => customAddress,
    company: () => customCompany,
  };
  const defaultResolverErrorMessage = 'Default mock not found!';
  const defaultResolversWithError = {
    ...defaultMockResolvers,
    address: () => {
      throw new Error(defaultResolverErrorMessage);
    },
  };

  const callResolverForKey = (mocks: IMocks, key: string) =>
    mocks[key]({}, {}, {}, {} as GraphQLResolveInfo);

  it('supports overriding the default mocks', async () => {
    const result = defaultMocks(customMocks, defaultMockResolvers);
    expect(callResolverForKey(result, 'address')).toEqual(customAddress);
    expect(callResolverForKey(result, 'company')).toEqual(customCompany);
  });

  it('returns the result of a custom resolver if the default resolver throws an error', () => {
    const result = defaultMocks(customMocks, defaultResolversWithError);
    expect(callResolverForKey(result, 'address')).toEqual(customAddress);
    expect(callResolverForKey(result, 'company')).toEqual(customCompany);
  });

  it('throws the error from the default resolver if there is no custom resolver', () => {
    expect(defaultMocks({}, defaultResolversWithError)['address']).toThrowError(
      defaultResolverErrorMessage,
    );
  });
});
