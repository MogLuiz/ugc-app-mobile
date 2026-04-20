import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { bootstrapToUser, type BootstrapPayload, type User } from '@/types'

export function getFriendlyRegisterError(message?: string | null): string {
  if (!message?.trim()) return 'Erro ao criar conta. Tente novamente.'
  const lower = message.toLowerCase()
  if (lower.includes('already registered') || lower.includes('already exists'))
    return 'Este e-mail já está cadastrado. Faça login ou recupere sua senha.'
  if (lower.includes('too many requests') || lower.includes('rate limit'))
    return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.'
  if (
    lower.includes('network') ||
    lower.includes('timeout') ||
    lower.includes('fetch') ||
    lower === 'aborted'
  )
    return 'Erro de conexão. Verifique sua internet.'
  return message
}

export function getFriendlyAuthError(message?: string | null): string {
  if (!message?.trim()) return 'Não foi possível entrar. Tente novamente.'
  const lower = message.toLowerCase()

  if (
    lower.includes('network') ||
    lower.includes('timeout') ||
    lower.includes('econnaborted') ||
    lower.includes('enotfound') ||
    lower.includes('econnrefused') ||
    lower.includes('fetch') ||
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
  if (lower.includes('profile_not_found') || lower.includes('no_role_metadata'))
    return 'Conta não encontrada. Acesse pelo site para criar seu perfil.'

  return message
}

type SignInResult = {
  user: User
  accessToken: string
  refreshToken: string
}

export type SignUpResult =
  | { kind: 'success'; user: User; accessToken: string; refreshToken: string }
  | { kind: 'confirmation_required' }

async function fetchProfile(token: string): Promise<User> {
  const { data } = await api.get<BootstrapPayload>('/profiles/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return bootstrapToUser(data)
}

async function bootstrapNewUser(token: string): Promise<User> {
  const { data: userData, error: userError } = await supabase.auth.getUser(token)

  if (userError || !userData.user) {
    throw new Error('Não foi possível obter dados do usuário.')
  }

  const metadataRole = userData.user.user_metadata?.role as string | undefined
  const backendRole = metadataRole === 'COMPANY' || metadataRole === 'CREATOR' ? metadataRole : null

  if (!backendRole) {
    throw new Error('no_role_metadata')
  }

  const { data } = await api.post<BootstrapPayload>(
    '/users/bootstrap',
    { role: backendRole },
    { headers: { Authorization: `Bearer ${token}` } },
  )
  return bootstrapToUser(data)
}

export const authService = {
  async signIn(email: string, password: string): Promise<SignInResult> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) throw error

    const { access_token, refresh_token } = data.session

    let user: User
    try {
      user = await fetchProfile(access_token)
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 404) {
        user = await bootstrapNewUser(access_token)
      } else {
        throw err
      }
    }

    return { user, accessToken: access_token, refreshToken: refresh_token }
  },

  async getMe(token?: string): Promise<User> {
    if (token) {
      return fetchProfile(token)
    }
    const { data } = await api.get<BootstrapPayload>('/profiles/me')
    return bootstrapToUser(data)
  },

  async signOut(): Promise<void> {
    await supabase.auth.signOut().catch(() => { })
  },

  async signUp(
    email: string,
    password: string,
    meta: { name: string; role: 'COMPANY' | 'CREATOR' },
  ): Promise<SignUpResult> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: meta.name, role: meta.role } },
    })

    if (error) throw error

    if (!data.session) {
      return { kind: 'confirmation_required' }
    }

    const { access_token, refresh_token } = data.session

    let user: User
    try {
      user = await fetchProfile(access_token)
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 404) {
        user = await bootstrapNewUser(access_token)
      } else {
        throw err
      }
    }

    return { kind: 'success', user, accessToken: access_token, refreshToken: refresh_token }
  },
}
