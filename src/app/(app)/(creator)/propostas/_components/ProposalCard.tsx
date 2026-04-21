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


function getVisualLabel(item: ContractRequestItem): { label: string; isOffer: boolean } {
  const isOffer = Boolean(item.openOfferId)
  return { label: isOffer ? 'OFERTA ABERTA' : 'CONVITE DIRETO', isOffer }
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
  const { label: visualLabel, isOffer } = getVisualLabel(item)
  const amount = item.pricing?.totalAmount ?? item.totalAmount ?? item.totalPrice
  const effectiveExpiresAt = isPending ? getEffectiveExpiresAt(item) : null
  const locationLine = getLocationLine(item)

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      {/* Seção 1: badge de tipo + valor */}
      <View style={styles.topRow}>
        <View style={[styles.kindBadge, isOffer ? styles.kindBadgeOffer : styles.kindBadgeDirect]}>
          <Text style={[styles.kindLabel, isOffer ? styles.kindLabelOffer : styles.kindLabelDirect]}>
            {visualLabel}
          </Text>
        </View>
        <View style={styles.amountBlock}>
          <Text style={styles.amountLabel}>VALOR BRUTO</Text>
          <Text style={styles.amount}>{formatAmount(amount)}</Text>
        </View>
      </View>

      {/* Seção 2: nome da empresa */}
      <Text style={styles.companyName} numberOfLines={2}>
        {item.companyName ?? 'Empresa'}
      </Text>

      {/* Seção 3: descrição em caixa cinza */}
      {item.description ? (
        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionText} numberOfLines={3}>
            {item.description}
          </Text>
        </View>
      ) : null}

      {/* Seção 4: detalhes com ícones */}
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

      {/* Seção 5: expiry badge só para PENDING — sem texto de status redundante */}
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

  // Seção 1
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  kindBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  kindBadgeDirect: {
    backgroundColor: '#fef3c7',
  },
  kindBadgeOffer: {
    backgroundColor: colors.primary + '18',
  },
  kindLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  kindLabelDirect: {
    color: '#92400e',
  },
  kindLabelOffer: {
    color: '#6a36d5',
  },
  amountBlock: {
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text.secondary.light,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  amount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#6a36d5',
    marginTop: 2,
  },

  // Seção 2
  companyName: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text.primary.light,
    letterSpacing: -0.2,
  },

  // Seção 3
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

  // Seção 4
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

  // Seção 5
  footer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  statusSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.secondary.light,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
})
