import { NativeModules, NativeEventEmitter } from 'react-native';
import { getBrightnessSettings, saveBrightnessSettings } from './storage';
import { notifyBrightnessEnforcement } from './enforcementService';

const { BrightnessControl } = NativeModules;

// Create event emitter for brightness enforcement events
const brightnessEventEmitter = new NativeEventEmitter(NativeModules.BrightnessControl);

let enforcedBrightness = null;
let isEnforcing = false;
let brightnessInitialized = false;

// Initialize brightness control
export const initializeBrightnessControl = async () => {
  if (brightnessInitialized) {
    console.log('Brightness control already initialized - skipping duplicate call');
    return true;
  }

  try {
    console.log('Initializing brightness control...');

    // Load settings and start monitoring if locked
    const settings = await getBrightnessSettings();
    if (settings.locked) {
      await startBrightnessMonitoring(settings.brightness);
    }

    console.log('Brightness control initialized');
    brightnessInitialized = true;
    return true;
  } catch (error) {
    console.error('Error initializing brightness control:', error);
    return false;
  }
};

// Set brightness level (0-100)
export const setBrightness = async (brightnessPercent) => {
  try {
    // Ensure brightness is between 0 and 100
    const clampedBrightness = Math.max(0, Math.min(100, brightnessPercent));

    // Set brightness using native module
    await BrightnessControl.setBrightness(clampedBrightness);

    console.log(`Brightness set to ${clampedBrightness}%`);
    return true;
  } catch (error) {
    console.error('Error setting brightness:', error);
    return false;
  }
};

// Get current brightness level (0-100)
export const getBrightness = async () => {
  try {
    const brightness = await BrightnessControl.getBrightness();
    console.log(`[getBrightness] Native returned: ${brightness}, rounded: ${Math.round(brightness)}`);
    return Math.round(brightness);
  } catch (error) {
    console.error('Error getting brightness:', error);
    return 50; // Default fallback
  }
};

// Start monitoring brightness changes and enforce locked value
export const startBrightnessMonitoring = async (targetBrightnessPercent) => {
  try {
    enforcedBrightness = targetBrightnessPercent;
    isEnforcing = true;

    // Start enforcement using native module (for in-app enforcement)
    await BrightnessControl.startEnforcing(targetBrightnessPercent);

    // Notify enforcement service with brightness value (for background enforcement)
    await notifyBrightnessEnforcement(true, targetBrightnessPercent);

    console.log(`Brightness monitoring started at ${targetBrightnessPercent}%`);
    return true;
  } catch (error) {
    console.error('Error starting brightness monitoring:', error);
    return false;
  }
};

// Stop monitoring brightness
export const stopBrightnessMonitoring = async () => {
  try {
    isEnforcing = false;
    enforcedBrightness = null;

    await BrightnessControl.stopEnforcing();

    // Notify enforcement service that brightness enforcement is inactive
    await notifyBrightnessEnforcement(false);

    console.log('Brightness monitoring stopped');
    return true;
  } catch (error) {
    console.error('Error stopping brightness monitoring:', error);
    return false;
  }
};

// Update brightness settings and start/stop monitoring
export const updateBrightnessSettings = async (brightness, locked) => {
  try {
    // Save settings
    await saveBrightnessSettings({ brightness, locked });

    // Start or stop monitoring based on locked state
    if (locked) {
      await startBrightnessMonitoring(brightness);
    } else {
      stopBrightnessMonitoring();
    }

    return true;
  } catch (error) {
    console.error('Error updating brightness settings:', error);
    return false;
  }
};

// Check if brightness monitoring is active
export const isBrightnessMonitoring = () => {
  return isEnforcing;
};

// Get enforced brightness value
export const getEnforcedBrightness = () => {
  return enforcedBrightness;
};

// Check if WRITE_SETTINGS permission is granted
export const checkWriteSettingsPermission = async () => {
  try {
    return await BrightnessControl.checkWriteSettingsPermission();
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
};

// Request WRITE_SETTINGS permission (opens system settings page)
export const requestWriteSettingsPermission = async () => {
  try {
    await BrightnessControl.requestWriteSettingsPermission();
    return true;
  } catch (error) {
    console.error('Error requesting permission:', error);
    return false;
  }
};
