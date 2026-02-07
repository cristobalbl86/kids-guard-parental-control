package com.kidsguard;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.PixelFormat;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.provider.Settings;
import android.text.InputType;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

/**
 * Manages a system overlay that covers the entire screen.
 * This overlay cannot be dismissed by Home, Recent Apps, or Back buttons.
 * Only the correct parent PIN can remove it.
 */
public class LockOverlayManager {
    private static final String TAG = "LockOverlayManager";

    private static LockOverlayManager instance;
    private WindowManager windowManager;
    private View overlayView;
    private boolean isShowing = false;
    private Context context;

    public static LockOverlayManager getInstance() {
        if (instance == null) {
            instance = new LockOverlayManager();
        }
        return instance;
    }

    public boolean isShowing() {
        return isShowing;
    }

    public void showLockScreen(Context ctx) {
        if (isShowing) {
            Log.d(TAG, "Lock screen already showing");
            return;
        }

        this.context = ctx.getApplicationContext();

        // Check overlay permission
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(context)) {
            Log.e(TAG, "SYSTEM_ALERT_WINDOW permission not granted, falling back to activity");
            launchLockActivity(context);
            return;
        }

        try {
            windowManager = (WindowManager) context.getSystemService(Context.WINDOW_SERVICE);

            // Create overlay layout params - covers entire screen, stays on top of everything
            // Use TRANSLUCENT instead of OPAQUE to allow soft keyboard to render properly
            WindowManager.LayoutParams params = new WindowManager.LayoutParams(
                WindowManager.LayoutParams.MATCH_PARENT,
                WindowManager.LayoutParams.MATCH_PARENT,
                Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                    ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                    : WindowManager.LayoutParams.TYPE_PHONE,
                WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN
                    | WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
                    | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON,
                PixelFormat.TRANSLUCENT
            );
            params.gravity = Gravity.TOP | Gravity.START;
            // Required for keyboard input on Android 11+
            params.softInputMode = WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE;

            // Create the overlay view
            overlayView = createLockView();

            windowManager.addView(overlayView, params);
            isShowing = true;
            Log.d(TAG, "Lock overlay shown");
        } catch (Exception e) {
            Log.e(TAG, "Error showing lock overlay, falling back to activity", e);
            launchLockActivity(context);
        }
    }

    public void dismiss() {
        if (!isShowing || overlayView == null || windowManager == null) {
            return;
        }

        try {
            windowManager.removeView(overlayView);
            overlayView = null;
            isShowing = false;
            Log.d(TAG, "Lock overlay dismissed");
        } catch (Exception e) {
            Log.e(TAG, "Error dismissing lock overlay", e);
        }
    }

    private void launchLockActivity(Context ctx) {
        try {
            Intent intent = new Intent(ctx, ScreenTimeLockActivity.class);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            ctx.startActivity(intent);
        } catch (Exception e) {
            Log.e(TAG, "Error launching lock activity fallback", e);
        }
    }

    private View createLockView() {
        // Main scrollable container
        ScrollView scrollView = new ScrollView(context);
        scrollView.setBackgroundColor(0xFF0F172A);
        scrollView.setFillViewport(true);

        // Content container
        LinearLayout contentLayout = new LinearLayout(context);
        contentLayout.setOrientation(LinearLayout.VERTICAL);
        contentLayout.setGravity(Gravity.CENTER);
        int padding = dpToPx(32);
        contentLayout.setPadding(padding, dpToPx(80), padding, dpToPx(80));

        // Lock icon
        TextView iconText = new TextView(context);
        iconText.setText("\uD83D\uDD12");
        iconText.setTextSize(64);
        iconText.setGravity(Gravity.CENTER);
        iconText.setPadding(0, 0, 0, dpToPx(16));
        contentLayout.addView(iconText);

        // Title
        TextView titleText = new TextView(context);
        titleText.setText("Screen Time Limit");
        titleText.setTextSize(28);
        titleText.setTextColor(0xFFFFFFFF);
        titleText.setGravity(Gravity.CENTER);
        titleText.setTypeface(null, Typeface.BOLD);
        titleText.setPadding(0, 0, 0, dpToPx(8));
        contentLayout.addView(titleText);

        // Subtitle
        TextView subtitleText = new TextView(context);
        subtitleText.setText("Time's up!");
        subtitleText.setTextSize(18);
        subtitleText.setTextColor(0xFFCBD5E1);
        subtitleText.setGravity(Gravity.CENTER);
        subtitleText.setPadding(0, 0, 0, dpToPx(32));
        contentLayout.addView(subtitleText);

        // Usage info card
        LinearLayout usageCard = new LinearLayout(context);
        usageCard.setOrientation(LinearLayout.VERTICAL);
        usageCard.setPadding(dpToPx(24), dpToPx(20), dpToPx(24), dpToPx(20));
        LinearLayout.LayoutParams usageCardParams = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        );
        usageCardParams.setMargins(0, 0, 0, dpToPx(32));
        usageCard.setLayoutParams(usageCardParams);

        GradientDrawable usageCardBg = new GradientDrawable();
        usageCardBg.setColor(0xFF1E293B);
        usageCardBg.setCornerRadius(dpToPx(12));
        usageCard.setBackground(usageCardBg);

        // Usage text
        TextView usageText = new TextView(context);
        try {
            int limitSeconds = ScreenTimeModule.getLimitStatic(context);
            String limitFormatted = formatSeconds(limitSeconds);
            usageText.setText("Time limit reached\nAllowed time: " + limitFormatted);
        } catch (Exception e) {
            usageText.setText("Screen time limit reached");
        }
        usageText.setTextSize(16);
        usageText.setTextColor(0xFFE2E8F0);
        usageText.setGravity(Gravity.CENTER);
        usageText.setLineSpacing(dpToPx(4), 1.0f);
        usageCard.addView(usageText);

        contentLayout.addView(usageCard);

        // Instruction
        TextView instructionText = new TextView(context);
        instructionText.setText("Enter parent PIN to unlock");
        instructionText.setTextSize(14);
        instructionText.setTextColor(0xFF94A3B8);
        instructionText.setGravity(Gravity.CENTER);
        instructionText.setPadding(0, 0, 0, dpToPx(12));
        contentLayout.addView(instructionText);

        // PIN input
        final EditText pinInput = new EditText(context);
        pinInput.setHint("\u2022\u2022\u2022\u2022");
        pinInput.setHintTextColor(0xFF64748B);
        pinInput.setInputType(InputType.TYPE_CLASS_NUMBER | InputType.TYPE_NUMBER_VARIATION_PASSWORD);
        pinInput.setTextSize(24);
        pinInput.setTextColor(0xFF1E293B);
        pinInput.setGravity(Gravity.CENTER);
        int pinPad = dpToPx(16);
        pinInput.setPadding(dpToPx(24), pinPad, dpToPx(24), pinPad);

        GradientDrawable pinBg = new GradientDrawable();
        pinBg.setColor(0xFFF1F5F9);
        pinBg.setCornerRadius(dpToPx(12));
        pinInput.setBackground(pinBg);

        LinearLayout.LayoutParams pinParams = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        );
        pinParams.setMargins(0, 0, 0, dpToPx(16));
        pinInput.setLayoutParams(pinParams);
        contentLayout.addView(pinInput);

        // Error text (hidden initially)
        final TextView errorText = new TextView(context);
        errorText.setText("Incorrect PIN");
        errorText.setTextSize(14);
        errorText.setTextColor(0xFFEF4444);
        errorText.setGravity(Gravity.CENTER);
        errorText.setPadding(0, 0, 0, dpToPx(12));
        errorText.setVisibility(View.GONE);
        contentLayout.addView(errorText);

        // Unlock button
        Button unlockButton = new Button(context);
        unlockButton.setText("UNLOCK");
        unlockButton.setTextSize(16);
        unlockButton.setTextColor(0xFFFFFFFF);
        unlockButton.setTypeface(null, Typeface.BOLD);
        unlockButton.setAllCaps(false);
        int btnPad = dpToPx(14);
        unlockButton.setPadding(dpToPx(40), btnPad, dpToPx(40), btnPad);

        GradientDrawable unlockBg = new GradientDrawable();
        unlockBg.setColor(0xFF3B82F6);
        unlockBg.setCornerRadius(dpToPx(12));
        unlockButton.setBackground(unlockBg);

        unlockButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String entered = pinInput.getText().toString();
                if (entered.isEmpty()) {
                    Toast.makeText(context, "Please enter PIN", Toast.LENGTH_SHORT).show();
                    return;
                }

                boolean isValid = PINStorageHelper.verifyPIN(context, entered);
                if (isValid) {
                    // Stop enforcement so the timer doesn't re-lock
                    try {
                        SharedPreferences prefs = context.getSharedPreferences("screen_time_prefs", Context.MODE_PRIVATE);
                        prefs.edit()
                            .putBoolean("enforcing", false)
                            .putLong("timer_start_ms", 0)
                            .apply();
                    } catch (Exception ex) {
                        Log.e(TAG, "Error stopping enforcement on unlock", ex);
                    }
                    dismiss();
                } else {
                    errorText.setVisibility(View.VISIBLE);
                    pinInput.setText("");
                }
            }
        });

        LinearLayout.LayoutParams unlockParams = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        );
        unlockButton.setLayoutParams(unlockParams);
        contentLayout.addView(unlockButton);

        scrollView.addView(contentLayout);
        return scrollView;
    }

    private int dpToPx(int dp) {
        float density = context.getResources().getDisplayMetrics().density;
        return Math.round(dp * density);
    }

    private String formatSeconds(int seconds) {
        int hours = seconds / 3600;
        int minutes = (seconds % 3600) / 60;
        if (hours > 0) {
            return hours + "h " + minutes + "m";
        }
        return minutes + "m";
    }
}
