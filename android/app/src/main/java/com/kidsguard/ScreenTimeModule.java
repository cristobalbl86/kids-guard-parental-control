package com.kidsguard;

import android.app.AppOpsManager;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
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

import java.util.Calendar;
import java.util.List;

public class ScreenTimeModule extends ReactContextBaseJavaModule {
    private static final String TAG = "ScreenTimeModule";
    private static final String PREFS_NAME = "screen_time_prefs";
    private static final String KEY_LIMIT_SECONDS = "limit_seconds";
    private static final String KEY_ENFORCING = "enforcing";

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
     * Get total screen time usage for today in seconds
     */
    @ReactMethod
    public void getDailyUsageSeconds(Promise promise) {
        try {
            int usageSeconds = getDailyUsageSecondsStatic(reactContext);
            promise.resolve(usageSeconds);
        } catch (Exception e) {
            Log.e(TAG, "Error getting daily usage", e);
            promise.reject("ERROR", "Failed to get daily usage: " + e.getMessage());
        }
    }

    /**
     * Static version of getDailyUsageSeconds for use by EnforcementService
     */
    public static int getDailyUsageSecondsStatic(Context context) {
        try {
            UsageStatsManager usageStatsManager = (UsageStatsManager) context.getSystemService(Context.USAGE_STATS_SERVICE);
            if (usageStatsManager == null) {
                Log.w(TAG, "UsageStatsManager not available");
                return 0;
            }

            // Get usage from midnight today to now
            Calendar calendar = Calendar.getInstance();
            calendar.set(Calendar.HOUR_OF_DAY, 0);
            calendar.set(Calendar.MINUTE, 0);
            calendar.set(Calendar.SECOND, 0);
            calendar.set(Calendar.MILLISECOND, 0);
            long startTime = calendar.getTimeInMillis();
            long endTime = System.currentTimeMillis();

            // Query usage stats for today
            List<UsageStats> statsList = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                startTime,
                endTime
            );

            if (statsList == null || statsList.isEmpty()) {
                Log.d(TAG, "No usage stats available");
                return 0;
            }

            // Sum up total foreground time for all apps
            long totalTimeInForeground = 0;
            for (UsageStats stats : statsList) {
                totalTimeInForeground += stats.getTotalTimeInForeground();
            }

            int usageSeconds = (int) (totalTimeInForeground / 1000);
            Log.d(TAG, "Daily usage: " + usageSeconds + " seconds (" + formatSeconds(usageSeconds) + ")");
            return usageSeconds;
        } catch (Exception e) {
            Log.e(TAG, "Error calculating daily usage", e);
            return 0;
        }
    }

    /**
     * Start enforcing screen time limit
     */
    @ReactMethod
    public void startEnforcing(int limitSeconds, Promise promise) {
        try {
            if (!checkPermissionInternal()) {
                promise.reject("PERMISSION_DENIED", "PACKAGE_USAGE_STATS permission not granted");
                return;
            }

            // Save limit to SharedPreferences
            SharedPreferences prefs = reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            prefs.edit()
                .putInt(KEY_LIMIT_SECONDS, limitSeconds)
                .putBoolean(KEY_ENFORCING, true)
                .apply();

            Log.d(TAG, "Screen time enforcement started: limit=" + limitSeconds + " seconds (" + formatSeconds(limitSeconds) + ")");
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
                .apply();

            Log.d(TAG, "Screen time enforcement stopped");
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error stopping enforcement", e);
            promise.reject("ERROR", "Failed to stop enforcement: " + e.getMessage());
        }
    }

    /**
     * Check if PACKAGE_USAGE_STATS permission is granted
     */
    @ReactMethod
    public void checkPermission(Promise promise) {
        try {
            boolean hasPermission = checkPermissionInternal();
            promise.resolve(hasPermission);
        } catch (Exception e) {
            Log.e(TAG, "Error checking permission", e);
            promise.resolve(false);
        }
    }

    /**
     * Request PACKAGE_USAGE_STATS permission (opens Settings)
     */
    @ReactMethod
    public void requestPermission(Promise promise) {
        try {
            Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            reactContext.startActivity(intent);
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error requesting permission", e);
            promise.reject("ERROR", "Failed to open settings: " + e.getMessage());
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

    private boolean checkPermissionInternal() {
        try {
            AppOpsManager appOps = (AppOpsManager) reactContext.getSystemService(Context.APP_OPS_SERVICE);
            if (appOps == null) {
                return false;
            }

            int mode;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                mode = appOps.unsafeCheckOpNoThrow(
                    AppOpsManager.OPSTR_GET_USAGE_STATS,
                    android.os.Process.myUid(),
                    reactContext.getPackageName()
                );
            } else {
                mode = appOps.checkOpNoThrow(
                    AppOpsManager.OPSTR_GET_USAGE_STATS,
                    android.os.Process.myUid(),
                    reactContext.getPackageName()
                );
            }

            return mode == AppOpsManager.MODE_ALLOWED;
        } catch (Exception e) {
            Log.e(TAG, "Error checking permission", e);
            return false;
        }
    }

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
