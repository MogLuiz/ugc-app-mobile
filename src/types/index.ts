export type UserRole = 'business' | 'creator'
export type BackendRole = 'COMPANY' | 'CREATOR'

export function toFrontendRole(role: BackendRole): UserRole {
  return role === 'COMPANY' ? 'business' : 'creator'
}

export function toBackendRole(role: UserRole): BackendRole {
  return role === 'business' ? 'COMPANY' : 'CREATOR'
}

export type ProfilePayload = {
  userId: string
  name?: string
  photoUrl?: string
  bio?: string
  onboardingStep?: number
  birthDate?: string
  gender?: string
  phone?: string
  addressStreet?: string
  addressNumber?: string
  addressCity?: string
  addressState?: string
  addressZipCode?: string
  formattedAddress?: string | null
  latitude?: number | null
  longitude?: number | null
  createdAt: string
  updatedAt: string
}

export type PortfolioMedia = {
  id: string
  type: 'IMAGE' | 'VIDEO'
  url: string
  thumbnailUrl?: string | null
  sortOrder: number
  status: 'PROCESSING' | 'READY' | 'FAILED'
  createdAt: string
  updatedAt: string
}

export type CompanyProfilePayload = {
  userId: string
  documentType?: 'CPF' | 'CNPJ' | null
  documentNumber?: string | null
  companyName?: string | null
  jobTitle?: string | null
  businessNiche?: string | null
  createdAt: string
  updatedAt: string
}

export type PortfolioPayload = {
  id: string
  userId: string
  media: PortfolioMedia[]
  createdAt: string
  updatedAt: string
}

export type BootstrapPayload = {
  id: string
  authUserId: string
  email: string
  phone?: string
  role: BackendRole
  status: string
  createdAt: string
  updatedAt: string
  profile?: ProfilePayload
  creatorProfile?: Record<string, unknown>
  companyProfile?: CompanyProfilePayload | null
  portfolio?: PortfolioPayload | null
  warnings?: string[]
}

export type User = {
  id: string
  authUserId: string
  name: string
  email: string
  phone?: string
  role: UserRole
  avatarUrl?: string
  onboardingStep?: number
}

export function bootstrapToUser(payload: BootstrapPayload): User {
  return {
    id: payload.id,
    authUserId: payload.authUserId,
    name: payload.profile?.name ?? 'Usuário',
    email: payload.email,
    phone: payload.phone,
    role: toFrontendRole(payload.role),
    avatarUrl: payload.profile?.photoUrl,
    onboardingStep: payload.profile?.onboardingStep,
  }
}

export type ApiError = {
  message: string
  code?: string
  statusCode?: number
}
