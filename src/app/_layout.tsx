import { useEffect, useRef } from 'react'
import { Stack, useRouter } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { ThemeProvider } from '@shopify/restyle'
import { QueryClientProvider } from '@tanstack/react-query'
import { notificationKeys } from '@/lib/query-keys'
import { queryClient } from '@/lib/queryClient'
import { resolveNotificationDestination } from '@/modules/notifications/navigation'
import { notificationsService } from '@/services/notifications.service'
import { SessionProvider, useSessionContext } from '@/providers/SessionProvider'
import { useAuthStore } from '@/store/auth.store'
import theme from '@/theme/theme'

SplashScreen.preventAutoHideAsync()

function RootNavigator() {
  const { isLoading } = useSessionContext()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const router = useRouter()
  const handledNotificationResponseKeysRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync()
    }
  }, [isLoading])

  useEffect(() => {
    if (isLoading || !isAuthenticated) {
      return
    }

    let cleanup: (() => void) | undefined
    let cancelled = false

    async function handleNotificationResponse(params: {
      responseKey: string
      payload: {
        notificationId?: string
        type?: string
        sourceType?: string
        sourceId?: string | null
        data?: Record<string, unknown> | null
      } | null
    }) {
      if (cancelled) {
        return
      }

      if (handledNotificationResponseKeysRef.current.has(params.responseKey)) {
        return
      }

      handledNotificationResponseKeysRef.current.add(params.responseKey)
      if (handledNotificationResponseKeysRef.current.size > 20) {
        const firstKey = handledNotificationResponseKeysRef.current.values().next().value
        if (firstKey) {
          handledNotificationResponseKeysRef.current.delete(firstKey)
        }
      }

      const payload = params.payload
      if (!payload) {
        return
      }

      const destination = resolveNotificationDestination({
        type: payload.type ?? 'unknown',
        sourceType: payload.sourceType ?? '',
        sourceId: payload.sourceId ?? null,
        data: payload.data ?? null,
      })

      const markAsReadPromise = payload.notificationId
        ? notificationsService
            .markNotificationAsRead(payload.notificationId)
            .then(() =>
              queryClient.invalidateQueries({
                queryKey: notificationKeys.all,
              }),
            )
            .catch(() => {})
        : Promise.resolve()

      if (destination) {
        router.push(destination.href)
      }

      void markAsReadPromise
    }

    import('@/features/notifications/pushNotifications')
      .then(
        async ({
          clearLastNotificationResponsePayload,
          getLastNotificationResponsePayload,
          setupNotificationListeners,
        }) => {
          const initialResponse = await getLastNotificationResponsePayload().catch(() => null)
          if (initialResponse) {
            await handleNotificationResponse(initialResponse)
            await clearLastNotificationResponsePayload().catch(() => {})
          }

          return setupNotificationListeners({
            onNotificationResponse: handleNotificationResponse,
          })
        },
      )
      .then((fn) => {
        cleanup = fn
      })
      .catch(() => {})

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) return null

  return (
    <>
      <Stack>
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="sign-up" options={{ headerShown: false }} />
        <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="dark" />
    </>
  )
}

export default function RootLayout() {
  return (
    <ThemeProvider theme={theme}>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <RootNavigator />
        </QueryClientProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}
