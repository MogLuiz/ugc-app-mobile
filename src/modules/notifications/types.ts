export type NotificationType =
  | 'message_received'
  | 'direct_invite_received'
  | 'open_offer_selected'
  | 'completion_confirmation_required'
  | 'payout_updated'
  | string

export type NotificationData = {
  conversationId?: string
  contractRequestId?: string
  openOfferId?: string | null
  payoutId?: string
  paymentId?: string
  companyName?: string
  status?: string
  amountCents?: number
  currency?: string
  messageId?: string
  [key: string]: unknown
}

export type NotificationItem = {
  id: string
  type: NotificationType
  title: string
  body: string
  data: NotificationData | null
  sourceType: string
  sourceId: string | null
  dedupeKey: string | null
  readAt: string | null
  pushedAt: string | null
  lastPushError: string | null
  createdAt: string
  updatedAt: string
}

export type NotificationsResponse = {
  items: NotificationItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type UnreadCountResponse = {
  count: number
}
