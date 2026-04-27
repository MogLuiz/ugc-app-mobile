import { api } from '@/lib/api'
import type {
  NotificationsResponse,
  NotificationItem,
  UnreadCountResponse,
} from '@/modules/notifications/types'

type RegisterDevicePushTokenPayload = {
  token: string
  provider?: 'expo'
  deviceId?: string
  deviceName?: string
  platform?: string
  appVersion?: string
  permissionGranted?: boolean
}

export const notificationsService = {
  async registerDevicePushToken(payload: RegisterDevicePushTokenPayload): Promise<void> {
    await api.post('/devices/push-token', payload)
  },

  async unregisterDevicePushToken(token: string): Promise<void> {
    await api.delete('/devices/push-token', { data: { token } })
  },

  async listNotifications(params?: {
    page?: number
    limit?: number
  }): Promise<NotificationsResponse> {
    const { data } = await api.get<NotificationsResponse>('/notifications', {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
      },
    })
    return data
  },

  async getUnreadCount(): Promise<UnreadCountResponse> {
    const { data } = await api.get<UnreadCountResponse>('/notifications/unread-count')
    return data
  },

  async markNotificationAsRead(notificationId: string): Promise<NotificationItem> {
    const { data } = await api.patch<NotificationItem>(`/notifications/${notificationId}/read`)
    return data
  },

  async markAllNotificationsAsRead(): Promise<{ updatedCount: number }> {
    const { data } = await api.patch<{ updatedCount: number }>('/notifications/read-all')
    return data
  },
}
