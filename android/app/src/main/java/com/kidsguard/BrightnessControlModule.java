package com.kidsguard;

import android.app.Activity;
import android.content.ContentResolver;
import android.provider.Settings;
import android.util.Log;
import android.view.Window;
import android.view.WindowManager;
import android.database.ContentObserver;
import android.os.Handler;
import android.content.res.Resources;

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
    private boolean brightnessRangeInitialized = false;
    private int brightnessMinimum = 0;
    private int brightnessMaximum = 255;

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

                    ensureBrightnessRangeInitialized();

                    int systemBrightnessValue = convertPercentToSystemValue(clampedBrightness);

                    // Also try to set system brightness (requires WRITE_SETTINGS permission)
                    try {
                        ContentResolver cResolver = reactContext.getContentResolver();
                        Settings.System.putInt(
                            cResolver,
                            Settings.System.SCREEN_BRIGHTNESS,
                            systemBrightnessValue
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

                    // Ensure the current window follows the value we just applied system-wide.
                    Window window = activity.getWindow();
                    WindowManager.LayoutParams layoutParams = window.getAttributes();
                    // Set window brightness explicitly to ensure immediate feedback
                    // Use the calculated system value to ensure consistency with the curve
                    layoutParams.screenBrightness = (float)systemBrightnessValue / brightnessMaximum;
                    window.setAttributes(layoutParams);

                    Log.d(TAG, "Brightness set to " + brightnessPercent + "% (system=" + systemBrightnessValue + "/" + brightnessMaximum + ")");
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

                    float brightness;
                    String brightnessSource;

                    ensureBrightnessRangeInitialized();
                    // Check window brightness first as it reflects what the user sees in the app
                    Window window = activity.getWindow();
                    WindowManager.LayoutParams layoutParams = window.getAttributes();
                    float windowBrightness = layoutParams.screenBrightness;

                    if (windowBrightness >= 0) {
                        // Convert window brightness (linear) back to percent (gamma)
                        int estimatedSystemValue = Math.round(windowBrightness * brightnessMaximum);
                        brightness = convertSystemValueToPercent(estimatedSystemValue);
                        brightnessSource = "window";
                    } else {
                        // Fallback to system brightness
                        try {
                            ContentResolver cResolver = reactContext.getContentResolver();
                            int systemBrightness = Settings.System.getInt(
                                cResolver,
                                Settings.System.SCREEN_BRIGHTNESS
                            );
                            // Convert from system range to 0-100 percentage
                            brightness = convertSystemValueToPercent(systemBrightness);
                            brightnessSource = "system";
                            Log.d(TAG, "Read system brightness: " + systemBrightness + "/" + brightnessMaximum + " (" + brightness + "%)");
                        } catch (Exception e) {
                            Log.w(TAG, "Could not read system brightness", e);
                            brightness = 50;
                            brightnessSource = "default";
                        }
                    }

                    int brightnessPercent = Math.round(Math.max(0, Math.min(100, brightness)));

                    Log.d(TAG, "getBrightness() returning " + brightnessPercent + "% from " + brightnessSource + " brightness");
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

            // Reset window brightness to use system brightness
            UiThreadUtil.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    Activity activity = getCurrentActivity();
                    if (activity != null) {
                        Window window = activity.getWindow();
                        WindowManager.LayoutParams layoutParams = window.getAttributes();
                        layoutParams.screenBrightness = -1.0f;  // Use system brightness
                        window.setAttributes(layoutParams);
                        Log.d(TAG, "Window brightness reset to use system brightness");
                    }
                }
            });

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

    private void ensureBrightnessRangeInitialized() {
        if (brightnessRangeInitialized) {
            return;
        }

        int min = 0;
        int max = 255;

        ContentResolver resolver = reactContext.getContentResolver();

        try {
            min = Settings.System.getInt(resolver, "screen_brightness_min");
        } catch (Settings.SettingNotFoundException | SecurityException ignored) {
        }

        try {
            max = Settings.System.getInt(resolver, "screen_brightness_max");
        } catch (Settings.SettingNotFoundException | SecurityException ignored) {
        }

        Resources res = reactContext.getResources();

        int resMinId = res.getIdentifier("config_screenBrightnessSettingMinimum", "integer", "android");
        if (resMinId != 0) {
            try {
                min = res.getInteger(resMinId);
            } catch (Resources.NotFoundException ignored) {
            }
        }

        int resMaxId = res.getIdentifier("config_screenBrightnessSettingMaximum", "integer", "android");
        if (resMaxId != 0) {
            try {
                max = res.getInteger(resMaxId);
            } catch (Resources.NotFoundException ignored) {
            }
        }

        if (max <= min) {
            // Fallback to defaults if values are invalid
            min = 0;
            max = 255;
        }

        brightnessMinimum = Math.max(0, min);
        brightnessMaximum = Math.max(brightnessMinimum + 1, max);
        brightnessRangeInitialized = true;

        Log.d(TAG, "Resolved brightness range -> min=" + brightnessMinimum + ", max=" + brightnessMaximum);
    }

    private int convertPercentToSystemValue(int percent) {
        ensureBrightnessRangeInitialized();

        int clampedPercent = Math.max(0, Math.min(100, percent));
        int range = brightnessMaximum - brightnessMinimum;

        if (range <= 0) {
            return Math.round(clampedPercent * 255.0f / 100.0f);
        }

        // Use quadratic curve for better perception matching (Gamma 2.0)
        // This matches Android's slider behavior where 50% is perceptually half bright (but ~25% power)
        float normalizedPercent = clampedPercent / 100.0f;
        float normalizedValue = normalizedPercent * normalizedPercent; // x^2
        
        int systemValue = Math.round(brightnessMinimum + normalizedValue * range);
        return Math.max(brightnessMinimum, Math.min(brightnessMaximum, systemValue));
    }

    private int convertSystemValueToPercent(int systemValue) {
        ensureBrightnessRangeInitialized();

        int clampedValue = Math.max(brightnessMinimum, Math.min(brightnessMaximum, systemValue));
        int range = brightnessMaximum - brightnessMinimum;

        if (range <= 0) {
            float normalized = clampedValue / 255.0f;
            return Math.round(normalized * 100.0f);
        }

        // Inverse of quadratic curve: percent = sqrt(normalizedValue)
        float normalizedValue = (float)(clampedValue - brightnessMinimum) / range;
        float normalizedPercent = (float)Math.sqrt(normalizedValue);
        
        return Math.round(Math.max(0.0f, Math.min(1.0f, normalizedPercent)) * 100.0f);
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
                    ensureBrightnessRangeInitialized();

                    int currentPercent = convertSystemValueToPercent(currentSystemBrightness);

                    // Check if brightness has changed significantly
                    if (Math.abs(currentPercent - enforcedBrightness) > 5) {
                        // Restore enforced brightness - convert percentage (0-100) to Android value (0-255)
                        int targetBrightness = convertPercentToSystemValue(enforcedBrightness);
                        
                        // Set system brightness
                        Settings.System.putInt(
                            cResolver,
                            Settings.System.SCREEN_BRIGHTNESS,
                            targetBrightness
                        );

                        // Set window brightness explicitly to ensure enforcement in app
                        Activity activity = getCurrentActivity();
                        if (activity != null) {
                            Window window = activity.getWindow();
                            WindowManager.LayoutParams layoutParams = window.getAttributes();
                            layoutParams.screenBrightness = (float)targetBrightness / brightnessMaximum;
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
