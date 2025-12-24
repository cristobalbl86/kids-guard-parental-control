module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-paper|react-native-vector-icons|react-native-keychain|@react-native-async-storage|@react-native-community|react-native-gesture-handler|react-native-safe-area-context|react-native-screens)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!src/**/__tests__/**',
    '!**/node_modules/**',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/android/',
    '/ios/',
  ],
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  // Prevent worker issues
  maxWorkers: '50%',
  // Force exit after tests complete (prevents hanging workers)
  forceExit: true,
  // Detect open handles that might cause worker issues
  detectOpenHandles: false,
  // Clear mocks between tests
  clearMocks: true,
  // Reset modules between test files
  resetModules: false,
};
