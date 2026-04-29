import { formatCurrency, formatShortDate } from '@/lib/formatters'
import type { CreatorHubItem } from '@/modules/contract-requests/creator-hub.types'
import type { CreatorPayout } from '@/modules/creator-payouts/types'
import type {
  ConversationSummaryItem,
  CreatorKpiCardVm,
  PendingActionVm,
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

// Centralised rule used by both adaptHubUpcoming (to exclude) and adaptPendingActions (to include).
export function isAwaitingConfirmation(item: CreatorHubItem): boolean {
  return (
    item.displayStatus === 'AWAITING_CONFIRMATION' ||
    item.primaryAction === 'CONFIRM_OR_DISPUTE' ||
    item.canConfirmCompletion === true
  )
}

function formatDayMonth(isoDate: string | null): string | null {
  if (!isoDate) return null
  return new Date(isoDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export function adaptHubUpcoming(
  items: CreatorHubItem[],
  now: Date,
  limit = 3,
): UpcomingPreviewVm[] {
  return items
    .filter((item) => item.startsAt != null && !isAwaitingConfirmation(item))
    .sort((a, b) => new Date(a.startsAt!).getTime() - new Date(b.startsAt!).getTime())
    .slice(0, limit)
    .map((item) => {
      const d = new Date(item.startsAt!)
      const dateStr = d
        .toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
        .replace(/\./g, '')
        .trim()
      const timeStr = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      const statusBadge = item.displayStatus === 'IN_DISPUTE' ? 'Pendente' : 'Confirmada'
      return {
        id: item.id,
        campaignName: item.title,
        companyName: item.company.name,
        dateDisplay: `${dateStr} · ${timeStr}`,
        locationDisplay: item.address ?? item.locationDisplay,
        statusBadge,
        href: `/(creator)/propostas/${item.id}`,
      }
    })
}

export function adaptPendingActions(
  inProgress: CreatorHubItem[],
  completed: CreatorHubItem[],
): PendingActionVm[] {
  const confirmItems: PendingActionVm[] = inProgress
    .filter(isAwaitingConfirmation)
    .map((item) => {
      const dayMonth = formatDayMonth(item.startsAt)
      return {
        id: item.id,
        kind: 'confirm_completion' as const,
        companyName: item.company.name,
        companyLogoUrl: item.company.logoUrl,
        title: item.title,
        jobTypeName: item.jobTypeName ?? null,
        dateLabel: dayMonth ? `Realizado em ${dayMonth}` : null,
      }
    })

  const reviewItems: PendingActionVm[] = completed
    .filter((item) => item.myReviewPending === true)
    .map((item) => {
      const dayMonth = formatDayMonth(item.finalizedAt ?? item.startsAt)
      return {
        id: item.id,
        kind: 'review_company' as const,
        companyName: item.company.name,
        companyLogoUrl: item.company.logoUrl,
        title: item.title,
        jobTypeName: item.jobTypeName ?? null,
        dateLabel: dayMonth ? `Concluído em ${dayMonth}` : null,
      }
    })

  return [...confirmItems, ...reviewItems]
}

export function deriveUnreadCount(conversations: ConversationSummaryItem[]): number {
  return conversations.reduce((sum, c) => sum + c.unreadCount, 0)
}
