module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests', '<rootDir>/packages', '<rootDir>/apps'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'packages/**/*.ts',
    'apps/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapping: {
    '^@packages/(.*)$': '<rootDir>/packages/$1/src',
    '^@apps/(.*)$': '<rootDir>/apps/$1/src',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};