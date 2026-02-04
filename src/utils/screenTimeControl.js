import { NativeModules } from 'react-native';
import { saveScreenTimeSettings, getScreenTimeSettings } from './storage';
import { EnforcementServiceModule } from 'react-native';

const { ScreenTimeModule } = NativeModules;

if (!ScreenTimeModule) {
  console.warn('[ScreenTime] ScreenTimeModule not available');
}

/**
 * Initialize screen time control
 * Loads saved settings and starts enforcement if needed
 */
export const initializeScreenTimeControl = async () => {
  try {
    if (!ScreenTimeModule) {
      console.warn('[ScreenTime] Module not available, skipping initialization');
      return false;
    }

    console.log('[ScreenTime] Initializing screen time control...');

    // Load saved settings
    const settings = await getScreenTimeSettings();
    console.log('[ScreenTime] Loaded settings:', settings);

    // If locked, start enforcement
    if (settings.locked && !settings.isDefault) {
      const hasPermission = await checkPermission();
      if (hasPermission) {
        const limitSeconds = settings.limitMinutes * 60;
        await ScreenTimeModule.startEnforcing(limitSeconds);

        // Update enforcement service
        const { EnforcementServiceModule } = NativeModules;
        if (EnforcementServiceModule) {
          await EnforcementServiceModule.updateScreenTimeEnforcement(true);
        }

        console.log('[ScreenTime] Enforcement started:', settings.limitMinutes, 'minutes');
      } else {
        console.log('[ScreenTime] Permission not granted, cannot enforce');
      }
    }

    console.log('[ScreenTime] Screen time control initialized');
    return true;
  } catch (error) {
    console.error('[ScreenTime] Error initializing screen time control:', error);
    return false;
  }
};

/**
 * Get daily screen time usage in seconds
 */
export const getDailyUsageSeconds = async () => {
  try {
    if (!ScreenTimeModule) {
      return 0;
    }
    return await ScreenTimeModule.getDailyUsageSeconds();
  } catch (error) {
    console.error('[ScreenTime] Error getting daily usage:', error);
    return 0;
  }
};

/**
 * Check if PACKAGE_USAGE_STATS permission is granted
 */
export const checkPermission = async () => {
  try {
    if (!ScreenTimeModule) {
      return false;
    }
    return await ScreenTimeModule.checkPermission();
  } catch (error) {
    console.error('[ScreenTime] Error checking permission:', error);
    return false;
  }
};

/**
 * Check if SYSTEM_ALERT_WINDOW (overlay) permission is granted
 */
export const checkOverlayPermission = async () => {
  try {
    if (!ScreenTimeModule) {
      return false;
    }
    return await ScreenTimeModule.checkOverlayPermission();
  } catch (error) {
    console.error('[ScreenTime] Error checking overlay permission:', error);
    return false;
  }
};

/**
 * Request SYSTEM_ALERT_WINDOW permission (opens Settings)
 */
export const requestOverlayPermission = async () => {
  try {
    if (!ScreenTimeModule) {
      throw new Error('ScreenTimeModule not available');
    }
    return await ScreenTimeModule.requestOverlayPermission();
  } catch (error) {
    console.error('[ScreenTime] Error requesting overlay permission:', error);
    throw error;
  }
};

/**
 * Request PACKAGE_USAGE_STATS permission (opens Settings)
 */
export const requestPermission = async () => {
  try {
    if (!ScreenTimeModule) {
      throw new Error('ScreenTimeModule not available');
    }
    return await ScreenTimeModule.requestPermission();
  } catch (error) {
    console.error('[ScreenTime] Error requesting permission:', error);
    throw error;
  }
};

/**
 * Update screen time settings and enforcement
 */
export const updateScreenTimeSettings = async (limitMinutes, locked) => {
  try {
    if (!ScreenTimeModule) {
      throw new Error('ScreenTimeModule not available');
    }

    // Save settings to storage
    await saveScreenTimeSettings({
      limitMinutes,
      locked,
    });

    const limitSeconds = limitMinutes * 60;

    if (locked) {
      // Start enforcement
      await ScreenTimeModule.startEnforcing(limitSeconds);

      // Update enforcement service
      const { EnforcementServiceModule } = NativeModules;
      if (EnforcementServiceModule) {
        await EnforcementServiceModule.updateScreenTimeEnforcement(true);
      }

      console.log('[ScreenTime] Enforcement enabled:', limitMinutes, 'minutes');
    } else {
      // Stop enforcement
      await ScreenTimeModule.stopEnforcing();

      // Update enforcement service
      const { EnforcementServiceModule } = NativeModules;
      if (EnforcementServiceModule) {
        await EnforcementServiceModule.stopScreenTimeEnforcement();
      }

      console.log('[ScreenTime] Enforcement disabled');
    }

    return true;
  } catch (error) {
    console.error('[ScreenTime] Error updating screen time settings:', error);
    return false;
  }
};

/**
 * Format seconds to human-readable string
 */
export const formatSeconds = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

/**
 * Format minutes to human-readable string
 */
export const formatMinutes = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    if (mins > 0) {
      return `${hours}h ${mins}m`;
    } else {
      return `${hours}h`;
    }
  } else {
    return `${mins}m`;
  }
};

/**
 * Check if screen time monitoring is active
 */
export const isScreenTimeMonitoring = async () => {
  try {
    if (!ScreenTimeModule) {
      return false;
    }
    return await ScreenTimeModule.isEnforcing();
  } catch (error) {
    console.error('[ScreenTime] Error checking monitoring status:', error);
    return false;
  }
};
