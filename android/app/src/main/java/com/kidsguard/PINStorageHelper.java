package com.kidsguard;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

/**
 * Helper class for storing and verifying PIN
 * Uses SharedPreferences for easy access from both JS and native code
 */
public class PINStorageHelper {
    private static final String TAG = "PINStorageHelper";
    private static final String PREFS_NAME = "kids_guard_pin";
    private static final String KEY_PIN = "parent_pin";

    /**
     * Save PIN to SharedPreferences
     */
    public static void savePIN(Context context, String pin) {
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            prefs.edit().putString(KEY_PIN, pin).apply();
            Log.d(TAG, "PIN saved successfully");
        } catch (Exception e) {
            Log.e(TAG, "Error saving PIN", e);
        }
    }

    /**
     * Verify PIN
     */
    public static boolean verifyPIN(Context context, String enteredPin) {
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            String storedPin = prefs.getString(KEY_PIN, null);

            if (storedPin == null) {
                Log.w(TAG, "No PIN stored");
                return false;
            }

            boolean isValid = storedPin.equals(enteredPin);
            Log.d(TAG, "PIN verification: " + (isValid ? "SUCCESS" : "FAILED"));
            return isValid;
        } catch (Exception e) {
            Log.e(TAG, "Error verifying PIN", e);
            return false;
        }
    }

    /**
     * Check if PIN exists
     */
    public static boolean hasPIN(Context context) {
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            return prefs.contains(KEY_PIN);
        } catch (Exception e) {
            Log.e(TAG, "Error checking PIN", e);
            return false;
        }
    }
}
