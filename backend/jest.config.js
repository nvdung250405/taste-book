module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },
  verbose: true,
  clearMocks: true,
  restoreMocks: true,
};
