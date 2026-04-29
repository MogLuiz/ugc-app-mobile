import type { Href } from 'expo-router'
import type { NotificationItem } from './types'

export type NotificationNavigationInput = Pick<
  NotificationItem,
  'type' | 'data' | 'sourceType' | 'sourceId'
>

type NotificationDestination = {
  href: Href
}

function getString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function getConversationId(notification: NotificationNavigationInput): string | null {
  return (
    getString(notification.data?.conversationId) ??
    (notification.sourceType === 'conversation' ? getString(notification.sourceId) : null)
  )
}

function getContractRequestId(notification: NotificationNavigationInput): string | null {
  return (
    getString(notification.data?.contractRequestId) ??
    (notification.sourceType === 'contract_request' ? getString(notification.sourceId) : null)
  )
}

export function resolveNotificationDestination(
  notification: NotificationNavigationInput,
): NotificationDestination | null {
  switch (notification.type) {
    case 'message_received': {
      const conversationId = getConversationId(notification)
      if (!conversationId) return null
      return {
        href: `/(creator)/mensagens/${conversationId}` as Href,
      }
    }

    case 'direct_invite_received':
    case 'open_offer_selected':
    case 'completion_confirmation_required': {
      const contractRequestId = getContractRequestId(notification)
      if (!contractRequestId) return null
      return {
        href: `/(creator)/propostas/${contractRequestId}` as Href,
      }
    }

    case 'payout_updated':
      return {
        href: '/(creator)/ganhos' as Href,
      }

    default:
      return null
  }
}
