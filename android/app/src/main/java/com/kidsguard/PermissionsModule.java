package com.kidsguard;

import android.Manifest;
import android.app.Activity;
import android.content.pm.PackageManager;
import android.os.Build;
import android.util.Log;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.PermissionListener;
import com.facebook.react.modules.core.PermissionAwareActivity;

import androidx.annotation.NonNull;

public class PermissionsModule extends ReactContextBaseJavaModule implements PermissionListener {
    private static final String TAG = "PermissionsModule";
    private static final int REQUEST_POST_NOTIFICATIONS = 1001;
    private final ReactApplicationContext reactContext;
    private Promise permissionPromise;

    public PermissionsModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
    }

    @NonNull
    @Override
    public String getName() {
        return "PermissionsModule";
    }

    @ReactMethod
    public void checkPostNotificationsPermission(Promise promise) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
            // Permission not required on Android < 13
            promise.resolve(true);
            return;
        }

        boolean hasPermission = ContextCompat.checkSelfPermission(
            reactContext,
            Manifest.permission.POST_NOTIFICATIONS
        ) == PackageManager.PERMISSION_GRANTED;

        Log.d(TAG, "POST_NOTIFICATIONS permission status: " + hasPermission);
        promise.resolve(hasPermission);
    }

    @ReactMethod
    public void requestPostNotificationsPermission(Promise promise) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
            // Permission not required on Android < 13
            promise.resolve(true);
            return;
        }

        Activity activity = getCurrentActivity();
        if (activity == null) {
            promise.reject("ERROR", "Activity is null");
            return;
        }

        // Check if already granted
        boolean hasPermission = ContextCompat.checkSelfPermission(
            reactContext,
            Manifest.permission.POST_NOTIFICATIONS
        ) == PackageManager.PERMISSION_GRANTED;

        if (hasPermission) {
            promise.resolve(true);
            return;
        }

        // Request permission
        permissionPromise = promise;
        if (activity instanceof PermissionAwareActivity) {
            PermissionAwareActivity permissionAwareActivity = (PermissionAwareActivity) activity;
            permissionAwareActivity.requestPermissions(
                new String[]{Manifest.permission.POST_NOTIFICATIONS},
                REQUEST_POST_NOTIFICATIONS,
                this
            );
        } else {
            ActivityCompat.requestPermissions(
                activity,
                new String[]{Manifest.permission.POST_NOTIFICATIONS},
                REQUEST_POST_NOTIFICATIONS
            );
        }
    }

    @Override
    public boolean onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        if (requestCode == REQUEST_POST_NOTIFICATIONS) {
            boolean granted = grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED;
            Log.d(TAG, "POST_NOTIFICATIONS permission " + (granted ? "granted" : "denied"));

            if (permissionPromise != null) {
                permissionPromise.resolve(granted);
                permissionPromise = null;
            }
            return true;
        }
        return false;
    }
}
