import { NativeModules } from 'react-native';

const { EnforcementServiceModule } = NativeModules;

let serviceNeeded = {
  volume: false,
};

// Track if service start has failed to avoid repeated crash attempts
let serviceStartFailed = false;

// Start the foreground service
const startService = async () => {
  // If we previously failed to start, don't keep trying (avoid repeated crashes)
  if (serviceStartFailed) {
    console.log('[EnforcementService] Skipping service start - previous attempt failed');
    return false;
  }

  try {
    // Check if the module exists
    if (!EnforcementServiceModule || !EnforcementServiceModule.startService) {
      console.warn('[EnforcementService] EnforcementServiceModule not available');
      serviceStartFailed = true;
      return false;
    }

    await EnforcementServiceModule.startService();
    console.log('[EnforcementService] Service started');
    return true;
  } catch (error) {
    console.error('[EnforcementService] Error starting service:', error);
    console.warn('[EnforcementService] Service failed to start. Controls will still work but may be less reliable in the background.');
    // Mark as failed to avoid repeated crash attempts
    serviceStartFailed = true;
    return false;
  }
};

// Stop the foreground service
const stopService = async () => {
  try {
    if (!EnforcementServiceModule || !EnforcementServiceModule.stopService) {
      console.warn('[EnforcementService] EnforcementServiceModule not available');
      return false;
    }

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
  return serviceNeeded.volume;
};

// Update service state based on enforcement needs
const updateServiceState = async () => {
  try {
    // Check if module is available
    if (!EnforcementServiceModule || !EnforcementServiceModule.isServiceRunning) {
      console.warn('[EnforcementService] EnforcementServiceModule not available for state update');
      return;
    }

    const needed = shouldServiceRun();
    const isRunning = await EnforcementServiceModule.isServiceRunning();

    if (needed && !isRunning) {
      await startService();
    } else if (!needed && isRunning) {
      await stopService();
    }
  } catch (error) {
    console.error('[EnforcementService] Error updating service state:', error);
    // Don't rethrow - let enforcement continue without the service
  }
};

// Notify that volume enforcement needs the service
export const notifyVolumeEnforcement = async (isEnforcing) => {
  try {
    serviceNeeded.volume = isEnforcing;
    await updateServiceState();
    console.log(`[EnforcementService] Volume enforcement ${isEnforcing ? 'enabled' : 'disabled'}, service needed: ${shouldServiceRun()}`);
  } catch (error) {
    console.error('[EnforcementService] Error in notifyVolumeEnforcement:', error);
    // Don't rethrow - enforcement can still work without the service
  }
};


// Check if service is running
export const isServiceRunning = async () => {
  try {
    if (!EnforcementServiceModule || !EnforcementServiceModule.isServiceRunning) {
      return false;
    }
    return await EnforcementServiceModule.isServiceRunning();
  } catch (error) {
    console.error('[EnforcementService] Error checking service status:', error);
    return false;
  }
};

// Force start the service (for manual testing/debugging)
export const forceStartService = async () => {
  // Reset the failed flag to allow retry
  serviceStartFailed = false;
  return await startService();
};

// Force stop the service (for manual testing/debugging)
export const forceStopService = async () => {
  return await stopService();
};

// Reset the service failed state (for testing)
export const resetServiceFailedState = () => {
  serviceStartFailed = false;
};
