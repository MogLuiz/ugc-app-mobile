import { formatAmount, formatDurationMinutes, formatShortDate } from '@/lib/formatters'
import type {
  ConversationSummaryItem,
  CreatorDashboardSummaryApi,
  CreatorInviteApi,
  CreatorKpiCardVm,
  CreatorPayoutApi,
  CreatorUpcomingApi,
  InvitePreviewVm,
  UpcomingPreviewVm,
} from './types'

export function adaptCreatorKpis(
  summary: CreatorDashboardSummaryApi,
  payouts: CreatorPayoutApi[],
  now = new Date(),
): CreatorKpiCardVm[] {
  const monthlyEarningsCents = payouts.reduce((sum, payout) => {
    if (payout.status !== 'paid' || !payout.paidAt) return sum

    const paidAt = new Date(payout.paidAt)
    if (Number.isNaN(paidAt.getTime())) return sum

    if (paidAt.getMonth() !== now.getMonth() || paidAt.getFullYear() !== now.getFullYear()) {
      return sum
    }

    return sum + payout.amountCents
  }, 0)

  const ratingDisplay =
    summary.averageRating != null && summary.averageRating > 0
      ? `${summary.averageRating.toFixed(1).replace('.', ',')}/5`
      : '—'

  return [
    {
      id: 'confirmed',
      label: 'Trabalhos confirmados',
      valueDisplay: String(summary.confirmedCampaigns),
      accent: 'primary',
    },
    {
      id: 'pending',
      label: 'Pendentes',
      valueDisplay: String(summary.pendingInvites),
    },
    {
      id: 'earnings',
      label: 'Ganhos do mês',
      valueDisplay: formatAmount(monthlyEarningsCents / 100),
    },
    {
      id: 'rating',
      label: 'Avaliação',
      valueDisplay: ratingDisplay,
    },
  ]
}

export function adaptInvites(rows: CreatorInviteApi[]): InvitePreviewVm[] {
  return rows.slice(0, 3).map((row) => ({
    id: row.id,
    companyName: row.companyName,
    campaignTitle: row.campaignTitle,
    dateDisplay: formatShortDate(row.proposedDate),
    paymentDisplay: formatAmount(row.payment),
    distanceDisplay:
      row.distanceKm != null
        ? `${row.distanceKm.toFixed(1).replace('.', ',')} km`
        : null,
  }))
}

export function adaptUpcoming(rows: CreatorUpcomingApi[]): UpcomingPreviewVm[] {
  return rows.slice(0, 3).map((row) => {
    const d = new Date(row.date)
    return {
      id: row.id,
      campaignName: row.campaignName,
      companyName: row.companyName,
      dateDisplay: formatShortDate(row.date),
      timeDisplay: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      locationDisplay: row.location,
      durationDisplay: formatDurationMinutes(row.duration),
      statusBadge: row.status,
    }
  })
}

export function deriveUnreadCount(conversations: ConversationSummaryItem[]): number {
  return conversations.reduce((sum, c) => sum + c.unreadCount, 0)
}
