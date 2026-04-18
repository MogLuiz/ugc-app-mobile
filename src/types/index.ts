export type UserRole = 'creator' | 'company'

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl?: string
}

export type ApiError = {
  message: string
  code?: string
  statusCode?: number
}
