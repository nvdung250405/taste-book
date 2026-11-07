module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/setupTokenRevocation.js"],
  testMatch: ["**/tests/**/*.test.js"],
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },
  verbose: true,
  clearMocks: true,
  restoreMocks: true,
};
