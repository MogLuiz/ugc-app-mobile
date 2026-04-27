import { useEffect, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { formatTimeInTimeZone } from '@/modules/creator-calendar/lib/calendar-tz'
import { formatMobileFreeGapDurationLabel } from '@/modules/creator-calendar/lib/calendar-display'
import { buildMobileDayTimelineItems } from '@/modules/creator-calendar/lib/mobile-day-timeline'
import type { CalendarTimelineSection, CalendarViewModel, UiCalendarEvent } from '@/modules/creator-calendar/types'
import { colors } from '@/theme/colors'
import { JobCard } from './JobCard'

function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

function SectionHeading({ label, isToday }: { label: string; isToday: boolean }) {
  return (
    <View style={sectionStyles.row}>
      <Text style={[sectionStyles.label, isToday && sectionStyles.labelToday]}>{label}</Text>
      <View style={sectionStyles.line} />
    </View>
  )
}

const sectionStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  labelToday: {
    color: colors.primary,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
})

function NowDivider({ timeZone, now }: { timeZone: string; now: Date }) {
  const timeLabel = formatTimeInTimeZone(now, timeZone)
  return (
    <View style={nowStyles.row} accessibilityRole="text" accessibilityLabel={`Agora, ${timeLabel}`}>
      <View style={nowStyles.line} />
      <Text style={nowStyles.label}>Agora {timeLabel}</Text>
      <View style={nowStyles.line} />
    </View>
  )
}

const nowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 6,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
  },
})

function FreeGapRow({ durationMinutes }: { durationMinutes: number }) {
  const label = formatMobileFreeGapDurationLabel(durationMinutes)
  return (
    <View style={freeStyles.container}>
      <Text style={freeStyles.text}>🟢 Livre · {label}</Text>
    </View>
  )
}

const freeStyles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803d',
  },
})

function EmptyDayRow() {
  return (
    <View style={emptyDayStyles.container}>
      <Text style={emptyDayStyles.text}>Sem eventos neste dia</Text>
    </View>
  )
}

const emptyDayStyles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  text: {
    fontSize: 13,
    color: '#cbd5e1',
    fontStyle: 'italic',
  },
})

type TimelineRowProps = {
  event: UiCalendarEvent
  startLabel: string
  showSpineBelow: boolean
  onPress: () => void
}

function TimelineRow({ event, startLabel, showSpineBelow, onPress }: TimelineRowProps) {
  return (
    <View style={rowStyles.grid}>
      <View style={rowStyles.timeCol}>
        <Text style={rowStyles.timeLabel}>{startLabel}</Text>
      </View>
      <View style={rowStyles.spineCol}>
        <View style={rowStyles.dot} />
        {showSpineBelow ? <View style={rowStyles.spine} /> : null}
      </View>
      <View style={rowStyles.cardCol}>
        <JobCard event={event} onPress={onPress} />
        <View style={rowStyles.cardGap} />
      </View>
    </View>
  )
}

const rowStyles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
  },
  timeCol: {
    width: 48,
    paddingTop: 4,
  },
  timeLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontVariant: ['tabular-nums'],
  },
  spineCol: {
    width: 16,
    alignItems: 'center',
    paddingTop: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#cbd5e1',
    flexShrink: 0,
  },
  spine: {
    flex: 1,
    width: 1,
    backgroundColor: '#e2e8f0',
    marginTop: 4,
    minHeight: 24,
  },
  cardCol: {
    flex: 1,
  },
  cardGap: {
    height: 12,
  },
})

type DaySectionProps = {
  section: CalendarTimelineSection
  viewModel: CalendarViewModel
  now: Date
  onOpenEvent: (event: UiCalendarEvent) => void
}

function DaySection({ section, viewModel, now, onOpenEvent }: DaySectionProps) {
  const isToday = section.dateKey === viewModel.todayDateKey
  const items = useMemo(
    () =>
      buildMobileDayTimelineItems(
        section.events,
        section.dateKey,
        viewModel.todayDateKey,
        viewModel.timeZone,
        now,
      ),
    [section.events, section.dateKey, viewModel.todayDateKey, viewModel.timeZone, now],
  )

  return (
    <View style={daySectionStyles.container}>
      <SectionHeading label={section.sectionLabel} isToday={isToday} />

      {items.length === 0 ? (
        <EmptyDayRow />
      ) : (
        items.map((item, idx) => {
          const showSpineBelow = idx < items.length - 1

          if (item.type === 'event') {
            return (
              <TimelineRow
                key={item.event.id}
                event={item.event}
                startLabel={item.event.startLabel}
                showSpineBelow={showSpineBelow}
                onPress={() => onOpenEvent(item.event)}
              />
            )
          }
          if (item.type === 'freeGap') {
            return <FreeGapRow key={item.key} durationMinutes={item.durationMinutes} />
          }
          return (
            <NowDivider key={item.key} timeZone={viewModel.timeZone} now={now} />
          )
        })
      )}
    </View>
  )
}

const daySectionStyles = StyleSheet.create({
  container: {
    marginBottom: 28,
  },
})

type AgendaTimelineProps = {
  viewModel: CalendarViewModel
  selectedDateKey: string
  onOpenEvent: (event: UiCalendarEvent) => void
  scrollRef?: RefObject<ScrollView | null>
  refreshing?: boolean
  onRefresh?: () => void
}

export function AgendaTimeline({
  viewModel,
  selectedDateKey,
  onOpenEvent,
  scrollRef,
  refreshing = false,
  onRefresh,
}: AgendaTimelineProps) {
  const now = useNow()
  const sectionOffsets = useRef<Record<string, number>>({})
  const internalRef = useRef<ScrollView>(null)
  const ref = (scrollRef ?? internalRef) as RefObject<ScrollView>

  useEffect(() => {
    const offset = sectionOffsets.current[selectedDateKey]
    if (offset !== undefined && ref.current) {
      ref.current.scrollTo({ y: offset, animated: true })
    }
  }, [selectedDateKey])

  return (
    <ScrollView
      ref={ref}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={timelineStyles.content}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#895af6" />
        ) : undefined
      }
    >
      {viewModel.timelineByDay.map((section) => (
        <View
          key={section.dateKey}
          onLayout={(e) => {
            sectionOffsets.current[section.dateKey] = e.nativeEvent.layout.y
          }}
        >
          <DaySection
            section={section}
            viewModel={viewModel}
            now={now}
            onOpenEvent={onOpenEvent}
          />
        </View>
      ))}
    </ScrollView>
  )
}

const timelineStyles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
})
