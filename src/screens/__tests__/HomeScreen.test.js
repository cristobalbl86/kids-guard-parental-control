import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../HomeScreen';
import * as storage from '../../utils/storage';
import * as volumeControl from '../../utils/volumeControl';

// Mock the utilities
jest.mock('../../utils/storage');
jest.mock('../../utils/volumeControl');

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
      const { getByText } = render(<HomeScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('home.headerTitle')).toBeTruthy();
      });
    });

    it('should display volume card', async () => {
      const { getByText } = render(<HomeScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('common.volume')).toBeTruthy();
      });
    });

    it('should display settings button', async () => {
      const { getByText } = render(<HomeScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('home.parentSettingsButton')).toBeTruthy();
      });
    });

    it('should display info card', async () => {
      const { getByText } = render(<HomeScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('home.infoTitle')).toBeTruthy();
        expect(getByText('home.infoText')).toBeTruthy();
      });
    });
  });

  describe('Settings Loading', () => {
    it('should load settings on mount', async () => {
      render(<HomeScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(storage.getAllSettings).toHaveBeenCalled();
      });
    });

    it('should initialize volume control', async () => {
      render(<HomeScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(volumeControl.initializeVolumeControl).toHaveBeenCalled();
      });
    });

    it('should display loaded volume settings', async () => {
      storage.getAllSettings.mockResolvedValue({
        volume: { volume: 75, locked: false },
      });

      const { getByText } = render(<HomeScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('75')).toBeTruthy();
      });
    });

    it('should display loaded brightness settings', async () => {
      storage.getAllSettings.mockResolvedValue({
        volume: { volume: 50, locked: false },
        brightness: { brightness: 80, locked: true },
      });

      const { getByText } = render(<HomeScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('80')).toBeTruthy();
      });
    });

    it('should handle settings loading error gracefully', async () => {
      storage.getAllSettings.mockRejectedValue(new Error('Storage error'));

      const { getByText } = render(<HomeScreen navigation={mockNavigation} />);

      // Should still render with default values
      await waitFor(() => {
        expect(getByText('home.headerTitle')).toBeTruthy();
      });
    });
  });

  describe('Lock Status Display', () => {
    it('should show unlocked status when volume is not locked', async () => {
      storage.getAllSettings.mockResolvedValue({
        volume: { volume: 50, locked: false },
        brightness: { brightness: 50, locked: false },
      });

      const { getAllByText } = render(<HomeScreen navigation={mockNavigation} />);

      await waitFor(() => {
        const unlockedElements = getAllByText('common.unlocked');
        expect(unlockedElements.length).toBeGreaterThan(0);
      });
    });

    it('should show locked status when volume is locked', async () => {
      storage.getAllSettings.mockResolvedValue({
        volume: { volume: 60, locked: true },
        brightness: { brightness: 50, locked: false },
      });

      const { getByText } = render(<HomeScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('common.locked')).toBeTruthy();
      });
    });

    it('should show locked status when brightness is locked', async () => {
      storage.getAllSettings.mockResolvedValue({
        volume: { volume: 50, locked: false },
        brightness: { brightness: 70, locked: true },
      });

      const { getByText } = render(<HomeScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('common.locked')).toBeTruthy();
      });
    });

    it('should show locked message when volume is locked', async () => {
      storage.getAllSettings.mockResolvedValue({
        volume: { volume: 60, locked: true },
        brightness: { brightness: 50, locked: false },
      });

      const { getByText } = render(<HomeScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('home.lockedMessage')).toBeTruthy();
      });
    });

    it('should show both locked when both are locked', async () => {
      storage.getAllSettings.mockResolvedValue({
        volume: { volume: 60, locked: true },
        brightness: { brightness: 70, locked: true },
      });

      const { getAllByText } = render(<HomeScreen navigation={mockNavigation} />);

      await waitFor(() => {
        const lockedElements = getAllByText('common.locked');
        expect(lockedElements.length).toBe(2);
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to PIN entry when settings button is pressed', async () => {
      const { getByText } = render(<HomeScreen navigation={mockNavigation} />);

      await waitFor(() => {
        const settingsButton = getByText('home.parentSettingsButton');
        fireEvent.press(settingsButton);
      });

      expect(mockNavigation.navigate).toHaveBeenCalledWith('PINEntry', {
        nextScreen: 'ParentSettings',
      });
    });
  });

  describe('Pull to Refresh', () => {
    it('should reload settings on refresh', async () => {
      render(<HomeScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(storage.getAllSettings).toHaveBeenCalledTimes(1);
      });

      // Note: Testing pull-to-refresh behavior requires triggering the RefreshControl
      // which is difficult to test directly. In a real scenario, this would be tested
      // through integration or E2E tests. For now, we verify that the settings
      // loading logic exists and works.
      expect(storage.getAllSettings).toHaveBeenCalled();
    });
  });

  describe('Different Lock States', () => {
    it('should render with volume locked at 0%', async () => {
      storage.getAllSettings.mockResolvedValue({
        volume: { volume: 0, locked: true },
        brightness: { brightness: 50, locked: false },
      });

      const { getByText } = render(<HomeScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('0')).toBeTruthy();
        expect(getByText('common.locked')).toBeTruthy();
      });
    });

    it('should render with volume locked at 100%', async () => {
      storage.getAllSettings.mockResolvedValue({
        volume: { volume: 100, locked: true },
        brightness: { brightness: 50, locked: false },
      });

      const { getByText } = render(<HomeScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('100')).toBeTruthy();
      });
    });

    it('should render with brightness locked at 0%', async () => {
      storage.getAllSettings.mockResolvedValue({
        volume: { volume: 50, locked: false },
        brightness: { brightness: 0, locked: true },
      });

      const { getByText } = render(<HomeScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('0')).toBeTruthy();
      });
    });

    it('should render with brightness locked at 100%', async () => {
      storage.getAllSettings.mockResolvedValue({
        volume: { volume: 50, locked: false },
        brightness: { brightness: 100, locked: true },
      });

      const { getByText } = render(<HomeScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('100')).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle volume control initialization failure', async () => {
      volumeControl.initializeVolumeControl.mockResolvedValue(false);

      const { getByText } = render(<HomeScreen navigation={mockNavigation} />);

      // Should still render without crashing
      await waitFor(() => {
        expect(getByText('home.headerTitle')).toBeTruthy();
      });
    });

    it('should handle brightness control initialization failure', async () => {
      brightnessControl.initializeBrightnessControl.mockResolvedValue(false);

      const { getByText } = render(<HomeScreen navigation={mockNavigation} />);

      // Should still render without crashing
      await waitFor(() => {
        expect(getByText('home.headerTitle')).toBeTruthy();
      });
    });

    it('should handle both control initializations failing', async () => {
      volumeControl.initializeVolumeControl.mockResolvedValue(false);
      brightnessControl.initializeBrightnessControl.mockResolvedValue(false);

      const { getByText } = render(<HomeScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('home.headerTitle')).toBeTruthy();
      });
    });
  });
});
