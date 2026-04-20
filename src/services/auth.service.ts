import { api } from '@/lib/api'
import type { User } from '@/types'

export function getFriendlyAuthError(message?: string | null): string {
  if (!message?.trim()) return 'Não foi possível entrar. Tente novamente.'
  const lower = message.toLowerCase()

  if (
    lower.includes('network error') ||
    lower.includes('timeout') ||
    lower.includes('econnaborted') ||
    lower.includes('enotfound') ||
    lower.includes('econnrefused') ||
    lower === 'aborted'
  ) {
    return 'Erro de conexão. Verifique sua internet.'
  }
  if (lower.includes('email not confirmed') || lower.includes('email_not_confirmed'))
    return 'Confirme seu e-mail antes de entrar.'
  if (
    lower.includes('invalid login credentials') ||
    lower.includes('invalid_credentials') ||
    lower.includes('wrong password') ||
    lower.includes('incorrect password')
  )
    return 'E-mail ou senha incorretos.'
  if (lower.includes('user not found') || lower.includes('email not found'))
    return 'Nenhuma conta encontrada com este e-mail.'
  if (lower.includes('too many requests') || lower.includes('rate limit'))
    return 'Muitas tentativas. Aguarde alguns minutos.'

  return message
}

type SignInResponse = {
  user: User
  accessToken: string
  refreshToken: string
}

type RefreshTokenResponse = {
  accessToken: string
  refreshToken: string
}

export const authService = {
  async signIn(email: string, password: string): Promise<SignInResponse> {
    const { data } = await api.post<SignInResponse>('/auth/sign-in', { email, password })
    return data
  },

  async signOut(): Promise<void> {
    await api.post('/auth/sign-out').catch(() => {})
  },

  async getMe(): Promise<User> {
    const { data } = await api.get<User>('/auth/me')
    return data
  },

  async refreshToken(token: string): Promise<RefreshTokenResponse> {
    // stub — implement when backend supports token refresh
    const { data } = await api.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken: token,
    })
    return data
  },
}
