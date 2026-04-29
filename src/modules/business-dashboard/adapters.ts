import { formatOfferExpiry, formatTimeAgo } from '@/lib/formatters'
import type { ConversationListItem } from '@/modules/chat/types'
import type {
  BusinessDashboardKpiCardVm,
  BusinessDashboardKpiSourceData,
  BusinessDashboardPendingResponseItem,
  CompanyHubItem,
  CompanyOffersHubResponse,
} from './types'

export function resolveRecordingInstant(item: CompanyHubItem): Date | null {
  const iso = item.startsAt
  if (!iso) return null

  const instant = new Date(iso)
  if (Number.isNaN(instant.getTime())) return null

  return instant
}

function getPendingApplicationsCount(hub: CompanyOffersHubResponse): number {
  return hub.pending.openOffers.reduce(
    (sum, item) => sum + (item.applicationsToReviewCount ?? 0),
    0,
  )
}

function getUnreadMessagesCount(conversations: ConversationListItem[]): number {
  return conversations.reduce((sum, conversation) => sum + (conversation.unreadCount ?? 0), 0)
}

function getUpcomingRecordingsCount(hub: CompanyOffersHubResponse, now: Date): number {
  return hub.inProgress.reduce((count, item) => {
    const recordingInstant = resolveRecordingInstant(item)
    if (!recordingInstant) return count
    return recordingInstant.getTime() > now.getTime() ? count + 1 : count
  }, 0)
}

const PENDING_RESPONSES_LIMIT = 3

export function computeHasAnyCampaignData(hub: CompanyOffersHubResponse | undefined): boolean {
  if (!hub) return false
  return (
    (hub.pending?.openOffers?.length ?? 0) > 0 ||
    (hub.pending?.directInvites?.length ?? 0) > 0 ||
    (hub.pending?.awaitingPayment?.length ?? 0) > 0 ||
    (hub.inProgress?.length ?? 0) > 0 ||
    (hub.finalized?.completed?.length ?? 0) > 0 ||
    (hub.finalized?.cancelled?.length ?? 0) > 0 ||
    (hub.finalized?.expiredWithoutHire?.length ?? 0) > 0
  )
}

export function mapHubToPendingResponses(
  hub: CompanyOffersHubResponse | undefined,
): BusinessDashboardPendingResponseItem[] {
  const invites = hub?.pending?.directInvites ?? []
  return invites
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, PENDING_RESPONSES_LIMIT)
    .map((item) => ({
      id: item.id,
      title: item.title,
      creatorName: item.creatorName ?? 'Creator',
      creatorAvatarUrl: item.creatorAvatarUrl ?? null,
      waitingLabel: formatTimeAgo(item.createdAt),
      expiresLabel: item.effectiveExpiresAt
        ? formatOfferExpiry(item.effectiveExpiresAt)
        : item.expiresAt
          ? formatOfferExpiry(item.expiresAt)
          : null,
    }))
}

export function buildBusinessDashboardKpiValues({
  hub,
  conversations,
  now,
}: BusinessDashboardKpiSourceData): Record<BusinessDashboardKpiCardVm['id'], number> {
  return {
    'pending-applications': hub ? getPendingApplicationsCount(hub) : 0,
    'unread-messages': conversations ? getUnreadMessagesCount(conversations) : 0,
    'active-campaigns': hub ? hub.inProgress.length : 0,
    'upcoming-recordings': hub ? getUpcomingRecordingsCount(hub, now) : 0,
  }
}
