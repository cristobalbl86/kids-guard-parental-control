package com.kidsguard;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Base64;
import android.util.Log;

import java.security.MessageDigest;
import java.security.SecureRandom;
import java.security.spec.KeySpec;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

/**
 * Stores a salted hash of the parent PIN so native lock screens can verify it,
 * and rate-limits native verification attempts (exponential lockout).
 */
public class PINStorageHelper {
    private static final String TAG = "PINStorageHelper";
    private static final String PREFS_NAME = "kids_guard_pin";
    private static final String KEY_PIN = "parent_pin"; // legacy plaintext (migrated on read)
    private static final String KEY_PIN_HASH = "parent_pin_hash";
    private static final String KEY_PIN_SALT = "parent_pin_salt";
    private static final String KEY_FAILED_ATTEMPTS = "failed_attempts";
    private static final String KEY_LOCKOUT_UNTIL = "lockout_until";

    private static final int PBKDF2_ITERATIONS = 10000;
    private static final int HASH_BITS = 256;
    private static final int MAX_ATTEMPTS_BEFORE_LOCKOUT = 5;
    private static final long BASE_LOCKOUT_MS = 60_000L;
    private static final long MAX_LOCKOUT_MS = 60 * 60_000L;

    private static SharedPreferences prefs(Context context) {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }

    /**
     * Save PIN (as salted PBKDF2 hash). Skips rewrite if the same PIN is already stored.
     */
    public static synchronized void savePIN(Context context, String pin) {
        try {
            SharedPreferences p = prefs(context);
            if (p.contains(KEY_PIN_HASH) && !p.contains(KEY_PIN) && matchesHash(p, pin)) {
                return; // Already stored
            }
            byte[] salt = new byte[16];
            new SecureRandom().nextBytes(salt);
            String hash = hash(pin, salt);
            p.edit()
                .putString(KEY_PIN_HASH, hash)
                .putString(KEY_PIN_SALT, Base64.encodeToString(salt, Base64.NO_WRAP))
                .remove(KEY_PIN)
                .apply();
            Log.d(TAG, "PIN saved successfully");
        } catch (Exception e) {
            Log.e(TAG, "Error saving PIN", e);
        }
    }

    /**
     * Remaining lockout time in ms (0 if not locked out).
     */
    public static long getLockoutRemainingMs(Context context) {
        long until = prefs(context).getLong(KEY_LOCKOUT_UNTIL, 0);
        return Math.max(0, until - System.currentTimeMillis());
    }

    /**
     * Verify PIN. Returns false (without checking) while locked out.
     */
    public static synchronized boolean verifyPIN(Context context, String enteredPin) {
        try {
            SharedPreferences p = prefs(context);

            if (getLockoutRemainingMs(context) > 0) {
                Log.w(TAG, "PIN verification blocked: locked out");
                return false;
            }

            boolean isValid;
            String legacyPin = p.getString(KEY_PIN, null);
            if (legacyPin != null) {
                isValid = MessageDigest.isEqual(legacyPin.getBytes("UTF-8"), enteredPin.getBytes("UTF-8"));
                // Migrate legacy plaintext to hash
                savePIN(context, legacyPin);
            } else if (p.contains(KEY_PIN_HASH)) {
                isValid = matchesHash(p, enteredPin);
            } else {
                Log.w(TAG, "No PIN stored");
                return false;
            }

            if (isValid) {
                p.edit().remove(KEY_FAILED_ATTEMPTS).remove(KEY_LOCKOUT_UNTIL).apply();
            } else {
                recordFailedAttempt(p);
            }
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
            SharedPreferences p = prefs(context);
            return p.contains(KEY_PIN_HASH) || p.contains(KEY_PIN);
        } catch (Exception e) {
            Log.e(TAG, "Error checking PIN", e);
            return false;
        }
    }

    private static void recordFailedAttempt(SharedPreferences p) {
        int attempts = p.getInt(KEY_FAILED_ATTEMPTS, 0) + 1;
        SharedPreferences.Editor editor = p.edit().putInt(KEY_FAILED_ATTEMPTS, attempts);
        if (attempts >= MAX_ATTEMPTS_BEFORE_LOCKOUT) {
            int exponent = Math.min(attempts / MAX_ATTEMPTS_BEFORE_LOCKOUT, 10);
            long lockoutMs = Math.min(BASE_LOCKOUT_MS * (1L << exponent), MAX_LOCKOUT_MS);
            editor.putLong(KEY_LOCKOUT_UNTIL, System.currentTimeMillis() + lockoutMs);
            Log.w(TAG, "Too many failed PIN attempts, locked out for " + (lockoutMs / 1000) + "s");
        }
        editor.apply();
    }

    private static boolean matchesHash(SharedPreferences p, String pin) throws Exception {
        String storedHash = p.getString(KEY_PIN_HASH, null);
        String saltB64 = p.getString(KEY_PIN_SALT, null);
        if (storedHash == null || saltB64 == null || pin == null) {
            return false;
        }
        byte[] salt = Base64.decode(saltB64, Base64.NO_WRAP);
        return MessageDigest.isEqual(
            storedHash.getBytes("UTF-8"),
            hash(pin, salt).getBytes("UTF-8"));
    }

    private static String hash(String pin, byte[] salt) throws Exception {
        KeySpec spec = new PBEKeySpec(pin.toCharArray(), salt, PBKDF2_ITERATIONS, HASH_BITS);
        SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA1");
        byte[] out = factory.generateSecret(spec).getEncoded();
        return Base64.encodeToString(out, Base64.NO_WRAP);
    }
}
