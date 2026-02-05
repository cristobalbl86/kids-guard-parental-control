// Mock storage module BEFORE importing screenTimeControl
jest.mock('../storage', () => ({
  saveScreenTimeSettings: jest.fn(),
  getScreenTimeSettings: jest.fn(),
}));

import { NativeModules } from 'react-native';
import * as storage from '../storage';
import {
  initializeScreenTimeControl,
  getDailyUsageSeconds,
  checkOverlayPermission,
  requestOverlayPermission,
  updateScreenTimeSettings,
  formatSeconds,
  formatMinutes,
  isScreenTimeMonitoring,
} from '../screenTimeControl';

// Get references to the mocked native modules (from jest.setup.js)
const mockScreenTimeModule = NativeModules.ScreenTimeModule;
const mockEnforcementServiceModule = NativeModules.EnforcementServiceModule;

describe('Screen Time Control Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    storage.getScreenTimeSettings.mockResolvedValue({
      limitMinutes: 120,
      locked: false,
      isDefault: false,
    });
    storage.saveScreenTimeSettings.mockResolvedValue();
    mockScreenTimeModule.getDailyUsageSeconds.mockResolvedValue(0);
    mockScreenTimeModule.checkOverlayPermission.mockResolvedValue(true);
    mockScreenTimeModule.requestOverlayPermission.mockResolvedValue(true);
    mockScreenTimeModule.startEnforcing.mockResolvedValue();
    mockScreenTimeModule.stopEnforcing.mockResolvedValue();
    mockScreenTimeModule.isEnforcing.mockResolvedValue(false);
    mockEnforcementServiceModule.updateScreenTimeEnforcement.mockResolvedValue();
    mockEnforcementServiceModule.stopScreenTimeEnforcement.mockResolvedValue();
  });

  describe('initializeScreenTimeControl', () => {
    it('should initialize successfully and return true', async () => {
      const result = await initializeScreenTimeControl();

      expect(result).toBe(true);
      expect(storage.getScreenTimeSettings).toHaveBeenCalled();
    });

    it('should restore enforcement service if locked', async () => {
      storage.getScreenTimeSettings.mockResolvedValue({
        limitMinutes: 120,
        locked: true,
        isDefault: false,
      });

      await initializeScreenTimeControl();

      expect(mockEnforcementServiceModule.updateScreenTimeEnforcement).toHaveBeenCalledWith(true);
    });

    it('should not restore enforcement service if not locked', async () => {
      storage.getScreenTimeSettings.mockResolvedValue({
        limitMinutes: 120,
        locked: false,
        isDefault: false,
      });

      await initializeScreenTimeControl();

      expect(mockEnforcementServiceModule.updateScreenTimeEnforcement).not.toHaveBeenCalled();
    });

    it('should not restore enforcement service if settings are default', async () => {
      storage.getScreenTimeSettings.mockResolvedValue({
        limitMinutes: 120,
        locked: true,
        isDefault: true,
      });

      await initializeScreenTimeControl();

      expect(mockEnforcementServiceModule.updateScreenTimeEnforcement).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      storage.getScreenTimeSettings.mockRejectedValue(new Error('Storage error'));

      const result = await initializeScreenTimeControl();

      expect(result).toBe(false);
    });
  });

  describe('getDailyUsageSeconds', () => {
    it('should return daily usage in seconds', async () => {
      mockScreenTimeModule.getDailyUsageSeconds.mockResolvedValue(3600);

      const usage = await getDailyUsageSeconds();

      expect(usage).toBe(3600);
      expect(mockScreenTimeModule.getDailyUsageSeconds).toHaveBeenCalled();
    });

    it('should return 0 on error', async () => {
      mockScreenTimeModule.getDailyUsageSeconds.mockRejectedValue(new Error('Error'));

      const usage = await getDailyUsageSeconds();

      expect(usage).toBe(0);
    });
  });

  describe('checkOverlayPermission', () => {
    it('should return true when permission is granted', async () => {
      mockScreenTimeModule.checkOverlayPermission.mockResolvedValue(true);

      const hasPermission = await checkOverlayPermission();

      expect(hasPermission).toBe(true);
      expect(mockScreenTimeModule.checkOverlayPermission).toHaveBeenCalled();
    });

    it('should return false when permission is not granted', async () => {
      mockScreenTimeModule.checkOverlayPermission.mockResolvedValue(false);

      const hasPermission = await checkOverlayPermission();

      expect(hasPermission).toBe(false);
    });

    it('should return false on error', async () => {
      mockScreenTimeModule.checkOverlayPermission.mockRejectedValue(new Error('Error'));

      const hasPermission = await checkOverlayPermission();

      expect(hasPermission).toBe(false);
    });
  });

  describe('requestOverlayPermission', () => {
    it('should request overlay permission', async () => {
      mockScreenTimeModule.requestOverlayPermission.mockResolvedValue(true);

      const result = await requestOverlayPermission();

      expect(result).toBe(true);
      expect(mockScreenTimeModule.requestOverlayPermission).toHaveBeenCalled();
    });

    it('should throw error on failure', async () => {
      mockScreenTimeModule.requestOverlayPermission.mockRejectedValue(new Error('Permission denied'));

      await expect(requestOverlayPermission()).rejects.toThrow('Permission denied');
    });
  });

  describe('updateScreenTimeSettings', () => {
    it('should save settings and start enforcement when locked', async () => {
      const result = await updateScreenTimeSettings(120, true);

      expect(result).toBe(true);
      expect(storage.saveScreenTimeSettings).toHaveBeenCalledWith({
        limitMinutes: 120,
        locked: true,
      });
      expect(mockScreenTimeModule.startEnforcing).toHaveBeenCalledWith(7200); // 120 * 60
      expect(mockEnforcementServiceModule.updateScreenTimeEnforcement).toHaveBeenCalledWith(true);
    });

    it('should save settings and stop enforcement when unlocked', async () => {
      const result = await updateScreenTimeSettings(120, false);

      expect(result).toBe(true);
      expect(storage.saveScreenTimeSettings).toHaveBeenCalledWith({
        limitMinutes: 120,
        locked: false,
      });
      expect(mockScreenTimeModule.stopEnforcing).toHaveBeenCalled();
      expect(mockEnforcementServiceModule.stopScreenTimeEnforcement).toHaveBeenCalled();
    });

    it('should convert minutes to seconds correctly', async () => {
      await updateScreenTimeSettings(60, true);

      expect(mockScreenTimeModule.startEnforcing).toHaveBeenCalledWith(3600); // 60 * 60
    });

    it('should handle different time limits', async () => {
      await updateScreenTimeSettings(180, true);

      expect(mockScreenTimeModule.startEnforcing).toHaveBeenCalledWith(10800); // 180 * 60
    });

    it('should return false on error', async () => {
      storage.saveScreenTimeSettings.mockRejectedValue(new Error('Storage error'));

      const result = await updateScreenTimeSettings(120, true);

      expect(result).toBe(false);
    });
  });

  describe('formatSeconds', () => {
    it('should format seconds to hours and minutes', () => {
      expect(formatSeconds(3661)).toBe('1h 1m');
    });

    it('should format minutes only when less than 1 hour', () => {
      expect(formatSeconds(1800)).toBe('30m');
    });

    it('should format multiple hours and minutes', () => {
      expect(formatSeconds(7230)).toBe('2h 0m');
    });

    it('should handle zero seconds', () => {
      expect(formatSeconds(0)).toBe('0m');
    });

    it('should handle exact hours', () => {
      expect(formatSeconds(3600)).toBe('1h 0m');
    });

    it('should round down partial minutes', () => {
      expect(formatSeconds(90)).toBe('1m');
    });
  });

  describe('formatMinutes', () => {
    it('should format minutes to hours and minutes', () => {
      expect(formatMinutes(90)).toBe('1h 30m');
    });

    it('should format minutes only when less than 1 hour', () => {
      expect(formatMinutes(45)).toBe('45m');
    });

    it('should format hours only when no remaining minutes', () => {
      expect(formatMinutes(120)).toBe('2h');
    });

    it('should handle zero minutes', () => {
      expect(formatMinutes(0)).toBe('0m');
    });

    it('should handle multiple hours', () => {
      expect(formatMinutes(250)).toBe('4h 10m');
    });

    it('should handle exact hours', () => {
      expect(formatMinutes(180)).toBe('3h');
    });
  });

  describe('isScreenTimeMonitoring', () => {
    it('should return true when monitoring is active', async () => {
      mockScreenTimeModule.isEnforcing.mockResolvedValue(true);

      const isMonitoring = await isScreenTimeMonitoring();

      expect(isMonitoring).toBe(true);
      expect(mockScreenTimeModule.isEnforcing).toHaveBeenCalled();
    });

    it('should return false when monitoring is not active', async () => {
      mockScreenTimeModule.isEnforcing.mockResolvedValue(false);

      const isMonitoring = await isScreenTimeMonitoring();

      expect(isMonitoring).toBe(false);
    });

    it('should return false on error', async () => {
      mockScreenTimeModule.isEnforcing.mockRejectedValue(new Error('Error'));

      const isMonitoring = await isScreenTimeMonitoring();

      expect(isMonitoring).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large time limits', async () => {
      await updateScreenTimeSettings(480, true); // 8 hours

      expect(mockScreenTimeModule.startEnforcing).toHaveBeenCalledWith(28800);
    });

    it('should handle minimum time limit', async () => {
      await updateScreenTimeSettings(15, true); // 15 minutes

      expect(mockScreenTimeModule.startEnforcing).toHaveBeenCalledWith(900);
    });

    it('should format large seconds values correctly', () => {
      expect(formatSeconds(86400)).toBe('24h 0m'); // 1 day
    });

    it('should format large minutes values correctly', () => {
      expect(formatMinutes(1440)).toBe('24h'); // 1 day
    });
  });

  describe('Permission Flow', () => {
    it('should handle complete permission request flow', async () => {
      mockScreenTimeModule.checkOverlayPermission.mockResolvedValueOnce(false);
      mockScreenTimeModule.requestOverlayPermission.mockResolvedValueOnce(true);
      mockScreenTimeModule.checkOverlayPermission.mockResolvedValueOnce(true);

      const hasPermissionBefore = await checkOverlayPermission();
      expect(hasPermissionBefore).toBe(false);

      await requestOverlayPermission();

      const hasPermissionAfter = await checkOverlayPermission();
      expect(hasPermissionAfter).toBe(true);
    });
  });

  describe('Enforcement State Management', () => {
    it('should track enforcement state changes', async () => {
      mockScreenTimeModule.isEnforcing.mockResolvedValueOnce(false);
      
      let isMonitoring = await isScreenTimeMonitoring();
      expect(isMonitoring).toBe(false);

      await updateScreenTimeSettings(120, true);
      
      mockScreenTimeModule.isEnforcing.mockResolvedValueOnce(true);
      isMonitoring = await isScreenTimeMonitoring();
      expect(isMonitoring).toBe(true);

      await updateScreenTimeSettings(120, false);
      
      mockScreenTimeModule.isEnforcing.mockResolvedValueOnce(false);
      isMonitoring = await isScreenTimeMonitoring();
      expect(isMonitoring).toBe(false);
    });

    it('should maintain enforcement through app restarts', async () => {
      storage.getScreenTimeSettings.mockResolvedValue({
        limitMinutes: 180,
        locked: true,
        isDefault: false,
      });

      await initializeScreenTimeControl();

      expect(mockEnforcementServiceModule.updateScreenTimeEnforcement).toHaveBeenCalledWith(true);
    });
  });
});
