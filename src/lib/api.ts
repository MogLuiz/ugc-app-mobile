import { env } from '@/constants/env'
import { SECURE_STORE_KEYS } from '@/constants/storage-keys'
import { performTokenRefresh } from '@/lib/tokenRefresh'
import { useAuthStore } from '@/store/auth.store'
import axios, { type InternalAxiosRequestConfig } from 'axios'
import * as SecureStore from 'expo-secure-store'

export { SECURE_STORE_KEYS }

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

let isRefreshing = false
let refreshSuccessQueue: ((token: string) => void)[] = []
let refreshFailureQueue: ((err: unknown) => void)[] = []

function drainQueues(token: string) {
  refreshSuccessQueue.forEach((cb) => cb(token))
  refreshSuccessQueue = []
  refreshFailureQueue = []
}

function failQueues(err: unknown) {
  refreshFailureQueue.forEach((cb) => cb(err))
  refreshSuccessQueue = []
  refreshFailureQueue = []
}

async function clearSession() {
  useAuthStore.getState().clearAuth()
  await Promise.all([
    SecureStore.deleteItemAsync(SECURE_STORE_KEYS.accessToken),
    SecureStore.deleteItemAsync(SECURE_STORE_KEYS.refreshToken),
  ])
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as InternalAxiosRequestConfig & { _retried?: boolean }
    const status = error.response?.status

    if (status !== 401 || config._retried) {
      return Promise.reject(error)
    }

    config._retried = true

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshSuccessQueue.push((token) => {
          config.headers.Authorization = `Bearer ${token}`
          resolve(api(config))
        })
        refreshFailureQueue.push(reject)
      })
    }

    isRefreshing = true
    try {
      const newToken = await performTokenRefresh()
      config.headers.Authorization = `Bearer ${newToken}`
      drainQueues(newToken)
      return api(config)
    } catch (refreshErr) {
      failQueues(refreshErr)
      await clearSession()
      return Promise.reject(refreshErr)
    } finally {
      isRefreshing = false
    }
  },
)
