import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shastika.shastikaapp',
  appName: 'shastikaapp',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
};

export default config;
