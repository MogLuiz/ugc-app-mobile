import { useEffect } from 'react'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { ThemeProvider } from '@shopify/restyle'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { SessionProvider, useSessionContext } from '@/providers/SessionProvider'
import { useAuthStore } from '@/store/auth.store'
import theme from '@/theme/theme'

SplashScreen.preventAutoHideAsync()

function RootNavigator() {
  const { isLoading } = useSessionContext()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync()
    }
  }, [isLoading])

  useEffect(() => {
    let cleanup: (() => void) | undefined

    import('@/features/notifications/pushNotifications')
      .then(({ setupNotificationListeners }) => setupNotificationListeners())
      .then((fn) => {
        cleanup = fn
      })
      .catch(() => {})

    return () => cleanup?.()
  }, [])

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
