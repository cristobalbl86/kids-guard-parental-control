# Testing Guide for Kids Guard Parental Control App

This document provides comprehensive information about running and writing tests for the Kids Guard parental control React Native application.

## Table of Contents

- [Overview](#overview)
- [Test Framework](#test-framework)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Coverage Reports](#coverage-reports)
- [Writing Tests](#writing-tests)
- [Troubleshooting](#troubleshooting)

## Overview

The test suite covers:

- **Utility Functions**: Storage operations, PIN management, volume/brightness control
- **React Components**: Screen components with user interactions
- **Integration Scenarios**: Complete user flows and edge cases

### Test Statistics

- **Total Test Files**: 6
- **Test Categories**:
  - Storage Utilities: 45 tests
  - Volume Control: 43 tests
  - Brightness Control: 43 tests
  - HomeScreen Component: 25+ tests
  - ParentSettingsScreen Component: 30+ tests
  - PIN Screens: 30+ tests

## Test Framework

### Technologies Used

- **Jest**: Test runner and assertion library
- **@testing-library/react-native**: React component testing
- **react-test-renderer**: React rendering for tests

### Configuration

Jest configuration is defined in `jest.config.js`:

```javascript
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [...],
  collectCoverageFrom: ['src/**/*.{js,jsx}', ...],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
};
```

## Running Tests

### Basic Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with verbose output
npm run test:verbose
```

### Running Specific Test Suites

```bash
# Run only storage utility tests
npm run test:storage

# Run only volume control tests
npm run test:volumeControl

# Run only brightness control tests
npm run test:brightnessControl

# Run all utility tests
npm run test:utils

# Run all screen component tests
npm run test:screens
```

### Running Tests for CI/CD

```bash
# Optimized for continuous integration
npm run test:ci
```

This command:
- Runs in CI mode (non-interactive)
- Generates coverage reports
- Uses limited workers for resource management

### Running Individual Test Files

```bash
# Run a specific test file
npm test -- src/utils/__tests__/storage.test.js

# Run tests matching a pattern
npm test -- --testNamePattern="PIN"

# Run tests in a specific directory
npm test -- src/screens/__tests__/
```

## Test Structure

### Test Files Location

```
FamilyHelperRN/
├── src/
│   ├── utils/
│   │   └── __tests__/
│   │       ├── storage.test.js
│   │       ├── volumeControl.test.js
│   │       └── brightnessControl.test.js
│   └── screens/
│       └── __tests__/
│           ├── HomeScreen.test.js
│           ├── ParentSettingsScreen.test.js
│           └── PINScreens.test.js
├── jest.config.js
└── jest.setup.js
```

### Test File Structure

Each test file follows this pattern:

```javascript
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import ComponentOrFunction from '../ComponentOrFunction';

describe('Component/Function Name', () => {
  beforeEach(() => {
    // Setup before each test
    jest.clearAllMocks();
  });

  describe('Feature Group', () => {
    it('should do something specific', () => {
      // Test implementation
    });
  });
});
```

## Coverage Reports

### Generating Coverage

```bash
npm run test:coverage
```

This generates:
- Console output with coverage summary
- HTML report in `coverage/lcov-report/index.html`
- LCOV file for CI tools

### Viewing Coverage

Open the HTML report in a browser:

```bash
# On Windows
start coverage/lcov-report/index.html

# On macOS
open coverage/lcov-report/index.html

# On Linux
xdg-open coverage/lcov-report/index.html
```

### Coverage Thresholds

The project enforces minimum coverage thresholds:

- **Branches**: 60%
- **Functions**: 60%
- **Lines**: 60%
- **Statements**: 60%

Tests will fail in CI if coverage drops below these thresholds.

## Writing Tests

### Testing Utilities

#### Storage Functions

```javascript
import * as storage from '../../utils/storage';
import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('react-native-keychain');
jest.mock('@react-native-async-storage/async-storage');

describe('savePIN', () => {
  it('should save PIN to Keychain', async () => {
    await storage.savePIN('1234');

    expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
      'parent_pin',
      '1234',
      { service: 'parent_pin' }
    );
  });
});
```

#### Native Module Wrappers

```javascript
import { NativeModules } from 'react-native';
import { setVolume } from '../volumeControl';

describe('setVolume', () => {
  it('should call native module with correct volume', async () => {
    await setVolume(75);

    expect(NativeModules.VolumeControl.setVolume)
      .toHaveBeenCalledWith(75);
  });
});
```

### Testing Components

#### Basic Rendering

```javascript
import { render } from '@testing-library/react-native';
import HomeScreen from '../HomeScreen';

it('should render correctly', () => {
  const { getByText } = render(
    <HomeScreen navigation={mockNavigation} />
  );

  expect(getByText('Home')).toBeTruthy();
});
```

#### User Interactions

```javascript
import { render, fireEvent, waitFor } from '@testing-library/react-native';

it('should handle button press', async () => {
  const { getByText } = render(<MyComponent />);

  fireEvent.press(getByText('Submit'));

  await waitFor(() => {
    expect(mockFunction).toHaveBeenCalled();
  });
});
```

#### Testing Async Operations

```javascript
it('should load data on mount', async () => {
  storage.getAllSettings.mockResolvedValue({
    volume: { volume: 50, locked: false },
  });

  const { getByText } = render(<HomeScreen />);

  await waitFor(() => {
    expect(storage.getAllSettings).toHaveBeenCalled();
    expect(getByText('50')).toBeTruthy();
  });
});
```

### Mocking Dependencies

All mocks are centralized in `jest.setup.js`:

- **react-native-keychain**: PIN storage
- **AsyncStorage**: App settings
- **NativeModules**: Volume and brightness controls
- **React Navigation**: Navigation functions
- **react-native-paper**: UI components

## Best Practices

### 1. Test Independence

Each test should be independent and not rely on other tests:

```javascript
beforeEach(() => {
  jest.clearAllMocks();
  // Reset any state
});
```

### 2. Descriptive Test Names

Use clear, descriptive test names:

```javascript
// Good
it('should show error when PIN is incorrect', () => {});

// Bad
it('works', () => {});
```

### 3. Test User Behavior

Focus on testing what users do, not implementation details:

```javascript
// Good - tests user interaction
fireEvent.press(getByText('Save'));
expect(getByText('Saved successfully')).toBeTruthy();

// Bad - tests implementation
expect(component.state.isSaving).toBe(true);
```

### 4. Use waitFor for Async

Always use `waitFor` for asynchronous operations:

```javascript
await waitFor(() => {
  expect(getByText('Loaded')).toBeTruthy();
});
```

### 5. Mock External Dependencies

Mock all external dependencies (native modules, storage, navigation):

```javascript
jest.mock('../utils/storage');
jest.mock('react-native', () => ({
  NativeModules: {
    VolumeControl: {
      setVolume: jest.fn(),
    },
  },
}));
```

## Troubleshooting

### Common Issues

#### 1. "Cannot find module" errors

**Problem**: Jest can't find a module.

**Solution**: Check `transformIgnorePatterns` in `jest.config.js` and ensure the module is included.

#### 2. Tests timeout

**Problem**: Async operations never complete.

**Solution**:
- Ensure all async operations are properly mocked
- Use `waitFor` with appropriate timeout
- Check for infinite loops in component logic

#### 3. "act()" warnings

**Problem**: React state updates not wrapped in `act()`.

**Solution**: Use `waitFor` from `@testing-library/react-native` which handles `act()` automatically.

#### 4. Mock not working

**Problem**: Mock implementation not being used.

**Solution**:
- Ensure mock is defined before imports
- Use `jest.clearAllMocks()` in `beforeEach`
- Check mock is defined in `jest.setup.js`

### Debugging Tests

#### Enable Verbose Logging

```bash
npm run test:verbose
```

#### Run Single Test

```bash
npm test -- --testNamePattern="specific test name"
```

#### Debug in VSCode

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## Continuous Integration

### Running Tests in CI

The project includes a CI-optimized test command:

```bash
npm run test:ci
```

This command is suitable for:
- GitHub Actions
- GitLab CI
- Jenkins
- CircleCI
- Travis CI

### Example CI Configuration (GitHub Actions)

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:ci
      - uses: codecov/codecov-action@v2
        with:
          files: ./coverage/lcov.info
```

## Test Coverage Goals

### Current Coverage

Run `npm run test:coverage` to see current coverage statistics.

### Coverage Goals

- **Utilities**: 80%+ coverage
- **Components**: 60%+ coverage
- **Overall**: 60%+ coverage

### Improving Coverage

Focus on:
1. Edge cases and error handling
2. User interaction flows
3. Component state transitions
4. Async operation completions

## Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Questions or Issues?

If you encounter issues with tests:

1. Check this guide
2. Review existing test files for examples
3. Check Jest and Testing Library documentation
4. Run tests with `--verbose` flag for more details
