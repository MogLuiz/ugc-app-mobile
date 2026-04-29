import type { ConversationListItem } from '@/modules/chat/types'

export type HubDisplayStatus =
  | 'OPEN'
  | 'PENDING'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED'

export type HubItemKind = 'open_offer' | 'direct_invite' | 'contract'

export type HubPrimaryAction = 'review_applications' | 'view_details'

export type CompanyHubItem = {
  id: string
  kind: HubItemKind
  title: string
  description: string | null
  address: string
  amount: number | null
  startsAt: string | null
  durationMinutes: number | null
  legacyStatus: string
  displayStatus: HubDisplayStatus
  expiresAt: string | null
  effectiveExpiresAt: string | null
  contestDeadlineAt: string | null
  completedAt: string | null
  actionRequiredByCompany: boolean
  primaryAction: HubPrimaryAction
  applicationsToReviewCount: number
  myReviewPending: boolean | null
  creatorId: string | null
  creatorName: string | null
  creatorAvatarUrl: string | null
  offerId: string | null
  contractRequestId: string | null
  createdAt: string
  updatedAt: string | null
  paymentId: string | null
  paymentStatus: string | null
  pixExpiresAt: string | null
}

export type CompanyOffersHubResponse = {
  pending: {
    openOffers: CompanyHubItem[]
    directInvites: CompanyHubItem[]
    awaitingPayment: CompanyHubItem[]
  }
  inProgress: CompanyHubItem[]
  finalized: {
    completed: CompanyHubItem[]
    cancelled: CompanyHubItem[]
    expiredWithoutHire: CompanyHubItem[]
  }
}

export type BusinessDashboardKpiCardId =
  | 'pending-applications'
  | 'unread-messages'
  | 'active-campaigns'
  | 'upcoming-recordings'

export type BusinessDashboardKpiCardState = 'loading' | 'ready' | 'error'

export type BusinessDashboardKpiCardVm = {
  id: BusinessDashboardKpiCardId
  label: string
  value: number | null
  valueDisplay: string
  subtitle: string
  state: BusinessDashboardKpiCardState
  tone: 'default' | 'highlight'
  href: '/(business)/campanhas' | '/(business)/mensagens'
}

export type BusinessDashboardKpisResult = {
  items: BusinessDashboardKpiCardVm[]
  isRefreshing: boolean
  refreshAll: () => void
}

export type BusinessDashboardKpiSourceData = {
  hub: CompanyOffersHubResponse | undefined
  conversations: ConversationListItem[] | undefined
  now: Date
}

export type BusinessDashboardPendingResponseItem = {
  id: string
  title: string
  creatorName: string
  creatorAvatarUrl: string | null
  waitingLabel: string
  expiresLabel: string | null
}
