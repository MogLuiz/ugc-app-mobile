import { StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/theme/colors'
import type { CreatorKpiCardVm } from '@/modules/creator-home/types'

function KpiIcon({ id, accent }: { id: CreatorKpiCardVm['id']; accent?: 'primary' }) {
  const color = accent === 'primary' ? colors.primary : colors.text.secondary.light

  if (id === 'confirmed') {
    return <Ionicons name="briefcase-outline" size={18} color={color} />
  }
  if (id === 'pending') {
    return <Ionicons name="mail-unread-outline" size={18} color={color} />
  }
  if (id === 'earnings') {
    return <Ionicons name="wallet-outline" size={18} color={color} />
  }

  return <Ionicons name="star-outline" size={18} color={color} />
}

function KpiSkeleton() {
  return (
    <View style={styles.grid}>
      {Array.from({ length: 4 }).map((_, index) => (
        <View key={index} style={[styles.card, index === 0 && styles.cardAccent]}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonValue} />
          <View style={styles.skeletonIcon} />
        </View>
      ))}
    </View>
  )
}

export function CreatorKpiSection({
  items,
  isLoading,
  error,
}: {
  items: CreatorKpiCardVm[]
  isLoading: boolean
  error: string | null
}) {
  return (
    <View style={styles.section}>
      {isLoading ? <KpiSkeleton /> : null}

      {!isLoading && error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Resumo indisponível</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {!isLoading && !error ? (
        <View style={styles.grid}>
          {items.map((item) => (
            <View
              key={item.id}
              style={[styles.card, item.accent === 'primary' && styles.cardAccent]}
            >
              <Text style={[styles.label, item.accent === 'primary' && styles.labelAccent]}>
                {item.label}
              </Text>
              <View style={styles.cardFooter}>
                <Text
                  style={[styles.value, item.accent === 'primary' && styles.valueAccent]}
                  numberOfLines={1}
                >
                  {item.valueDisplay}
                </Text>
                <View
                  style={[styles.iconWrap, item.accent === 'primary' && styles.iconWrapAccent]}
                >
                  <KpiIcon id={item.id} accent={item.accent} />
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    gap: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    width: '48.5%',
    minHeight: 112,
    backgroundColor: colors.surface.light,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border.light,
    justifyContent: 'space-between',
    borderCurve: 'continuous',
  } as object,
  cardAccent: {
    backgroundColor: '#f7f3ff',
    borderColor: '#ddd1fb',
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: colors.text.secondary.light,
    lineHeight: 16,
  },
  labelAccent: {
    color: colors.primary,
  },
  value: {
    flex: 1,
    fontSize: 24,
    fontWeight: '800',
    color: colors.text.primary.light,
    letterSpacing: -0.5,
    marginRight: 8,
  },
  valueAccent: {
    color: colors.primary,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  iconWrapAccent: {
    backgroundColor: '#ede9fb',
  },
  errorCard: {
    backgroundColor: colors.surface.light,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary.light,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
  },
  skeletonTitle: {
    width: '78%',
    height: 14,
    borderRadius: 999,
    backgroundColor: colors.border.light,
    opacity: 0.7,
  },
  skeletonValue: {
    width: '56%',
    height: 30,
    borderRadius: 999,
    backgroundColor: colors.border.light,
    opacity: 0.55,
  },
  skeletonIcon: {
    alignSelf: 'flex-end',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border.light,
    opacity: 0.5,
  },
})
