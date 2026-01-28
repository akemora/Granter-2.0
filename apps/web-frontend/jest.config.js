const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './'
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^.+\\.(css|less|sass|scss)$': 'identity-obj-proxy'
  },
  testEnvironment: 'jsdom'
};

module.exports = createJestConfig(customJestConfig);
