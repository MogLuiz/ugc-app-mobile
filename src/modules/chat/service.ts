import { api } from '@/lib/api'
import type { ConversationListItem, ConversationMessageItem, ConversationMessagesPage } from './types'

export async function getConversations(params?: {
  contractRequestId?: string
}): Promise<ConversationListItem[]> {
  const { data } = await api.get<ConversationListItem[]>('/conversations', {
    params: params?.contractRequestId ? { contractRequestId: params.contractRequestId } : undefined,
  })
  return data
}

export async function getConversationMessages(
  conversationId: string,
  params?: { cursor?: string; limit?: number },
): Promise<ConversationMessagesPage> {
  const { data } = await api.get<ConversationMessagesPage>(
    `/conversations/${conversationId}/messages`,
    {
      params: {
        limit: params?.limit ?? 30,
        ...(params?.cursor ? { cursor: params.cursor } : {}),
      },
    },
  )
  return data
}

export async function sendConversationMessage(
  conversationId: string,
  content: string,
): Promise<ConversationMessageItem> {
  const { data } = await api.post<ConversationMessageItem>(
    `/conversations/${conversationId}/messages`,
    { content },
  )
  return data
}
