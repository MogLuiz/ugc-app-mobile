import { SECURE_STORE_KEYS } from '@/constants/storage-keys'
import { queryClient } from '@/lib/queryClient'
import { performTokenRefresh } from '@/lib/tokenRefresh'
import { authService, type SignUpResult } from '@/services/auth.service'
import { notificationsService } from '@/services/notifications.service'
import { useAuthStore } from '@/store/auth.store'
import * as SecureStore from 'expo-secure-store'
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

type SessionContextValue = {
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signUp: (
    email: string,
    password: string,
    meta: { name: string; role: 'COMPANY' | 'CREATOR' },
  ) => Promise<SignUpResult['kind']>
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

        try {
          const user = await authService.getMe(accessToken)
          setAuth(user, accessToken, refreshToken ?? undefined)
        } catch (err: unknown) {
          const status = (err as { response?: { status?: number } })?.response?.status

          if (status === 401 && refreshToken) {
            try {
              // performTokenRefresh already updates SecureStore + auth store tokens
              const newAccessToken = await performTokenRefresh()
              const user = await authService.getMe(newAccessToken)
              const { accessToken: storedToken, refreshToken: storedRefresh } =
                useAuthStore.getState()
              setAuth(user, storedToken ?? newAccessToken, storedRefresh ?? undefined)
            } catch {
              await Promise.all([
                SecureStore.deleteItemAsync(SECURE_STORE_KEYS.accessToken),
                SecureStore.deleteItemAsync(SECURE_STORE_KEYS.refreshToken),
              ])
              clearAuth()
            }
          } else {
            await Promise.all([
              SecureStore.deleteItemAsync(SECURE_STORE_KEYS.accessToken),
              SecureStore.deleteItemAsync(SECURE_STORE_KEYS.refreshToken),
            ])
            clearAuth()
          }
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
        .then((token) => {
          if (!token) return
          return notificationsService.registerDevicePushToken(token)
        })
        .catch(() => {})
    },
    [setAuth],
  )

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      meta: { name: string; role: 'COMPANY' | 'CREATOR' },
    ): Promise<SignUpResult['kind']> => {
      const result = await authService.signUp(email, password, meta)

      if (result.kind === 'success') {
        const { user, accessToken, refreshToken } = result

        await Promise.all([
          SecureStore.setItemAsync(SECURE_STORE_KEYS.accessToken, accessToken),
          SecureStore.setItemAsync(SECURE_STORE_KEYS.refreshToken, refreshToken),
        ])

        setAuth(user, accessToken, refreshToken)

        import('@/features/notifications/pushNotifications')
          .then(({ registerForPushNotificationsAsync }) => registerForPushNotificationsAsync())
          .then((token) => {
            if (!token) return
            return notificationsService.registerDevicePushToken(token)
          })
          .catch(() => {})
      }

      return result.kind
    },
    [setAuth],
  )

  const signOut = useCallback(async () => {
    const { accessToken } = useAuthStore.getState()

    await authService.signOut()

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
    <SessionContext.Provider value={{ isLoading, signIn, signOut, signUp }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSessionContext() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSessionContext must be used within SessionProvider')
  return ctx
}
