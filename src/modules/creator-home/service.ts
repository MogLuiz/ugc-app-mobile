import { api } from '@/lib/api'
import type {
  ConversationSummaryItem,
  CreatorDashboardSummaryApi,
  CreatorInviteApi,
  CreatorPayoutApi,
  CreatorUpcomingApi,
} from './types'

export async function fetchCreatorDashboardSummary(): Promise<CreatorDashboardSummaryApi> {
  const { data } = await api.get<CreatorDashboardSummaryApi>('/creator/dashboard')
  return data
}

export async function fetchCreatorInvites(): Promise<CreatorInviteApi[]> {
  const { data } = await api.get<CreatorInviteApi[]>('/creator/invites')
  return data
}

export async function fetchCreatorUpcoming(): Promise<CreatorUpcomingApi[]> {
  const { data } = await api.get<CreatorUpcomingApi[]>('/creator/upcoming-campaigns')
  return data
}

export async function fetchConversations(): Promise<ConversationSummaryItem[]> {
  const { data } = await api.get<ConversationSummaryItem[]>('/conversations')
  return data
}

export async function fetchCreatorPayouts(): Promise<CreatorPayoutApi[]> {
  const { data } = await api.get<CreatorPayoutApi[]>('/payouts/my')
  return data
}
