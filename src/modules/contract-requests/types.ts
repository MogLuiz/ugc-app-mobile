export type ContractRequestStatus =
  | 'PENDING_PAYMENT'
  | 'PENDING_ACCEPTANCE'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'EXPIRED'

export type CompanyCampaignStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'

export type OfferDisplayStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'COMPLETED'

export type PaymentStatus = 'PENDING' | 'PAID'

export type ContractRequestItem = {
  id: string
  companyId: string
  creatorId: string
  jobTypeId: string
  mode: 'PRESENTIAL' | 'REMOTE' | 'HYBRID'
  description: string
  status: ContractRequestStatus | CompanyCampaignStatus | OfferDisplayStatus
  paymentStatus: PaymentStatus
  currency: string
  termsAcceptedAt: string
  startsAt: string
  durationMinutes: number
  jobAddress: string
  jobFormattedAddress: string | null
  jobLatitude: number
  jobLongitude: number
  creatorDistance: {
    km: number | null
    formatted: string | null
    isWithinServiceRadius: boolean | null
    effectiveServiceRadiusKm: number | null
  }
  transport: {
    price: number
    formatted: string
    isMinimumApplied: boolean
  }
  transportFee: number
  creatorBasePrice: number
  platformFee: number
  totalPrice: number
  totalAmount: number
  transportPricePerKmUsed: number
  transportMinimumFeeUsed: number
  creatorNameSnapshot: string
  creatorAvatarUrlSnapshot: string | null
  rejectionReason: string | null
  openOfferId?: string | null
  createdAt?: string
  updatedAt?: string
  // Enriched fields (my-creator/pending)
  companyName?: string
  companyLogoUrl?: string | null
  companyRating?: number | null
  jobTypeName?: string | null
  expiresSoon?: boolean
  expiresAt?: string
  // Enriched fields (my-company)
  creator?: { name: string; avatarUrl: string | null; rating: number | null }
  job?: { title: string; description: string; durationMinutes: number }
  schedule?: { date: string; startTime: string }
  location?: { city: string | null; state: string | null }
  pricing?: { totalAmount: number; baseAmount: number; transportAmount: number }
  metadata?: { createdAt: string | null; acceptedAt: string | null }
  actions?: { canCancel: boolean; canChat: boolean; canViewDetails: boolean }
}
