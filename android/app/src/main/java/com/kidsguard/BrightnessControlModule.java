package com.kidsguard;

import android.app.Activity;
import android.content.ContentResolver;
import android.os.Build;
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
    private static final String SCREEN_BRIGHTNESS_FLOAT = "screen_brightness_float";
    private final ReactApplicationContext reactContext;
    private ContentObserver brightnessObserver;
    private int enforcedBrightness = -1;
    private boolean isEnforcing = false;

    // HLG (Hybrid Log-Gamma) constants from AOSP BrightnessUtils.
    // Used as a fallback if reflection to system BrightnessUtils fails.
    private static final float HLG_R = 0.5f;
    private static final float HLG_A = 0.17883277f;
    private static final float HLG_B = 0.28466892f;
    private static final float HLG_C = 0.55991073f;

    public BrightnessControlModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
    }

    @NonNull
    @Override
    public String getName() {
        return "BrightnessControl";
    }

    // ============ Brightness Conversion Methods ============

    private static float clamp01(float value) {
        return Math.max(0.0f, Math.min(1.0f, value));
    }

    private static Float invokeBrightnessUtils(String methodName, float value) {
        try {
            Class<?> clazz = Class.forName("com.android.internal.display.BrightnessUtils");
            java.lang.reflect.Method method = clazz.getDeclaredMethod(methodName, float.class);
            method.setAccessible(true);
            Object result = method.invoke(null, value);
            if (result instanceof Float) {
                return (Float) result;
            }
        } catch (Throwable ignored) {
            // Reflection may be blocked on some devices; fall back to HLG.
        }
        return null;
    }

    private static float hlgGammaToLinear(float gamma) {
        if (gamma <= 0) {
            return 0.0f;
        }

        final float linear;
        if (gamma <= HLG_R) {
            linear = (gamma / HLG_R) * (gamma / HLG_R) / 12.0f;
        } else {
            linear = ((float) Math.exp((gamma - HLG_C) / HLG_A) + HLG_B) / 12.0f;
        }

        return clamp01(linear);
    }

    private static float hlgLinearToGamma(float linear) {
        if (linear <= 0) {
            return 0.0f;
        }

        final float gamma;
        if (linear <= 1.0f / 12.0f) {
            gamma = (float) Math.sqrt(linear * 12.0f) * HLG_R;
        } else {
            gamma = HLG_A * (float) Math.log(12.0f * linear - HLG_B) + HLG_C;
        }

        return clamp01(gamma);
    }

    /**
     * Convert slider/user percentage (0-100) to system brightness float (0.0-1.0).
     * Uses system BrightnessUtils when available; falls back to HLG.
     */
    private static float sliderPercentToLinearFloat(int percent) {
        float gamma = clamp01(Math.max(0, Math.min(100, percent)) / 100.0f);

        Float reflected = invokeBrightnessUtils("convertGammaToLinearFloat", gamma);
        if (reflected != null) {
            return clamp01(reflected);
        }

        return hlgGammaToLinear(gamma);
    }

    /**
     * Convert system brightness float (0.0-1.0) to slider/user percentage (0-100).
     * Uses system BrightnessUtils when available; falls back to HLG.
     */
    private static int linearFloatToSliderPercent(float linear) {
        float clampedLinear = clamp01(linear);

        Float reflected = invokeBrightnessUtils("convertLinearToGammaFloat", clampedLinear);
        float gamma = reflected != null ? clamp01(reflected) : hlgLinearToGamma(clampedLinear);

        return Math.round(gamma * 100.0f);
    }

    /**
     * Convert slider/user percentage (0-100) to system brightness integer (0-255).
     */
    private static int sliderPercentToSystemInt(int percent) {
        float clamped = Math.max(0, Math.min(100, percent));
        return Math.round(clamped * 255.0f / 100.0f);
    }

    /**
     * Convert system brightness integer (0-255) to slider/user percentage (0-100).
     */
    private static int systemIntToSliderPercent(int systemValue) {
        int clamped = Math.max(0, Math.min(255, systemValue));
        return Math.round(clamped * 100.0f / 255.0f);
    }

    /**
     * Android 16+ uses a non-linear slider curve that doesn't match HLG on some devices.
     * Apply an empirically derived inverse mapping so the app percentage matches the
     * system slider percentage. Uses piecewise linear interpolation.
     */
    private static int adjustSliderPercentForAndroid16Plus(int desiredPercent) {
        int clamped = Math.max(0, Math.min(100, desiredPercent));

        // Device percent (x) -> App percent (y) inverse mapping points
        // Derived from observed pairs: app->device
        final int[] devicePoints = new int[] { 0, 20, 37, 50, 60, 70, 79, 89, 99, 100 };
        final int[] appPoints = new int[]    { 0, 20, 30, 40, 50, 60, 70, 80, 90, 100 };

        if (clamped <= devicePoints[0]) {
            return appPoints[0];
        }

        for (int i = 1; i < devicePoints.length; i++) {
            if (clamped <= devicePoints[i]) {
                int x0 = devicePoints[i - 1];
                int x1 = devicePoints[i];
                int y0 = appPoints[i - 1];
                int y1 = appPoints[i];

                float t = (x1 == x0) ? 0.0f : (clamped - x0) / (float) (x1 - x0);
                return Math.round(y0 + t * (y1 - y0));
            }
        }

        return appPoints[appPoints.length - 1];
    }

    private static int maybeAdjustPercentForAndroid16Plus(int desiredPercent) {
        if (Build.VERSION.SDK_INT >= 35) { // Android 15/16+
            return adjustSliderPercentForAndroid16Plus(desiredPercent);
        }
        return desiredPercent;
    }

    // ============ Public API Methods ============

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

                    int clampedBrightness = Math.max(0, Math.min(100, brightnessPercent));
                    int adjustedBrightness = maybeAdjustPercentForAndroid16Plus(clampedBrightness);

                    // Set system brightness (requires WRITE_SETTINGS permission)
                    try {
                        ContentResolver cResolver = reactContext.getContentResolver();

                        // Disable auto brightness
                        Settings.System.putInt(
                            cResolver,
                            Settings.System.SCREEN_BRIGHTNESS_MODE,
                            Settings.System.SCREEN_BRIGHTNESS_MODE_MANUAL
                        );

                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                            // Android 9+: convert slider (gamma) percent to linear float
                            float linearFloat = sliderPercentToLinearFloat(adjustedBrightness);

                            try {
                                Settings.System.putFloat(cResolver, SCREEN_BRIGHTNESS_FLOAT, linearFloat);
                            } catch (Exception e) {
                                Log.w(TAG, "Could not write float brightness setting", e);
                            }

                            // Also write integer value derived from linear float (compatibility)
                            int systemValue = Math.round(linearFloat * 255.0f);
                            Settings.System.putInt(
                                cResolver,
                                Settings.System.SCREEN_BRIGHTNESS,
                                systemValue
                            );

                            Log.d(TAG, "Brightness set to " + clampedBrightness + "% (adjusted=" + adjustedBrightness + "%, linearFloat=" + linearFloat + ", int=" + systemValue + "/255)");

                            // Set window brightness
                            Window window = activity.getWindow();
                            WindowManager.LayoutParams layoutParams = window.getAttributes();
                            layoutParams.screenBrightness = linearFloat;
                            window.setAttributes(layoutParams);
                        } else {
                            // Android 6-8: linear mapping to integer range
                            int systemValue = sliderPercentToSystemInt(adjustedBrightness);
                            Settings.System.putInt(
                                cResolver,
                                Settings.System.SCREEN_BRIGHTNESS,
                                systemValue
                            );

                            Log.d(TAG, "Brightness set to " + clampedBrightness + "% (adjusted=" + adjustedBrightness + "%, int=" + systemValue + "/255)");

                            Window window = activity.getWindow();
                            WindowManager.LayoutParams layoutParams = window.getAttributes();
                            layoutParams.screenBrightness = systemValue / 255.0f;
                            window.setAttributes(layoutParams);
                        }
                    } catch (Exception e) {
                        Log.w(TAG, "Could not set system brightness (permission may be missing)", e);
                    }

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

                    int brightnessPercent;
                    String brightnessSource;

                    // Check window brightness first as it reflects what the user sees in the app
                    Window window = activity.getWindow();
                    WindowManager.LayoutParams layoutParams = window.getAttributes();
                    float windowBrightness = layoutParams.screenBrightness;

                    if (windowBrightness >= 0) {
                        // Window brightness is linear (0.0-1.0), convert to percentage
                        brightnessPercent = linearFloatToSliderPercent(windowBrightness);
                        brightnessSource = "window";
                    } else {
                        // Fallback to system brightness
                        try {
                            ContentResolver cResolver = reactContext.getContentResolver();

                            // Try float setting first on Android 9+, then fall back to integer
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                                try {
                                    float brightnessFloat = Settings.System.getFloat(cResolver, SCREEN_BRIGHTNESS_FLOAT);
                                    brightnessPercent = linearFloatToSliderPercent(brightnessFloat);
                                    brightnessSource = "system_float";
                                } catch (Settings.SettingNotFoundException e) {
                                    int systemBrightness = Settings.System.getInt(cResolver, Settings.System.SCREEN_BRIGHTNESS);
                                    brightnessPercent = systemIntToSliderPercent(systemBrightness);
                                    brightnessSource = "system_int_fallback";
                                }
                            } else {
                                int systemBrightness = Settings.System.getInt(cResolver, Settings.System.SCREEN_BRIGHTNESS);
                                brightnessPercent = systemIntToSliderPercent(systemBrightness);
                                brightnessSource = "system_int";
                            }

                            Log.d(TAG, "Read system brightness (" + brightnessSource + ")");
                        } catch (Exception e) {
                            Log.w(TAG, "Could not read system brightness", e);
                            brightnessPercent = 50;
                            brightnessSource = "default";
                        }
                    }

                    brightnessPercent = Math.max(0, Math.min(100, brightnessPercent));
                    Log.d(TAG, "getBrightness() returning " + brightnessPercent + "% from " + brightnessSource);
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

    // ============ Monitoring & Enforcement ============

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

        ContentResolver resolver = reactContext.getContentResolver();

        resolver.registerContentObserver(
            Settings.System.getUriFor(Settings.System.SCREEN_BRIGHTNESS),
            false,
            brightnessObserver
        );

        // On API 28+, also observe the float brightness setting for better detection
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            resolver.registerContentObserver(
                Settings.System.getUriFor(SCREEN_BRIGHTNESS_FLOAT),
                false,
                brightnessObserver
            );
        }

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
                    ContentResolver cResolver = reactContext.getContentResolver();
                    int currentPercent;

                    // Read current brightness and convert to slider percentage
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                        try {
                            float currentFloat = Settings.System.getFloat(cResolver, SCREEN_BRIGHTNESS_FLOAT);
                            currentPercent = linearFloatToSliderPercent(currentFloat);
                        } catch (Settings.SettingNotFoundException e) {
                            int currentInt = Settings.System.getInt(cResolver, Settings.System.SCREEN_BRIGHTNESS);
                            currentPercent = systemIntToSliderPercent(currentInt);
                        }
                    } else {
                        int currentInt = Settings.System.getInt(cResolver, Settings.System.SCREEN_BRIGHTNESS);
                        currentPercent = systemIntToSliderPercent(currentInt);
                    }

                    // Check if brightness has changed significantly (more than 3% tolerance)
                    if (Math.abs(currentPercent - enforcedBrightness) > 3) {
                        // Disable auto brightness if needed
                        Settings.System.putInt(cResolver,
                            Settings.System.SCREEN_BRIGHTNESS_MODE,
                            Settings.System.SCREEN_BRIGHTNESS_MODE_MANUAL);

                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                            int adjustedBrightness = maybeAdjustPercentForAndroid16Plus(enforcedBrightness);
                            float enforcedLinear = sliderPercentToLinearFloat(adjustedBrightness);

                            try {
                                Settings.System.putFloat(cResolver, SCREEN_BRIGHTNESS_FLOAT, enforcedLinear);
                            } catch (Exception e) {
                                Log.w(TAG, "Could not write float brightness during enforcement", e);
                            }

                            int enforcedInt = Math.round(enforcedLinear * 255.0f);
                            Settings.System.putInt(cResolver, Settings.System.SCREEN_BRIGHTNESS, enforcedInt);

                            Activity activity = getCurrentActivity();
                            if (activity != null) {
                                Window window = activity.getWindow();
                                WindowManager.LayoutParams lp = window.getAttributes();
                                lp.screenBrightness = enforcedLinear;
                                window.setAttributes(lp);
                                Log.d(TAG, "Brightness enforced (system + window): " + currentPercent + "% -> " + enforcedBrightness + "%");
                            } else {
                                Log.d(TAG, "Brightness enforced (system only): " + currentPercent + "% -> " + enforcedBrightness + "%");
                            }
                        } else {
                            int adjustedBrightness = maybeAdjustPercentForAndroid16Plus(enforcedBrightness);
                            int enforcedInt = sliderPercentToSystemInt(adjustedBrightness);
                            Settings.System.putInt(cResolver, Settings.System.SCREEN_BRIGHTNESS, enforcedInt);

                            Activity activity = getCurrentActivity();
                            if (activity != null) {
                                Window window = activity.getWindow();
                                WindowManager.LayoutParams lp = window.getAttributes();
                                lp.screenBrightness = enforcedInt / 255.0f;
                                window.setAttributes(lp);
                                Log.d(TAG, "Brightness enforced (system + window): " + currentPercent + "% -> " + enforcedBrightness + "%");
                            } else {
                                Log.d(TAG, "Brightness enforced (system only): " + currentPercent + "% -> " + enforcedBrightness + "%");
                            }
                        }

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
