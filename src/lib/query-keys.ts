// Centralized query key registry.
// Structure mirrors the web (frontend/app/lib/query/query-keys.ts).
// Only keys relevant to the mobile creator MVP are included.

export const contractRequestKeys = {
  all: ['contract-requests'] as const,
  creatorPending: () => [...contractRequestKeys.all, 'creator', 'pending'] as const,
  creatorList: (status: string) => [...contractRequestKeys.all, 'creator', status] as const,
  companyList: (status?: string) =>
    [...contractRequestKeys.all, 'company', status ?? 'all'] as const,
  detail: (id: string) => [...contractRequestKeys.all, 'detail', id] as const,
  reviews: (contractRequestId: string) =>
    [...contractRequestKeys.all, 'reviews', contractRequestId] as const,
}

export const chatKeys = {
  all: ['chat'] as const,
  conversations: (contractRequestId?: string) =>
    [...chatKeys.all, 'conversations', contractRequestId ?? 'all'] as const,
  messages: (conversationId?: string) =>
    [...chatKeys.all, 'messages', conversationId ?? 'none'] as const,
}

export const opportunityKeys = {
  all: ['opportunities'] as const,
  preview: (limit = 2) => [...opportunityKeys.all, 'preview', limit] as const,
  list: (params?: { page?: number; limit?: number }) =>
    [...opportunityKeys.all, 'list', params?.page ?? 1, params?.limit ?? 50] as const,
  infiniteList: (limit = 24) => [...opportunityKeys.all, 'infinite-list', limit] as const,
  detail: (id: string) => [...opportunityKeys.all, 'detail', id] as const,
}

export const creatorDashboardKeys = {
  all: ['creator-dashboard'] as const,
  summary: () => [...creatorDashboardKeys.all, 'summary'] as const,
}

export const businessDashboardKeys = {
  all: ['business-dashboard'] as const,
  companyOffersHub: () => [...businessDashboardKeys.all, 'company-offers-hub'] as const,
}

export const creatorHubKeys = {
  all: ['creator-hub'] as const,
  hub: () => [...creatorHubKeys.all, 'hub'] as const,
}

export const creatorPayoutKeys = {
  all: ['creator-payouts'] as const,
  list: () => [...creatorPayoutKeys.all, 'list'] as const,
}

export const payoutSettingsKeys = {
  all: ['payout-settings'] as const,
  mine: () => [...payoutSettingsKeys.all, 'mine'] as const,
}

export const calendarKeys = {
  all: ['creator-calendar'] as const,
  availability: () => [...calendarKeys.all, 'availability'] as const,
  range: (start: string, end: string) => [...calendarKeys.all, 'range', start, end] as const,
}

export const creatorProfileKeys = {
  all: ['creator-profile'] as const,
  myEdit: (userId: string) => [...creatorProfileKeys.all, 'my-edit', userId] as const,
}

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (page = 1, limit = 20) => [...notificationKeys.all, 'list', page, limit] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
}
