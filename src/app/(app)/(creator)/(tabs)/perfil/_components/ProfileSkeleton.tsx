import { StyleSheet, View } from 'react-native'
import { colors } from '@/theme/colors'
import theme from '@/theme/theme'

function Block({
  width,
  height,
  radius = 6,
}: {
  width: number | `${number}%`
  height: number
  radius?: number
}) {
  return <View style={[styles.block, { width: width as number, height, borderRadius: radius }]} />
}

function AvatarSkeleton() {
  return (
    <View style={styles.avatarSection}>
      <View style={styles.avatarCircle} />
      <Block width="40%" height={16} />
      <Block width="25%" height={12} />
    </View>
  )
}

function FormSkeleton() {
  return (
    <View style={styles.card}>
      <Block width="35%" height={14} />
      <Block width="100%" height={44} radius={12} />
      <Block width="100%" height={80} radius={12} />
      <Block width="100%" height={44} radius={12} />
    </View>
  )
}

function PortfolioSkeleton() {
  return (
    <View style={styles.card}>
      <Block width="30%" height={14} />
      <View style={styles.portfolioRow}>
        <View style={styles.portfolioItem} />
        <View style={styles.portfolioItem} />
      </View>
    </View>
  )
}

export function ProfileSkeleton() {
  return (
    <View style={styles.container}>
      <AvatarSkeleton />
      <FormSkeleton />
      <PortfolioSkeleton />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.s4,
    paddingTop: theme.spacing.s3,
    paddingHorizontal: theme.spacing.s5,
    opacity: 0.5,
  },
  block: {
    backgroundColor: colors.border.light,
  },
  avatarSection: {
    alignItems: 'center',
    gap: theme.spacing.s2,
    paddingVertical: theme.spacing.s4,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.border.light,
    marginBottom: theme.spacing.s2,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadii.card,
    padding: theme.spacing.s5,
    gap: theme.spacing.s3,
  },
  portfolioRow: {
    flexDirection: 'row',
    gap: 10,
  },
  portfolioItem: {
    flex: 1,
    aspectRatio: 3 / 4,
    borderRadius: 16,
    backgroundColor: colors.border.light,
  },
})
