import { NativeModules, NativeEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initializeVolumeControl,
  setVolume,
  getVolume,
  startVolumeMonitoring,
  stopVolumeMonitoring,
  updateVolumeSettings,
  isVolumeMonitoring,
  getEnforcedVolume,
  addVolumeEnforcementListener,
  removeVolumeEnforcementListener,
} from '../volumeControl';

// Get mocked module
const { VolumeControl } = NativeModules;

describe('Volume Control Utility', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Reset mock implementations
    VolumeControl.setVolume.mockResolvedValue();
    VolumeControl.getVolume.mockResolvedValue(50);
    VolumeControl.startEnforcing.mockResolvedValue();
    VolumeControl.stopEnforcing.mockResolvedValue();
    VolumeControl.isEnforcingVolume.mockResolvedValue(false);
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockResolvedValue();
  });

  describe('initializeVolumeControl', () => {
    it('should initialize successfully with default settings', async () => {
      await jest.isolateModules(async () => {
        AsyncStorage.getItem.mockResolvedValue(
          JSON.stringify({ volume: 50, locked: false })
        );

        const { initializeVolumeControl: init } = require('../volumeControl');
        const result = await init();

        expect(result).toBe(true);
      });
    });

    it('should start monitoring if settings are locked', async () => {
      await jest.isolateModules(async () => {
        AsyncStorage.getItem.mockResolvedValue(
          JSON.stringify({ volume: 75, locked: true })
        );

        const { initializeVolumeControl: init } = require('../volumeControl');
        await init();

        expect(VolumeControl.startEnforcing).toHaveBeenCalledWith(75);
      });
    });

    it('should not start monitoring if settings are unlocked', async () => {
      await jest.isolateModules(async () => {
        AsyncStorage.getItem.mockResolvedValue(
          JSON.stringify({ volume: 50, locked: false })
        );

        const { initializeVolumeControl: init } = require('../volumeControl');
        await init();

        expect(VolumeControl.startEnforcing).not.toHaveBeenCalled();
      });
    });

    it('should return false on initialization error', async () => {
      await jest.isolateModules(async () => {
        AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

        const { initializeVolumeControl: init } = require('../volumeControl');
        const result = await init();

        expect(result).toBe(false);
      });
    });

    it('should skip initialization if already initialized', async () => {
      await jest.isolateModules(async () => {
        AsyncStorage.getItem.mockResolvedValue(
          JSON.stringify({ volume: 50, locked: false })
        );

        const { initializeVolumeControl: init } = require('../volumeControl');
        await init();
        jest.clearAllMocks();

        await init();

        // Should not call AsyncStorage again
        expect(AsyncStorage.getItem).not.toHaveBeenCalled();
      });
    });
  });

  describe('setVolume', () => {
    it('should call native module with correct volume', async () => {
      const result = await setVolume(75);

      expect(VolumeControl.setVolume).toHaveBeenCalledWith(75);
      expect(result).toBe(true);
    });

    it('should clamp volume to 100 maximum', async () => {
      await setVolume(150);

      expect(VolumeControl.setVolume).toHaveBeenCalledWith(100);
    });

    it('should clamp volume to 0 minimum', async () => {
      await setVolume(-10);

      expect(VolumeControl.setVolume).toHaveBeenCalledWith(0);
    });

    it('should return false on native module error', async () => {
      VolumeControl.setVolume.mockRejectedValue(new Error('Native error'));

      const result = await setVolume(50);

      expect(result).toBe(false);
    });

    it('should handle decimal volumes by clamping', async () => {
      await setVolume(75.7);

      expect(VolumeControl.setVolume).toHaveBeenCalledWith(75.7);
    });
  });

  describe('getVolume', () => {
    it('should return current volume from native module', async () => {
      VolumeControl.getVolume.mockResolvedValue(65);

      const volume = await getVolume();

      expect(volume).toBe(65);
      expect(VolumeControl.getVolume).toHaveBeenCalled();
    });

    it('should round volume to nearest integer', async () => {
      VolumeControl.getVolume.mockResolvedValue(65.7);

      const volume = await getVolume();

      expect(volume).toBe(66);
    });

    it('should return 50 as default on error', async () => {
      VolumeControl.getVolume.mockRejectedValue(new Error('Native error'));

      const volume = await getVolume();

      expect(volume).toBe(50);
    });
  });

  describe('startVolumeMonitoring', () => {
    it('should call native module to start enforcing', async () => {
      const result = await startVolumeMonitoring(80);

      expect(VolumeControl.startEnforcing).toHaveBeenCalledWith(80);
      expect(result).toBe(true);
    });

    it('should update enforced volume state', async () => {
      await startVolumeMonitoring(80);

      const enforcedVolume = getEnforcedVolume();

      expect(enforcedVolume).toBe(80);
    });

    it('should return false on native module error', async () => {
      VolumeControl.startEnforcing.mockRejectedValue(new Error('Native error'));

      const result = await startVolumeMonitoring(80);

      expect(result).toBe(false);
    });

    it('should handle 0 volume enforcement', async () => {
      await startVolumeMonitoring(0);

      expect(VolumeControl.startEnforcing).toHaveBeenCalledWith(0);
    });

    it('should handle 100 volume enforcement', async () => {
      await startVolumeMonitoring(100);

      expect(VolumeControl.startEnforcing).toHaveBeenCalledWith(100);
    });
  });

  describe('stopVolumeMonitoring', () => {
    it('should call native module to stop enforcing', async () => {
      const result = await stopVolumeMonitoring();

      expect(VolumeControl.stopEnforcing).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should clear enforced volume state', async () => {
      await startVolumeMonitoring(80);
      await stopVolumeMonitoring();

      const enforcedVolume = getEnforcedVolume();

      expect(enforcedVolume).toBe(null);
    });

    it('should return false on native module error', async () => {
      VolumeControl.stopEnforcing.mockRejectedValue(new Error('Native error'));

      const result = await stopVolumeMonitoring();

      expect(result).toBe(false);
    });
  });

  describe('updateVolumeSettings', () => {
    it('should save settings and start monitoring when locked', async () => {
      const result = await updateVolumeSettings(70, true);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'volume_settings',
        JSON.stringify({ volume: 70, locked: true })
      );
      expect(VolumeControl.startEnforcing).toHaveBeenCalledWith(70);
      expect(result).toBe(true);
    });

    it('should save settings and stop monitoring when unlocked', async () => {
      const result = await updateVolumeSettings(60, false);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'volume_settings',
        JSON.stringify({ volume: 60, locked: false })
      );
      expect(VolumeControl.stopEnforcing).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false on storage error', async () => {
      AsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      const result = await updateVolumeSettings(70, true);

      expect(result).toBe(false);
    });

    it('should return false on native module error', async () => {
      await jest.isolateModules(async () => {
        VolumeControl.startEnforcing.mockRejectedValue(new Error('Native error'));

        const { updateVolumeSettings: update } = require('../volumeControl');
        const result = await update(70, true);

        expect(result).toBe(false);
      });
    });

    it('should handle switching from locked to unlocked', async () => {
      await updateVolumeSettings(70, true);
      jest.clearAllMocks();

      await updateVolumeSettings(70, false);

      expect(VolumeControl.stopEnforcing).toHaveBeenCalled();
      expect(VolumeControl.startEnforcing).not.toHaveBeenCalled();
    });

    it('should handle switching from unlocked to locked', async () => {
      await updateVolumeSettings(60, false);
      jest.clearAllMocks();

      await updateVolumeSettings(80, true);

      expect(VolumeControl.startEnforcing).toHaveBeenCalledWith(80);
      expect(VolumeControl.stopEnforcing).not.toHaveBeenCalled();
    });
  });

  describe('isVolumeMonitoring', () => {
    it('should return monitoring status from native module', async () => {
      VolumeControl.isEnforcingVolume.mockResolvedValue(true);

      const isMonitoring = await isVolumeMonitoring();

      expect(isMonitoring).toBe(true);
      expect(VolumeControl.isEnforcingVolume).toHaveBeenCalled();
    });

    it('should return false on native module error', async () => {
      VolumeControl.isEnforcingVolume.mockRejectedValue(new Error('Native error'));

      const isMonitoring = await isVolumeMonitoring();

      expect(isMonitoring).toBe(false);
    });
  });

  describe('getEnforcedVolume', () => {
    it('should return null when not enforcing', async () => {
      await jest.isolateModules(async () => {
        const { getEnforcedVolume: getEnforced } = require('../volumeControl');
        const enforcedVolume = getEnforced();

        expect(enforcedVolume).toBe(null);
      });
    });

    it('should return enforced volume when monitoring', async () => {
      await startVolumeMonitoring(85);

      const enforcedVolume = getEnforcedVolume();

      expect(enforcedVolume).toBe(85);
    });

    it('should return null after stopping monitoring', async () => {
      await startVolumeMonitoring(85);
      await stopVolumeMonitoring();

      const enforcedVolume = getEnforcedVolume();

      expect(enforcedVolume).toBe(null);
    });
  });

  describe('Event Listeners', () => {
    it('should add volume enforcement listener', () => {
      const callback = jest.fn();

      const subscription = addVolumeEnforcementListener(callback);

      expect(subscription).toBeDefined();
      expect(subscription.remove).toBeDefined();
    });

    it('should remove volume enforcement listener', () => {
      const callback = jest.fn();
      const subscription = addVolumeEnforcementListener(callback);

      removeVolumeEnforcementListener(subscription);

      expect(subscription.remove).toHaveBeenCalled();
    });

    it('should handle removing null subscription', () => {
      expect(() => {
        removeVolumeEnforcementListener(null);
      }).not.toThrow();
    });

    it('should handle removing undefined subscription', () => {
      expect(() => {
        removeVolumeEnforcementListener(undefined);
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid volume changes', async () => {
      await setVolume(10);
      await setVolume(20);
      await setVolume(30);

      expect(VolumeControl.setVolume).toHaveBeenCalledTimes(3);
      expect(VolumeControl.setVolume).toHaveBeenLastCalledWith(30);
    });

    it('should handle rapid lock/unlock toggles', async () => {
      await updateVolumeSettings(50, true);
      await updateVolumeSettings(50, false);
      await updateVolumeSettings(50, true);

      expect(VolumeControl.startEnforcing).toHaveBeenCalledTimes(2);
      expect(VolumeControl.stopEnforcing).toHaveBeenCalledTimes(1);
    });

    it('should handle monitoring status check during enforcement', async () => {
      VolumeControl.isEnforcingVolume.mockResolvedValue(true);

      await startVolumeMonitoring(75);
      const status = await isVolumeMonitoring();

      expect(status).toBe(true);
    });

    it('should handle concurrent monitoring operations', async () => {
      const promises = [
        startVolumeMonitoring(60),
        startVolumeMonitoring(70),
        startVolumeMonitoring(80),
      ];

      await Promise.all(promises);

      expect(VolumeControl.startEnforcing).toHaveBeenCalledTimes(3);
      expect(getEnforcedVolume()).toBe(80); // Last one wins
    });
  });
});
