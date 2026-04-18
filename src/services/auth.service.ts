import { api } from '@/lib/api'
import type { User } from '@/types'

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
