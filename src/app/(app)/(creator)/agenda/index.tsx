import { useCallback, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { AppScreenHeader } from '@/components/AppScreenHeader'
import {
  useAcceptCreatorBookingMutation,
  useCreatorCalendarQuery,
} from '@/modules/creator-calendar/queries'
import {
  buildCalendarViewModel,
  CALENDAR_VISIBLE_DAYS_MOBILE,
} from '@/modules/creator-calendar/lib/calendar-view-model'
import { addDays, startOfDay, toCalendarRequestRange } from '@/modules/creator-calendar/lib/calendar-date'
import { formatIsoDateInTimeZone } from '@/modules/creator-calendar/lib/calendar-tz'
import { SCHEDULING_TIMEZONE } from '@/modules/creator-calendar/lib/calendar-date'
import type { UiCalendarEvent } from '@/modules/creator-calendar/types'
import { colors } from '@/theme/colors'
import { WeekStrip } from './_components/WeekStrip'
import { AgendaTimeline } from './_components/AgendaTimeline'
import { EventSheet } from './_components/EventSheet'

function commitmentSubtitle(count: number): string {
  if (count === 0) return 'Nenhum compromisso neste período'
  if (count === 1) return '1 compromisso neste período'
  return `${count} compromissos neste período`
}

function AgendaSkeleton() {
  return (
    <View style={skeletonStyles.container}>
      <View style={skeletonStyles.stripPlaceholder} />
      {Array.from({ length: 3 }).map((_, i) => (
        <View key={i} style={skeletonStyles.section}>
          <View style={skeletonStyles.heading} />
          <View style={skeletonStyles.card} />
        </View>
      ))}
    </View>
  )
}

const skeletonStyles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 20, gap: 24 },
  stripPlaceholder: {
    height: 100,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
  },
  section: { gap: 12 },
  heading: {
    height: 12,
    width: 160,
    borderRadius: 6,
    backgroundColor: '#e2e8f0',
  },
  card: {
    height: 150,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
  },
})

function EmptyState() {
  const router = useRouter()
  return (
    <View style={emptyStyles.container}>
      <View style={emptyStyles.iconWrap}>
        <Ionicons name="calendar-outline" size={40} color={colors.primary} />
      </View>
      <Text style={emptyStyles.title}>Nenhum trabalho agendado</Text>
      <Text style={emptyStyles.description}>
        Sua agenda está livre por enquanto. Quando você aceitar uma campanha, ela aparecerá aqui.
      </Text>
      <Pressable
        style={({ pressed }) => [emptyStyles.cta, pressed && emptyStyles.ctaPressed]}
        onPress={() => router.push('/(creator)/oportunidades' as never)}
      >
        <Ionicons name="search-outline" size={18} color="#fff" />
        <Text style={emptyStyles.ctaText}>Ver novas oportunidades</Text>
      </Pressable>
    </View>
  )
}

const emptyStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(137,90,246,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary.light,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 14,
    color: colors.text.secondary.light,
    textAlign: 'center',
    lineHeight: 22,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 100,
    marginTop: 8,
  },
  ctaPressed: { opacity: 0.85 },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
})

function ErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <View style={errorStyles.container}>
      <Ionicons name="alert-circle-outline" size={36} color={colors.error} />
      <Text style={errorStyles.message}>{message}</Text>
      <Pressable
        onPress={onRetry}
        style={({ pressed }) => [errorStyles.retryBtn, pressed && errorStyles.retryPressed]}
      >
        <Text style={errorStyles.retryText}>Tentar novamente</Text>
      </Pressable>
    </View>
  )
}

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  message: {
    fontSize: 14,
    color: colors.text.secondary.light,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 100,
    backgroundColor: colors.primary,
  },
  retryPressed: { opacity: 0.85 },
  retryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
})

export default function AgendaScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const timelineScrollRef = useRef<ScrollView>(null)

  const [periodStart, setPeriodStart] = useState(() => startOfDay(new Date()))
  const [selectedDateKey, setSelectedDateKey] = useState(() => {
    const now = new Date()
    return formatIsoDateInTimeZone(now, SCHEDULING_TIMEZONE)
  })
  const [selectedEvent, setSelectedEvent] = useState<UiCalendarEvent | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const calendarRange = useMemo(
    () =>
      toCalendarRequestRange(periodStart, {
        now: new Date(),
        visiblePeriodDays: CALENDAR_VISIBLE_DAYS_MOBILE,
        upcomingHorizonDays: CALENDAR_VISIBLE_DAYS_MOBILE,
      }),
    [periodStart],
  )

  const calendarQuery = useCreatorCalendarQuery({
    start: calendarRange.startIso,
    end: calendarRange.endIso,
  })

  const acceptMutation = useAcceptCreatorBookingMutation({
    start: calendarRange.startIso,
    end: calendarRange.endIso,
  })

  const viewModel = useMemo(
    () =>
      buildCalendarViewModel({
        response: calendarQuery.data,
        weekStart: periodStart,
        visiblePeriodDays: CALENDAR_VISIBLE_DAYS_MOBILE,
      }),
    [calendarQuery.data, periodStart],
  )

  const timeZone = viewModel?.timeZone ?? SCHEDULING_TIMEZONE

  function goToPrevPeriod() {
    setPeriodStart((d) => addDays(d, -CALENDAR_VISIBLE_DAYS_MOBILE))
    setSelectedDateKey((key) => {
      const date = new Date(`${key}T12:00:00.000Z`)
      return formatIsoDateInTimeZone(
        addDays(date, -CALENDAR_VISIBLE_DAYS_MOBILE),
        timeZone,
      )
    })
  }

  function goToNextPeriod() {
    setPeriodStart((d) => addDays(d, CALENDAR_VISIBLE_DAYS_MOBILE))
    setSelectedDateKey((key) => {
      const date = new Date(`${key}T12:00:00.000Z`)
      return formatIsoDateInTimeZone(
        addDays(date, CALENDAR_VISIBLE_DAYS_MOBILE),
        timeZone,
      )
    })
  }

  function selectDay(isoDate: string) {
    setSelectedDateKey(isoDate)
  }

  function openEvent(event: UiCalendarEvent) {
    setSelectedEvent(event)
    setIsSheetOpen(true)
  }

  function closeSheet() {
    setIsSheetOpen(false)
  }

  async function handleAccept(bookingId: string) {
    try {
      await acceptMutation.mutateAsync(bookingId)
      closeSheet()
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Não foi possível confirmar o compromisso.'
      Alert.alert('Erro', msg)
    }
  }

  const handleOpenProposal = useCallback(
    (contractRequestId: string) => {
      closeSheet()
      router.push(`/(creator)/propostas/${contractRequestId}` as never)
    },
    [router],
  )

  const handleOpenChat = useCallback(
    (contractRequestId: string) => {
      closeSheet()
      router.push({
        pathname: '/(creator)/mensagens' as never,
        params: { contractRequestId },
      })
    },
    [router],
  )

  const isFirstLoad = calendarQuery.isLoading && !calendarQuery.data
  const errorMessage = calendarQuery.error
    ? calendarQuery.error instanceof Error
      ? calendarQuery.error.message
      : 'Não foi possível carregar a agenda.'
    : null

  const totalEvents = viewModel?.weeklyStats.jobCount ?? 0
  const hasEvents = totalEvents > 0

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <AppScreenHeader title="Agenda" />
          {!isFirstLoad && !errorMessage && viewModel ? (
            <Text style={styles.subtitle}>{commitmentSubtitle(totalEvents)}</Text>
          ) : null}
        </View>

        {/* Content */}
        {isFirstLoad ? (
          <AgendaSkeleton />
        ) : errorMessage ? (
          <ErrorState
            message={errorMessage}
            onRetry={() => void calendarQuery.refetch()}
          />
        ) : !viewModel ? null : (
          <>
            <View style={styles.stripWrap}>
              <WeekStrip
                weekDays={viewModel.weekDays}
                selectedDateKey={selectedDateKey}
                weekRangeLabelCompact={viewModel.weekRangeLabelCompact}
                onPrev={goToPrevPeriod}
                onNext={goToNextPeriod}
                onSelectDay={selectDay}
              />
            </View>

            {viewModel.rangePastNotice === 'full' ? (
              <View style={styles.pastNotice}>
                <Ionicons name="time-outline" size={14} color="#7c3aed" />
                <Text style={styles.pastNoticeText}>
                  Todo este período já passou.
                </Text>
              </View>
            ) : viewModel.rangePastNotice === 'partial' ? (
              <View style={styles.pastNotice}>
                <Ionicons name="time-outline" size={14} color="#7c3aed" />
                <Text style={styles.pastNoticeText}>
                  Parte deste período já passou.
                </Text>
              </View>
            ) : null}

            {!hasEvents ? (
              <EmptyState />
            ) : (
              <AgendaTimeline
                viewModel={viewModel}
                selectedDateKey={selectedDateKey}
                onOpenEvent={openEvent}
                scrollRef={timelineScrollRef}
                refreshing={calendarQuery.isRefetching}
                onRefresh={() => void calendarQuery.refetch()}
              />
            )}
          </>
        )}
      </View>

      <EventSheet
        event={selectedEvent}
        isOpen={isSheetOpen}
        timeZone={timeZone}
        isAccepting={acceptMutation.isPending}
        onClose={closeSheet}
        onAccept={(id) => void handleAccept(id)}
        onOpenProposal={handleOpenProposal}
        onOpenChat={handleOpenChat}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f6f5f8',
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 13,
    color: colors.text.secondary.light,
    marginTop: -8,
    marginBottom: 4,
    paddingHorizontal: 16,
  },
  stripWrap: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  pastNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 20,
    marginBottom: 4,
    backgroundColor: 'rgba(137,90,246,0.07)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  pastNoticeText: {
    fontSize: 12,
    color: '#7c3aed',
    fontWeight: '500',
  },
})
