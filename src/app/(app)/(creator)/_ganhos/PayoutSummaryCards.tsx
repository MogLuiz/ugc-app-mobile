import { StyleSheet, Text, View } from 'react-native'
import { formatCurrency } from '@/lib/formatters'
import { colors } from '@/theme/colors'
import theme from '@/theme/theme'

type Props = {
  aReceberCents: number
  recebidoCents: number
  aReceberCount: number
  recebidoCount: number
  isLoading: boolean
}

function SkeletonCard() {
  return (
    <View style={[styles.card, styles.cardSkeleton]}>
      <View style={styles.skeletonLabel} />
      <View style={styles.skeletonValue} />
      <View style={styles.skeletonSub} />
    </View>
  )
}

export function PayoutSummaryCards({
  aReceberCents,
  recebidoCents,
  aReceberCount,
  recebidoCount,
  isLoading,
}: Props) {
  if (isLoading) {
    return (
      <View style={styles.grid}>
        <SkeletonCard />
        <SkeletonCard />
      </View>
    )
  }

  const aReceberActive = aReceberCents > 0
  const recebidoActive = recebidoCents > 0

  return (
    <View style={styles.grid}>
      <View style={[styles.card, aReceberActive && styles.cardPurple]}>
        <Text style={[styles.cardLabel, aReceberActive && styles.labelPurple]}>A receber</Text>
        <Text style={[styles.cardValue, aReceberActive && styles.valuePurple]} numberOfLines={1}>
          {formatCurrency(aReceberCents / 100)}
        </Text>
        <Text style={styles.cardSub} numberOfLines={1}>
          {aReceberCount > 0
            ? `${aReceberCount} repasse${aReceberCount > 1 ? 's' : ''} liberado${aReceberCount > 1 ? 's' : ''}`
            : 'Aguardando pagamento'}
        </Text>
      </View>

      <View style={[styles.card, recebidoActive && styles.cardGreen]}>
        <Text style={[styles.cardLabel, recebidoActive && styles.labelGreen]}>Recebido</Text>
        <Text style={[styles.cardValue, recebidoActive && styles.valueGreen]} numberOfLines={1}>
          {formatCurrency(recebidoCents / 100)}
        </Text>
        <Text style={styles.cardSub} numberOfLines={1}>
          {recebidoCount > 0
            ? `${recebidoCount} repasse${recebidoCount > 1 ? 's' : ''} pago${recebidoCount > 1 ? 's' : ''}`
            : 'Nenhum ainda'}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface.light,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: 14,
    gap: 4,
    borderCurve: 'continuous',
  } as object,
  cardSkeleton: {
    minHeight: 96,
    gap: 8,
    justifyContent: 'center',
  },
  cardPurple: {
    backgroundColor: '#f7f3ff',
    borderColor: '#ddd1fb',
  },
  cardGreen: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: theme.colors.textSecondary,
  },
  labelPurple: {
    color: colors.primary,
  },
  labelGreen: {
    color: '#15803d',
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textStrong,
    letterSpacing: -0.5,
  },
  valuePurple: {
    color: colors.primary,
  },
  valueGreen: {
    color: '#15803d',
  },
  cardSub: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  skeletonLabel: {
    width: '60%',
    height: 12,
    borderRadius: 999,
    backgroundColor: colors.border.light,
  },
  skeletonValue: {
    width: '80%',
    height: 24,
    borderRadius: 999,
    backgroundColor: colors.border.light,
    opacity: 0.7,
  },
  skeletonSub: {
    width: '50%',
    height: 11,
    borderRadius: 999,
    backgroundColor: colors.border.light,
    opacity: 0.5,
  },
})
