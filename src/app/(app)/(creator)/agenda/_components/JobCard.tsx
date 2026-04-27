import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import {
  bookingStatusBorderColor,
  getMobileCardDescriptionTitle,
  getMobilePinLineText,
} from '@/modules/creator-calendar/lib/calendar-display'
import { VISUAL_STATUS_BADGE_LABEL } from '@/modules/creator-calendar/lib/calendar-view-model'
import type { UiCalendarEvent, VisualCalendarStatus } from '@/modules/creator-calendar/types'
import { colors } from '@/theme/colors'

type StatusStyle = { dot: string; bg: string; text: string }

const STATUS_STYLE: Record<VisualCalendarStatus, StatusStyle> = {
  confirmed: { dot: '#10b981', bg: '#d1fae5', text: '#065f46' },
  pending: { dot: '#f59e0b', bg: '#fef3c7', text: '#92400e' },
  completed: { dot: '#94a3b8', bg: '#f1f5f9', text: '#475569' },
  cancelled: { dot: '#ef4444', bg: '#fee2e2', text: '#991b1b' },
}

type JobCardProps = {
  event: UiCalendarEvent
  onPress: () => void
}

export function JobCard({ event, onPress }: JobCardProps) {
  const tone = STATUS_STYLE[event.visualStatus]
  const pinText = getMobilePinLineText(event)
  const descTitle = getMobileCardDescriptionTitle(event)
  const borderColor = bookingStatusBorderColor(event.bookingStatus)
  const initial = event.company.charAt(0).toUpperCase()

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, { borderLeftColor: borderColor }, pressed && styles.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel={`${event.company} · ${descTitle}`}
    >
      <View style={styles.topRow}>
        <View style={styles.avatar}>
          {event.companyPhotoUrl ? (
            <Image source={{ uri: event.companyPhotoUrl }} style={styles.avatarImg} />
          ) : (
            <Text style={styles.avatarInitial}>{initial}</Text>
          )}
        </View>

        <View style={styles.topInfo}>
          <Text style={styles.companyName} numberOfLines={1}>
            {event.company}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: tone.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: tone.dot }]} />
            <Text style={[styles.statusText, { color: tone.text }]}>
              {VISUAL_STATUS_BADGE_LABEL[event.visualStatus]}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <Text style={styles.jobKind}>{event.jobKindLabel}</Text>
      <Text style={styles.jobTitle} numberOfLines={2}>
        {descTitle}
      </Text>

      <View style={styles.divider} />

      <View style={styles.metaRow}>
        <Ionicons name="time-outline" size={14} color="#94a3b8" />
        <Text style={styles.metaText}>
          {event.startLabel} — {event.endLabel} · {event.durationLabel}
        </Text>
      </View>
      <View style={styles.metaRow}>
        <Ionicons name="location-outline" size={14} color="#94a3b8" />
        <Text style={styles.metaText} numberOfLines={1}>
          {pinText}
        </Text>
      </View>

      <View style={styles.footer}>
        <View />
        <Text style={styles.detailsCta}>Ver detalhes</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderLeftWidth: 4,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 14,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarImg: {
    width: 40,
    height: 40,
  },
  avatarInitial: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
  },
  topInfo: {
    flex: 1,
    gap: 6,
  },
  companyName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary.light,
    letterSpacing: -0.2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  jobKind: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.secondary.light,
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary.light,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  metaText: {
    flex: 1,
    fontSize: 13,
    color: colors.text.secondary.light,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  detailsCta: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
})
