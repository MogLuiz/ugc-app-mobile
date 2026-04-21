import { StyleSheet, Text, View } from 'react-native'
import { formatOfferExpiry } from '@/lib/formatters'
import { colors } from '@/theme/colors'

type Props = {
  expiresAt: string
}

export function ExpirationBadge({ expiresAt }: Props) {
  const label = formatOfferExpiry(expiresAt)
  const isExpired = label === 'Expirada'

  return (
    <View style={[styles.badge, isExpired ? styles.expiredBg : styles.expiringBg]}>
      <Text style={[styles.label, isExpired ? styles.expiredText : styles.expiringText]}>
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  expiringBg: {
    backgroundColor: '#fef3c7',
  },
  expiredBg: {
    backgroundColor: '#fee2e2',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
  expiringText: {
    color: '#92400e',
  },
  expiredText: {
    color: '#991b1b',
  },
})
