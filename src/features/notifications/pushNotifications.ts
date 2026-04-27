import Constants from 'expo-constants'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import type { NotificationData, NotificationType } from '@/modules/notifications/types'

export type PushRegistrationResult = {
  token: string | null
  deviceId?: string
  deviceName?: string
  platform?: string
  appVersion?: string
  permissionGranted: boolean
}

export type PushNotificationPayload = {
  notificationId?: string
  type?: NotificationType
  data?: NotificationData | null
  sourceType?: string
  sourceId?: string | null
}

type PushNotificationResponsePayload = {
  payload: PushNotificationPayload | null
  responseKey: string
}

type SetupNotificationListenersOptions = {
  onNotificationResponse?: (
    response: PushNotificationResponsePayload,
  ) => void | Promise<void>
}

function isExpoGo(): boolean {
  return Constants.executionEnvironment === 'storeClient'
}

function isPushNotificationsSupported(): boolean {
  return !isExpoGo()
}

export async function registerForPushNotificationsAsync(): Promise<PushRegistrationResult> {
  const metadata = {
    deviceId: Device.osInternalBuildId ?? undefined,
    deviceName: Device.deviceName ?? undefined,
    platform: Platform.OS,
    appVersion: Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? undefined,
  }

  if (!isPushNotificationsSupported()) {
    return { token: null, permissionGranted: false, ...metadata }
  }

  if (!Device.isDevice) {
    return { token: null, permissionGranted: false, ...metadata }
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
    return { token: null, permissionGranted: false, ...metadata }
  }

  const projectId =
    Constants.easConfig?.projectId ??
    (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas?.projectId

  if (!projectId) {
    return { token: null, permissionGranted: true, ...metadata }
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

  return {
    token: tokenData.data,
    permissionGranted: true,
    ...metadata,
  }
}

function getString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function getPayloadObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function extractPushNotificationPayload(
  data: unknown,
): PushNotificationPayload | null {
  const payload = getPayloadObject(data)
  if (!payload) {
    return null
  }

  return {
    notificationId: getString(payload.notificationId) ?? undefined,
    type: (getString(payload.type) as NotificationType | null) ?? undefined,
    sourceType: getString(payload.sourceType) ?? undefined,
    sourceId: getString(payload.sourceId),
    data: getPayloadObject(payload.data) as NotificationData | null,
  }
}

function buildResponseKey(response: {
  notification: { request: { identifier: string; content: { data: unknown } } }
  actionIdentifier: string
}): string {
  const payload = extractPushNotificationPayload(response.notification.request.content.data)

  return [
    response.notification.request.identifier,
    response.actionIdentifier,
    payload?.notificationId ?? 'no-notification-id',
    payload?.type ?? 'no-type',
  ].join(':')
}

export async function getLastNotificationResponsePayload(): Promise<PushNotificationResponsePayload | null> {
  if (!isPushNotificationsSupported()) {
    return null
  }

  const Notifications = await import('expo-notifications')
  const response = await Notifications.getLastNotificationResponseAsync()

  if (!response) {
    return null
  }

  return {
    payload: extractPushNotificationPayload(response.notification.request.content.data),
    responseKey: buildResponseKey(response),
  }
}

export async function clearLastNotificationResponsePayload(): Promise<void> {
  if (!isPushNotificationsSupported()) {
    return
  }

  const Notifications = await import('expo-notifications')
  await Notifications.clearLastNotificationResponseAsync()
}

export async function setupNotificationListeners(
  options?: SetupNotificationListenersOptions,
): Promise<() => void> {
  if (!isPushNotificationsSupported()) {
    return () => {}
  }

  const Notifications = await import('expo-notifications')

  const receivedSubscription = Notifications.addNotificationReceivedListener((_notification) => {
    // foreground notification received — extend here as needed
  })

  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      void options?.onNotificationResponse?.({
        payload: extractPushNotificationPayload(response.notification.request.content.data),
        responseKey: buildResponseKey(response),
      })
    },
  )

  return () => {
    receivedSubscription.remove()
    responseSubscription.remove()
  }
}
