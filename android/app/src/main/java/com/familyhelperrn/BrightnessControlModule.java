package com.familyhelperrn;

import android.app.Activity;
import android.content.ContentResolver;
import android.content.Context;
import android.provider.Settings;
import android.util.Log;
import android.view.Window;
import android.view.WindowManager;
import android.database.ContentObserver;
import android.os.Handler;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import androidx.annotation.NonNull;

public class BrightnessControlModule extends ReactContextBaseJavaModule {
    private static final String TAG = "BrightnessControl";
    private final ReactApplicationContext reactContext;
    private ContentObserver brightnessObserver;
    private int enforcedBrightness = -1;
    private boolean isEnforcing = false;

    public BrightnessControlModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
    }

    @NonNull
    @Override
    public String getName() {
        return "BrightnessControl";
    }

    @ReactMethod
    public void setBrightness(final int brightnessPercent, final Promise promise) {
        UiThreadUtil.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                try {
                    Activity activity = getCurrentActivity();
                    if (activity == null) {
                        promise.reject("ERROR", "Activity is null");
                        return;
                    }

                    // Clamp brightness between 0 and 100
                    int clampedBrightness = Math.max(0, Math.min(100, brightnessPercent));
                    float brightness = clampedBrightness / 100.0f;

                    Window window = activity.getWindow();
                    WindowManager.LayoutParams layoutParams = window.getAttributes();
                    layoutParams.screenBrightness = brightness;
                    window.setAttributes(layoutParams);

                    // Also try to set system brightness (requires WRITE_SETTINGS permission)
                    try {
                        ContentResolver cResolver = reactContext.getContentResolver();
                        Settings.System.putInt(
                            cResolver,
                            Settings.System.SCREEN_BRIGHTNESS,
                            (int) (brightness * 255)
                        );

                        // Disable auto brightness
                        Settings.System.putInt(
                            cResolver,
                            Settings.System.SCREEN_BRIGHTNESS_MODE,
                            Settings.System.SCREEN_BRIGHTNESS_MODE_MANUAL
                        );
                    } catch (Exception e) {
                        Log.w(TAG, "Could not set system brightness (permission may be missing)", e);
                    }

                    Log.d(TAG, "Brightness set to " + brightnessPercent + "%");
                    promise.resolve(true);
                } catch (Exception e) {
                    Log.e(TAG, "Error setting brightness", e);
                    promise.reject("ERROR", "Failed to set brightness: " + e.getMessage());
                }
            }
        });
    }

    @ReactMethod
    public void getBrightness(final Promise promise) {
        UiThreadUtil.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                try {
                    Activity activity = getCurrentActivity();
                    if (activity == null) {
                        promise.reject("ERROR", "Activity is null");
                        return;
                    }

                    Window window = activity.getWindow();
                    WindowManager.LayoutParams layoutParams = window.getAttributes();
                    float brightness = layoutParams.screenBrightness;

                    // If brightness is set to system default (-1), get system brightness
                    if (brightness < 0) {
                        try {
                            ContentResolver cResolver = reactContext.getContentResolver();
                            int systemBrightness = Settings.System.getInt(
                                cResolver,
                                Settings.System.SCREEN_BRIGHTNESS
                            );
                            brightness = systemBrightness / 255.0f;
                        } catch (Settings.SettingNotFoundException e) {
                            brightness = 0.5f; // Default to 50%
                        }
                    }

                    int brightnessPercent = Math.round(brightness * 100);
                    Log.d(TAG, "Current brightness: " + brightnessPercent + "%");
                    promise.resolve(brightnessPercent);
                } catch (Exception e) {
                    Log.e(TAG, "Error getting brightness", e);
                    promise.reject("ERROR", "Failed to get brightness: " + e.getMessage());
                }
            }
        });
    }

    @ReactMethod
    public void checkWriteSettingsPermission(Promise promise) {
        boolean hasPermission = Settings.System.canWrite(reactContext);
        promise.resolve(hasPermission);
    }

    @ReactMethod
    public void requestWriteSettingsPermission(Promise promise) {
        try {
            Activity activity = getCurrentActivity();
            if (activity == null) {
                promise.reject("ERROR", "Activity is null");
                return;
            }

            // Open the specific "Modify system settings" permission page
            android.content.Intent intent = new android.content.Intent(
                Settings.ACTION_MANAGE_WRITE_SETTINGS,
                android.net.Uri.parse("package:" + reactContext.getPackageName())
            );
            intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
            activity.startActivity(intent);

            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error opening write settings permission", e);
            promise.reject("ERROR", "Failed to open settings: " + e.getMessage());
        }
    }

    @ReactMethod
    public void startEnforcing(int targetBrightness, Promise promise) {
        try {
            enforcedBrightness = targetBrightness;
            isEnforcing = true;

            // Set initial brightness
            setBrightness(targetBrightness, new Promise() {
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
            startBrightnessMonitoring();

            Log.d(TAG, "Started enforcing brightness at " + targetBrightness + "%");
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
            enforcedBrightness = -1;
            stopBrightnessMonitoring();

            Log.d(TAG, "Stopped enforcing brightness");
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error stopping enforcement", e);
            promise.reject("ERROR", "Failed to stop enforcement: " + e.getMessage());
        }
    }

    @ReactMethod
    public void isEnforcingBrightness(Promise promise) {
        promise.resolve(isEnforcing);
    }

    private void startBrightnessMonitoring() {
        if (brightnessObserver != null) {
            return; // Already monitoring
        }

        brightnessObserver = new ContentObserver(new Handler()) {
            @Override
            public void onChange(boolean selfChange) {
                super.onChange(selfChange);
                if (isEnforcing) {
                    enforceBrightness();
                }
            }
        };

        reactContext.getContentResolver().registerContentObserver(
            Settings.System.getUriFor(Settings.System.SCREEN_BRIGHTNESS),
            false,
            brightnessObserver
        );

        Log.d(TAG, "Brightness monitoring started");
    }

    private void stopBrightnessMonitoring() {
        if (brightnessObserver != null) {
            reactContext.getContentResolver().unregisterContentObserver(brightnessObserver);
            brightnessObserver = null;
            Log.d(TAG, "Brightness monitoring stopped");
        }
    }

    private void enforceBrightness() {
        if (!isEnforcing || enforcedBrightness == -1) {
            return;
        }

        UiThreadUtil.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                try {
                    // Get current system brightness
                    ContentResolver cResolver = reactContext.getContentResolver();
                    int currentSystemBrightness = Settings.System.getInt(
                        cResolver,
                        Settings.System.SCREEN_BRIGHTNESS
                    );
                    int currentPercent = (int) ((currentSystemBrightness * 100.0) / 255);

                    // Check if brightness has changed significantly
                    if (Math.abs(currentPercent - enforcedBrightness) > 5) {
                        // Restore enforced brightness
                        int targetBrightness = (int) ((enforcedBrightness / 100.0) * 255);
                        
                        // Set system brightness
                        Settings.System.putInt(
                            cResolver,
                            Settings.System.SCREEN_BRIGHTNESS,
                            targetBrightness
                        );

                        // Also set window brightness
                        Activity activity = getCurrentActivity();
                        if (activity != null) {
                            Window window = activity.getWindow();
                            WindowManager.LayoutParams layoutParams = window.getAttributes();
                            layoutParams.screenBrightness = enforcedBrightness / 100.0f;
                            window.setAttributes(layoutParams);
                        }

                        Log.d(TAG, "Brightness enforced: " + currentPercent + "% -> " + enforcedBrightness + "%");

                        // Send event to JavaScript
                        sendBrightnessEnforcedEvent(currentPercent, enforcedBrightness);
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Error enforcing brightness", e);
                }
            }
        });
    }

    private void sendBrightnessEnforcedEvent(int from, int to) {
        WritableMap params = Arguments.createMap();
        params.putInt("from", from);
        params.putInt("to", to);

        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit("onBrightnessEnforced", params);
    }

    @Override
    public void onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy();
        stopBrightnessMonitoring();
    }
}
