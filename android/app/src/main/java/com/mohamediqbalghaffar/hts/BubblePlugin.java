package com.mohamediqbalghaffar.hts;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Bubble")
public class BubblePlugin extends Plugin {

    /**
     * Start the floating bubble service.
     * If the SYSTEM_ALERT_WINDOW permission hasn't been granted yet,
     * open the Android Settings screen so the user can grant it.
     * Then call this again — the second call will actually start the service.
     */
    @PluginMethod
    public void startBubble(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (!Settings.canDrawOverlays(getContext())) {
                // Ask user to grant "Display over other apps" permission
                Intent permIntent = new Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:" + getContext().getPackageName())
                );
                permIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(permIntent);
                call.resolve(); // Return success — user must manually grant and re-trigger
                return;
            }
        }

        Intent serviceIntent = new Intent(getContext(), BubbleService.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            getContext().startForegroundService(serviceIntent);
        } else {
            getContext().startService(serviceIntent);
        }
        call.resolve();
    }

    /**
     * Stop the floating bubble service.
     */
    @PluginMethod
    public void stopBubble(PluginCall call) {
        Intent serviceIntent = new Intent(getContext(), BubbleService.class);
        getContext().stopService(serviceIntent);
        call.resolve();
    }

    /**
     * Check whether the overlay permission is granted.
     * Returns { granted: boolean }
     */
    @PluginMethod
    public void checkPermission(PluginCall call) {
        boolean granted = true;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            granted = Settings.canDrawOverlays(getContext());
        }
        com.getcapacitor.JSObject result = new com.getcapacitor.JSObject();
        result.put("granted", granted);
        call.resolve(result);
    }
}
