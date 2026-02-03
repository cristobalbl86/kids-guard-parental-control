import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  savePIN,
  verifyPIN,
  changePIN,
  saveVolumeSettings,
  getVolumeSettings,
  getAllSettings,
  initializeApp,
  checkFirstLaunch,
  completeFirstLaunch,
  saveLastAdShownTime,
  getLastAdShownTime,
  canShowAd,
} from '../storage';

describe('Storage Utility', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Reset mock implementations to defaults
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockResolvedValue();
    AsyncStorage.removeItem.mockResolvedValue();
    Keychain.setGenericPassword.mockResolvedValue(true);
    Keychain.getGenericPassword.mockResolvedValue({ password: '1234' });
  });

  describe('PIN Management', () => {
    describe('savePIN', () => {
      it('should save PIN to Keychain with correct service', async () => {
        await savePIN('1234');

        expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
          'parent_pin',
          '1234',
          { service: 'parent_pin' }
        );
      });

      it('should throw error if Keychain fails', async () => {
        Keychain.setGenericPassword.mockRejectedValue(new Error('Keychain error'));

        await expect(savePIN('1234')).rejects.toThrow('Keychain error');
      });
    });

    describe('verifyPIN', () => {
      it('should return true for correct PIN', async () => {
        Keychain.getGenericPassword.mockResolvedValue({ password: '1234' });

        const result = await verifyPIN('1234');

        expect(result).toBe(true);
        expect(Keychain.getGenericPassword).toHaveBeenCalledWith({ service: 'parent_pin' });
      });

      it('should return false for incorrect PIN', async () => {
        Keychain.getGenericPassword.mockResolvedValue({ password: '1234' });

        const result = await verifyPIN('9999');

        expect(result).toBe(false);
      });

      it('should return false if no PIN is stored', async () => {
        Keychain.getGenericPassword.mockResolvedValue(false);

        const result = await verifyPIN('1234');

        expect(result).toBe(false);
      });

      it('should increment failed attempts on incorrect PIN', async () => {
        Keychain.getGenericPassword.mockResolvedValue({ password: '1234' });

        await verifyPIN('9999');

        expect(AsyncStorage.setItem).toHaveBeenCalledWith('failed_attempts', '1');
      });

      it('should clear failed attempts on successful PIN entry', async () => {
        Keychain.getGenericPassword.mockResolvedValue({ password: '1234' });

        await verifyPIN('1234');

        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('failed_attempts');
      });

      it('should lock out after 5 failed attempts', async () => {
        Keychain.getGenericPassword.mockResolvedValue({ password: '1234' });
        AsyncStorage.getItem.mockResolvedValue('4'); // 4 previous failed attempts

        await expect(verifyPIN('9999')).rejects.toThrow(/Locked out/);
      });

      it('should calculate exponential backoff correctly', async () => {
        Keychain.getGenericPassword.mockResolvedValue({ password: '1234' });
        AsyncStorage.getItem.mockResolvedValue('4'); // 4 previous attempts

        try {
          await verifyPIN('9999'); // This will be the 5th attempt
        } catch (error) {
          // Math.pow(2, Math.floor(5 / 5)) * 60 * 1000 = 120 seconds
          expect(error.message).toContain('120 seconds');
        }
      });

      it('should calculate longer lockout for 10 failed attempts', async () => {
        Keychain.getGenericPassword.mockResolvedValue({ password: '1234' });
        AsyncStorage.getItem.mockResolvedValue('9'); // 9 previous attempts

        try {
          await verifyPIN('9999'); // This will be the 10th attempt
        } catch (error) {
          // Math.pow(2, Math.floor(10 / 5)) * 60 * 1000 = 240 seconds
          expect(error.message).toContain('240 seconds');
        }
      });

      it('should throw lockout error if still in lockout period', async () => {
        const futureTime = Date.now() + 60000; // 60 seconds in future
        AsyncStorage.getItem.mockImplementation((key) => {
          if (key === 'lockout_until') return Promise.resolve(futureTime.toString());
          return Promise.resolve(null);
        });

        await expect(verifyPIN('1234')).rejects.toThrow(/Locked out/);
      });

      it('should clear lockout if period has passed', async () => {
        const pastTime = Date.now() - 1000; // 1 second in past
        Keychain.getGenericPassword.mockResolvedValue({ password: '1234' });
        AsyncStorage.getItem.mockImplementation((key) => {
          if (key === 'lockout_until') return Promise.resolve(pastTime.toString());
          return Promise.resolve(null);
        });

        const result = await verifyPIN('1234');

        expect(result).toBe(true);
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('lockout_until');
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('failed_attempts');
      });
    });

    describe('changePIN', () => {
      it('should change PIN if old PIN is correct', async () => {
        Keychain.getGenericPassword.mockResolvedValue({ password: '1234' });

        const result = await changePIN('1234', '5678');

        expect(result).toBe(true);
        expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
          'parent_pin',
          '5678',
          { service: 'parent_pin' }
        );
      });

      it('should throw error if old PIN is incorrect', async () => {
        Keychain.getGenericPassword.mockResolvedValue({ password: '1234' });

        await expect(changePIN('9999', '5678')).rejects.toThrow('Current PIN is incorrect');
      });

      it('should not save new PIN if old PIN verification fails', async () => {
        Keychain.getGenericPassword.mockResolvedValue({ password: '1234' });

        try {
          await changePIN('9999', '5678');
        } catch (error) {
          // Expected to fail
        }

        // Should have been called once during verification, not for saving new PIN
        const saveCalls = Keychain.setGenericPassword.mock.calls.filter(
          call => call[1] === '5678'
        );
        expect(saveCalls.length).toBe(0);
      });
    });
  });

  describe('Volume Settings', () => {
    describe('saveVolumeSettings', () => {
      it('should save volume settings to AsyncStorage', async () => {
        await saveVolumeSettings({ volume: 75, locked: true });

        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'volume_settings',
          JSON.stringify({ volume: 75, locked: true })
        );
      });

      it('should clamp volume to 0-100 range', async () => {
        await saveVolumeSettings({ volume: 150, locked: false });

        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'volume_settings',
          JSON.stringify({ volume: 100, locked: false })
        );
      });

      it('should clamp negative volume to 0', async () => {
        await saveVolumeSettings({ volume: -10, locked: false });

        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'volume_settings',
          JSON.stringify({ volume: 0, locked: false })
        );
      });

      it('should use default volume if not provided', async () => {
        await saveVolumeSettings({ locked: true });

        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'volume_settings',
          JSON.stringify({ volume: 50, locked: true })
        );
      });

      it('should convert locked to boolean', async () => {
        await saveVolumeSettings({ volume: 50, locked: 'true' });

        const savedData = JSON.parse(AsyncStorage.setItem.mock.calls[0][1]);
        expect(savedData.locked).toBe(true);
      });
    });

    describe('getVolumeSettings', () => {
      it('should retrieve volume settings from AsyncStorage', async () => {
        AsyncStorage.getItem.mockResolvedValue(
          JSON.stringify({ volume: 75, locked: true })
        );

        const settings = await getVolumeSettings();

        expect(settings).toEqual({ volume: 75, locked: true, isDefault: false });
      });

      it('should return default settings if none exist', async () => {
        AsyncStorage.getItem.mockResolvedValue(null);

        const settings = await getVolumeSettings();

        expect(settings).toEqual({ volume: 50, locked: false, isDefault: true });
      });

      it('should handle invalid JSON gracefully', async () => {
        AsyncStorage.getItem.mockResolvedValue('invalid json');

        const settings = await getVolumeSettings();

        expect(settings).toEqual({ volume: 50, locked: false, isDefault: true });
      });

      it('should clamp stored volume to valid range', async () => {
        AsyncStorage.getItem.mockResolvedValue(
          JSON.stringify({ volume: 200, locked: false })
        );

        const settings = await getVolumeSettings();

        expect(settings.volume).toBe(100);
      });

      it('should convert locked to boolean from storage', async () => {
        AsyncStorage.getItem.mockResolvedValue(
          JSON.stringify({ volume: 50, locked: 1 })
        );

        const settings = await getVolumeSettings();

        expect(settings.locked).toBe(true);
      });
    });
  });



  describe('getAllSettings', () => {
    it('should return volume settings', async () => {
      AsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'volume_settings') {
          return Promise.resolve(JSON.stringify({ volume: 60, locked: true }));
        }
        return Promise.resolve(null);
      });

      const allSettings = await getAllSettings();

      expect(allSettings).toEqual({
        volume: { volume: 60, locked: true, isDefault: false },
      });
    });

    it('should return default volume settings if none exist', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const allSettings = await getAllSettings();

      expect(allSettings).toEqual({
        volume: { volume: 50, locked: false, isDefault: true },
      });
    });
  });

  describe('First Launch Management', () => {
    describe('initializeApp', () => {
      it('should initialize default settings on first launch', async () => {
        AsyncStorage.getItem.mockResolvedValue(null); // First launch

        await initializeApp();

        expect(AsyncStorage.setItem).toHaveBeenCalledWith('first_launch', 'true');
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'volume_settings',
          JSON.stringify({ volume: 50, locked: false })
        );
      });

      it('should not initialize if not first launch', async () => {
        AsyncStorage.getItem.mockResolvedValue('true'); // Not first launch

        await initializeApp();

        // Should only have called getItem, not setItem
        expect(AsyncStorage.setItem).not.toHaveBeenCalled();
      });

      it('should throw error if initialization fails', async () => {
        AsyncStorage.getItem.mockResolvedValue(null);
        AsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

        await expect(initializeApp()).rejects.toThrow('Storage error');
      });
    });

    describe('checkFirstLaunch', () => {
      it('should return true if no PIN exists', async () => {
        Keychain.getGenericPassword.mockResolvedValue(false);

        const isFirstLaunch = await checkFirstLaunch();

        expect(isFirstLaunch).toBe(true);
      });

      it('should return false if PIN exists', async () => {
        Keychain.getGenericPassword.mockResolvedValue({ password: '1234' });

        const isFirstLaunch = await checkFirstLaunch();

        expect(isFirstLaunch).toBe(false);
      });

      it('should return true if Keychain check fails', async () => {
        Keychain.getGenericPassword.mockRejectedValue(new Error('Keychain error'));

        const isFirstLaunch = await checkFirstLaunch();

        expect(isFirstLaunch).toBe(true);
      });
    });

    describe('completeFirstLaunch', () => {
      it('should set first launch flag to false', async () => {
        await completeFirstLaunch();

        expect(AsyncStorage.setItem).toHaveBeenCalledWith('first_launch', 'false');
      });

      it('should throw error if setting fails', async () => {
        AsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

        await expect(completeFirstLaunch()).rejects.toThrow('Storage error');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent PIN verifications', async () => {
      Keychain.getGenericPassword.mockResolvedValue({ password: '1234' });

      const promises = [
        verifyPIN('1234'),
        verifyPIN('9999'),
        verifyPIN('1234'),
      ];

      const results = await Promise.all(promises);

      expect(results).toEqual([true, false, true]);
    });

    it('should handle empty PIN gracefully', async () => {
      await savePIN('');

      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        'parent_pin',
        '',
        { service: 'parent_pin' }
      );
    });

    it('should handle volume settings with missing fields', async () => {
      await saveVolumeSettings({});

      const savedData = JSON.parse(AsyncStorage.setItem.mock.calls[0][1]);
      expect(savedData).toEqual({ volume: 50, locked: false });
    });

    it('should handle malformed settings in storage', async () => {
      AsyncStorage.getItem.mockResolvedValue('{ broken json');

      const settings = await getVolumeSettings();

      expect(settings).toEqual({ volume: 50, locked: false, isDefault: true });
    });
  });

  describe('Ad Timing Management', () => {
    describe('saveLastAdShownTime', () => {
      it('should save current timestamp to AsyncStorage', async () => {
        const mockNow = 1640000000000;
        jest.spyOn(Date, 'now').mockReturnValue(mockNow);

        await saveLastAdShownTime();

        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'last_ad_shown',
          mockNow.toString()
        );

        Date.now.mockRestore();
      });

      it('should throw error if AsyncStorage fails', async () => {
        AsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

        await expect(saveLastAdShownTime()).rejects.toThrow('Storage error');
      });

      it('should log the saved time', async () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        const mockNow = 1640000000000;
        jest.spyOn(Date, 'now').mockReturnValue(mockNow);

        await saveLastAdShownTime();

        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('[AdMob] Last ad shown time saved:'),
          expect.any(String)
        );

        consoleSpy.mockRestore();
        Date.now.mockRestore();
      });
    });

    describe('getLastAdShownTime', () => {
      it('should retrieve timestamp from AsyncStorage', async () => {
        const mockTimestamp = '1640000000000';
        AsyncStorage.getItem.mockResolvedValue(mockTimestamp);

        const result = await getLastAdShownTime();

        expect(AsyncStorage.getItem).toHaveBeenCalledWith('last_ad_shown');
        expect(result).toBe(1640000000000);
      });

      it('should return null if no timestamp exists', async () => {
        AsyncStorage.getItem.mockResolvedValue(null);

        const result = await getLastAdShownTime();

        expect(result).toBeNull();
      });

      it('should throw error when AsyncStorage fails', async () => {
        AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

        await expect(getLastAdShownTime()).rejects.toThrow('Storage error');
      });

      it('should parse timestamp as integer', async () => {
        AsyncStorage.getItem.mockResolvedValue('1640000000000');

        const result = await getLastAdShownTime();

        expect(typeof result).toBe('number');
        expect(result).toBe(1640000000000);
      });
    });

    describe('canShowAd', () => {
      it('should return true if no ad was shown before', async () => {
        AsyncStorage.getItem.mockResolvedValue(null);

        const result = await canShowAd();

        expect(result).toBe(true);
      });

      it('should return true if 6 hours have elapsed', async () => {
        const sixHoursAgo = Date.now() - (6 * 60 * 60 * 1000);
        AsyncStorage.getItem.mockResolvedValue(sixHoursAgo.toString());

        const result = await canShowAd();

        expect(result).toBe(true);
      });

      it('should return true if more than 6 hours have elapsed', async () => {
        const sevenHoursAgo = Date.now() - (7 * 60 * 60 * 1000);
        AsyncStorage.getItem.mockResolvedValue(sevenHoursAgo.toString());

        const result = await canShowAd();

        expect(result).toBe(true);
      });

      it('should return false if less than 6 hours have elapsed', async () => {
        const threeHoursAgo = Date.now() - (3 * 60 * 60 * 1000);
        AsyncStorage.getItem.mockResolvedValue(threeHoursAgo.toString());

        const result = await canShowAd();

        expect(result).toBe(false);
      });

      it('should return false if ad was just shown', async () => {
        const justNow = Date.now() - 1000; // 1 second ago
        AsyncStorage.getItem.mockResolvedValue(justNow.toString());

        const result = await canShowAd();

        expect(result).toBe(false);
      });

      it('should return false on error', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

        const result = await canShowAd();

        expect(result).toBe(false);
        expect(consoleErrorSpy).toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
      });

      it('should log eligibility status when can show', async () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        AsyncStorage.getItem.mockResolvedValue(null);

        await canShowAd();

        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('[AdMob] No previous ad shown, eligible to show')
        );

        consoleSpy.mockRestore();
      });

      it('should log remaining time when cannot show', async () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        const oneHourAgo = Date.now() - (1 * 60 * 60 * 1000);
        AsyncStorage.getItem.mockResolvedValue(oneHourAgo.toString());

        await canShowAd();

        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('[AdMob] Too soon to show ad')
        );
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('minutes remaining')
        );

        consoleSpy.mockRestore();
      });

      it('should calculate elapsed time correctly', async () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        const eightHoursAgo = Date.now() - (8 * 60 * 60 * 1000);
        AsyncStorage.getItem.mockResolvedValue(eightHoursAgo.toString());

        await canShowAd();

        const logCall = consoleSpy.mock.calls.find(call =>
          call[0].includes('Eligible to show ad')
        );
        expect(logCall).toBeDefined();
        expect(logCall[0]).toMatch(/\d+\.\d+ hours elapsed/);

        consoleSpy.mockRestore();
      });

      it('should handle exactly 6 hours as eligible', async () => {
        const exactlySixHours = Date.now() - (6 * 60 * 60 * 1000);
        AsyncStorage.getItem.mockResolvedValue(exactlySixHours.toString());

        const result = await canShowAd();

        expect(result).toBe(true);
      });
    });
  });
});
