import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { BusinessDashboardKpiCardVm } from '../types'
import { colors } from '@/theme/colors'

type Props = {
  item: BusinessDashboardKpiCardVm
  onPress: () => void
}

function KpiIcon({ id, tone }: Pick<BusinessDashboardKpiCardVm, 'id' | 'tone'>) {
  const color = tone === 'highlight' ? colors.primary : colors.text.secondary.light

  if (id === 'pending-applications') {
    return <Ionicons name="mail-unread-outline" size={18} color={color} />
  }
  if (id === 'unread-messages') {
    return <Ionicons name="chatbubble-ellipses-outline" size={18} color={color} />
  }
  if (id === 'active-campaigns') {
    return <Ionicons name="briefcase-outline" size={18} color={color} />
  }

  return <Ionicons name="calendar-outline" size={18} color={color} />
}

export function BusinessKpiCard({ item, onPress }: Props) {
  if (item.state === 'loading') {
    return (
      <View style={[styles.card, item.tone === 'highlight' && styles.cardAccent]}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonValue} />
        <View style={styles.skeletonIcon} />
      </View>
    )
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        item.tone === 'highlight' && styles.cardAccent,
        pressed && styles.cardPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${item.label}: ${item.valueDisplay}`}
    >
      <Text style={[styles.label, item.tone === 'highlight' && styles.labelAccent]}>
        {item.label}
      </Text>

      <View style={styles.cardFooter}>
        <Text
          style={[
            styles.value,
            item.tone === 'highlight' && styles.valueAccent,
            item.state === 'error' && styles.valueError,
          ]}
          numberOfLines={1}
        >
          {item.valueDisplay}
        </Text>
        <View style={[styles.iconWrap, item.tone === 'highlight' && styles.iconWrapAccent]}>
          <KpiIcon id={item.id} tone={item.tone} />
        </View>
      </View>

      <Text
        style={[styles.subtitle, item.state === 'error' && styles.subtitleError]}
        numberOfLines={2}
      >
        {item.subtitle}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    width: '48.5%',
    minHeight: 116,
    backgroundColor: colors.surface.light,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border.light,
    justifyContent: 'space-between',
    gap: 10,
    borderCurve: 'continuous',
  } as object,
  cardAccent: {
    backgroundColor: '#f7f3ff',
    borderColor: '#ddd1fb',
  },
  cardPressed: {
    opacity: 0.78,
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
  valueError: {
    color: colors.text.secondary.light,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.text.secondary.light,
  },
  subtitleError: {
    color: colors.error,
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
  skeletonTitle: {
    width: '62%',
    height: 14,
    borderRadius: 999,
    backgroundColor: colors.border.light,
    opacity: 0.7,
  },
  skeletonValue: {
    width: '50%',
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
