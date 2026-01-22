package com.kidsguard;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.ContentResolver;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.content.res.Resources;
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

    // Brightness range
    private boolean brightnessRangeInitialized = false;
    private int brightnessMinimum = 0;
    private int brightnessMaximum = 255;

    @Override
    public void onCreate() {
        super.onCreate();
        Log.d(TAG, "EnforcementService created");
        mainHandler = new Handler(Looper.getMainLooper());
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.d(TAG, "EnforcementService onStartCommand");

        // Handle intent actions
        if (intent != null) {
            String action = intent.getAction();
            if (action != null) {
                switch (action) {
                    case ACTION_UPDATE_BRIGHTNESS:
                        int brightness = intent.getIntExtra(EXTRA_BRIGHTNESS_VALUE, -1);
                        boolean enforcing = intent.getBooleanExtra(EXTRA_BRIGHTNESS_ENFORCING, false);
                        updateBrightnessEnforcement(brightness, enforcing);
                        break;
                    case ACTION_STOP_BRIGHTNESS:
                        stopBrightnessEnforcement();
                        break;
                    case ACTION_START:
                    default:
                        // Check for initial brightness settings
                        if (intent.hasExtra(EXTRA_BRIGHTNESS_VALUE)) {
                            int initBrightness = intent.getIntExtra(EXTRA_BRIGHTNESS_VALUE, -1);
                            boolean initEnforcing = intent.getBooleanExtra(EXTRA_BRIGHTNESS_ENFORCING, false);
                            updateBrightnessEnforcement(initBrightness, initEnforcing);
                        }
                        break;
                }
            }
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

        Log.d(TAG, "Brightness monitoring started in foreground service");
    }

    private void stopBrightnessMonitoring() {
        if (brightnessObserver != null) {
            getContentResolver().unregisterContentObserver(brightnessObserver);
            brightnessObserver = null;
            Log.d(TAG, "Brightness monitoring stopped");
        }
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

            // Get current system brightness
            int currentSystemBrightness = Settings.System.getInt(
                resolver,
                Settings.System.SCREEN_BRIGHTNESS
            );

            ensureBrightnessRangeInitialized();
            int currentPercent = convertSystemValueToPercent(currentSystemBrightness);

            // Check if brightness has changed significantly (more than 3% tolerance)
            if (Math.abs(currentPercent - enforcedBrightness) > 3) {
                int targetSystemValue = convertPercentToSystemValue(enforcedBrightness);

                Settings.System.putInt(
                    resolver,
                    Settings.System.SCREEN_BRIGHTNESS,
                    targetSystemValue
                );

                Log.d(TAG, "Brightness enforced in service: " + currentPercent + "% -> " + enforcedBrightness + "% (system value: " + targetSystemValue + ")");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error enforcing brightness in service", e);
        }
    }

    private void setBrightness(int brightnessPercent) {
        try {
            ContentResolver resolver = getContentResolver();

            // Disable auto-brightness
            Settings.System.putInt(resolver,
                Settings.System.SCREEN_BRIGHTNESS_MODE,
                Settings.System.SCREEN_BRIGHTNESS_MODE_MANUAL);

            ensureBrightnessRangeInitialized();
            int systemValue = convertPercentToSystemValue(brightnessPercent);

            Settings.System.putInt(resolver,
                Settings.System.SCREEN_BRIGHTNESS,
                systemValue);

            Log.d(TAG, "Brightness set to " + brightnessPercent + "% (system value: " + systemValue + ")");
        } catch (Exception e) {
            Log.e(TAG, "Error setting brightness in service", e);
        }
    }

    // ============ Brightness Conversion Methods ============

    private void ensureBrightnessRangeInitialized() {
        if (brightnessRangeInitialized) {
            return;
        }

        int min = 0;
        int max = 255;

        ContentResolver resolver = getContentResolver();

        try {
            min = Settings.System.getInt(resolver, "screen_brightness_min");
        } catch (Settings.SettingNotFoundException | SecurityException ignored) {
        }

        try {
            max = Settings.System.getInt(resolver, "screen_brightness_max");
        } catch (Settings.SettingNotFoundException | SecurityException ignored) {
        }

        Resources res = getResources();

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
            min = 0;
            max = 255;
        }

        brightnessMinimum = Math.max(0, min);
        brightnessMaximum = Math.max(brightnessMinimum + 1, max);
        brightnessRangeInitialized = true;

        Log.d(TAG, "Brightness range initialized: min=" + brightnessMinimum + ", max=" + brightnessMaximum);
    }

    private int convertPercentToSystemValue(int percent) {
        ensureBrightnessRangeInitialized();

        int clampedPercent = Math.max(0, Math.min(100, percent));
        int range = brightnessMaximum - brightnessMinimum;

        if (range <= 0) {
            return Math.round(clampedPercent * 255.0f / 100.0f);
        }

        // Use quadratic curve for better perception matching (Gamma 2.0)
        float normalizedPercent = clampedPercent / 100.0f;
        float normalizedValue = normalizedPercent * normalizedPercent;

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
}
