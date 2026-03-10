package com.mohamediqbalghaffar.hts;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;

import java.util.ArrayList;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        registerPlugin(BubblePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
