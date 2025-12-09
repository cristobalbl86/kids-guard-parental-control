import { MD3LightTheme } from 'react-native-paper';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#4A90E2',
    secondary: '#50C878',
    accent: '#F5A623',
    error: '#E74C3C',
    success: '#50C878',
    warning: '#F5A623',
    locked: '#E74C3C',
    unlocked: '#50C878',
    background: '#F5F7FA',
    surface: '#FFFFFF',
    text: '#2C3E50',
    disabled: '#BDC3C7',
    placeholder: '#95A5A6',
  },
  roundness: 8,
};

export const statusColors = {
  locked: {
    background: '#FADBD8',
    border: '#E74C3C',
    text: '#C0392B',
    icon: '#E74C3C',
  },
  unlocked: {
    background: '#D5F4E6',
    border: '#50C878',
    text: '#27AE60',
    icon: '#50C878',
  },
};
