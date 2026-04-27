export type AvailabilityDayOfWeek =
  | 'SUNDAY'
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'

export type CreatorAvailabilityResponse = {
  creatorUserId: string
  timezone: string
  days: Array<{
    dayOfWeek: AvailabilityDayOfWeek
    isActive: boolean
    startTime: string | null
    endTime: string | null
  }>
}

export type UpdateCreatorAvailabilityInput = {
  days: Array<{
    dayOfWeek: AvailabilityDayOfWeek
    isActive: boolean
    startTime?: string | null
    endTime?: string | null
  }>
}

export type AvailabilityDay = {
  id: string
  dayOfWeek: AvailabilityDayOfWeek
  label: string
  enabled: boolean
  start: string
  end: string
}

// ─── Calendar types ──────────────────────────────────────────────────────────

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED'

export type JobMode = 'PRESENTIAL' | 'REMOTE' | 'HYBRID'

export type CalendarItemOrigin = 'BOOKING' | 'CONTRACT_REQUEST'

export type VisualCalendarStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled'

export type CalendarBooking = {
  id: string
  title: string
  description: string | null
  status: BookingStatus
  mode: JobMode
  startDateTime: string
  endDateTime: string
  durationMinutes: number
  origin: string
  notes: string | null
  jobType: { id: string; name: string }
  companyUserId: string
  creatorUserId: string
  isBlocking: boolean
  companyName?: string | null
  companyPhotoUrl?: string | null
  companyRating?: number | null
  distanceKm?: number | null
  contractRequestId?: string | null
  location?: string | null
}

export type CreatorCalendarResponse = {
  creatorUserId: string
  timezone: string
  range: { start: string; end: string }
  blockedStatuses: BookingStatus[]
  bookings: CalendarBooking[]
  weeklyEarnings?: number
}

export type UiCalendarEvent = {
  id: string
  origin: CalendarItemOrigin
  contractRequestId: string | null
  bookingStatus: BookingStatus
  visualStatus: VisualCalendarStatus
  company: string
  title: string
  jobTypeName: string
  mode: JobMode
  startAt: Date
  endAt: Date
  startLabel: string
  endLabel: string
  locationLine: string | null
  modeLine: string
  description: string | null
  notes: string | null
  dayIndex: number
  startHour: number
  startMinute: number
  durationMinutes: number
  overlapIndex: number
  overlapCount: number
  companyUserId: string
  companyPhotoUrl: string | null
  companyRating: number | null
  distanceKm: number | null
  durationLabel: string
  jobKindLabel: string
  distanceLabel: string | null
}

export type CalendarTimelineSection = {
  dateKey: string
  sectionLabel: string
  events: UiCalendarEvent[]
}

export type CalendarWeeklyStats = {
  jobCount: number
  totalHours: number
  weeklyEarnings?: number
}

export type CalendarRangePastNotice = 'none' | 'partial' | 'full'

export type CalendarWeekDay = {
  id: string
  label: string
  date: string
  highlighted?: boolean
  isToday?: boolean
  isoDate: string
  fullLabel: string
}

export type CalendarViewModel = {
  timeZone: string
  weekRangeLabel: string
  weekRangeLabelCompact: string
  weekDays: CalendarWeekDay[]
  hourSlots: string[]
  events: UiCalendarEvent[]
  timelineByDay: CalendarTimelineSection[]
  nextUpcomingCommitment: UiCalendarEvent | null
  weeklyStats: CalendarWeeklyStats
  todayDateKey: string
  rangePastNotice: CalendarRangePastNotice
}
