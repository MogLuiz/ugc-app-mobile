export type CreatorHubDisplayStatus =
  | 'PENDING_INVITE'
  | 'APPLICATION_PENDING'
  | 'ACCEPTED'
  | 'AWAITING_CONFIRMATION'
  | 'IN_DISPUTE'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'APPLICATION_NOT_SELECTED'
  | 'APPLICATION_WITHDRAWN'

export type CreatorHubItemKind = 'direct_invite' | 'open_offer_application' | 'contract'

export type CreatorHubPrimaryAction =
  | 'ACCEPT_OR_REJECT'
  | 'CONFIRM_OR_DISPUTE'
  | 'LEAVE_REVIEW'
  | 'VIEW'

export type CreatorHubItem = {
  id: string
  kind: CreatorHubItemKind
  displayStatus: CreatorHubDisplayStatus

  company: {
    id: string
    name: string
    logoUrl: string | null
    rating: number | null
    reviewCount: number
  }

  jobTypeName: string
  title: string

  totalAmount: number | null
  currency: string

  startsAt: string | null
  finalizedAt: string | null
  effectiveExpiresAt: string | null
  expiresSoon: boolean
  openOfferId: string | null
  locationDisplay: string | null

  primaryAction: CreatorHubPrimaryAction
  actionRequired: boolean

  canAccept: boolean
  canReject: boolean
  canCancel: boolean
  canConfirmCompletion: boolean
  canDispute: boolean

  myReviewPending: boolean | null
}

export type CreatorHubSummary = {
  pendingInvitesCount: number
  pendingApplicationsCount: number
  inProgressCount: number
  completedPendingReviewCount: number
  actionRequiredCount: number
}

export type CreatorOffersHubResponse = {
  summary: CreatorHubSummary
  pending: {
    invites: CreatorHubItem[]
    applications: CreatorHubItem[]
  }
  inProgress: CreatorHubItem[]
  finalized: {
    completed: CreatorHubItem[]
    rejected: CreatorHubItem[]
    cancelled: CreatorHubItem[]
    expired: CreatorHubItem[]
  }
}
