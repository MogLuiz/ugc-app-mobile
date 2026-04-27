import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationKeys } from '@/lib/query-keys'
import { notificationsService } from '@/services/notifications.service'

export function useNotificationsQuery(params?: { page?: number; limit?: number }) {
  const page = params?.page ?? 1
  const limit = params?.limit ?? 20

  return useQuery({
    queryKey: notificationKeys.list(page, limit),
    queryFn: () => notificationsService.listNotifications({ page, limit }),
    staleTime: 30_000,
  })
}

export function useUnreadNotificationsCountQuery() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationsService.getUnreadCount(),
    staleTime: 15_000,
  })
}

export function useMarkNotificationAsReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationsService.markNotificationAsRead(notificationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

export function useMarkAllNotificationsAsReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationsService.markAllNotificationsAsRead(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}
