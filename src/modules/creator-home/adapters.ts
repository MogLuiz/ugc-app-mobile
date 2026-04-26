import { formatCurrency, formatShortDate } from '@/lib/formatters'
import type { CreatorHubItem } from '@/modules/contract-requests/creator-hub.types'
import type { CreatorPayout } from '@/modules/creator-payouts/types'
import type {
  ConversationSummaryItem,
  CreatorKpiCardVm,
  UpcomingPreviewVm,
  WorkInvitePreviewVm,
} from './types'

export function adaptCreatorKpis(
  averageRating: number | null,
  inProgressCount: number,
  pendingInvitesCount: number,
  payouts: CreatorPayout[],
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
    averageRating != null && averageRating > 0
      ? `${averageRating.toFixed(1).replace('.', ',')}/5`
      : '—'

  return [
    {
      id: 'confirmed',
      label: 'Trabalhos confirmados',
      valueDisplay: String(inProgressCount),
      accent: 'primary',
    },
    {
      id: 'pending',
      label: 'Pendentes',
      valueDisplay: String(pendingInvitesCount),
    },
    {
      id: 'earnings',
      label: 'Ganhos do mês',
      valueDisplay: formatCurrency(monthlyEarningsCents / 100),
    },
    {
      id: 'rating',
      label: 'Avaliação',
      valueDisplay: ratingDisplay,
    },
  ]
}

export function adaptHubInvites(items: CreatorHubItem[], limit = 2): WorkInvitePreviewVm[] {
  return items.slice(0, limit).map((item) => ({
    id: item.id,
    companyName: item.company.name,
    title: item.title,
    dateDisplay: item.startsAt ? formatShortDate(item.startsAt) : 'A combinar',
    paymentDisplay: formatCurrency((item.totalAmount ?? 0) / 100),
    distanceDisplay: null,
  }))
}

export function adaptHubUpcoming(
  items: CreatorHubItem[],
  now: Date,
  limit = 3,
): UpcomingPreviewVm[] {
  return items
    .filter((item) => item.startsAt != null)
    .sort((a, b) => new Date(a.startsAt!).getTime() - new Date(b.startsAt!).getTime())
    .slice(0, limit)
    .map((item) => {
      const d = new Date(item.startsAt!)
      const statusBadge =
        item.displayStatus === 'AWAITING_CONFIRMATION'
          ? 'Concluída'
          : item.displayStatus === 'IN_DISPUTE'
            ? 'Pendente'
            : 'Confirmada'
      return {
        id: item.id,
        campaignName: item.title,
        companyName: item.company.name,
        dateDisplay: formatShortDate(item.startsAt!),
        timeDisplay: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        locationDisplay:
          item.displayStatus === 'AWAITING_CONFIRMATION'
            ? null
            : (item.address ?? item.locationDisplay),
        durationDisplay: '',
        statusBadge,
        primaryAction:
          item.displayStatus === 'AWAITING_CONFIRMATION' ? 'CONFIRM_OR_DISPUTE' : 'VIEW',
        href: `/(creator)/propostas/${item.id}`,
      }
    })
}

export function deriveUnreadCount(conversations: ConversationSummaryItem[]): number {
  return conversations.reduce((sum, c) => sum + c.unreadCount, 0)
}
