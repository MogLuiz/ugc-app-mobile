import { ExpoConfig, ConfigContext } from 'expo/config'

const androidConfig = {
  package: 'com.ugclocal.app',
  usesCleartextTraffic: (process.env.EXPO_PUBLIC_API_URL ?? '').startsWith('http://'),
  adaptiveIcon: {
    backgroundColor: '#E6F4FE',
    foregroundImage: './assets/images/android-icon-foreground.png',
    backgroundImage: './assets/images/android-icon-background.png',
    monochromeImage: './assets/images/android-icon-monochrome.png',
  },
  edgeToEdgeEnabled: true,
  predictiveBackGestureEnabled: false,
} as ExpoConfig['android'] & { usesCleartextTraffic?: boolean }

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'UGC Local',
  slug: 'ugc-local',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'ugclocal',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.ugclocal.app',
  },
  android: androidConfig,
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
        dark: { backgroundColor: '#000000' },
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/images/icon.png',
        color: '#ffffff',
        defaultChannel: 'default',
        sounds: [],
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    eas: {
      projectId: process.env.EAS_PROJECT_ID ?? '',
    },
  },
})
