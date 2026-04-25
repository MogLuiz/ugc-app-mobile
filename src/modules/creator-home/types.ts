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
  timeDisplay: string
  locationDisplay: string | null
  durationDisplay: string
  statusBadge: string
  primaryAction: 'CONFIRM_OR_DISPUTE' | 'VIEW'
  href: string
}
