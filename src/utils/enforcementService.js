import { NativeModules } from 'react-native';

const { EnforcementServiceModule } = NativeModules;

let serviceNeeded = {
  volume: false,
  brightness: false,
};

// Start the foreground service
const startService = async () => {
  try {
    await EnforcementServiceModule.startService();
    console.log('[EnforcementService] Service started');
    return true;
  } catch (error) {
    console.error('[EnforcementService] Error starting service:', error);
    return false;
  }
};

// Stop the foreground service
const stopService = async () => {
  try {
    await EnforcementServiceModule.stopService();
    console.log('[EnforcementService] Service stopped');
    return true;
  } catch (error) {
    console.error('[EnforcementService] Error stopping service:', error);
    return false;
  }
};

// Check if service should be running
const shouldServiceRun = () => {
  return serviceNeeded.volume || serviceNeeded.brightness;
};

// Update service state based on enforcement needs
const updateServiceState = async () => {
  const needed = shouldServiceRun();
  const isRunning = await EnforcementServiceModule.isServiceRunning();

  if (needed && !isRunning) {
    await startService();
  } else if (!needed && isRunning) {
    await stopService();
  }
};

// Notify that volume enforcement needs the service
export const notifyVolumeEnforcement = async (isEnforcing) => {
  serviceNeeded.volume = isEnforcing;
  await updateServiceState();
  console.log(`[EnforcementService] Volume enforcement ${isEnforcing ? 'enabled' : 'disabled'}, service needed: ${shouldServiceRun()}`);
};

// Notify that brightness enforcement needs the service
export const notifyBrightnessEnforcement = async (isEnforcing) => {
  serviceNeeded.brightness = isEnforcing;
  await updateServiceState();
  console.log(`[EnforcementService] Brightness enforcement ${isEnforcing ? 'enabled' : 'disabled'}, service needed: ${shouldServiceRun()}`);
};

// Check if service is running
export const isServiceRunning = async () => {
  try {
    return await EnforcementServiceModule.isServiceRunning();
  } catch (error) {
    console.error('[EnforcementService] Error checking service status:', error);
    return false;
  }
};

// Force start the service (for manual testing/debugging)
export const forceStartService = async () => {
  return await startService();
};

// Force stop the service (for manual testing/debugging)
export const forceStopService = async () => {
  return await stopService();
};
