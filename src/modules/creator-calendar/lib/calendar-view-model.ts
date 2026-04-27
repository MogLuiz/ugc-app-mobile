import { addDays, SCHEDULING_TIMEZONE } from './calendar-date'
import {
  diffCalendarDays,
  formatDayMonthCompactInTimeZone,
  formatDayNumberInTimeZone,
  formatIsoDateInTimeZone,
  formatTimeInTimeZone,
  formatWeekRangeLabelCompact,
  formatWeekdayLongInTimeZone,
  formatWeekdayShortInTimeZone,
  getHourMinuteInTimeZone,
} from './calendar-tz'
import {
  formatCalendarDurationLabel,
  formatDistanceLabel,
  formatJobKindLabel,
} from './calendar-display'
import type {
  BookingStatus,
  CalendarBooking,
  CalendarItemOrigin,
  CalendarRangePastNotice,
  CalendarTimelineSection,
  CalendarViewModel,
  CalendarWeeklyStats,
  CreatorCalendarResponse,
  JobMode,
  UiCalendarEvent,
  VisualCalendarStatus,
} from '../types'

export const VISUAL_STATUS_BADGE_LABEL: Record<VisualCalendarStatus, string> = {
  confirmed: 'CONFIRMADO',
  pending: 'PENDENTE',
  completed: 'CONCLUÍDO',
  cancelled: 'CANCELADO',
}

export const CALENDAR_VISIBLE_DAYS_MOBILE = 15

function resolveTimeZone(response: CreatorCalendarResponse | undefined): string {
  return response?.timezone?.trim() || SCHEDULING_TIMEZONE
}

function calendarItemOrigin(row: CalendarBooking): CalendarItemOrigin {
  if (row.contractRequestId || row.origin === 'CONTRACT_REQUEST') return 'CONTRACT_REQUEST'
  return 'BOOKING'
}

function mapVisualStatus(status: BookingStatus): VisualCalendarStatus {
  switch (status) {
    case 'CONFIRMED': return 'confirmed'
    case 'PENDING': return 'pending'
    case 'COMPLETED': return 'completed'
    case 'CANCELLED':
    case 'REJECTED': return 'cancelled'
    default: return 'cancelled'
  }
}

function mapModeLine(mode: JobMode): string {
  if (mode === 'REMOTE') return 'Remoto'
  if (mode === 'HYBRID') return 'Híbrido'
  return 'Presencial'
}

function isUpcomingStatus(status: BookingStatus): boolean {
  return status === 'PENDING' || status === 'CONFIRMED'
}

function mapBookingToUiEvent(
  row: CalendarBooking,
  timeZone: string,
  dayIndex: number,
): UiCalendarEvent {
  const startAt = new Date(row.startDateTime)
  const endAt = new Date(row.endDateTime)
  const { hour: startHour, minute: startMinute } = getHourMinuteInTimeZone(startAt, timeZone)
  const origin = calendarItemOrigin(row)
  const company = row.companyName?.trim() || (origin === 'CONTRACT_REQUEST' ? 'Empresa' : 'Cliente')
  const locationLine = row.location?.trim() || null
  const modeLine = mapModeLine(row.mode)
  const distanceKm =
    row.distanceKm != null && Number.isFinite(Number(row.distanceKm))
      ? Number(row.distanceKm)
      : null

  return {
    id: row.id,
    origin,
    contractRequestId: row.contractRequestId ?? null,
    bookingStatus: row.status,
    visualStatus: mapVisualStatus(row.status),
    company,
    title: row.title,
    jobTypeName: row.jobType.name,
    mode: row.mode,
    startAt,
    endAt,
    startLabel: formatTimeInTimeZone(startAt, timeZone),
    endLabel: formatTimeInTimeZone(endAt, timeZone),
    locationLine,
    modeLine,
    description: row.description,
    notes: row.notes,
    dayIndex,
    startHour,
    startMinute,
    durationMinutes: row.durationMinutes,
    overlapIndex: 0,
    overlapCount: 1,
    companyUserId: row.companyUserId,
    companyPhotoUrl: row.companyPhotoUrl?.trim() || null,
    companyRating:
      row.companyRating != null && Number.isFinite(Number(row.companyRating))
        ? Number(row.companyRating)
        : null,
    distanceKm,
    durationLabel: formatCalendarDurationLabel(row.durationMinutes),
    jobKindLabel: formatJobKindLabel(row.jobType.name, row.mode),
    distanceLabel: formatDistanceLabel(distanceKm),
  }
}

function pickNextUpcomingCommitment(
  rows: CalendarBooking[],
  timeZone: string,
  now: Date,
): UiCalendarEvent | null {
  const candidates: UiCalendarEvent[] = []
  for (const row of rows) {
    if (!isUpcomingStatus(row.status)) continue
    const endAt = new Date(row.endDateTime)
    if (endAt.getTime() <= now.getTime()) continue
    candidates.push(mapBookingToUiEvent(row, timeZone, -1))
  }
  candidates.sort(
    (a, b) => a.startAt.getTime() - b.startAt.getTime() || a.id.localeCompare(b.id),
  )
  return candidates[0] ?? null
}

function buildWeeklyStats(
  events: UiCalendarEvent[],
  weeklyEarnings?: number,
): CalendarWeeklyStats {
  const counted = events.filter(
    (e) => e.bookingStatus !== 'CANCELLED' && e.bookingStatus !== 'REJECTED',
  )
  const totalHours =
    Math.round(
      counted.reduce(
        (sum, e) => sum + (e.endAt.getTime() - e.startAt.getTime()) / 3_600_000,
        0,
      ) * 100,
    ) / 100

  const stats: CalendarWeeklyStats = { jobCount: counted.length, totalHours }
  if (weeklyEarnings !== undefined && Number.isFinite(weeklyEarnings)) {
    stats.weeklyEarnings = weeklyEarnings
  }
  return stats
}

export function buildCalendarViewModel(input: {
  response: CreatorCalendarResponse | undefined
  weekStart: Date
  visiblePeriodDays?: number
  now?: Date
}): CalendarViewModel | null {
  const { response, weekStart } = input
  if (!response) return null

  const now = input.now ?? new Date()
  const visiblePeriodDays = Math.max(1, input.visiblePeriodDays ?? CALENDAR_VISIBLE_DAYS_MOBILE)
  const lastDayOffset = visiblePeriodDays - 1
  const timeZone = resolveTimeZone(response)

  const rangeStartKey = formatIsoDateInTimeZone(weekStart, timeZone)
  const todayDateKey = formatIsoDateInTimeZone(now, timeZone)
  const rangeEndKey = formatIsoDateInTimeZone(addDays(weekStart, lastDayOffset), timeZone)

  let rangePastNotice: CalendarRangePastNotice = 'none'
  if (rangeEndKey < todayDateKey) rangePastNotice = 'full'
  else if (rangeStartKey < todayDateKey && rangeEndKey >= todayDateKey) rangePastNotice = 'partial'

  const rawEvents: UiCalendarEvent[] = []
  for (const row of response.bookings) {
    const startAt = new Date(row.startDateTime)
    const eventKey = formatIsoDateInTimeZone(startAt, timeZone)
    const dayIndex = diffCalendarDays(rangeStartKey, eventKey)
    if (dayIndex < 0 || dayIndex >= visiblePeriodDays) continue
    rawEvents.push(mapBookingToUiEvent(row, timeZone, dayIndex))
  }

  rawEvents.sort(
    (a, b) => a.startAt.getTime() - b.startAt.getTime() || a.id.localeCompare(b.id),
  )

  const timelineByDay: CalendarTimelineSection[] = []
  for (let i = 0; i < visiblePeriodDays; i++) {
    const date = addDays(weekStart, i)
    const dateKey = formatIsoDateInTimeZone(date, timeZone)
    const dayEvents = rawEvents.filter((e) => e.dayIndex === i)

    let dayPrefix: string
    if (dateKey === todayDateKey) {
      dayPrefix = 'Hoje'
    } else if (diffCalendarDays(todayDateKey, dateKey) === 1) {
      dayPrefix = 'Amanhã'
    } else {
      dayPrefix = formatWeekdayShortInTimeZone(date, timeZone)
    }

    const dateCaption = formatDayMonthCompactInTimeZone(date, timeZone)
    timelineByDay.push({
      dateKey,
      sectionLabel: `${dayPrefix} · ${dateCaption}`,
      events: dayEvents,
    })
  }

  const weekDays = Array.from({ length: visiblePeriodDays }, (_, index) => {
    const date = addDays(weekStart, index)
    const isoDate = formatIsoDateInTimeZone(date, timeZone)
    return {
      id: isoDate,
      label: formatWeekdayShortInTimeZone(date, timeZone),
      date: formatDayNumberInTimeZone(date, timeZone),
      isToday: isoDate === todayDateKey,
      isoDate,
      fullLabel: formatWeekdayLongInTimeZone(date, timeZone),
    }
  })

  const nextUpcomingCommitment = pickNextUpcomingCommitment(response.bookings, timeZone, now)
  const weeklyStats = buildWeeklyStats(rawEvents, response.weeklyEarnings)

  return {
    timeZone,
    weekRangeLabel: formatWeekRangeLabelCompact(weekStart, timeZone, visiblePeriodDays),
    weekRangeLabelCompact: formatWeekRangeLabelCompact(weekStart, timeZone, visiblePeriodDays),
    weekDays,
    hourSlots: [],
    events: rawEvents,
    timelineByDay,
    nextUpcomingCommitment,
    weeklyStats,
    todayDateKey,
    rangePastNotice,
  }
}
