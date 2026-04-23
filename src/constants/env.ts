import { Platform } from 'react-native'

const getRequired = (key: string, value: string | undefined): string => {
  if (!value) {
    const msg = `Missing required environment variable: ${key}. Copy .env.example to .env.local and set the value.`
    if (__DEV__) {
      console.warn(msg)
      return ''
    }
    throw new Error(msg)
  }
  return value
}

function resolveAndroidDevLoopback(url: string): string {
  if (Platform.OS !== 'android') return url

  try {
    const parsed = new URL(url)
    const isLocalhost = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1'
    if (parsed.protocol === 'http:' && isLocalhost) {
      parsed.hostname = '10.0.2.2'
      return parsed.toString().replace(/\/$/, '')
    }
  } catch {
    return url
  }

  return url
}

export const env = {
  apiUrl: resolveAndroidDevLoopback(
    getRequired('EXPO_PUBLIC_API_URL', process.env.EXPO_PUBLIC_API_URL),
  ),
  supabaseUrl: getRequired('EXPO_PUBLIC_SUPABASE_URL', process.env.EXPO_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: getRequired(
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  ),
  appEnv: (process.env.EXPO_PUBLIC_APP_ENV ?? 'development') as
    | 'development'
    | 'staging'
    | 'production',
} as const
