import { colors } from '@/theme/colors'
import { StyleSheet, View } from 'react-native'

function SkeletonLine({ width, height = 12 }: { width: string | number; height?: number }) {
  return (
    <View style={[styles.line, { width: width as number, height, borderRadius: height / 2 }]} />
  )
}

function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar} />
        <View style={styles.headerText}>
          <SkeletonLine width="60%" height={13} />
          <SkeletonLine width="40%" height={11} />
        </View>
      </View>
      <View style={styles.body}>
        <SkeletonLine width="80%" />
        <SkeletonLine width="50%" />
      </View>
      <View style={styles.footer}>
        <SkeletonLine width={60} height={24} />
        <SkeletonLine width={80} height={13} />
      </View>
    </View>
  )
}

export function ProposalSkeleton() {
  return (
    <View style={styles.container}>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  card: {
    backgroundColor: colors.surface.light,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border.light,
  },
  headerText: {
    flex: 1,
    gap: 6,
  },
  body: {
    gap: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  line: {
    backgroundColor: colors.border.light,
  },
})
