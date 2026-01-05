module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "src",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  collectCoverageFrom: ["**/*.(t|j)s"],
  coverageDirectory: "../coverage",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^src/(.*)$": "<rootDir>/$1",
  },
  testTimeout: 30000,
  // Handle ESM modules in node_modules
  transformIgnorePatterns: ["node_modules/(?!(better-auth|oslo)/)"],
  // Ignore integration tests by default (they require DB/Redis)
  testPathIgnorePatterns: ["/node_modules/", "integration\\.spec\\.ts$"],
  // Show console.log output
  verbose: true,
};
