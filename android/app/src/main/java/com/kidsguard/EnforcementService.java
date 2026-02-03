package com.kidsguard;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;

import androidx.core.app.NotificationCompat;

public class EnforcementService extends Service {
    private static final String TAG = "EnforcementService";
    private static final String CHANNEL_ID = "kids_guard_enforcement";
    private static final int NOTIFICATION_ID = 1001;

    // Intent action constants
    public static final String ACTION_START = "com.kidsguard.ACTION_START";

    @Override
    public void onCreate() {
        super.onCreate();
        Log.d(TAG, "EnforcementService created");
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.d(TAG, "EnforcementService onStartCommand");

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
        Log.d(TAG, "EnforcementService destroyed");
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null; // We don't need binding
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

        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(appName + " is active")
            .setContentText("Parental controls are active")
            .setSmallIcon(android.R.drawable.ic_lock_lock)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build();
    }
}
