/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  clearMocks: true,
  coveragePathIgnorePatterns: ["/node_modules/", "/tests/"],
  // Integration tests share one real database and call cleanDb() between
  // suites, which wipes ALL tables. Running files in parallel (Jest's
  // default) lets one suite's cleanup wipe another suite's data mid-test,
  // causing flaky failures. Forcing serial execution fixes that.
  maxWorkers: 1,
};
