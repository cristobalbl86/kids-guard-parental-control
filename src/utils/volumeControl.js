import { NativeModules, NativeEventEmitter } from 'react-native';
import { getVolumeSettings, saveVolumeSettings } from './storage';

const { VolumeControl } = NativeModules;

// Create event emitter for volume enforcement events
const volumeEventEmitter = new NativeEventEmitter(NativeModules.VolumeControl);

let enforcedVolume = null;
let isEnforcing = false;
let volumeInitialized = false;

// Initialize volume control
export const initializeVolumeControl = async () => {
  if (volumeInitialized) {
    console.log('Volume control already initialized - skipping duplicate call');
    return true;
  }

  try {
    console.log('Initializing volume control...');

    // Load settings and start monitoring if locked
    const settings = await getVolumeSettings();
    if (settings.locked) {
      await startVolumeMonitoring(settings.volume);
    }

    console.log('Volume control initialized');
    volumeInitialized = true;
    return true;
  } catch (error) {
    console.error('Error initializing volume control:', error);
    return false;
  }
};

// Set volume level (0-100)
export const setVolume = async (volumePercent) => {
  try {
    // Ensure volume is between 0 and 100
    const clampedVolume = Math.max(0, Math.min(100, volumePercent));

    // Set system volume using native module
    await VolumeControl.setVolume(clampedVolume);

    console.log(`Volume set to ${clampedVolume}%`);
    return true;
  } catch (error) {
    console.error('Error setting volume:', error);
    return false;
  }
};

// Get current volume level (0-100)
export const getVolume = async () => {
  try {
    const volume = await VolumeControl.getVolume();
    return Math.round(volume);
  } catch (error) {
    console.error('Error getting volume:', error);
    return 50; // Default fallback
  }
};

// Start monitoring volume changes and enforce locked value
export const startVolumeMonitoring = async (targetVolumePercent) => {
  try {
    enforcedVolume = targetVolumePercent;
    isEnforcing = true;

    // Start enforcement using native module
    await VolumeControl.startEnforcing(targetVolumePercent);

    console.log(`Volume monitoring started at ${targetVolumePercent}%`);
    return true;
  } catch (error) {
    console.error('Error starting volume monitoring:', error);
    return false;
  }
};

// Stop monitoring volume
export const stopVolumeMonitoring = async () => {
  try {
    isEnforcing = false;
    enforcedVolume = null;

    await VolumeControl.stopEnforcing();

    console.log('Volume monitoring stopped');
    return true;
  } catch (error) {
    console.error('Error stopping volume monitoring:', error);
    return false;
  }
};

// Update volume settings and start/stop monitoring
export const updateVolumeSettings = async (volume, locked) => {
  try {
    // Save settings
    await saveVolumeSettings({ volume, locked });

    // Start or stop monitoring based on locked state
    if (locked) {
      await startVolumeMonitoring(volume);
    } else {
      await stopVolumeMonitoring();
    }

    return true;
  } catch (error) {
    console.error('Error updating volume settings:', error);
    return false;
  }
};

// Check if volume monitoring is active
export const isVolumeMonitoring = async () => {
  try {
    return await VolumeControl.isEnforcingVolume();
  } catch (error) {
    console.error('Error checking volume monitoring status:', error);
    return false;
  }
};

// Get enforced volume value
export const getEnforcedVolume = () => {
  return enforcedVolume;
};

// Listen for volume enforcement events
export const addVolumeEnforcementListener = (callback) => {
  return volumeEventEmitter.addListener('onVolumeEnforced', callback);
};

// Remove volume enforcement listener
export const removeVolumeEnforcementListener = (subscription) => {
  if (subscription) {
    subscription.remove();
  }
};
