import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shastikaapp.global',
  appName: 'shastikaapp',
  webDir: 'dist',
  server: {
    url: 'https://app-final-eta.vercel.app',
    androidScheme: 'https',
    cleartext: false
  },
  android: {
    allowMixedContent: true
  }
};

export default config;