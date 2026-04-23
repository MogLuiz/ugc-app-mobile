import { Ionicons } from '@expo/vector-icons'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '@/theme/colors'
import { adaptOpportunityCard } from '../helpers'
import type { OpportunityListItem } from '../types'

type Props = {
  item: OpportunityListItem
  onPress?: () => void
}

export function OpportunityCard({ item, onPress }: Props) {
  const viewModel = adaptOpportunityCard(item)
  const isPressable = Boolean(onPress)

  return (
    <Pressable
      disabled={!isPressable}
      onPress={onPress}
      style={({ pressed }) => [styles.card, isPressable && pressed && styles.cardPressed]}
    >
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {viewModel.title}
        </Text>
        <View style={styles.amountWrap}>
          <Text style={styles.amountLabel}>Cache</Text>
          <Text style={styles.amountValue}>{viewModel.amountDisplay}</Text>
        </View>
      </View>

      <View style={styles.descriptionRow}>
        <Ionicons name="document-text-outline" size={14} color={colors.primary} />
        <Text style={styles.description} numberOfLines={2}>
          {viewModel.description}
        </Text>
      </View>

      <View style={styles.metaGrid}>
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={14} color={colors.primary} />
          <Text style={styles.metaText}>{viewModel.dateDisplay}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={14} color={colors.primary} />
          <Text style={styles.metaText}>{viewModel.durationDisplay}</Text>
        </View>
        <View style={[styles.metaRow, styles.locationRow]}>
          <Ionicons name="location-outline" size={14} color={colors.primary} />
          <Text style={styles.metaText} numberOfLines={1}>
            {viewModel.locationDisplay}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.deadline}>{viewModel.deadlineDisplay}</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.light,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 14,
  },
  cardPressed: {
    opacity: 0.88,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
    color: '#6a36d5',
  },
  amountWrap: {
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  amountValue: {
    marginTop: 4,
    fontSize: 24,
    fontWeight: '900',
    color: '#6a36d5',
  },
  descriptionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  description: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#64748b',
  },
  metaGrid: {
    gap: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationRow: {
    alignItems: 'flex-start',
  },
  metaText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#475569',
  },
  footer: {
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  deadline: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
  },
})
