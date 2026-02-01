package com.kidsguard;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.ContentResolver;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ServiceInfo;
import android.database.ContentObserver;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.provider.Settings;
import android.util.Log;

import androidx.core.app.NotificationCompat;

public class EnforcementService extends Service {
    private static final String TAG = "EnforcementService";
    private static final String CHANNEL_ID = "kids_guard_enforcement";
    private static final int NOTIFICATION_ID = 1001;
    private static final long BRIGHTNESS_ENFORCE_INTERVAL_MS = 5000;
    private static final String SCREEN_BRIGHTNESS_FLOAT = "screen_brightness_float";

    // HLG (Hybrid Log-Gamma) constants from AOSP BrightnessUtils.
    // These define the standard curve Android uses to map between the
    // brightness slider position (perceptual/gamma) and the underlying
    // brightness float value (linear/physical).
    private static final float HLG_R = 0.5f;
    private static final float HLG_A = 0.17883277f;
    private static final float HLG_B = 0.28466892f;
    private static final float HLG_C = 0.55991073f;

    // Persistence keys so brightness enforcement survives service restarts
    private static final String PREFS_NAME = "enforcement_prefs";
    private static final String KEY_BRIGHTNESS_ENFORCING = "brightness_enforcing";
    private static final String KEY_BRIGHTNESS_VALUE = "brightness_value";

    // Intent action constants
    public static final String ACTION_START = "com.kidsguard.ACTION_START";
    public static final String ACTION_UPDATE_BRIGHTNESS = "com.kidsguard.ACTION_UPDATE_BRIGHTNESS";
    public static final String ACTION_STOP_BRIGHTNESS = "com.kidsguard.ACTION_STOP_BRIGHTNESS";

    // Intent extra keys
    public static final String EXTRA_BRIGHTNESS_VALUE = "brightness_value";
    public static final String EXTRA_BRIGHTNESS_ENFORCING = "brightness_enforcing";

    // Brightness enforcement state
    private ContentObserver brightnessObserver;
    private int enforcedBrightness = -1;
    private boolean isBrightnessEnforcing = false;
    private Handler mainHandler;
    private final Runnable periodicEnforceRunnable = new Runnable() {
        @Override
        public void run() {
            if (isBrightnessEnforcing) {
                enforceBrightness();
                mainHandler.postDelayed(this, BRIGHTNESS_ENFORCE_INTERVAL_MS);
            }
        }
    };

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
     * Android 16+ uses a non-linear slider curve that doesn't match HLG on some devices.
     * Apply an empirically derived inverse mapping so the app percentage matches the
     * system slider percentage. Uses piecewise linear interpolation.
     */
    private static int adjustSliderPercentForAndroid16Plus(int desiredPercent) {
        int clamped = Math.max(0, Math.min(100, desiredPercent));

        // Device percent (x) -> App percent (y) inverse mapping points
        // Refined from observed pairs: app->device
        final int[] devicePoints = new int[] { 0, 14, 20, 34, 50, 60, 70, 79, 89, 99, 100 };
        final int[] appPoints = new int[]    { 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100 };

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

    // ============ Service Lifecycle ============

    @Override
    public void onCreate() {
        super.onCreate();
        Log.d(TAG, "EnforcementService created");
        mainHandler = new Handler(Looper.getMainLooper());
        createNotificationChannel();

        // Restore any previously enforced brightness if the service was restarted by the system
        restoreBrightnessStateIfNeeded();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.d(TAG, "EnforcementService onStartCommand");

        // Handle intent actions
        boolean handledIntent = false;
        if (intent != null) {
            String action = intent.getAction();
            if (action != null) {
                switch (action) {
                    case ACTION_UPDATE_BRIGHTNESS:
                        int brightness = intent.getIntExtra(EXTRA_BRIGHTNESS_VALUE, -1);
                        boolean enforcing = intent.getBooleanExtra(EXTRA_BRIGHTNESS_ENFORCING, false);
                        updateBrightnessEnforcement(brightness, enforcing);
                        handledIntent = true;
                        break;
                    case ACTION_STOP_BRIGHTNESS:
                        stopBrightnessEnforcement();
                        handledIntent = true;
                        break;
                    case ACTION_START:
                    default:
                        // Check for initial brightness settings
                        if (intent.hasExtra(EXTRA_BRIGHTNESS_VALUE)) {
                            int initBrightness = intent.getIntExtra(EXTRA_BRIGHTNESS_VALUE, -1);
                            boolean initEnforcing = intent.getBooleanExtra(EXTRA_BRIGHTNESS_ENFORCING, false);
                            updateBrightnessEnforcement(initBrightness, initEnforcing);
                            handledIntent = true;
                        }
                        break;
                }
            }
        }

        // If the system restarted us with no extras, restore the last known brightness lock
        if (!handledIntent) {
            restoreBrightnessStateIfNeeded();
        }

        // Create notification
        Notification notification = createNotification();

        // Start as foreground service
        // On Android 14+ (API 34+), we must specify the foreground service type
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
            Log.d(TAG, "Started foreground service with SPECIAL_USE type (Android 14+)");
        } else {
            startForeground(NOTIFICATION_ID, notification);
            Log.d(TAG, "Started foreground service (Android < 14)");
        }

        // Return START_STICKY to ensure the service restarts if killed by the system
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        stopBrightnessMonitoring();
        Log.d(TAG, "EnforcementService destroyed");
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null; // We don't need binding
    }

    // ============ Brightness Enforcement Methods ============

    private void updateBrightnessEnforcement(int brightness, boolean enforcing) {
        Log.d(TAG, "updateBrightnessEnforcement: brightness=" + brightness + ", enforcing=" + enforcing);

        if (enforcing && brightness >= 0) {
            enforcedBrightness = brightness;
            isBrightnessEnforcing = true;

            // Persist the state so it survives service recreation
            persistBrightnessState(true, brightness);

            // Set initial brightness
            setBrightness(brightness);

            // Start monitoring
            startBrightnessMonitoring();
        } else {
            stopBrightnessEnforcement();
        }
    }

    private void stopBrightnessEnforcement() {
        isBrightnessEnforcing = false;
        enforcedBrightness = -1;
        persistBrightnessState(false, -1);
        stopBrightnessMonitoring();
        Log.d(TAG, "Brightness enforcement stopped");
    }

    private void startBrightnessMonitoring() {
        if (brightnessObserver != null) {
            return; // Already monitoring
        }

        // Use main looper handler for reliable callbacks
        brightnessObserver = new ContentObserver(mainHandler) {
            @Override
            public void onChange(boolean selfChange) {
                super.onChange(selfChange);
                if (isBrightnessEnforcing) {
                    enforceBrightness();
                }
            }
        };

        ContentResolver resolver = getContentResolver();

        // Observe screen brightness changes
        resolver.registerContentObserver(
            Settings.System.getUriFor(Settings.System.SCREEN_BRIGHTNESS),
            false,
            brightnessObserver
        );

        // Also observe auto-brightness mode changes
        resolver.registerContentObserver(
            Settings.System.getUriFor(Settings.System.SCREEN_BRIGHTNESS_MODE),
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

        // Always enforce periodically to stay reliable in background
        mainHandler.removeCallbacks(periodicEnforceRunnable);
        mainHandler.postDelayed(periodicEnforceRunnable, BRIGHTNESS_ENFORCE_INTERVAL_MS);

        Log.d(TAG, "Brightness monitoring started in foreground service");
    }

    private void stopBrightnessMonitoring() {
        if (brightnessObserver != null) {
            getContentResolver().unregisterContentObserver(brightnessObserver);
            brightnessObserver = null;
            Log.d(TAG, "Brightness monitoring stopped");
        }

        mainHandler.removeCallbacks(periodicEnforceRunnable);
    }

    private void enforceBrightness() {
        if (!isBrightnessEnforcing || enforcedBrightness < 0) {
            return;
        }

        try {
            ContentResolver resolver = getContentResolver();

            // Disable auto-brightness if enabled
            int brightnessMode = Settings.System.getInt(resolver,
                Settings.System.SCREEN_BRIGHTNESS_MODE,
                Settings.System.SCREEN_BRIGHTNESS_MODE_MANUAL);

            if (brightnessMode == Settings.System.SCREEN_BRIGHTNESS_MODE_AUTOMATIC) {
                Settings.System.putInt(resolver,
                    Settings.System.SCREEN_BRIGHTNESS_MODE,
                    Settings.System.SCREEN_BRIGHTNESS_MODE_MANUAL);
                Log.d(TAG, "Disabled auto-brightness");
            }

            // Read current brightness as perceptual percentage
            int currentPercent;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                try {
                    float currentLinear = Settings.System.getFloat(resolver, SCREEN_BRIGHTNESS_FLOAT);
                    currentPercent = linearFloatToSliderPercent(currentLinear);
                } catch (Settings.SettingNotFoundException e) {
                    int currentInt = Settings.System.getInt(
                        resolver,
                        Settings.System.SCREEN_BRIGHTNESS
                    );
                    currentPercent = Math.round(currentInt * 100.0f / 255.0f);
                }
            } else {
                int currentInt = Settings.System.getInt(
                    resolver,
                    Settings.System.SCREEN_BRIGHTNESS
                );
                currentPercent = Math.round(currentInt * 100.0f / 255.0f);
            }

            // Check if brightness has changed significantly (more than 3% tolerance)
            if (Math.abs(currentPercent - enforcedBrightness) > 3) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                    int adjustedBrightness = maybeAdjustPercentForAndroid16Plus(enforcedBrightness);
                    float enforcedLinear = sliderPercentToLinearFloat(adjustedBrightness);

                    try {
                        Settings.System.putFloat(resolver, SCREEN_BRIGHTNESS_FLOAT, enforcedLinear);
                    } catch (Exception e) {
                        Log.w(TAG, "Could not write float brightness during enforcement", e);
                    }

                    int targetSystemValue = Math.round(enforcedLinear * 255.0f);
                    Settings.System.putInt(
                        resolver,
                        Settings.System.SCREEN_BRIGHTNESS,
                        targetSystemValue
                    );

                    Log.d(TAG, "Brightness enforced in service: " + currentPercent + "% -> " + enforcedBrightness + "% (adjusted=" + adjustedBrightness + "%, linearFloat=" + enforcedLinear + ", int=" + targetSystemValue + ")");
                } else {
                    int adjustedBrightness = maybeAdjustPercentForAndroid16Plus(enforcedBrightness);
                    int targetSystemValue = Math.round(adjustedBrightness * 255.0f / 100.0f);
                    Settings.System.putInt(
                        resolver,
                        Settings.System.SCREEN_BRIGHTNESS,
                        targetSystemValue
                    );

                    Log.d(TAG, "Brightness enforced in service: " + currentPercent + "% -> " + enforcedBrightness + "% (adjusted=" + adjustedBrightness + "%, int=" + targetSystemValue + ")");
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error enforcing brightness in service", e);
        }
    }

    private void setBrightness(int brightnessPercent) {
        try {
            ContentResolver resolver = getContentResolver();
            int clampedPercent = Math.max(0, Math.min(100, brightnessPercent));
            int adjustedPercent = maybeAdjustPercentForAndroid16Plus(clampedPercent);

            // Disable auto-brightness
            Settings.System.putInt(resolver,
                Settings.System.SCREEN_BRIGHTNESS_MODE,
                Settings.System.SCREEN_BRIGHTNESS_MODE_MANUAL);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                // Android 9+: convert perceptual percent to linear float using HLG curve
                float linearFloat = sliderPercentToLinearFloat(adjustedPercent);

                try {
                    Settings.System.putFloat(resolver, SCREEN_BRIGHTNESS_FLOAT, linearFloat);
                } catch (Exception e) {
                    Log.w(TAG, "Could not write float brightness setting", e);
                }

                int systemValue = Math.round(linearFloat * 255.0f);
                Settings.System.putInt(resolver,
                    Settings.System.SCREEN_BRIGHTNESS,
                    systemValue);

                Log.d(TAG, "Brightness set to " + clampedPercent + "% (adjusted=" + adjustedPercent + "%, linearFloat=" + linearFloat + ", int=" + systemValue + "/255)");
            } else {
                // Android 6-8: linear mapping to integer range
                int systemValue = Math.round(adjustedPercent * 255.0f / 100.0f);
                Settings.System.putInt(resolver,
                    Settings.System.SCREEN_BRIGHTNESS,
                    systemValue);

                Log.d(TAG, "Brightness set to " + clampedPercent + "% (adjusted=" + adjustedPercent + "%, int=" + systemValue + "/255)");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error setting brightness in service", e);
        }
    }

    // ============ Notification Methods ============

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Parental Control Enforcement",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Keeps volume and brightness controls active");
            channel.setShowBadge(false);

            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    private Notification createNotification() {
        // Create an intent to open the app when notification is tapped
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this,
            0,
            notificationIntent,
            PendingIntent.FLAG_IMMUTABLE
        );

        // Get app name
        String appName = getString(getApplicationInfo().labelRes);

        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(appName + " is active")
            .setContentText("Volume and brightness controls are locked")
            .setSmallIcon(android.R.drawable.ic_lock_lock)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build();
    }

    // ============ Persistence Helpers ============

    private void persistBrightnessState(boolean enforcing, int brightnessValue) {
        try {
            SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
            prefs.edit()
                .putBoolean(KEY_BRIGHTNESS_ENFORCING, enforcing)
                .putInt(KEY_BRIGHTNESS_VALUE, brightnessValue)
                .apply();
            Log.d(TAG, "Persisted brightness state -> enforcing=" + enforcing + ", value=" + brightnessValue);
        } catch (Exception e) {
            Log.w(TAG, "Failed to persist brightness state", e);
        }
    }

    private void restoreBrightnessStateIfNeeded() {
        try {
            SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
            boolean savedEnforcing = prefs.getBoolean(KEY_BRIGHTNESS_ENFORCING, false);
            int savedValue = prefs.getInt(KEY_BRIGHTNESS_VALUE, -1);

            if (savedEnforcing && savedValue >= 0 && !isBrightnessEnforcing) {
                Log.d(TAG, "Restoring persisted brightness enforcement at " + savedValue + "%");
                updateBrightnessEnforcement(savedValue, true);
            }
        } catch (Exception e) {
            Log.w(TAG, "Failed to restore brightness state", e);
        }
    }
}
