import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { formatAmount, formatDurationMinutes, formatShortDate } from '@/lib/formatters'
import { colors } from '@/theme/colors'
import type { ContractRequestItem } from '@/modules/contract-requests/types'
import { getEffectiveExpiresAt } from '@/modules/contract-requests/utils'
import { ExpirationBadge } from './ExpirationBadge'

type Props = {
  item: ContractRequestItem
  onPress: () => void
}

function getLocationLine(item: ContractRequestItem): string {
  const address = item.jobFormattedAddress ?? item.jobAddress
  if (item.mode === 'REMOTE') return 'Remoto'
  if (item.mode === 'HYBRID') return address ? `Híbrido · ${address}` : 'Híbrido'
  return address ?? 'Endereço a combinar'
}

function getTimeLabel(startsAt: string): string {
  return new Date(startsAt).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ProposalCard({ item, onPress }: Props) {
  const isPending = item.status === 'PENDING_ACCEPTANCE'
  const amount = item.pricing?.totalAmount ?? item.totalAmount ?? item.totalPrice
  const effectiveExpiresAt = isPending ? getEffectiveExpiresAt(item) : null
  const locationLine = getLocationLine(item)

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      {/* Seção 1: valor alinhado à direita */}
      <View style={styles.topRow}>
        <Text style={styles.companyName} numberOfLines={2}>
          {item.companyName ?? 'Empresa'}
        </Text>
        <Text style={styles.amount}>{formatAmount(amount)}</Text>
      </View>

      {/* Seção 2: descrição em caixa cinza */}
      {item.description ? (
        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionText} numberOfLines={3}>
            {item.description}
          </Text>
        </View>
      ) : null}

      {/* Seção 3: detalhes com ícones */}
      <View style={styles.detailsBlock}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={14} color={colors.primary} />
          <Text style={styles.detailText}>
            {formatShortDate(item.startsAt)} · {getTimeLabel(item.startsAt)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={14} color={colors.primary} />
          <Text style={styles.detailText}>{formatDurationMinutes(item.durationMinutes)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={14} color={colors.primary} style={styles.locationIcon} />
          <Text style={styles.detailText} numberOfLines={2}>
            {locationLine}
          </Text>
        </View>
      </View>

      {/* Seção 4: expiry badge só para PENDING */}
      {isPending && effectiveExpiresAt ? (
        <View style={styles.footer}>
          <ExpirationBadge expiresAt={effectiveExpiresAt} />
        </View>
      ) : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.light,
    borderRadius: 20,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderCurve: 'continuous',
  } as object,
  cardPressed: {
    opacity: 0.88,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  companyName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: colors.text.primary.light,
    letterSpacing: -0.2,
  },
  amount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#6a36d5',
  },
  descriptionBox: {
    backgroundColor: '#f6f5f8',
    borderRadius: 14,
    padding: 12,
  },
  descriptionText: {
    fontSize: 13,
    color: colors.text.secondary.light,
    lineHeight: 20,
  },
  detailsBlock: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  locationIcon: {
    marginTop: 1,
  },
  detailText: {
    flex: 1,
    fontSize: 13,
    color: colors.text.secondary.light,
    lineHeight: 18,
  },
  footer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
})
