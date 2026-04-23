export type ContractRequestStatus =
  | 'PENDING_PAYMENT'
  | 'PENDING_ACCEPTANCE'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'EXPIRED'
  | 'AWAITING_COMPLETION_CONFIRMATION'
  | 'COMPLETION_DISPUTE'

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
  completedAt?: string | null
  creatorConfirmedCompletedAt?: string | null
  companyConfirmedCompletedAt?: string | null
  contestDeadlineAt?: string | null
  completionDisputeReason?: string | null
  completionDisputedAt?: string | null
  completionDisputedByUserId?: string | null
  completionPhaseEnteredAt?: string | null
  createdAt?: string
  updatedAt?: string
  // Enriched fields (my-creator/pending)
  companyName?: string
  companyLogoUrl?: string | null
  companyRating?: number | null
  campaignTitle?: string | null
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

export type ReviewerRole = 'COMPANY' | 'CREATOR'

export type ReviewItem = {
  id: string
  reviewerRole: ReviewerRole
  rating: number
  comment: string | null
  createdAt: string
}

export type ContractReviewsResponse = {
  contractRequestId: string
  reviews: ReviewItem[]
}

export type CreateReviewPayload = {
  rating: number
  comment?: string
}
