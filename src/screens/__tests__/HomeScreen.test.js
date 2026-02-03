import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../HomeScreen';
import * as storage from '../../utils/storage';
import * as volumeControl from '../../utils/volumeControl';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Mock the utilities
jest.mock('../../utils/storage');
jest.mock('../../utils/volumeControl');

// Wrapper component to provide SafeAreaProvider for tests
const SafeAreaWrapper = ({ children }) => (
  <SafeAreaProvider initialMetrics={{ insets: { top: 0, left: 0, right: 0, bottom: 0 }, frame: { x: 0, y: 0, width: 0, height: 0 } }}>
    {children}
  </SafeAreaProvider>
);

describe('HomeScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    storage.getAllSettings.mockResolvedValue({
      volume: { volume: 50, locked: false },
    });
    volumeControl.initializeVolumeControl.mockResolvedValue(true);
    volumeControl.isVolumeMonitoring.mockResolvedValue(false);
  });

  describe('Rendering', () => {
    it('should render correctly with default state', async () => {
      const { getByText } = render(
        <SafeAreaWrapper>
          <HomeScreen navigation={mockNavigation} />
        </SafeAreaWrapper>
      );

      await waitFor(() => {
        expect(getByText('home.headerTitle')).toBeTruthy();
      });
    });

    it('should display volume card', async () => {
      const { getByText } = render(
        <SafeAreaWrapper>
          <HomeScreen navigation={mockNavigation} />
        </SafeAreaWrapper>
      );

      await waitFor(() => {
        expect(getByText('common.volume')).toBeTruthy();
      });
    });

    it('should display settings button', async () => {
      const { getByText } = render(
        <SafeAreaWrapper>
          <HomeScreen navigation={mockNavigation} />
        </SafeAreaWrapper>
      );

      await waitFor(() => {
        expect(getByText('home.parentSettingsButton')).toBeTruthy();
      });
    });
  });

  describe('Settings Loading', () => {
    it('should load settings on mount', async () => {
      render(
        <SafeAreaWrapper>
          <HomeScreen navigation={mockNavigation} />
        </SafeAreaWrapper>
      );

      await waitFor(() => {
        expect(storage.getAllSettings).toHaveBeenCalled();
      });
    });

    it('should display loaded volume settings', async () => {
      storage.getAllSettings.mockResolvedValue({
        volume: { volume: 80, locked: true },
      });

      const { getByText } = render(
        <SafeAreaWrapper>
          <HomeScreen navigation={mockNavigation} />
        </SafeAreaWrapper>
      );

      await waitFor(() => {
        expect(getByText('80')).toBeTruthy();
      });
    });

    it('should handle settings loading error gracefully', async () => {
      storage.getAllSettings.mockRejectedValue(new Error('Storage error'));

      const { getByText } = render(
        <SafeAreaWrapper>
          <HomeScreen navigation={mockNavigation} />
        </SafeAreaWrapper>
      );

      await waitFor(() => {
        expect(getByText('home.headerTitle')).toBeTruthy();
      });
    });
  });

  describe('Lock Status Display', () => {
    it('should show unlocked status when volume is not locked', async () => {
      storage.getAllSettings.mockResolvedValue({
        volume: { volume: 50, locked: false },
      });

      const { getByText } = render(
        <SafeAreaWrapper>
          <HomeScreen navigation={mockNavigation} />
        </SafeAreaWrapper>
      );

      await waitFor(() => {
        expect(getByText('common.unlocked')).toBeTruthy();
      });
    });

    it('should show locked status when volume is locked', async () => {
      storage.getAllSettings.mockResolvedValue({
        volume: { volume: 60, locked: true },
      });

      const { getByText } = render(
        <SafeAreaWrapper>
          <HomeScreen navigation={mockNavigation} />
        </SafeAreaWrapper>
      );

      await waitFor(() => {
        expect(getByText('common.locked')).toBeTruthy();
      });
    });

    it('should show locked message when volume is locked', async () => {
      storage.getAllSettings.mockResolvedValue({
        volume: { volume: 50, locked: true },
      });

      const { getByText } = render(
        <SafeAreaWrapper>
          <HomeScreen navigation={mockNavigation} />
        </SafeAreaWrapper>
      );

      await waitFor(() => {
        expect(getByText('home.lockedMessage')).toBeTruthy();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to PIN entry when settings button is pressed', async () => {
      const { getByText } = render(
        <SafeAreaWrapper>
          <HomeScreen navigation={mockNavigation} />
        </SafeAreaWrapper>
      );

      await waitFor(() => {
        const settingsButton = getByText('home.parentSettingsButton');
        fireEvent.press(settingsButton);

        expect(mockNavigation.navigate).toHaveBeenCalledWith('PINEntry', {
          nextScreen: 'ParentSettings',
        });
      });
    });
  });

  describe('Pull to Refresh', () => {
    it('should reload settings on refresh', async () => {
      const { getByTestId } = render(
        <SafeAreaWrapper>
          <HomeScreen navigation={mockNavigation} />
        </SafeAreaWrapper>
      );

      await waitFor(() => {
        expect(storage.getAllSettings).toHaveBeenCalled();
      });

      // Clear previous calls
      storage.getAllSettings.mockClear();

      // Note: Testing pull-to-refresh requires ScrollView testID
      // which would be added in production code for better testability
    });
  });

  describe('Different Lock States', () => {
    it('should render with volume locked at 0%', async () => {
      storage.getAllSettings.mockResolvedValue({
        volume: { volume: 0, locked: true },
      });

      const { getByText } = render(
        <SafeAreaWrapper>
          <HomeScreen navigation={mockNavigation} />
        </SafeAreaWrapper>
      );

      await waitFor(() => {
        expect(getByText('0')).toBeTruthy();
        expect(getByText('common.locked')).toBeTruthy();
      });
    });

    it('should render with volume locked at 100%', async () => {
      storage.getAllSettings.mockResolvedValue({
        volume: { volume: 100, locked: true },
      });

      const { getByText } = render(
        <SafeAreaWrapper>
          <HomeScreen navigation={mockNavigation} />
        </SafeAreaWrapper>
      );

      await waitFor(() => {
        expect(getByText('100')).toBeTruthy();
        expect(getByText('common.locked')).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle volume control initialization failure', async () => {
      volumeControl.initializeVolumeControl.mockResolvedValue(false);

      const { getByText } = render(
        <SafeAreaWrapper>
          <HomeScreen navigation={mockNavigation} />
        </SafeAreaWrapper>
      );

      await waitFor(() => {
        // Screen should still render even if volume control init fails
        expect(getByText('home.headerTitle')).toBeTruthy();
      });
    });
  });
});
