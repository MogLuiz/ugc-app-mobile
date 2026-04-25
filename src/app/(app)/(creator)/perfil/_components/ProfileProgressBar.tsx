import { StyleSheet, Text, View } from 'react-native'
import { colors } from '@/theme/colors'
import theme from '@/theme/theme'

type Props = {
  avatarUrl: string | null
  name: string
  bio: string
  phone: string
  city: string
  instagram: string
  tiktok: string
  portfolioLength: number
}

const CRITERIA_COUNT = 7

function calculateProgress(props: Props): number {
  let completed = 0
  if (props.avatarUrl) completed++
  if (props.name.trim()) completed++
  if (props.bio.trim()) completed++
  if (props.phone.trim()) completed++
  if (props.city.trim()) completed++
  if (props.instagram.trim() || props.tiktok.trim()) completed++
  if (props.portfolioLength > 0) completed++
  return completed
}

export function ProfileProgressBar(props: Props) {
  const completed = calculateProgress(props)
  const percent = Math.round((completed / CRITERIA_COUNT) * 100)

  if (percent >= 100) return null

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>Perfil {percent}% completo</Text>
        <Text style={styles.count}>{completed}/{CRITERIA_COUNT}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%` }]} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadii.card,
    padding: theme.spacing.s4,
    gap: theme.spacing.s2,
    shadowColor: '#1f2937',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  count: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  track: {
    height: 6,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
})
