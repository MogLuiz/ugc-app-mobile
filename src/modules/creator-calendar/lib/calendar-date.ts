export const SCHEDULING_TIMEZONE = 'America/Sao_Paulo'
const SAO_PAULO_UTC_OFFSET = '-03:00'

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date)
  next.setUTCDate(next.getUTCDate() + amount)
  return next
}

export function startOfDay(date: Date): Date {
  const key = formatIsoDateLocal(date)
  return new Date(`${key}T12:00:00.000Z`)
}

function formatIsoDateLocal(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: SCHEDULING_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export type CalendarRequestRangeOptions = {
  now?: Date
  upcomingHorizonDays?: number
  visiblePeriodDays?: number
}

export function toCalendarRequestRange(
  periodStart: Date,
  options?: CalendarRequestRangeOptions,
) {
  const now = options?.now ?? new Date()
  const upcomingHorizonDays = options?.upcomingHorizonDays ?? 45
  const visiblePeriodDays = Math.max(1, options?.visiblePeriodDays ?? 15)

  const startDateKey = formatIsoDateLocal(periodStart)
  const periodEndKey = formatIsoDateLocal(addDays(periodStart, visiblePeriodDays))
  const horizonEndKey = formatIsoDateLocal(addDays(startOfDay(now), upcomingHorizonDays))
  const endDateKey = periodEndKey > horizonEndKey ? periodEndKey : horizonEndKey

  const start = new Date(`${startDateKey}T00:00:00${SAO_PAULO_UTC_OFFSET}`)
  const end = new Date(`${endDateKey}T00:00:00${SAO_PAULO_UTC_OFFSET}`)

  return {
    start,
    end,
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  }
}
