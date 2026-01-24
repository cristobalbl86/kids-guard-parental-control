package com.kidsguard;

import android.content.Intent;
import android.os.Build;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

import androidx.annotation.NonNull;

public class EnforcementServiceModule extends ReactContextBaseJavaModule {
    private static final String TAG = "EnforcementServiceModule";
    private final ReactApplicationContext reactContext;
    private boolean serviceRunning = false;

    public EnforcementServiceModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
    }

    @NonNull
    @Override
    public String getName() {
        return "EnforcementServiceModule";
    }

    @ReactMethod
    public void startService(Promise promise) {
        try {
            if (serviceRunning) {
                Log.d(TAG, "Service already running");
                promise.resolve(true);
                return;
            }

            Intent serviceIntent = new Intent(reactContext, EnforcementService.class);

            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    reactContext.startForegroundService(serviceIntent);
                } else {
                    reactContext.startService(serviceIntent);
                }

                serviceRunning = true;
                Log.d(TAG, "Enforcement service started successfully");
                promise.resolve(true);
            } catch (SecurityException se) {
                // This can happen on Android 13+ if POST_NOTIFICATIONS permission is not granted
                Log.w(TAG, "SecurityException starting foreground service - likely missing POST_NOTIFICATIONS permission on Android 13+", se);
                serviceRunning = false;
                promise.reject("PERMISSION_DENIED", "Cannot start foreground service. POST_NOTIFICATIONS permission may be required on Android 13+: " + se.getMessage());
            } catch (IllegalStateException ise) {
                // This can happen if the app is in the background and can't start a foreground service
                Log.w(TAG, "IllegalStateException starting foreground service - app may be in background", ise);
                serviceRunning = false;
                promise.reject("BACKGROUND_RESTRICTION", "Cannot start foreground service from background: " + ise.getMessage());
            }
        } catch (Exception e) {
            Log.e(TAG, "Unexpected error starting service", e);
            serviceRunning = false;
            promise.reject("ERROR", "Failed to start enforcement service: " + e.getMessage());
        }
    }

    @ReactMethod
    public void stopService(Promise promise) {
        try {
            if (!serviceRunning) {
                Log.d(TAG, "Service already stopped");
                promise.resolve(true);
                return;
            }

            Intent serviceIntent = new Intent(reactContext, EnforcementService.class);
            reactContext.stopService(serviceIntent);

            serviceRunning = false;
            Log.d(TAG, "Enforcement service stopped");
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error stopping service", e);
            promise.reject("ERROR", "Failed to stop enforcement service: " + e.getMessage());
        }
    }

    @ReactMethod
    public void isServiceRunning(Promise promise) {
        promise.resolve(serviceRunning);
    }

    @ReactMethod
    public void updateBrightnessEnforcement(int brightness, boolean enforcing, Promise promise) {
        try {
            if (!serviceRunning) {
                Log.d(TAG, "Service not running, starting it first");
                // Start the service with brightness enforcement
                Intent serviceIntent = new Intent(reactContext, EnforcementService.class);
                serviceIntent.setAction(EnforcementService.ACTION_UPDATE_BRIGHTNESS);
                serviceIntent.putExtra(EnforcementService.EXTRA_BRIGHTNESS_VALUE, brightness);
                serviceIntent.putExtra(EnforcementService.EXTRA_BRIGHTNESS_ENFORCING, enforcing);

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    reactContext.startForegroundService(serviceIntent);
                } else {
                    reactContext.startService(serviceIntent);
                }
                serviceRunning = true;
            } else {
                // Service already running, send update intent
                Intent updateIntent = new Intent(reactContext, EnforcementService.class);
                updateIntent.setAction(EnforcementService.ACTION_UPDATE_BRIGHTNESS);
                updateIntent.putExtra(EnforcementService.EXTRA_BRIGHTNESS_VALUE, brightness);
                updateIntent.putExtra(EnforcementService.EXTRA_BRIGHTNESS_ENFORCING, enforcing);

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    reactContext.startForegroundService(updateIntent);
                } else {
                    reactContext.startService(updateIntent);
                }
            }

            Log.d(TAG, "Brightness enforcement updated: brightness=" + brightness + ", enforcing=" + enforcing);
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error updating brightness enforcement", e);
            promise.reject("ERROR", "Failed to update brightness enforcement: " + e.getMessage());
        }
    }

    @ReactMethod
    public void stopBrightnessEnforcement(Promise promise) {
        try {
            if (!serviceRunning) {
                Log.d(TAG, "Service not running, nothing to stop");
                promise.resolve(true);
                return;
            }

            Intent stopIntent = new Intent(reactContext, EnforcementService.class);
            stopIntent.setAction(EnforcementService.ACTION_STOP_BRIGHTNESS);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactContext.startForegroundService(stopIntent);
            } else {
                reactContext.startService(stopIntent);
            }

            Log.d(TAG, "Brightness enforcement stopped");
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error stopping brightness enforcement", e);
            promise.reject("ERROR", "Failed to stop brightness enforcement: " + e.getMessage());
        }
    }
}
