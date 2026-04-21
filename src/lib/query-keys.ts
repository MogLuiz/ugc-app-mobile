// Centralized query key registry.
// Structure mirrors the web (frontend/app/lib/query/query-keys.ts).
// Only keys relevant to the mobile creator MVP are included.

export const contractRequestKeys = {
  all: ['contract-requests'] as const,
  creatorPending: () => [...contractRequestKeys.all, 'creator', 'pending'] as const,
  creatorList: (status: string) => [...contractRequestKeys.all, 'creator', status] as const,
  companyList: (status?: string) =>
    [...contractRequestKeys.all, 'company', status ?? 'all'] as const,
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
  list: (params?: { page?: number; limit?: number }) =>
    [...opportunityKeys.all, 'list', params?.page ?? 1, params?.limit ?? 50] as const,
  detail: (id: string) => [...opportunityKeys.all, 'detail', id] as const,
}

export const creatorDashboardKeys = {
  all: ['creator-dashboard'] as const,
  summary: () => [...creatorDashboardKeys.all, 'summary'] as const,
  invites: () => [...creatorDashboardKeys.all, 'invites'] as const,
  upcoming: () => [...creatorDashboardKeys.all, 'upcoming'] as const,
}

export const calendarKeys = {
  all: ['creator-calendar'] as const,
  availability: () => [...calendarKeys.all, 'availability'] as const,
  range: (start: string, end: string) => [...calendarKeys.all, 'range', start, end] as const,
}
