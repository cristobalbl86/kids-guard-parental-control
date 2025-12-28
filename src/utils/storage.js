import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for storage
const KEYS = {
  FIRST_LAUNCH: 'first_launch',
  PIN: 'parent_pin',
  VOLUME_SETTINGS: 'volume_settings',
  BRIGHTNESS_SETTINGS: 'brightness_settings',
  FAILED_ATTEMPTS: 'failed_attempts',
  LOCKOUT_UNTIL: 'lockout_until',
  LAST_AD_SHOWN: 'last_ad_shown',
};

// Initialize app on first launch
export const initializeApp = async () => {
  try {
    const firstLaunch = await AsyncStorage.getItem(KEYS.FIRST_LAUNCH);
    if (firstLaunch === null) {
      await AsyncStorage.setItem(KEYS.FIRST_LAUNCH, 'true');
      // Initialize default settings
      await saveVolumeSettings({ volume: 50, locked: false });
      await saveBrightnessSettings({ brightness: 50, locked: false });
    }
  } catch (error) {
    console.error('Error initializing app:', error);
    throw error;
  }
};

// Check if this is the first launch
export const checkFirstLaunch = async () => {
  try {
    // Check if PIN exists in Keychain
    const credentials = await Keychain.getGenericPassword({ service: KEYS.PIN });
    return credentials === false;
  } catch (error) {
    console.error('Error checking first launch:', error);
    return true;
  }
};

// Mark first launch as complete
export const completeFirstLaunch = async () => {
  try {
    await AsyncStorage.setItem(KEYS.FIRST_LAUNCH, 'false');
  } catch (error) {
    console.error('Error completing first launch:', error);
    throw error;
  }
};

// PIN Management
export const savePIN = async (pin) => {
  try {
    await Keychain.setGenericPassword(KEYS.PIN, pin, { service: KEYS.PIN });
  } catch (error) {
    console.error('Error saving PIN:', error);
    throw error;
  }
};

export const verifyPIN = async (inputPIN) => {
  try {
    // Check if locked out
    const lockoutUntil = await AsyncStorage.getItem(KEYS.LOCKOUT_UNTIL);
    if (lockoutUntil) {
      const lockoutTime = parseInt(lockoutUntil);
      if (Date.now() < lockoutTime) {
        const remainingSeconds = Math.ceil((lockoutTime - Date.now()) / 1000);
        throw new Error(`Locked out. Please try again in ${remainingSeconds} seconds.`);
      } else {
        // Lockout period has passed
        await AsyncStorage.removeItem(KEYS.LOCKOUT_UNTIL);
        await AsyncStorage.removeItem(KEYS.FAILED_ATTEMPTS);
      }
    }

    // Get stored PIN from Keychain
    const credentials = await Keychain.getGenericPassword({ service: KEYS.PIN });
    if (!credentials) {
      return false;
    }

    const storedPIN = credentials.password;
    const isValid = storedPIN === inputPIN;

    if (!isValid) {
      await handleFailedAttempt();
    } else {
      // Reset failed attempts on successful login
      await AsyncStorage.removeItem(KEYS.FAILED_ATTEMPTS);
    }

    return isValid;
  } catch (error) {
    if (error.message.includes('Locked out')) {
      throw error;
    }
    console.error('Error verifying PIN:', error);
    return false;
  }
};

const handleFailedAttempt = async () => {
  try {
    const failedAttemptsStr = await AsyncStorage.getItem(KEYS.FAILED_ATTEMPTS);
    const failedAttempts = failedAttemptsStr ? parseInt(failedAttemptsStr) : 0;
    const newFailedAttempts = failedAttempts + 1;

    await AsyncStorage.setItem(KEYS.FAILED_ATTEMPTS, newFailedAttempts.toString());

    // Lockout logic: 5 attempts = lockout
    if (newFailedAttempts >= 5) {
      const lockoutDuration = Math.pow(2, Math.floor(newFailedAttempts / 5)) * 60 * 1000; // Exponential backoff
      const lockoutUntil = Date.now() + lockoutDuration;
      await AsyncStorage.setItem(KEYS.LOCKOUT_UNTIL, lockoutUntil.toString());
      throw new Error(`Too many failed attempts. Locked out for ${lockoutDuration / 1000} seconds.`);
    }
  } catch (error) {
    throw error;
  }
};

export const changePIN = async (oldPIN, newPIN) => {
  try {
    const isValid = await verifyPIN(oldPIN);
    if (!isValid) {
      throw new Error('Current PIN is incorrect');
    }
    await savePIN(newPIN);
    return true;
  } catch (error) {
    console.error('Error changing PIN:', error);
    throw error;
  }
};

// Volume Settings
export const saveVolumeSettings = async (settings) => {
  try {
    const payload = {
      volume: Math.max(0, Math.min(100, settings.volume ?? 50)),
      locked: !!settings.locked,
    };
    await AsyncStorage.setItem(KEYS.VOLUME_SETTINGS, JSON.stringify(payload));
  } catch (error) {
    console.error('Error saving volume settings:', error);
    throw error;
  }
};

export const getVolumeSettings = async () => {
  try {
    const settings = await AsyncStorage.getItem(KEYS.VOLUME_SETTINGS);
    if (!settings) {
      return { volume: 50, locked: false, isDefault: true };
    }

    const parsed = JSON.parse(settings);
    return {
      volume: Math.max(0, Math.min(100, parsed.volume ?? 50)),
      locked: !!parsed.locked,
      isDefault: false,
    };
  } catch (error) {
    console.error('Error getting volume settings:', error);
    return { volume: 50, locked: false, isDefault: true };
  }
};

// Brightness Settings
export const saveBrightnessSettings = async (settings) => {
  try {
    const payload = {
      brightness: Math.max(0, Math.min(100, settings.brightness ?? 50)),
      locked: !!settings.locked,
    };
    await AsyncStorage.setItem(KEYS.BRIGHTNESS_SETTINGS, JSON.stringify(payload));
  } catch (error) {
    console.error('Error saving brightness settings:', error);
    throw error;
  }
};

export const getBrightnessSettings = async () => {
  try {
    const settings = await AsyncStorage.getItem(KEYS.BRIGHTNESS_SETTINGS);
    if (!settings) {
      return { brightness: 50, locked: false, isDefault: true };
    }

    const parsed = JSON.parse(settings);
    return {
      brightness: Math.max(0, Math.min(100, parsed.brightness ?? 50)),
      locked: !!parsed.locked,
      isDefault: false,
    };
  } catch (error) {
    console.error('Error getting brightness settings:', error);
    return { brightness: 50, locked: false, isDefault: true };
  }
};

// Get all settings for display
export const getAllSettings = async () => {
  try {
    const [volumeSettings, brightnessSettings] = await Promise.all([
      getVolumeSettings(),
      getBrightnessSettings(),
    ]);
    return {
      volume: volumeSettings,
      brightness: brightnessSettings,
    };
  } catch (error) {
    console.error('Error getting all settings:', error);
    throw error;
  }
};

// Ad Timing Management
export const saveLastAdShownTime = async () => {
  try {
    const timestamp = Date.now().toString();
    await AsyncStorage.setItem(KEYS.LAST_AD_SHOWN, timestamp);
    console.log('[AdMob] Last ad shown time saved:', new Date(Date.now()).toISOString());
  } catch (error) {
    console.error('Error saving last ad shown time:', error);
    throw error;
  }
};

export const getLastAdShownTime = async () => {
  const timestamp = await AsyncStorage.getItem(KEYS.LAST_AD_SHOWN);
  if (timestamp === null) {
    return null;
  }
  return parseInt(timestamp, 10);
};

export const canShowAd = async () => {
  try {
    const lastShown = await getLastAdShownTime();

    // If never shown before, can show
    if (lastShown === null) {
      console.log('[AdMob] No previous ad shown, eligible to show');
      return true;
    }

    const now = Date.now();
    const sixHoursInMs = 6 * 60 * 60 * 1000; // 6 hours
    const elapsed = now - lastShown;

    const canShow = elapsed >= sixHoursInMs;

    if (canShow) {
      const elapsedHours = (elapsed / (60 * 60 * 1000)).toFixed(2);
      console.log(`[AdMob] Eligible to show ad (${elapsedHours} hours elapsed)`);
    } else {
      const remainingMs = sixHoursInMs - elapsed;
      const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
      console.log(`[AdMob] Too soon to show ad (${remainingMinutes} minutes remaining)`);
    }

    return canShow;
  } catch (error) {
    console.error('Error checking if can show ad:', error);
    return false;
  }
};
