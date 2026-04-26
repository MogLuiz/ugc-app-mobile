import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { formatCurrency, formatOfferExpiry, formatShortDate, getInitials } from '@/lib/formatters'
import {
  useAcceptContractRequestMutation,
  useRejectContractRequestMutation,
} from '@/modules/contract-requests/queries'
import type { CreatorHubItem } from '@/modules/contract-requests/creator-hub.types'
import { colors } from '@/theme/colors'

function resolveHref(item: CreatorHubItem): string {
  if (item.kind === 'open_offer_application' && item.openOfferId) {
    return `/(creator)/oportunidades/${item.openOfferId}`
  }
  return `/(creator)/propostas/${item.id}`
}

export function CreatorHubCard({
  item,
  onAccept,
  onReject,
}: {
  item: CreatorHubItem
  onAccept?: (id: string) => void
  onReject?: (id: string) => void
}) {
  const router = useRouter()
  const href = resolveHref(item)

  function handleCardPress() {
    router.push(href as never)
  }

  const showActions = item.primaryAction !== 'VIEW'
  const showAddress =
    (item.displayStatus === 'PENDING_INVITE' ||
      item.displayStatus === 'APPLICATION_PENDING' ||
      item.displayStatus === 'ACCEPTED') &&
    item.address &&
    item.address !== 'Local a combinar'

  return (
    <View style={styles.card}>
      <Pressable
        style={({ pressed }) => [styles.cardBody, pressed && styles.cardPressed]}
        onPress={handleCardPress}
      >
        {/* Company + job type + amount */}
        <View style={styles.identityBlock}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(item.company.name)}</Text>
          </View>
          <View style={styles.identityText}>
            <Text style={styles.companyName} numberOfLines={1}>
              {item.company.name}
            </Text>
            <Text style={styles.jobType} numberOfLines={1}>
              {item.title}
            </Text>
          </View>
          {item.totalAmount != null && (
            <Text style={styles.amount}>
              {formatCurrency(item.totalAmount / 100)}
            </Text>
          )}
          <Ionicons name="chevron-forward" size={16} color={colors.border.light} />
        </View>

        {/* Meta: date + location */}
        <View style={styles.metaRow}>
          {item.startsAt ? (
            <View style={styles.metaChip}>
              <Ionicons name="calendar-outline" size={11} color={colors.text.secondary.light} />
              <Text style={styles.metaText}>{formatShortDate(item.startsAt)}</Text>
            </View>
          ) : item.effectiveExpiresAt ? (
            <View style={styles.metaChip}>
              <Ionicons name="time-outline" size={11} color={colors.text.secondary.light} />
              <Text style={styles.metaText}>{formatOfferExpiry(item.effectiveExpiresAt)}</Text>
            </View>
          ) : null}

          {showAddress ? (
            <View style={styles.metaChip}>
              <Ionicons name="location-outline" size={11} color={colors.text.secondary.light} />
              <Text style={styles.metaText} numberOfLines={1}>
                {item.address}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Expiry warning strip */}
        {item.expiresSoon && item.effectiveExpiresAt ? (
          <View style={styles.expiryStrip}>
            <Ionicons name="time-outline" size={12} color="#92400e" />
            <Text style={styles.expiryText}>{formatOfferExpiry(item.effectiveExpiresAt)}</Text>
          </View>
        ) : null}
      </Pressable>

      {/* Action footer */}
      {showActions ? (
        <ActionFooter item={item} href={href} onAccept={onAccept} onReject={onReject} />
      ) : null}
    </View>
  )
}

function ActionFooter({
  item,
  href,
  onAccept,
  onReject,
}: {
  item: CreatorHubItem
  href: string
  onAccept?: (id: string) => void
  onReject?: (id: string) => void
}) {
  const router = useRouter()
  const acceptMutation = useAcceptContractRequestMutation()
  const rejectMutation = useRejectContractRequestMutation()
  const busy = acceptMutation.isPending || rejectMutation.isPending

  if (item.primaryAction === 'ACCEPT_OR_REJECT') {
    return (
      <View style={styles.actionsRow}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && !busy && styles.buttonPressed,
            busy && styles.buttonDisabled,
          ]}
          disabled={busy}
          onPress={() => {
            if (onAccept) {
              onAccept(item.id)
            } else {
              acceptMutation.mutate(item.id, {
                onError: (err) =>
                  Alert.alert(
                    'Erro',
                    err instanceof Error ? err.message : 'Não foi possível aceitar.',
                  ),
              })
            }
          }}
        >
          <Text style={styles.primaryButtonText}>
            {acceptMutation.isPending ? 'Aceitando…' : 'Aceitar'}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && !busy && styles.buttonPressed,
            busy && styles.buttonDisabled,
          ]}
          disabled={busy}
          onPress={() => {
            if (onReject) {
              onReject(item.id)
            } else {
              rejectMutation.mutate(
                { contractRequestId: item.id },
                {
                  onError: (err) =>
                    Alert.alert(
                      'Erro',
                      err instanceof Error ? err.message : 'Não foi possível recusar.',
                    ),
                },
              )
            }
          }}
        >
          <Text style={styles.secondaryButtonText}>
            {rejectMutation.isPending ? 'Recusando…' : 'Recusar'}
          </Text>
        </Pressable>
      </View>
    )
  }

  if (item.primaryAction === 'CONFIRM_OR_DISPUTE') {
    return (
      <Pressable
        style={({ pressed }) => [styles.confirmStrip, pressed && styles.confirmStripPressed]}
        onPress={() => router.push(href as never)}
      >
        <Text style={styles.confirmText}>Confirmar serviço realizado</Text>
        <Ionicons name="chevron-forward" size={14} color="#fff" />
      </Pressable>
    )
  }

  if (item.primaryAction === 'LEAVE_REVIEW') {
    return (
      <Pressable
        style={({ pressed }) => [styles.reviewStrip, pressed && styles.reviewStripPressed]}
        onPress={() => router.push(href as never)}
      >
        <Ionicons name="star-outline" size={13} color="#fff" />
        <Text style={styles.reviewText}>Avaliar empresa</Text>
        <Ionicons name="chevron-forward" size={14} color="#fff" />
      </Pressable>
    )
  }

  return null
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.light,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border.light,
    overflow: 'hidden',
  },
  cardBody: {
    padding: 14,
    gap: 10,
  },
  cardPressed: {
    opacity: 0.88,
  },

  amount: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: -0.3,
  },

  // Identity
  identityBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ede9fb',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  identityText: {
    flex: 1,
    gap: 2,
  },
  companyName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary.light,
    letterSpacing: -0.1,
  },
  jobType: {
    fontSize: 12,
    color: colors.text.secondary.light,
  },

  // Meta
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#f1f5f9',
    borderRadius: 100,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  metaText: {
    fontSize: 11,
    color: colors.text.secondary.light,
    fontWeight: '500',
  },

  // Expiry warning
  expiryStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#fef3c7',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  expiryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400e',
  },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  primaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: colors.primary,
    minHeight: 38,
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border.light,
    minHeight: 38,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary.light,
  },
  buttonPressed: {
    opacity: 0.88,
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  // Confirm strip
  confirmStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f59e0b',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  confirmStripPressed: {
    opacity: 0.88,
  },
  confirmText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },

  // Review strip
  reviewStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  reviewStripPressed: {
    opacity: 0.88,
  },
  reviewText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 6,
  },
})
