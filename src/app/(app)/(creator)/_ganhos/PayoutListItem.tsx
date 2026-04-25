import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { formatCurrency, formatFullDate, formatShortDate } from '@/lib/formatters'
import type { CreatorPayout } from '@/modules/creator-payouts/types'
import { colors } from '@/theme/colors'
import theme from '@/theme/theme'
import { PayoutStatusBadge } from './PayoutStatusBadge'

type Props = {
  payout: CreatorPayout
  onPress: (payout: CreatorPayout) => void
}

export function PayoutListItem({ payout, onPress }: Props) {
  const isPaid = payout.status === 'paid'
  const dateLabel = isPaid && payout.paidAt
    ? `Recebido em ${formatFullDate(payout.paidAt)}`
    : `Criado em ${formatFullDate(payout.createdAt)}`

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={() => onPress(payout)}
      accessibilityRole="button"
    >
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={styles.date}>{dateLabel}</Text>
          {isPaid ? (
            <View style={styles.paidRow}>
              <Ionicons name="checkmark-circle" size={14} color="#15803d" />
              <Text style={styles.paidLabel}>Pago</Text>
            </View>
          ) : (
            <PayoutStatusBadge status={payout.status} />
          )}
          {payout.scheduledFor && payout.status === 'scheduled' ? (
            <Text style={styles.scheduled}>
              Previsto {formatShortDate(payout.scheduledFor)}
            </Text>
          ) : null}
        </View>

        <View style={styles.right}>
          <Text style={[styles.amount, isPaid && styles.amountPaid]}>
            {formatCurrency(payout.amountCents / 100)}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.borderSubtle} />
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    backgroundColor: colors.surface.light,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderCurve: 'continuous',
  } as object,
  pressed: {
    opacity: 0.7,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  left: {
    flex: 1,
    gap: 6,
  },
  date: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  paidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  paidLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#15803d',
  },
  scheduled: {
    fontSize: 12,
    color: '#1d4ed8',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textStrong,
  },
  amountPaid: {
    color: '#15803d',
  },
})
