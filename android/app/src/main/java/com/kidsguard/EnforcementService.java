package com.kidsguard;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.util.Log;

import androidx.core.app.NotificationCompat;

public class EnforcementService extends Service {
    private static final String TAG = "EnforcementService";
    private static final String CHANNEL_ID = "kids_guard_enforcement";
    private static final int NOTIFICATION_ID = 1001;
    private static final long SCREEN_TIME_CHECK_INTERVAL_MS = 60000; // 60 seconds

    // Intent action constants
    public static final String ACTION_START = "com.kidsguard.ACTION_START";
    public static final String ACTION_UPDATE_SCREEN_TIME = "com.kidsguard.ACTION_UPDATE_SCREEN_TIME";
    public static final String ACTION_STOP_SCREEN_TIME = "com.kidsguard.ACTION_STOP_SCREEN_TIME";

    // Intent extra keys
    public static final String EXTRA_SCREEN_TIME_LIMIT = "screen_time_limit";
    public static final String EXTRA_SCREEN_TIME_ENFORCING = "screen_time_enforcing";

    // Screen time enforcement state
    private Handler screenTimeHandler;
    private boolean isMonitoringScreenTime = false;
    private final Runnable screenTimeCheckRunnable = new Runnable() {
        @Override
        public void run() {
            if (isMonitoringScreenTime) {
                checkScreenTimeLimit();
                screenTimeHandler.postDelayed(this, SCREEN_TIME_CHECK_INTERVAL_MS);
            }
        }
    };

    @Override
    public void onCreate() {
        super.onCreate();
        Log.d(TAG, "EnforcementService created");
        screenTimeHandler = new Handler(Looper.getMainLooper());
        createNotificationChannel();

        // Check if screen time enforcement was active before service restart
        restoreScreenTimeStateIfNeeded();
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
                    case ACTION_UPDATE_SCREEN_TIME:
                        boolean enforcing = intent.getBooleanExtra(EXTRA_SCREEN_TIME_ENFORCING, false);
                        updateScreenTimeEnforcement(enforcing);
                        handledIntent = true;
                        break;
                    case ACTION_STOP_SCREEN_TIME:
                        stopScreenTimeEnforcement();
                        handledIntent = true;
                        break;
                    case ACTION_START:
                    default:
                        // Check for initial screen time settings
                        if (intent.hasExtra(EXTRA_SCREEN_TIME_ENFORCING)) {
                            boolean initEnforcing = intent.getBooleanExtra(EXTRA_SCREEN_TIME_ENFORCING, false);
                            updateScreenTimeEnforcement(initEnforcing);
                            handledIntent = true;
                        }
                        break;
                }
            }
        }

        // If the system restarted us with no extras, restore the last known state
        if (!handledIntent) {
            restoreScreenTimeStateIfNeeded();
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
        stopScreenTimeMonitoring();
        Log.d(TAG, "EnforcementService destroyed");
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null; // We don't need binding
    }

    // ============ Screen Time Enforcement Methods ============

    private void updateScreenTimeEnforcement(boolean enforcing) {
        Log.d(TAG, "updateScreenTimeEnforcement: enforcing=" + enforcing);

        if (enforcing) {
            startScreenTimeMonitoring();
        } else {
            stopScreenTimeEnforcement();
        }
    }

    private void stopScreenTimeEnforcement() {
        isMonitoringScreenTime = false;
        stopScreenTimeMonitoring();
        // Dismiss overlay if showing
        try {
            LockOverlayManager.getInstance().dismiss();
        } catch (Exception e) {
            Log.w(TAG, "Error dismissing overlay on stop", e);
        }
        Log.d(TAG, "Screen time enforcement stopped");
    }

    private void startScreenTimeMonitoring() {
        if (isMonitoringScreenTime) {
            return; // Already monitoring
        }

        isMonitoringScreenTime = true;

        // Start periodic checks
        screenTimeHandler.removeCallbacks(screenTimeCheckRunnable);
        screenTimeHandler.postDelayed(screenTimeCheckRunnable, SCREEN_TIME_CHECK_INTERVAL_MS);

        Log.d(TAG, "Screen time monitoring started in foreground service");
    }

    private void stopScreenTimeMonitoring() {
        if (screenTimeHandler != null) {
            screenTimeHandler.removeCallbacks(screenTimeCheckRunnable);
        }
        isMonitoringScreenTime = false;
        Log.d(TAG, "Screen time monitoring stopped");
    }

    private void checkScreenTimeLimit() {
        try {
            boolean enforcing = ScreenTimeModule.isEnforcingStatic(this);
            if (!enforcing) {
                Log.d(TAG, "Screen time not enforcing, skipping check");
                return;
            }

            int usedSeconds = ScreenTimeModule.getDailyUsageSecondsStatic(this);
            int limitSeconds = ScreenTimeModule.getLimitStatic(this);

            Log.d(TAG, "Screen time check: used=" + usedSeconds + "s, limit=" + limitSeconds + "s");

            if (usedSeconds >= limitSeconds) {
                Log.d(TAG, "Screen time limit exceeded, launching lock activity");
                launchLockActivity();
            }
        } catch (Exception e) {
            Log.e(TAG, "Error checking screen time limit", e);
        }
    }

    private void launchLockActivity() {
        try {
            LockOverlayManager overlay = LockOverlayManager.getInstance();
            if (!overlay.isShowing()) {
                overlay.showLockScreen(this);
                Log.d(TAG, "Lock overlay shown via EnforcementService");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error showing lock overlay", e);
        }
    }

    private void restoreScreenTimeStateIfNeeded() {
        try {
            boolean savedEnforcing = ScreenTimeModule.isEnforcingStatic(this);

            if (savedEnforcing && !isMonitoringScreenTime) {
                Log.d(TAG, "Restoring screen time enforcement");
                updateScreenTimeEnforcement(true);
            }
        } catch (Exception e) {
            Log.w(TAG, "Failed to restore screen time state", e);
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
            channel.setDescription("Keeps parental controls active");
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

        // Build notification text based on active enforcements
        String contentText = "Parental controls are active";
        if (isMonitoringScreenTime) {
            try {
                int limitSeconds = ScreenTimeModule.getLimitStatic(this);
                int hours = limitSeconds / 3600;
                contentText = "Screen time limit: " + hours + "h/day";
            } catch (Exception e) {
                contentText = "Screen time limit active";
            }
        }

        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(appName + " is active")
            .setContentText(contentText)
            .setSmallIcon(android.R.drawable.ic_lock_lock)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build();
    }
}
