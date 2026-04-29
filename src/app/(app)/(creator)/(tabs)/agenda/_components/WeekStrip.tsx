import { useRef, useEffect } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { CalendarWeekDay } from '@/modules/creator-calendar/types'
import { colors } from '@/theme/colors'

type WeekStripProps = {
  weekDays: CalendarWeekDay[]
  selectedDateKey: string
  weekRangeLabelCompact: string
  onPrev: () => void
  onNext: () => void
  onSelectDay: (isoDate: string) => void
}

export function WeekStrip({
  weekDays,
  selectedDateKey,
  weekRangeLabelCompact,
  onPrev,
  onNext,
  onSelectDay,
}: WeekStripProps) {
  const scrollRef = useRef<ScrollView>(null)

  useEffect(() => {
    const idx = weekDays.findIndex((d) => d.isoDate === selectedDateKey)
    if (idx >= 0 && scrollRef.current) {
      scrollRef.current.scrollTo({ x: Math.max(0, idx - 1) * DAY_ITEM_WIDTH, animated: true })
    }
  }, [selectedDateKey, weekDays])

  return (
    <View style={styles.container}>
      <View style={styles.navRow}>
        <Pressable
          onPress={onPrev}
          style={({ pressed }) => [styles.navBtn, pressed && styles.navBtnPressed]}
          accessibilityLabel="Período anterior"
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={18} color={colors.primary} />
        </Pressable>

        <Text style={styles.rangeLabel} numberOfLines={1}>
          {weekRangeLabelCompact}
        </Text>

        <Pressable
          onPress={onNext}
          style={({ pressed }) => [styles.navBtn, pressed && styles.navBtnPressed]}
          accessibilityLabel="Próximo período"
          hitSlop={8}
        >
          <Ionicons name="chevron-forward" size={18} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.daysContent}
      >
        {weekDays.map((day) => {
          const isSelected = day.isoDate === selectedDateKey
          const isToday = day.isToday ?? false

          return (
            <Pressable
              key={day.isoDate}
              onPress={() => onSelectDay(day.isoDate)}
              style={({ pressed }) => [
                styles.dayItem,
                isSelected && styles.dayItemSelected,
                pressed && !isSelected && styles.dayItemPressed,
              ]}
              accessibilityLabel={day.fullLabel}
              accessibilityState={{ selected: isSelected }}
            >
              <Text
                style={[
                  styles.dayLabel,
                  isSelected && styles.dayLabelSelected,
                  isToday && !isSelected && styles.dayLabelToday,
                ]}
              >
                {day.label}
              </Text>
              <Text
                style={[
                  styles.dayNumber,
                  isSelected && styles.dayNumberSelected,
                  isToday && !isSelected && styles.dayNumberToday,
                ]}
              >
                {day.date}
              </Text>
              {isToday && !isSelected ? <View style={styles.todayDot} /> : null}
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )
}

const DAY_ITEM_WIDTH = 52

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(137,90,246,0.1)',
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(137,90,246,0.08)',
  },
  navBtnPressed: {
    backgroundColor: 'rgba(137,90,246,0.16)',
  },
  rangeLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary.light,
    letterSpacing: -0.2,
  },
  daysContent: {
    paddingHorizontal: 8,
    gap: 4,
  },
  dayItem: {
    width: DAY_ITEM_WIDTH,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 14,
    gap: 2,
  },
  dayItemSelected: {
    backgroundColor: colors.primary,
  },
  dayItemPressed: {
    backgroundColor: 'rgba(137,90,246,0.08)',
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text.secondary.light,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  dayLabelSelected: {
    color: '#fff',
  },
  dayLabelToday: {
    color: colors.primary,
  },
  dayNumber: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text.primary.light,
  },
  dayNumberSelected: {
    color: '#fff',
  },
  dayNumberToday: {
    color: colors.primary,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 1,
  },
})
