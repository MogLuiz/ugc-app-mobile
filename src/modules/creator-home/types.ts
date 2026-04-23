export type CreatorDashboardSummaryApi = {
  confirmedCampaigns: number
  pendingInvites: number
  monthlyEarnings: number
  averageRating: number | null
}

export type CreatorInviteApi = {
  id: string
  companyName: string
  campaignTitle: string
  proposedDate: string
  payment: number
  status: 'PENDING'
  distanceKm?: number | null
  expiresAt?: string | null
}

export type CreatorUpcomingApi = {
  id: string
  campaignName: string
  companyName: string
  date: string
  time: string
  location: string
  duration: number
  status: 'Confirmada' | 'Pendente' | 'Concluída'
}

export type ConversationSummaryItem = {
  id: string
  unreadCount: number
}

export type CreatorPayoutApi = {
  id: string
  amountCents: number
  currency: string
  status: 'not_due' | 'pending' | 'scheduled' | 'paid' | 'failed' | 'canceled'
  paidAt: string | null
  createdAt: string
  updatedAt: string
}

export type CreatorKpiCardVm = {
  id: 'confirmed' | 'pending' | 'earnings' | 'rating'
  label: string
  valueDisplay: string
  accent?: 'primary'
}

export type InvitePreviewVm = {
  id: string
  companyName: string
  campaignTitle: string
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
  locationDisplay: string
  durationDisplay: string
  statusBadge: string
}
