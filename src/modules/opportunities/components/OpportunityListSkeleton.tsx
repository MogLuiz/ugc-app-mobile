import { StyleSheet, View } from 'react-native'
import { colors } from '@/theme/colors'

function SkeletonLine({ width, height = 12 }: { width: string | number; height?: number }) {
  return (
    <View style={[styles.line, { width: width as number, height, borderRadius: height / 2 }]} />
  )
}

function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <SkeletonLine width="36%" height={18} />
        <View style={styles.amountWrap}>
          <SkeletonLine width={36} height={10} />
          <SkeletonLine width={82} height={22} />
        </View>
      </View>
      <View style={styles.body}>
        <SkeletonLine width="92%" />
        <SkeletonLine width="68%" />
      </View>
      <View style={styles.meta}>
        <SkeletonLine width="42%" />
        <SkeletonLine width="38%" />
        <SkeletonLine width="88%" />
      </View>
    </View>
  )
}

export function OpportunityListSkeleton({ items = 4 }: { items?: number }) {
  return (
    <View style={styles.container}>
      {Array.from({ length: items }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  card: {
    backgroundColor: colors.surface.light,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 18,
    opacity: 0.55,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  amountWrap: {
    alignItems: 'flex-end',
    gap: 8,
  },
  body: {
    gap: 8,
  },
  meta: {
    gap: 10,
  },
  line: {
    backgroundColor: colors.border.light,
  },
})
