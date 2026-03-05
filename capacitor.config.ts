import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mohamediqbalghaffar.hts',
  appName: 'Tasks (by HTS)',
  webDir: 'out',
  plugins: {
    CapacitorUpdater: {
      autoUpdate: true
    }
  }
};

export default config;
