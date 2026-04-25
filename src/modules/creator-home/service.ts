import { api } from '@/lib/api'
import type { ConversationSummaryItem, CreatorDashboardSummaryApi } from './types'

export async function fetchCreatorDashboardSummary(): Promise<CreatorDashboardSummaryApi> {
  const { data } = await api.get<CreatorDashboardSummaryApi>('/creator/dashboard')
  return data
}

export async function fetchConversations(): Promise<ConversationSummaryItem[]> {
  const { data } = await api.get<ConversationSummaryItem[]>('/conversations')
  return data
}
