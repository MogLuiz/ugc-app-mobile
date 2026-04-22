import { StyleSheet, Text, View } from 'react-native'
import { formatAmount } from '@/lib/formatters'
import type { ContractRequestItem } from '@/modules/contract-requests/types'

type Props = {
  item: ContractRequestItem
}

export function PaymentSection({ item }: Props) {
  const total = item.totalAmount ?? item.totalPrice
  const hasTransport = (item.transportFee ?? 0) > 0
  const transportLabel = item.transport?.formatted ?? formatAmount(item.transportFee)

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.totalLabel}>PAGAMENTO TOTAL</Text>
          <Text style={styles.totalAmount}>{formatAmount(total)}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>GARANTIDO</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.breakdown}>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Serviço</Text>
          <Text style={styles.breakdownValue}>{formatAmount(item.creatorBasePrice)}</Text>
        </View>
        {hasTransport ? (
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Transporte</Text>
            <Text style={styles.breakdownValue}>{transportLabel}</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.note}>
        Pagamento garantido pela plataforma após a conclusão do serviço.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 20,
    gap: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 32,
  },
  badge: {
    backgroundColor: 'rgba(137,90,246,0.2)',
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#d0bcff',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 12,
  },
  breakdown: {
    gap: 8,
    marginBottom: 14,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 13,
    color: '#94a3b8',
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e2e8f0',
  },
  note: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
  },
})
