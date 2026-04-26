export type ConversationParticipantRole = 'COMPANY' | 'CREATOR'

export type ConversationListItem = {
  id: string
  contractRequestId: string
  createdAt: string
  lastMessageAt: string | null
  closedAt: string | null
  unreadCount: number
  participant: {
    userId: string
    role: ConversationParticipantRole
    name: string
    avatarUrl: string | null
  } | null
  lastMessage: {
    id: string
    senderUserId: string
    content: string
    contentType: 'TEXT'
    createdAt: string
  } | null
}

export type ConversationMessageItem = {
  id: string
  conversationId: string
  senderUserId: string
  content: string
  contentType: 'TEXT'
  createdAt: string
}

export type ConversationMessagesPage = {
  items: ConversationMessageItem[]
  nextCursor: string | null
  hasMore: boolean
  polling: {
    latestCursor: string | null
    supportsAfterCursor: boolean
    dedupeKey: 'id'
  }
}

export type LocalMessage = ConversationMessageItem & {
  deliveryStatus: 'sending' | 'sent' | 'failed'
  localError?: string
}
