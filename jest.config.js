// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  projects: ['<rootDir>/packages/*'],

  coveragePathIgnorePatterns: ['<rootDir>/dist'],

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
};
