import { SECURE_STORE_KEYS } from '@/constants/storage-keys'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth.store'
import * as SecureStore from 'expo-secure-store'

/**
 * Attempts to refresh the Supabase session using the stored refresh token.
 * Returns the new access token on success.
 * Throws on failure — does NOT call clearAuth. The caller is responsible for cleanup.
 */
export async function performTokenRefresh(): Promise<string> {
  const { refreshToken } = useAuthStore.getState()

  if (!refreshToken) {
    throw new Error('no_refresh_token')
  }

  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken })

  if (error || !data.session) {
    throw error ?? new Error('refresh_failed')
  }

  const { access_token, refresh_token: newRefreshToken } = data.session

  await Promise.all([
    SecureStore.setItemAsync(SECURE_STORE_KEYS.accessToken, access_token),
    SecureStore.setItemAsync(SECURE_STORE_KEYS.refreshToken, newRefreshToken),
  ])

  useAuthStore.getState().setTokens(access_token, newRefreshToken)

  return access_token
}
