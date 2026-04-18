import { api } from '@/lib/api'

export const notificationsService = {
  async registerDevicePushToken(token: string): Promise<void> {
    await api.post('/devices/push-token', { token })
  },

  async unregisterDevicePushToken(token: string): Promise<void> {
    await api.delete('/devices/push-token', { data: { token } })
  },
}
