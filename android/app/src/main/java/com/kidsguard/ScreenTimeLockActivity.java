package com.kidsguard;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Callback;

public class ScreenTimeLockActivity extends Activity {
    private static final String TAG = "ScreenTimeLockActivity";
    private static final long RELAUNCH_CHECK_INTERVAL = 200; // 200ms - very aggressive
    private static final long IMMEDIATE_RELAUNCH_DELAY = 100; // 100ms for immediate relaunch

    private EditText pinInput;
    private Button unlockButton;
    private Button emergencyButton;
    private TextView usageText;
    private TextView titleText;

    private Handler relaunchHandler;
    private boolean isUnlocked = false;
    private Runnable relaunchRunnable;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Set window flags to show on lock screen and keep screen on
        getWindow().addFlags(
            WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
            WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD |
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON |
            WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
        );

        // Initialize handler for relaunch monitoring
        relaunchHandler = new Handler(Looper.getMainLooper());

        // Create layout programmatically (no XML needed)
        createLayout();

        // Get usage information and display it
        displayUsageInfo();

        // Start monitoring for bypass attempts
        startRelaunchMonitoring();
    }

    private void createLayout() {
        // Main container with gradient-like background
        android.widget.RelativeLayout mainContainer = new android.widget.RelativeLayout(this);
        mainContainer.setBackgroundColor(0xFF0F172A); // Dark slate background
        mainContainer.setPadding(40, 60, 40, 60);

        // Content container (centered)
        android.widget.LinearLayout contentLayout = new android.widget.LinearLayout(this);
        contentLayout.setOrientation(android.widget.LinearLayout.VERTICAL);
        contentLayout.setGravity(android.view.Gravity.CENTER);
        android.widget.RelativeLayout.LayoutParams contentParams = new android.widget.RelativeLayout.LayoutParams(
            android.widget.RelativeLayout.LayoutParams.MATCH_PARENT,
            android.widget.RelativeLayout.LayoutParams.WRAP_CONTENT
        );
        contentParams.addRule(android.widget.RelativeLayout.CENTER_IN_PARENT);
        contentLayout.setLayoutParams(contentParams);

        // Icon/Logo area
        TextView iconText = new TextView(this);
        iconText.setText("\uD83D\uDD12"); // Lock emoji
        iconText.setTextSize(64);
        iconText.setGravity(android.view.Gravity.CENTER);
        iconText.setPadding(0, 0, 0, 20);
        contentLayout.addView(iconText);

        // Title
        titleText = new TextView(this);
        titleText.setText("Screen Time Limit");
        titleText.setTextSize(28);
        titleText.setTextColor(0xFFFFFFFF);
        titleText.setGravity(android.view.Gravity.CENTER);
        titleText.setTypeface(null, android.graphics.Typeface.BOLD);
        titleText.setPadding(0, 0, 0, 10);
        contentLayout.addView(titleText);

        // Subtitle
        TextView subtitleText = new TextView(this);
        subtitleText.setText("Time's up for today!");
        subtitleText.setTextSize(18);
        subtitleText.setTextColor(0xFFCBD5E1); // Light gray
        subtitleText.setGravity(android.view.Gravity.CENTER);
        subtitleText.setPadding(0, 0, 0, 40);
        contentLayout.addView(subtitleText);

        // Usage info card
        android.widget.LinearLayout usageCard = new android.widget.LinearLayout(this);
        usageCard.setOrientation(android.widget.LinearLayout.VERTICAL);
        usageCard.setBackgroundColor(0xFF1E293B); // Slightly lighter background
        usageCard.setPadding(30, 25, 30, 25);
        android.widget.LinearLayout.LayoutParams usageCardParams = new android.widget.LinearLayout.LayoutParams(
            android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
            android.widget.LinearLayout.LayoutParams.WRAP_CONTENT
        );
        usageCardParams.setMargins(0, 0, 0, 40);
        usageCard.setLayoutParams(usageCardParams);

        // Set rounded corners
        android.graphics.drawable.GradientDrawable usageCardBg = new android.graphics.drawable.GradientDrawable();
        usageCardBg.setColor(0xFF1E293B);
        usageCardBg.setCornerRadius(16);
        usageCard.setBackground(usageCardBg);

        usageText = new TextView(this);
        usageText.setTextSize(16);
        usageText.setTextColor(0xFFE2E8F0);
        usageText.setGravity(android.view.Gravity.CENTER);
        usageText.setLineSpacing(1.2f, 1.2f);
        usageCard.addView(usageText);

        contentLayout.addView(usageCard);

        // Instruction text
        TextView instructionText = new TextView(this);
        instructionText.setText("Enter parent PIN to unlock");
        instructionText.setTextSize(14);
        instructionText.setTextColor(0xFF94A3B8);
        instructionText.setGravity(android.view.Gravity.CENTER);
        instructionText.setPadding(0, 0, 0, 15);
        contentLayout.addView(instructionText);

        // PIN input with rounded corners
        pinInput = new EditText(this);
        pinInput.setHint("••••");
        pinInput.setHintTextColor(0xFF64748B);
        pinInput.setInputType(android.text.InputType.TYPE_CLASS_NUMBER | android.text.InputType.TYPE_NUMBER_VARIATION_PASSWORD);
        pinInput.setTextSize(24);
        pinInput.setTextColor(0xFF1E293B);
        pinInput.setGravity(android.view.Gravity.CENTER);
        pinInput.setPadding(30, 25, 30, 25);

        android.graphics.drawable.GradientDrawable pinBg = new android.graphics.drawable.GradientDrawable();
        pinBg.setColor(0xFFF1F5F9);
        pinBg.setCornerRadius(12);
        pinInput.setBackground(pinBg);

        android.widget.LinearLayout.LayoutParams pinParams = new android.widget.LinearLayout.LayoutParams(
            android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
            android.widget.LinearLayout.LayoutParams.WRAP_CONTENT
        );
        pinParams.setMargins(0, 0, 0, 25);
        pinInput.setLayoutParams(pinParams);
        contentLayout.addView(pinInput);

        // Unlock button with rounded corners
        unlockButton = new Button(this);
        unlockButton.setText("UNLOCK");
        unlockButton.setTextSize(16);
        unlockButton.setTextColor(0xFFFFFFFF);
        unlockButton.setTypeface(null, android.graphics.Typeface.BOLD);
        unlockButton.setPadding(50, 30, 50, 30);

        android.graphics.drawable.GradientDrawable unlockBg = new android.graphics.drawable.GradientDrawable();
        unlockBg.setColor(0xFF3B82F6); // Blue
        unlockBg.setCornerRadius(12);
        unlockButton.setBackground(unlockBg);

        unlockButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                handleUnlock();
            }
        });
        android.widget.LinearLayout.LayoutParams unlockParams = new android.widget.LinearLayout.LayoutParams(
            android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
            android.widget.LinearLayout.LayoutParams.WRAP_CONTENT
        );
        unlockParams.setMargins(0, 0, 0, 15);
        unlockButton.setLayoutParams(unlockParams);
        contentLayout.addView(unlockButton);

        // Emergency call button with outline style
        emergencyButton = new Button(this);
        emergencyButton.setText("Emergency Call");
        emergencyButton.setTextSize(14);
        emergencyButton.setTextColor(0xFFEF4444); // Red text
        emergencyButton.setPadding(40, 25, 40, 25);

        android.graphics.drawable.GradientDrawable emergencyBg = new android.graphics.drawable.GradientDrawable();
        emergencyBg.setColor(0x00000000); // Transparent
        emergencyBg.setStroke(2, 0xFFEF4444); // Red border
        emergencyBg.setCornerRadius(12);
        emergencyButton.setBackground(emergencyBg);

        emergencyButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                handleEmergencyCall();
            }
        });
        android.widget.LinearLayout.LayoutParams emergencyParams = new android.widget.LinearLayout.LayoutParams(
            android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
            android.widget.LinearLayout.LayoutParams.WRAP_CONTENT
        );
        emergencyButton.setLayoutParams(emergencyParams);
        contentLayout.addView(emergencyButton);

        mainContainer.addView(contentLayout);
        setContentView(mainContainer);
    }

    private void displayUsageInfo() {
        try {
            int usedSeconds = ScreenTimeModule.getDailyUsageSecondsStatic(this);
            int limitSeconds = ScreenTimeModule.getLimitStatic(this);

            String usedFormatted = formatSeconds(usedSeconds);
            String limitFormatted = formatSeconds(limitSeconds);

            usageText.setText("You've used " + usedFormatted + " today\nLimit: " + limitFormatted);
        } catch (Exception e) {
            Log.e(TAG, "Error displaying usage info", e);
            usageText.setText("Screen time limit exceeded");
        }
    }

    private void handleUnlock() {
        String enteredPin = pinInput.getText().toString();

        if (enteredPin.isEmpty()) {
            Toast.makeText(this, "Please enter PIN", Toast.LENGTH_SHORT).show();
            return;
        }

        // Verify PIN using Keychain
        verifyPIN(enteredPin, new Callback() {
            @Override
            public void invoke(Object... args) {
                boolean isValid = (boolean) args[0];

                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        if (isValid) {
                            isUnlocked = true;
                            stopRelaunchMonitoring();
                            Toast.makeText(ScreenTimeLockActivity.this, "Unlocked", Toast.LENGTH_SHORT).show();
                            finish();
                        } else {
                            Toast.makeText(ScreenTimeLockActivity.this, "Incorrect PIN", Toast.LENGTH_SHORT).show();
                            pinInput.setText("");
                        }
                    }
                });
            }
        });
    }

    private void verifyPIN(String enteredPin, Callback callback) {
        try {
            boolean isValid = PINStorageHelper.verifyPIN(this, enteredPin);
            callback.invoke(isValid);
        } catch (Exception e) {
            Log.e(TAG, "Error verifying PIN", e);
            callback.invoke(false);
        }
    }

    private void handleEmergencyCall() {
        try {
            // Launch dialer for emergency call
            Intent intent = new Intent(Intent.ACTION_DIAL);
            intent.setData(Uri.parse("tel:"));
            startActivity(intent);

            // Schedule aggressive relaunches to return to lock screen
            // This allows the emergency call but brings user back immediately after
            relaunchHandler.postDelayed(new Runnable() {
                @Override
                public void run() {
                    if (!isUnlocked && !isFinishing()) {
                        // Check if we're still in the dialer (allow it)
                        // Otherwise relaunch
                        if (!isInDialer()) {
                            relaunchActivity();
                        } else {
                            // Check again soon
                            relaunchHandler.postDelayed(this, 500);
                        }
                    }
                }
            }, 1000);
        } catch (Exception e) {
            Log.e(TAG, "Error launching dialer", e);
            Toast.makeText(this, "Unable to open dialer", Toast.LENGTH_SHORT).show();
        }
    }

    private boolean isInDialer() {
        try {
            android.app.ActivityManager activityManager = (android.app.ActivityManager) getSystemService(ACTIVITY_SERVICE);
            if (activityManager == null) {
                return false;
            }

            java.util.List<android.app.ActivityManager.RunningTaskInfo> tasks = activityManager.getRunningTasks(1);
            if (tasks == null || tasks.isEmpty()) {
                return false;
            }

            android.content.ComponentName topActivity = tasks.get(0).topActivity;
            if (topActivity == null) {
                return false;
            }

            String packageName = topActivity.getPackageName();
            // Check if it's the dialer app
            return packageName != null && (
                packageName.contains("dialer") ||
                packageName.contains("phone") ||
                packageName.contains("contacts")
            );
        } catch (Exception e) {
            Log.e(TAG, "Error checking dialer", e);
            return false;
        }
    }

    @Override
    public void onBackPressed() {
        // Prevent back button from dismissing the lock screen
        Toast.makeText(this, "Only parent can unlock", Toast.LENGTH_SHORT).show();
    }

    @Override
    protected void onResume() {
        super.onResume();

        // Check if limit is still exceeded when returning from emergency call
        try {
            int usedSeconds = ScreenTimeModule.getDailyUsageSecondsStatic(this);
            int limitSeconds = ScreenTimeModule.getLimitStatic(this);
            boolean enforcing = ScreenTimeModule.isEnforcingStatic(this);

            if (!enforcing || usedSeconds < limitSeconds) {
                // Enforcement was disabled or limit no longer exceeded
                isUnlocked = true;
                stopRelaunchMonitoring();
                finish();
                return;
            }
        } catch (Exception e) {
            Log.e(TAG, "Error checking limit on resume", e);
        }

        // Restart monitoring if not unlocked
        if (!isUnlocked) {
            startRelaunchMonitoring();
        }
    }

    @Override
    protected void onPause() {
        super.onPause();

        // If user navigates away and hasn't unlocked, IMMEDIATELY relaunch
        if (!isUnlocked && !isFinishing()) {
            Log.d(TAG, "Activity paused without unlock - relaunching IMMEDIATELY");
            // Use very short delay to immediately bring back the lock screen
            relaunchHandler.postDelayed(new Runnable() {
                @Override
                public void run() {
                    if (!isUnlocked && !isFinishing()) {
                        relaunchActivity();
                    }
                }
            }, IMMEDIATE_RELAUNCH_DELAY);
        }
    }

    @Override
    protected void onStop() {
        super.onStop();

        // Also relaunch when stopped (moved to background)
        if (!isUnlocked && !isFinishing()) {
            Log.d(TAG, "Activity stopped - relaunching");
            relaunchHandler.post(new Runnable() {
                @Override
                public void run() {
                    if (!isUnlocked && !isFinishing()) {
                        relaunchActivity();
                    }
                }
            });
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        stopRelaunchMonitoring();
    }

    private void startRelaunchMonitoring() {
        if (relaunchRunnable != null) {
            return; // Already monitoring
        }

        relaunchRunnable = new Runnable() {
            @Override
            public void run() {
                if (!isUnlocked && !isFinishing()) {
                    // Check if we're in foreground
                    if (!isInForeground()) {
                        Log.d(TAG, "Lock screen not in foreground - relaunching");
                        relaunchActivity();
                    }
                    relaunchHandler.postDelayed(this, RELAUNCH_CHECK_INTERVAL);
                }
            }
        };

        relaunchHandler.postDelayed(relaunchRunnable, RELAUNCH_CHECK_INTERVAL);
        Log.d(TAG, "Started relaunch monitoring");
    }

    private void stopRelaunchMonitoring() {
        if (relaunchRunnable != null && relaunchHandler != null) {
            relaunchHandler.removeCallbacks(relaunchRunnable);
            relaunchRunnable = null;
            Log.d(TAG, "Stopped relaunch monitoring");
        }
    }

    private void scheduleRelaunch() {
        relaunchHandler.postDelayed(new Runnable() {
            @Override
            public void run() {
                if (!isUnlocked && !isFinishing()) {
                    relaunchActivity();
                }
            }
        }, IMMEDIATE_RELAUNCH_DELAY);
    }

    private void relaunchActivity() {
        try {
            Intent intent = new Intent(this, ScreenTimeLockActivity.class);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            startActivity(intent);
        } catch (Exception e) {
            Log.e(TAG, "Error relaunching activity", e);
        }
    }

    private boolean isInForeground() {
        android.app.ActivityManager activityManager = (android.app.ActivityManager) getSystemService(ACTIVITY_SERVICE);
        if (activityManager == null) {
            return false;
        }

        java.util.List<android.app.ActivityManager.RunningTaskInfo> tasks = activityManager.getRunningTasks(1);
        if (tasks == null || tasks.isEmpty()) {
            return false;
        }

        android.content.ComponentName topActivity = tasks.get(0).topActivity;
        if (topActivity == null) {
            return false;
        }

        return topActivity.getClassName().equals(getClass().getName());
    }

    private String formatSeconds(int seconds) {
        int hours = seconds / 3600;
        int minutes = (seconds % 3600) / 60;
        return hours + "h " + minutes + "m";
    }
}
