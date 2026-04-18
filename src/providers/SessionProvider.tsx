import { SECURE_STORE_KEYS } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'
import { authService } from '@/services/auth.service'
import { notificationsService } from '@/services/notifications.service'
import { useAuthStore } from '@/store/auth.store'
import * as SecureStore from 'expo-secure-store'
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

const ME_TIMEOUT_MS = 8_000

type SessionContextValue = {
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const hydrating = useRef(false)
  const { setAuth, clearAuth } = useAuthStore()

  useEffect(() => {
    if (hydrating.current) return
    hydrating.current = true

    async function hydrate() {
      try {
        const [accessToken, refreshToken] = await Promise.all([
          SecureStore.getItemAsync(SECURE_STORE_KEYS.accessToken),
          SecureStore.getItemAsync(SECURE_STORE_KEYS.refreshToken),
        ])

        if (!accessToken) return

        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), ME_TIMEOUT_MS)

        try {
          const user = await authService.getMe()
          setAuth(user, accessToken, refreshToken ?? undefined)
        } catch {
          await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.accessToken)
          await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.refreshToken)
          clearAuth()
        } finally {
          clearTimeout(timeout)
        }
      } catch {
        clearAuth()
      } finally {
        setIsLoading(false)
      }
    }

    hydrate()
  }, [setAuth, clearAuth])

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { user, accessToken, refreshToken } = await authService.signIn(email, password)
      await Promise.all([
        SecureStore.setItemAsync(SECURE_STORE_KEYS.accessToken, accessToken),
        SecureStore.setItemAsync(SECURE_STORE_KEYS.refreshToken, refreshToken),
      ])
      setAuth(user, accessToken, refreshToken)

      import('@/features/notifications/pushNotifications')
        .then(({ registerForPushNotificationsAsync }) => registerForPushNotificationsAsync())
        .then((token) => notificationsService.registerDevicePushToken(token))
        .catch(() => {})
    },
    [setAuth],
  )

  const signOut = useCallback(async () => {
    const { accessToken } = useAuthStore.getState()

    await authService.signOut().catch(() => {})

    if (accessToken) {
      await notificationsService.unregisterDevicePushToken(accessToken).catch(() => {})
    }

    await Promise.all([
      SecureStore.deleteItemAsync(SECURE_STORE_KEYS.accessToken),
      SecureStore.deleteItemAsync(SECURE_STORE_KEYS.refreshToken),
    ])

    clearAuth()
    queryClient.clear()
  }, [clearAuth])

  return (
    <SessionContext.Provider value={{ isLoading, signIn, signOut }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSessionContext() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSessionContext must be used within SessionProvider')
  return ctx
}
