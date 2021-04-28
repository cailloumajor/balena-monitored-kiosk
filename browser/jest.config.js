module.exports = {
  collectCoverageFrom: ["<rootDir>/src/**/*.js"],
  coverageDirectory: "coverage",
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/**/*.spec.ts"],
}
