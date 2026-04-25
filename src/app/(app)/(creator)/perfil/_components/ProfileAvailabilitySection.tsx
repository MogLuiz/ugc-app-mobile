import { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/theme/colors'
import theme from '@/theme/theme'
import { TIME_OPTIONS } from '@/modules/creator-calendar/calendar-mappers'
import type { AvailabilityDay } from '@/modules/creator-calendar/types'

// ─── Types ───────────────────────────────────────────────────────────────────

type PickerState = { dayId: string; field: 'start' | 'end' } | null

type Props = {
  days: AvailabilityDay[]
  onUpdateDay: (id: string, field: 'enabled' | 'start' | 'end', value: boolean | string) => void
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}

// ─── Custom Toggle ────────────────────────────────────────────────────────────

const TRACK_W = 44
const TRACK_H = 26
const THUMB = 22
const PAD = 2
const TRAVEL = TRACK_W - PAD * 2 - THUMB // 18

function CustomAvailabilityToggle({
  enabled,
  onToggle,
  dayLabel,
}: {
  enabled: boolean
  onToggle: (v: boolean) => void
  dayLabel: string
}) {
  const progress = useSharedValue(enabled ? 1 : 0)

  useEffect(() => {
    progress.set(withTiming(enabled ? 1 : 0, { duration: 160, easing: Easing.out(Easing.ease) }))
  }, [enabled])

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.get(), [0, 1], ['#d1d5db', colors.primary]),
  }))

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(progress.get(), [0, 1], [PAD, PAD + TRAVEL]) }],
  }))

  return (
    <Pressable
      onPress={() => onToggle(!enabled)}
      hitSlop={10}
      accessibilityRole="switch"
      accessibilityState={{ checked: enabled }}
      accessibilityLabel={`${dayLabel}: ${enabled ? 'disponível, toque para desativar' : 'indisponível, toque para ativar'}`}
    >
      <Animated.View style={[tog.track, trackStyle]}>
        <Animated.View style={[tog.thumb, thumbStyle]} />
      </Animated.View>
    </Pressable>
  )
}

const tog = StyleSheet.create({
  track: {
    width: TRACK_W,
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    justifyContent: 'center',
  },
  thumb: {
    position: 'absolute',
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
    elevation: 2,
  },
})

// ─── Time Fields ──────────────────────────────────────────────────────────────

function AvailabilityTimeFields({
  start,
  end,
  onPressStart,
  onPressEnd,
}: {
  start: string
  end: string
  onPressStart: () => void
  onPressEnd: () => void
}) {
  return (
    <View style={tf.row}>
      <View style={tf.fieldGroup}>
        <Text style={tf.label}>INÍCIO</Text>
        <Pressable style={tf.button} onPress={onPressStart}>
          <Text style={tf.value} numberOfLines={1}>{start}</Text>
          <Ionicons name="chevron-down" size={11} color={theme.colors.textMuted} />
        </Pressable>
      </View>

      <View style={tf.fieldGroup}>
        <Text style={tf.label}>FIM</Text>
        <Pressable style={tf.button} onPress={onPressEnd}>
          <Text style={tf.value} numberOfLines={1}>{end}</Text>
          <Ionicons name="chevron-down" size={11} color={theme.colors.textMuted} />
        </Pressable>
      </View>
    </View>
  )
}

const tf = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 6,
    paddingBottom: 10,
  },
  fieldGroup: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 10,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textStrong,
    textAlign: 'center',
  },
})

// ─── Time Picker Modal ────────────────────────────────────────────────────────

const ITEM_H = 48

function AvailabilityTimePickerModal({
  pickerState,
  days,
  onSelect,
  onClose,
}: {
  pickerState: PickerState
  days: AvailabilityDay[]
  onSelect: (time: string) => void
  onClose: () => void
}) {
  const scrollRef = useRef<ScrollView>(null)

  const currentDay = pickerState ? days.find((d) => d.id === pickerState.dayId) : null
  const currentValue = pickerState?.field === 'start' ? currentDay?.start : currentDay?.end
  const title =
    pickerState?.field === 'start' ? 'Selecionar horário inicial' : 'Selecionar horário final'

  useEffect(() => {
    if (!pickerState) return
    const idx = TIME_OPTIONS.indexOf(currentValue ?? '09:00')
    if (idx <= 2) return
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(0, idx * ITEM_H - ITEM_H * 2),
        animated: false,
      })
    }, 50)
    return () => clearTimeout(timer)
  }, [pickerState])

  if (!pickerState) return null

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={pm.backdrop} onPress={onClose}>
        <Pressable style={pm.sheet} onPress={() => undefined}>
          <View style={pm.header}>
            <Text style={pm.title}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
            </Pressable>
          </View>
          <ScrollView
            ref={scrollRef}
            style={pm.list}
            showsVerticalScrollIndicator={false}
          >
            {TIME_OPTIONS.map((item) => {
              const selected = item === currentValue
              return (
                <Pressable
                  key={item}
                  style={[pm.option, selected && pm.optionActive]}
                  onPress={() => {
                    onSelect(item)
                    onClose()
                  }}
                >
                  <Text style={[pm.optionText, selected && pm.optionTextActive]}>{item}</Text>
                  {selected ? (
                    <Ionicons name="checkmark" size={15} color={colors.primary} />
                  ) : null}
                </Pressable>
              )
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const pm = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    maxHeight: '62%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.s5,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borderSubtle,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textStrong,
  },
  list: {
    flex: 1,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.s5,
    height: ITEM_H,
  },
  optionActive: {
    backgroundColor: `${colors.primary}0c`,
  },
  optionText: {
    fontSize: 15,
    color: theme.colors.text,
  },
  optionTextActive: {
    fontWeight: '700',
    color: colors.primary,
  },
})

// ─── Day Row ──────────────────────────────────────────────────────────────────

function AvailabilityDayRow({
  day,
  isExpanded,
  onToggleExpand,
  onToggleEnabled,
  onOpenPicker,
}: {
  day: AvailabilityDay
  isExpanded: boolean
  onToggleExpand: () => void
  onToggleEnabled: (v: boolean) => void
  onOpenPicker: (field: 'start' | 'end') => void
}) {
  const abbrev = day.label.slice(0, 3).toUpperCase()

  return (
    <View>
      <View style={dr.row}>
        {/* Tappable area: abbrev + summary */}
        <Pressable
          style={dr.content}
          onPress={onToggleExpand}
          disabled={!day.enabled}
        >
          <Text style={[dr.abbr, !day.enabled && dr.abbrInactive]}>{abbrev}</Text>
          <Text
            style={[
              dr.summary,
              !day.enabled && dr.summaryInactive,
              isExpanded && dr.summaryExpanded,
            ]}
            numberOfLines={1}
          >
            {day.enabled ? `${day.start} às ${day.end}` : 'Indisponível'}
          </Text>
        </Pressable>

        {/* Toggle outside the Pressable area to avoid conflict */}
        <CustomAvailabilityToggle
          enabled={day.enabled}
          onToggle={onToggleEnabled}
          dayLabel={day.label}
        />
      </View>

      {day.enabled && isExpanded ? (
        <AvailabilityTimeFields
          start={day.start}
          end={day.end}
          onPressStart={() => onOpenPicker('start')}
          onPressEnd={() => onOpenPicker('end')}
        />
      ) : null}
    </View>
  )
}

const dr = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  abbr: {
    width: 34,
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textStrong,
    letterSpacing: 0.8,
  },
  abbrInactive: {
    color: theme.colors.textMuted,
  },
  summary: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: colors.primary,
  },
  summaryInactive: {
    color: theme.colors.textMuted,
    fontWeight: '400',
  },
  summaryExpanded: {
    fontWeight: '600',
  },
})

// ─── Section ──────────────────────────────────────────────────────────────────

export function ProfileAvailabilitySection({
  days,
  onUpdateDay,
  isLoading,
  isError,
  onRetry,
}: Props) {
  const [expandedDayId, setExpandedDayId] = useState<string | null>(null)
  const [pickerState, setPickerState] = useState<PickerState>(null)

  function toggleExpand(dayId: string) {
    setExpandedDayId((prev) => (prev === dayId ? null : dayId))
  }

  function handleToggleEnabled(dayId: string, value: boolean) {
    onUpdateDay(dayId, 'enabled', value)
    if (value) {
      setExpandedDayId(dayId) // auto-expand; implicitly closes any other
    } else {
      setExpandedDayId((prev) => (prev === dayId ? null : prev)) // collapse if it was open
    }
  }

  return (
    <View style={s.card}>
      <View style={s.header}>
        <Text style={s.title}>Disponibilidade</Text>
        <Text style={s.desc}>Informe os dias e horários em que você costuma atender.</Text>
      </View>

      {isLoading ? (
        <View style={s.stateBox}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : isError ? (
        <View style={s.stateBox}>
          <Text style={s.errorMsg}>Não foi possível carregar a disponibilidade.</Text>
          <Pressable style={s.retryBtn} onPress={onRetry}>
            <Text style={s.retryLabel}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : (
        <View>
          {days.map((day, index) => (
            <View
              key={day.id}
              style={[s.item, index < days.length - 1 && s.itemBorder]}
            >
              <AvailabilityDayRow
                day={day}
                isExpanded={expandedDayId === day.id}
                onToggleExpand={() => toggleExpand(day.id)}
                onToggleEnabled={(v) => handleToggleEnabled(day.id, v)}
                onOpenPicker={(f) => setPickerState({ dayId: day.id, field: f })}
              />
            </View>
          ))}
        </View>
      )}

      <AvailabilityTimePickerModal
        pickerState={pickerState}
        days={days}
        onSelect={(time) => {
          if (!pickerState) return
          onUpdateDay(pickerState.dayId, pickerState.field, time)
        }}
        onClose={() => setPickerState(null)}
      />
    </View>
  )
}

const s = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadii.card,
    padding: theme.spacing.s4,
    shadowColor: '#1f2937',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    gap: 3,
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textStrong,
    letterSpacing: 0.2,
  },
  desc: {
    fontSize: 12,
    color: theme.colors.textMuted,
    lineHeight: 17,
  },
  stateBox: {
    alignItems: 'center',
    paddingVertical: theme.spacing.s4,
    gap: theme.spacing.s3,
  },
  errorMsg: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: theme.spacing.s4,
    paddingVertical: 6,
    borderRadius: theme.borderRadii.full,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  retryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  item: {},
  itemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borderSubtle,
  },
})
