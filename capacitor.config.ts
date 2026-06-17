import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shastikaapp.global',
  appName: 'Shastika Global Impex Pvt Ltd',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['google.com'],
      androidClientId: '584894894933-7auh8qgvbfrc0v9rquu1h9daq148v81u.apps.googleusercontent.com'
    }
  }
};

export default config;
