import { StyleSheet, View } from 'react-native'
import { colors } from '@/theme/colors'

function SkeletonLine({ width, height = 12 }: { width: string | number; height?: number }) {
  return (
    <View style={[styles.line, { width: width as number, height, borderRadius: height / 2 }]} />
  )
}

function SkeletonRow() {
  return (
    <View style={styles.row}>
      <SkeletonLine width="65%" height={13} />
      <SkeletonLine width="40%" height={11} />
    </View>
  )
}

export function HomeSectionSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <View style={styles.container}>
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={styles.card}>
          <SkeletonRow />
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  card: {
    backgroundColor: colors.surface.light,
    borderRadius: 14,
    padding: 16,
    opacity: 0.5,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  row: {
    gap: 8,
  },
  line: {
    backgroundColor: colors.border.light,
  },
})
