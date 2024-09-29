import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  roots: ["<rootDir>/src"],
  collectCoverage: true,
  collectCoverageFrom: ["<rootDir>/src/useCases/**/*UseCase.ts"],
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  coverageReporters: ["text-summary", "lcov"],
  verbose: false,
  bail: true,
  clearMocks: true,
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/*.spec.ts"],
  transform: {
    ".+\\.ts$": "ts-jest",
  },
};

export default config;
