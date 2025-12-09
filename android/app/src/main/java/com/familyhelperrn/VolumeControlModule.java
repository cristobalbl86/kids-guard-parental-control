package com.familyhelperrn;

import android.content.Context;
import android.media.AudioManager;
import android.database.ContentObserver;
import android.os.Handler;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import androidx.annotation.NonNull;

public class VolumeControlModule extends ReactContextBaseJavaModule {
    private static final String TAG = "VolumeControlModule";
    private final ReactApplicationContext reactContext;
    private AudioManager audioManager;
    private ContentObserver volumeObserver;
    private int enforcedVolume = -1;
    private boolean isEnforcing = false;

    public VolumeControlModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
        this.audioManager = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);
    }

    @NonNull
    @Override
    public String getName() {
        return "VolumeControl";
    }

    @ReactMethod
    public void setVolume(int volumeLevel, Promise promise) {
        try {
            int maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC);
            int targetVolume = (int) ((volumeLevel / 100.0) * maxVolume);

            audioManager.setStreamVolume(
                AudioManager.STREAM_MUSIC,
                targetVolume,
                0  // No UI flags
            );

            Log.d(TAG, "Volume set to " + volumeLevel + "% (raw: " + targetVolume + "/" + maxVolume + ")");
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error setting volume", e);
            promise.reject("ERROR", "Failed to set volume: " + e.getMessage());
        }
    }

    @ReactMethod
    public void getVolume(Promise promise) {
        try {
            int currentVolume = audioManager.getStreamVolume(AudioManager.STREAM_MUSIC);
            int maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC);
            int volumePercent = (int) ((currentVolume * 100.0) / maxVolume);

            Log.d(TAG, "Current volume: " + volumePercent + "% (raw: " + currentVolume + "/" + maxVolume + ")");
            promise.resolve(volumePercent);
        } catch (Exception e) {
            Log.e(TAG, "Error getting volume", e);
            promise.reject("ERROR", "Failed to get volume: " + e.getMessage());
        }
    }

    @ReactMethod
    public void startEnforcing(int targetVolume, Promise promise) {
        try {
            enforcedVolume = targetVolume;
            isEnforcing = true;

            // Set initial volume
            setVolume(targetVolume, new Promise() {
                @Override
                public void resolve(Object value) {}
                @Override
                public void reject(String code, String message) {}
                @Override
                public void reject(String code, Throwable throwable) {}
                @Override
                public void reject(String code, String message, Throwable throwable) {}
                @Override
                public void reject(Throwable throwable) {}
                @Override
                public void reject(Throwable throwable, WritableMap userInfo) {}
                @Override
                public void reject(String code, WritableMap userInfo) {}
                @Override
                public void reject(String code, Throwable throwable, WritableMap userInfo) {}
                @Override
                public void reject(String code, String message, WritableMap userInfo) {}
                @Override
                public void reject(String code, String message, Throwable throwable, WritableMap userInfo) {}
                @Override
                public void reject(String message) {}
            });

            // Start monitoring for changes
            startVolumeMonitoring();

            Log.d(TAG, "Started enforcing volume at " + targetVolume + "%");
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error starting enforcement", e);
            promise.reject("ERROR", "Failed to start enforcement: " + e.getMessage());
        }
    }

    @ReactMethod
    public void stopEnforcing(Promise promise) {
        try {
            isEnforcing = false;
            enforcedVolume = -1;
            stopVolumeMonitoring();

            Log.d(TAG, "Stopped enforcing volume");
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error stopping enforcement", e);
            promise.reject("ERROR", "Failed to stop enforcement: " + e.getMessage());
        }
    }

    @ReactMethod
    public void isEnforcingVolume(Promise promise) {
        promise.resolve(isEnforcing);
    }

    private void startVolumeMonitoring() {
        if (volumeObserver != null) {
            return; // Already monitoring
        }

        volumeObserver = new ContentObserver(new Handler()) {
            @Override
            public void onChange(boolean selfChange) {
                super.onChange(selfChange);
                if (isEnforcing) {
                    enforceVolume();
                }
            }
        };

        reactContext.getContentResolver().registerContentObserver(
            android.provider.Settings.System.CONTENT_URI,
            true,
            volumeObserver
        );

        Log.d(TAG, "Volume monitoring started");
    }

    private void stopVolumeMonitoring() {
        if (volumeObserver != null) {
            reactContext.getContentResolver().unregisterContentObserver(volumeObserver);
            volumeObserver = null;
            Log.d(TAG, "Volume monitoring stopped");
        }
    }

    private void enforceVolume() {
        if (!isEnforcing || enforcedVolume == -1) {
            return;
        }

        try {
            int currentVolume = audioManager.getStreamVolume(AudioManager.STREAM_MUSIC);
            int maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC);
            int currentPercent = (int) ((currentVolume * 100.0) / maxVolume);

            if (Math.abs(currentPercent - enforcedVolume) > 2) {
                int targetVolume = (int) ((enforcedVolume / 100.0) * maxVolume);
                audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, targetVolume, 0);

                Log.d(TAG, "Volume enforced: " + currentPercent + "% -> " + enforcedVolume + "%");

                // Send event to JavaScript
                sendVolumeEnforcedEvent(currentPercent, enforcedVolume);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error enforcing volume", e);
        }
    }

    private void sendVolumeEnforcedEvent(int from, int to) {
        WritableMap params = Arguments.createMap();
        params.putInt("from", from);
        params.putInt("to", to);

        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit("onVolumeEnforced", params);
    }

    @Override
    public void onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy();
        stopVolumeMonitoring();
    }
}
