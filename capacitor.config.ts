import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.swifload.logistics',
  appName: 'SwifLoad',
  webDir: 'out',
  server: {
    url: 'https://swifload-cbe.azurewebsites.net',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#111827",
      showSpinner: true,
      spinnerColor: "#16a34a"
    }
  }
};

export default config;
