export type CreatorDashboardSummaryApi = {
  averageRating: number | null
}

export type ConversationSummaryItem = {
  id: string
  unreadCount: number
}

export type CreatorKpiCardVm = {
  id: 'confirmed' | 'pending' | 'earnings' | 'rating'
  label: string
  valueDisplay: string
  accent?: 'primary'
}

export type WorkInvitePreviewVm = {
  id: string
  companyName: string
  title: string
  dateDisplay: string
  paymentDisplay: string
  distanceDisplay: string | null
}

export type UpcomingPreviewVm = {
  id: string
  campaignName: string
  companyName: string
  dateDisplay: string
  locationDisplay: string | null
  statusBadge: string
  href: string
}

export type PendingActionVm = {
  id: string
  kind: 'confirm_completion' | 'review_company'
  companyName: string
  companyLogoUrl: string | null
  title: string
  jobTypeName: string | null
  dateLabel: string | null
}
