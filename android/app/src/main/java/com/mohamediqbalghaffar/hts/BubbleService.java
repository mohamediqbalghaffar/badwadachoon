package com.mohamediqbalghaffar.hts;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.os.Build;
import android.os.IBinder;
import android.provider.Settings;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.ImageView;
import android.widget.LinearLayout;

import androidx.core.app.NotificationCompat;

public class BubbleService extends Service {

    private static final String CHANNEL_ID   = "bubble_channel";
    private static final int    NOTIF_ID     = 1001;

    private WindowManager windowManager;
    private View          bubbleView;
    private View          expandedView;

    // Bubble layout params
    private WindowManager.LayoutParams bubbleParams;
    private WindowManager.LayoutParams expandedParams;

    private boolean isExpanded = false;

    // Drag state
    private int   initialX, initialY;
    private float initialTouchX, initialTouchY;
    private boolean dragging = false;

    @Override
    public void onCreate() {
        super.onCreate();

        // ── Foreground notification (required on Android 8+) ─────────────
        createNotificationChannel();
        Notification notification = buildNotification();
        startForeground(NOTIF_ID, notification);

        // ── Window manager ───────────────────────────────────────────────
        windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);

        // ── Create bubble view ───────────────────────────────────────────
        bubbleView = createBubbleCircle();
        bubbleParams = new WindowManager.LayoutParams(
            160, 160,
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                : WindowManager.LayoutParams.TYPE_SYSTEM_ALERT,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
                | WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        );
        bubbleParams.gravity = Gravity.TOP | Gravity.START;

        // Get screen width and start near bottom-right
        int screenWidth  = getResources().getDisplayMetrics().widthPixels;
        int screenHeight = getResources().getDisplayMetrics().heightPixels;
        bubbleParams.x = screenWidth  - 180;
        bubbleParams.y = screenHeight - 300;

        windowManager.addView(bubbleView, bubbleParams);

        // ── Create expanded panel view ───────────────────────────────────
        expandedView = createExpandedPanel();
        expandedParams = new WindowManager.LayoutParams(
            600, WindowManager.LayoutParams.WRAP_CONTENT,
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                : WindowManager.LayoutParams.TYPE_SYSTEM_ALERT,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
                | WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        );
        expandedParams.gravity = Gravity.TOP | Gravity.START;
        expandedView.setVisibility(View.GONE);
        windowManager.addView(expandedView, expandedParams);
    }

    // ── Build the circular bubble ─────────────────────────────────────────
    private View createBubbleCircle() {
        LinearLayout layout = new LinearLayout(this);
        layout.setGravity(Gravity.CENTER);

        // Purple gradient circle background
        android.graphics.drawable.GradientDrawable circle =
            new android.graphics.drawable.GradientDrawable(
                android.graphics.drawable.GradientDrawable.Orientation.TL_BR,
                new int[] { 0xFF7C3AED, 0xFF06B6D4 }
            );
        circle.setShape(android.graphics.drawable.GradientDrawable.OVAL);
        layout.setBackground(circle);

        // App icon in the center
        ImageView icon = new ImageView(this);
        int size = dpToPx(36);
        LinearLayout.LayoutParams iconParams = new LinearLayout.LayoutParams(size, size);
        icon.setLayoutParams(iconParams);
        try {
            icon.setImageDrawable(getPackageManager().getApplicationIcon(getPackageName()));
        } catch (Exception e) {
            icon.setBackgroundColor(Color.WHITE);
        }
        layout.addView(icon);

        // ── Touch: drag + tap ─────────────────────────────────────────────
        layout.setOnTouchListener(new View.OnTouchListener() {
            @Override
            public boolean onTouch(View v, MotionEvent event) {
                switch (event.getAction()) {
                    case MotionEvent.ACTION_DOWN:
                        initialX       = bubbleParams.x;
                        initialY       = bubbleParams.y;
                        initialTouchX  = event.getRawX();
                        initialTouchY  = event.getRawY();
                        dragging       = false;
                        return true;

                    case MotionEvent.ACTION_MOVE:
                        float dx = event.getRawX() - initialTouchX;
                        float dy = event.getRawY() - initialTouchY;
                        if (Math.abs(dx) > 8 || Math.abs(dy) > 8) dragging = true;
                        if (dragging) {
                            bubbleParams.x = initialX + (int) dx;
                            bubbleParams.y = initialY + (int) dy;
                            windowManager.updateViewLayout(bubbleView, bubbleParams);
                            // Keep expanded panel near bubble if open
                            if (isExpanded) {
                                expandedParams.x = bubbleParams.x - 440;
                                expandedParams.y = bubbleParams.y;
                                windowManager.updateViewLayout(expandedView, expandedParams);
                            }
                        }
                        return true;

                    case MotionEvent.ACTION_UP:
                        if (!dragging) toggleExpanded();
                        snapToEdge(); // snap bubble to screen edge on release
                        return true;
                }
                return false;
            }
        });

        return layout;
    }

    // ── Build the expanded action panel ───────────────────────────────────
    private View createExpandedPanel() {
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setPadding(dpToPx(16), dpToPx(14), dpToPx(16), dpToPx(14));

        android.graphics.drawable.GradientDrawable bg =
            new android.graphics.drawable.GradientDrawable();
        bg.setColor(0xF01E1345);
        bg.setCornerRadius(dpToPx(18));
        bg.setStroke(dpToPx(1), 0x557C3AED);
        layout.setBackground(bg);

        // Header
        android.widget.TextView title = new android.widget.TextView(this);
        title.setText("Tasks (by HTS)");
        title.setTextColor(Color.WHITE);
        title.setTextSize(13);
        title.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
        layout.addView(title);

        // Divider
        View divider = new View(this);
        LinearLayout.LayoutParams divParams = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT, dpToPx(1));
        divParams.setMargins(0, dpToPx(8), 0, dpToPx(8));
        divider.setLayoutParams(divParams);
        divider.setBackgroundColor(0x22FFFFFF);
        layout.addView(divider);

        // Action buttons
        layout.addView(makeActionButton("🏠  Open App",       null));
        layout.addView(makeActionButton("✅  Tasks",           "tasks"));
        layout.addView(makeActionButton("📄  Letters",         "letters"));
        layout.addView(makeActionButton("🗂️  Archives",       "archives"));

        // Close button
        View closeDivider = new View(this);
        LinearLayout.LayoutParams cdParams = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT, dpToPx(1));
        cdParams.setMargins(0, dpToPx(8), 0, dpToPx(8));
        closeDivider.setLayoutParams(cdParams);
        closeDivider.setBackgroundColor(0x22FFFFFF);
        layout.addView(closeDivider);

        android.widget.TextView close = new android.widget.TextView(this);
        close.setText("✕  Close bubble");
        close.setTextColor(0xFFEF4444);
        close.setTextSize(11);
        close.setPadding(dpToPx(8), dpToPx(6), dpToPx(8), dpToPx(6));
        close.setOnClickListener(v -> stopSelf());
        layout.addView(close);

        return layout;
    }

    private View makeActionButton(String label, String tab) {
        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.HORIZONTAL);
        row.setGravity(Gravity.CENTER_VERTICAL);
        row.setPadding(dpToPx(8), dpToPx(8), dpToPx(8), dpToPx(8));

        android.graphics.drawable.GradientDrawable btnBg =
            new android.graphics.drawable.GradientDrawable();
        btnBg.setColor(0x0AFFFFFF);
        btnBg.setCornerRadius(dpToPx(10));
        row.setBackground(btnBg);

        android.widget.TextView tv = new android.widget.TextView(this);
        tv.setText(label);
        tv.setTextColor(0xFFE2E8F0);
        tv.setTextSize(12);
        tv.setLayoutParams(new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT));
        row.addView(tv);

        LinearLayout.LayoutParams rowParams = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT);
        rowParams.setMargins(0, 0, 0, dpToPx(6));
        row.setLayoutParams(rowParams);

        row.setOnClickListener(v -> openApp(tab));
        return row;
    }

    // ── Toggle expanded panel ─────────────────────────────────────────────
    private void toggleExpanded() {
        isExpanded = !isExpanded;
        if (isExpanded) {
            expandedParams.x = Math.max(0, bubbleParams.x - 440);
            expandedParams.y = bubbleParams.y;
            windowManager.updateViewLayout(expandedView, expandedParams);
            expandedView.setVisibility(View.VISIBLE);
        } else {
            expandedView.setVisibility(View.GONE);
        }
    }

    // ── Snap bubble to nearest screen edge ────────────────────────────────
    private void snapToEdge() {
        int screenWidth = getResources().getDisplayMetrics().widthPixels;
        int mid = screenWidth / 2;
        int targetX = (bubbleParams.x + 80 < mid) ? 0 : screenWidth - 160;

        // Simple snap without animation for now
        bubbleParams.x = targetX;
        windowManager.updateViewLayout(bubbleView, bubbleParams);
    }

    // ── Open the main app ─────────────────────────────────────────────────
    private void openApp(String tab) {
        Intent intent = getPackageManager().getLaunchIntentForPackage(getPackageName());
        if (intent != null) {
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            if (tab != null) intent.putExtra("tab", tab);
            startActivity(intent);
        }
        expandedView.setVisibility(View.GONE);
        isExpanded = false;
    }

    // ── Helpers ───────────────────────────────────────────────────────────
    private int dpToPx(int dp) {
        float density = getResources().getDisplayMetrics().density;
        return Math.round(dp * density);
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "HTS Bubble",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Keeps the floating bubble active");
            NotificationManager nm = getSystemService(NotificationManager.class);
            nm.createNotificationChannel(channel);
        }
    }

    private Notification buildNotification() {
        Intent openIntent = getPackageManager().getLaunchIntentForPackage(getPackageName());
        PendingIntent pi = PendingIntent.getActivity(this, 0, openIntent,
            PendingIntent.FLAG_IMMUTABLE);
        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Tasks (by HTS)")
            .setContentText("Floating bubble is active")
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentIntent(pi)
            .setOngoing(true)
            .build();
    }

    @Override
    public IBinder onBind(Intent intent) { return null; }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (bubbleView   != null) windowManager.removeView(bubbleView);
        if (expandedView != null) windowManager.removeView(expandedView);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        return START_STICKY; // Restart service if killed
    }
}
