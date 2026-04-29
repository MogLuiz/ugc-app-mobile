import type { ConversationListItem } from '@/modules/chat/types'
import type {
  BusinessDashboardKpiCardVm,
  BusinessDashboardKpiSourceData,
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
