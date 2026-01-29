module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest'
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.module.ts',
    '!**/*.dto.ts',
    '!**/*.entity.ts',
    '!**/main.ts',
    '!**/config/**',
    '!**/database/**',
    '!**/types/**',
    '!**/automation/**',
    '!**/queue/**',
    '!**/common/logger/**',
    '!**/scraper/scrapers/**',
    '!**/common/interceptors/query-optimization.interceptor.ts'
  ],
  coverageDirectory: '../coverage/backend-core',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/../jest.setup.ts']
};
