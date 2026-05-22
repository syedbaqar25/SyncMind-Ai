module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['./src/tests/setup.js'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/utils/auth.utils.js',
    'src/utils/jwt.utils.js',
    'src/services/ai/actionItems.service.js'
  ],
  coverageThreshold: { global: { lines: 70 } }
};
