import axios from 'axios'
import * as SecureStore from 'expo-secure-store'
import { env } from '@/constants/env'
import { useAuthStore } from '@/store/auth.store'

export const SECURE_STORE_KEYS = {
  accessToken: 'auth.accessToken',
  refreshToken: 'auth.refreshToken',
} as const

export const api = axios.create({
  baseURL: env.apiUrl,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth()
      await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.accessToken)
      await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.refreshToken)
    }
    return Promise.reject(error)
  },
)
