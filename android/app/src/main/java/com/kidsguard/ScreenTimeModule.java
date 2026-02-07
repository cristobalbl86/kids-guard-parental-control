package com.kidsguard;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.provider.Settings;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class ScreenTimeModule extends ReactContextBaseJavaModule {
    private static final String TAG = "ScreenTimeModule";
    private static final String PREFS_NAME = "screen_time_prefs";
    private static final String KEY_LIMIT_SECONDS = "limit_seconds";
    private static final String KEY_ENFORCING = "enforcing";
    private static final String KEY_TIMER_START_MS = "timer_start_ms";

    private final ReactApplicationContext reactContext;

    public ScreenTimeModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
    }

    @NonNull
    @Override
    public String getName() {
        return "ScreenTimeModule";
    }

    /**
     * Get elapsed seconds since timer was started
     */
    @ReactMethod
    public void getDailyUsageSeconds(Promise promise) {
        try {
            int elapsedSeconds = getDailyUsageSecondsStatic(reactContext);
            promise.resolve(elapsedSeconds);
        } catch (Exception e) {
            Log.e(TAG, "Error getting elapsed time", e);
            promise.reject("ERROR", "Failed to get elapsed time: " + e.getMessage());
        }
    }

    /**
     * Static version: get elapsed seconds since timer start
     */
    public static int getDailyUsageSecondsStatic(Context context) {
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            long startMs = prefs.getLong(KEY_TIMER_START_MS, 0);
            if (startMs == 0) {
                return 0;
            }
            long elapsedMs = System.currentTimeMillis() - startMs;
            int elapsedSeconds = (int) (elapsedMs / 1000);
            Log.d(TAG, "Timer elapsed: " + elapsedSeconds + "s (" + formatSeconds(elapsedSeconds) + ")");
            return Math.max(0, elapsedSeconds);
        } catch (Exception e) {
            Log.e(TAG, "Error calculating elapsed time", e);
            return 0;
        }
    }

    /**
     * Start enforcing screen time limit
     */
    @ReactMethod
    public void startEnforcing(int limitSeconds, Promise promise) {
        try {
            // Save limit and timer start to SharedPreferences
            SharedPreferences prefs = reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            prefs.edit()
                .putInt(KEY_LIMIT_SECONDS, limitSeconds)
                .putBoolean(KEY_ENFORCING, true)
                .putLong(KEY_TIMER_START_MS, System.currentTimeMillis())
                .apply();

            Log.d(TAG, "Screen time timer started: limit=" + limitSeconds + "s (" + formatSeconds(limitSeconds) + ")");
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error starting enforcement", e);
            promise.reject("ERROR", "Failed to start enforcement: " + e.getMessage());
        }
    }

    /**
     * Stop enforcing screen time limit
     */
    @ReactMethod
    public void stopEnforcing(Promise promise) {
        try {
            SharedPreferences prefs = reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            prefs.edit()
                .putBoolean(KEY_ENFORCING, false)
                .putLong(KEY_TIMER_START_MS, 0)
                .apply();

            Log.d(TAG, "Screen time enforcement stopped");
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error stopping enforcement", e);
            promise.reject("ERROR", "Failed to stop enforcement: " + e.getMessage());
        }
    }

    /**
     * Check if screen time enforcement is currently active
     */
    @ReactMethod
    public void isEnforcing(Promise promise) {
        try {
            SharedPreferences prefs = reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            boolean enforcing = prefs.getBoolean(KEY_ENFORCING, false);
            promise.resolve(enforcing);
        } catch (Exception e) {
            Log.e(TAG, "Error checking enforcement status", e);
            promise.resolve(false);
        }
    }

    /**
     * Get current screen time limit in seconds
     */
    @ReactMethod
    public void getLimit(Promise promise) {
        try {
            SharedPreferences prefs = reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            int limit = prefs.getInt(KEY_LIMIT_SECONDS, 7200); // Default 2 hours
            promise.resolve(limit);
        } catch (Exception e) {
            Log.e(TAG, "Error getting limit", e);
            promise.resolve(7200);
        }
    }

    /**
     * Check if SYSTEM_ALERT_WINDOW (overlay) permission is granted
     */
    @ReactMethod
    public void checkOverlayPermission(Promise promise) {
        try {
            boolean hasPermission = true;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                hasPermission = Settings.canDrawOverlays(reactContext);
            }
            promise.resolve(hasPermission);
        } catch (Exception e) {
            Log.e(TAG, "Error checking overlay permission", e);
            promise.resolve(false);
        }
    }

    /**
     * Request SYSTEM_ALERT_WINDOW permission (opens Settings)
     */
    @ReactMethod
    public void requestOverlayPermission(Promise promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                Intent intent = new Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    android.net.Uri.parse("package:" + reactContext.getPackageName())
                );
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                reactContext.startActivity(intent);
            }
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error requesting overlay permission", e);
            promise.reject("ERROR", "Failed to open overlay settings: " + e.getMessage());
        }
    }

    // ============ Helper Methods ============

    /**
     * Get enforcement status from SharedPreferences (static for EnforcementService)
     */
    public static boolean isEnforcingStatic(Context context) {
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            return prefs.getBoolean(KEY_ENFORCING, false);
        } catch (Exception e) {
            Log.e(TAG, "Error checking enforcement status", e);
            return false;
        }
    }

    /**
     * Get limit from SharedPreferences (static for EnforcementService)
     */
    public static int getLimitStatic(Context context) {
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            return prefs.getInt(KEY_LIMIT_SECONDS, 7200); // Default 2 hours
        } catch (Exception e) {
            Log.e(TAG, "Error getting limit", e);
            return 7200;
        }
    }

    private static String formatSeconds(int seconds) {
        int hours = seconds / 3600;
        int minutes = (seconds % 3600) / 60;
        return hours + "h " + minutes + "m";
    }
}
