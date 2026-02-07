package com.kidsguard;

import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class PINStorageModule extends ReactContextBaseJavaModule {
    private static final String TAG = "PINStorageModule";
    private final ReactApplicationContext reactContext;

    public PINStorageModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
    }

    @NonNull
    @Override
    public String getName() {
        return "PINStorageModule";
    }

    @ReactMethod
    public void savePIN(String pin, Promise promise) {
        try {
            PINStorageHelper.savePIN(reactContext, pin);
            Log.d(TAG, "PIN cached for native access");
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error caching PIN", e);
            promise.reject("ERROR", "Failed to cache PIN: " + e.getMessage());
        }
    }

    @ReactMethod
    public void verifyPIN(String pin, Promise promise) {
        try {
            boolean isValid = PINStorageHelper.verifyPIN(reactContext, pin);
            promise.resolve(isValid);
        } catch (Exception e) {
            Log.e(TAG, "Error verifying PIN", e);
            promise.reject("ERROR", "Failed to verify PIN: " + e.getMessage());
        }
    }
}
