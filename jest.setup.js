// Jest setup file for Kids Guard parental control app
// Extended matchers are built-in to @testing-library/react-native v12.4+

// Mock react-native-keychain
jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(() => Promise.resolve(true)),
  getGenericPassword: jest.fn(() => Promise.resolve({ password: '1234' })),
  resetGenericPassword: jest.fn(() => Promise.resolve(true)),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

// Mock Native Modules
const mockNativeModules = {
  VolumeControl: {
    setVolume: jest.fn(() => Promise.resolve()),
    getVolume: jest.fn(() => Promise.resolve(50)),
    startEnforcing: jest.fn(() => Promise.resolve()),
    stopEnforcing: jest.fn(() => Promise.resolve()),
    isEnforcingVolume: jest.fn(() => Promise.resolve(false)),
  },
  BrightnessControl: {
    setBrightness: jest.fn(() => Promise.resolve()),
    getBrightness: jest.fn(() => Promise.resolve(50)),
    startEnforcing: jest.fn(() => Promise.resolve()),
    stopEnforcing: jest.fn(() => Promise.resolve()),
    checkWriteSettingsPermission: jest.fn(() => Promise.resolve(true)),
    requestWriteSettingsPermission: jest.fn(() => Promise.resolve()),
  },
  ScreenTimeModule: {
    getDailyUsageSeconds: jest.fn(() => Promise.resolve(0)),
    checkOverlayPermission: jest.fn(() => Promise.resolve(true)),
    requestOverlayPermission: jest.fn(() => Promise.resolve(true)),
    startEnforcing: jest.fn(() => Promise.resolve()),
    stopEnforcing: jest.fn(() => Promise.resolve()),
    isEnforcing: jest.fn(() => Promise.resolve(false)),
  },
  EnforcementServiceModule: {
    updateScreenTimeEnforcement: jest.fn(() => Promise.resolve()),
    stopScreenTimeEnforcement: jest.fn(() => Promise.resolve()),
  },
};

// Mock NativeEventEmitter
const mockEventEmitterInstance = {
  addListener: jest.fn(() => ({ remove: jest.fn() })),
  removeAllListeners: jest.fn(),
};

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter', () => {
  return jest.fn(() => mockEventEmitterInstance);
});

// Mock react-native core
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return Object.setPrototypeOf(
    {
      NativeModules: {
        ...RN.NativeModules,
        ...mockNativeModules,
      },
      NativeEventEmitter: jest.fn(() => mockEventEmitterInstance),
      Platform: {
        ...RN.Platform,
        OS: 'android',
        select: jest.fn((obj) => obj.android),
      },
      Alert: {
        alert: jest.fn(),
      },
    },
    RN
  );
});

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
  }),
  useRoute: () => ({
    params: {},
  }),
  useIsFocused: () => true,
}));

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: jest.fn(),
}));

// Mock react-native-paper
jest.mock('react-native-paper', () => {
  const React = require('react');
  const RN = require('react-native');

  return {
    Provider: ({ children }) => children,
    DefaultTheme: {},
    DarkTheme: {},
    Button: ({ children, onPress, mode, disabled, loading, ...props }) => {
      const testID = props.testID || 'button';
      return React.createElement(
        RN.TouchableOpacity,
        { onPress, disabled: disabled || loading, testID, ...props },
        React.createElement(RN.Text, {}, children)
      );
    },
    Text: ({ children, ...props }) => React.createElement(RN.Text, props, children),
    Card: Object.assign(
      ({ children, ...props }) => React.createElement(RN.View, { testID: 'card', ...props }, children),
      {
        Content: ({ children, ...props }) => React.createElement(RN.View, { testID: 'card-content', ...props }, children),
      }
    ),
    Surface: ({ children, ...props }) => React.createElement(RN.View, props, children),
    IconButton: ({ icon, onPress, disabled, ...props }) => {
      return React.createElement(
        RN.TouchableOpacity,
        { onPress, disabled, testID: `icon-${icon}`, ...props },
        React.createElement(RN.Text, {}, icon)
      );
    },
    Switch: ({ value, onValueChange, disabled, ...props }) => {
      return React.createElement(RN.Switch, {
        value,
        onValueChange,
        disabled,
        testID: 'switch',
        ...props,
      });
    },
    HelperText: ({ children, visible, type, ...props }) => {
      if (!visible) return null;
      return React.createElement(RN.Text, { testID: `helper-${type}`, ...props }, children);
    },
    Divider: (props) => React.createElement(RN.View, { testID: 'divider', ...props }),
    ActivityIndicator: ({ size, color, ...props }) => {
      return React.createElement(RN.ActivityIndicator, { size, color, testID: 'activity-indicator', ...props });
    },
    Portal: ({ children }) => children,
    Dialog: Object.assign(
      ({ children, visible, onDismiss, dismissable, ...props }) => {
        if (!visible) return null;
        return React.createElement(RN.View, { testID: 'dialog', ...props }, children);
      },
      {
        Title: ({ children, ...props }) => React.createElement(RN.Text, { testID: 'dialog-title', ...props }, children),
        Content: ({ children, ...props }) => React.createElement(RN.View, { testID: 'dialog-content', ...props }, children),
        Actions: ({ children, ...props }) => React.createElement(RN.View, { testID: 'dialog-actions', ...props }, children),
      }
    ),
  };
});

// Mock i18n
jest.mock('./src/utils/i18n', () => ({
  t: (key) => key,
  changeLanguage: jest.fn(),
  getLanguage: jest.fn(() => 'en'),
}));

// Mock theme
jest.mock('./src/utils/theme', () => ({
  theme: {
    colors: {
      primary: '#1976D2',
      background: '#FFFFFF',
      surface: '#F5F5F5',
      text: '#000000',
      disabled: '#CCCCCC',
      warning: '#FF9800',
    },
  },
  statusColors: {
    locked: {
      border: '#EF5350',
      background: '#FFEBEE',
      icon: '#D32F2F',
      text: '#C62828',
    },
    unlocked: {
      border: '#66BB6A',
      background: '#E8F5E9',
      icon: '#388E3C',
      text: '#2E7D32',
    },
  },
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

// Mock @react-native-community/slider
jest.mock('@react-native-community/slider', () => ({
  default: 'Slider',
}));

// Silence console errors and warnings during tests (optional)
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
