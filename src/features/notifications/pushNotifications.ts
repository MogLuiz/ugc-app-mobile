import Constants from 'expo-constants'
import * as Device from 'expo-device'
import { Platform } from 'react-native'

export async function registerForPushNotificationsAsync(): Promise<string> {
  if (!Device.isDevice) {
    throw new Error('Push notifications require a physical device')
  }

  const Notifications = await import('expo-notifications')

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  })

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    throw new Error('Push notification permission denied')
  }

  const projectId =
    Constants.easConfig?.projectId ??
    (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas?.projectId

  if (!projectId) {
    throw new Error(
      'Expo push token requires a projectId. Set EAS_PROJECT_ID and configure eas.projectId in app.config.ts',
    )
  }

  const tokenData = await Notifications.getExpoPushTokenAsync({ projectId })

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2563EB',
    })
  }

  return tokenData.data
}

export async function setupNotificationListeners(): Promise<() => void> {
  const Notifications = await import('expo-notifications')

  const receivedSubscription = Notifications.addNotificationReceivedListener((_notification) => {
    // foreground notification received — extend here as needed
  })

  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    (_response) => {
      // user tapped notification — add deep-link routing here as needed
    },
  )

  return () => {
    receivedSubscription.remove()
    responseSubscription.remove()
  }
}
