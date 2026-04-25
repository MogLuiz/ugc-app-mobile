import { StyleSheet, Text, View } from 'react-native'
import type { PayoutStatus } from '@/modules/creator-payouts/types'

type Config = { label: string; bg: string; text: string }

const STATUS_CONFIG: Record<PayoutStatus, Config> = {
  not_due: { label: 'Não liberado', bg: '#f1f5f9', text: '#64748b' },
  pending: { label: 'A processar', bg: '#fefce8', text: '#a16207' },
  scheduled: { label: 'Agendado', bg: '#eff6ff', text: '#1d4ed8' },
  paid: { label: 'Pago', bg: '#f0fdf4', text: '#15803d' },
  failed: { label: 'Falhou', bg: '#fef2f2', text: '#dc2626' },
  canceled: { label: 'Cancelado', bg: '#f1f5f9', text: '#94a3b8' },
}

type Props = { status: PayoutStatus; size?: 'sm' | 'md' }

export function PayoutStatusBadge({ status, size = 'sm' }: Props) {
  const config = STATUS_CONFIG[status]
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, size === 'md' && styles.badgeMd]}>
      <Text style={[styles.label, { color: config.text }, size === 'md' && styles.labelMd]}>
        {config.label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeMd: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
  labelMd: {
    fontSize: 13,
  },
})
