module.exports = {
  testEnvironment: 'node',
  globalSetup: './jest.globalSetup.js',
  setupFilesAfterEnv: [
    './jest.setup.js'
  ],
  testRegex: 'e2e/e2e.*\\.js$'
}
