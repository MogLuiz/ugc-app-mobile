import { addDays } from './calendar-date'

export function formatIsoDateInTimeZone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function formatTimeInTimeZone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

export function getHourMinuteInTimeZone(
  date: Date,
  timeZone: string,
): { hour: number; minute: number } {
  const formatted = formatTimeInTimeZone(date, timeZone)
  const [hour = 0, minute = 0] = formatted.split(':').map((x) => Number(x))
  return { hour, minute }
}

export function formatDayNumberInTimeZone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    day: 'numeric',
  }).format(date)
}

function normalizeWeekdayShort(value: string): string {
  return value.replace('.', '').slice(0, 3).toUpperCase()
}

export function formatWeekdayShortInTimeZone(date: Date, timeZone: string): string {
  const formatted = new Intl.DateTimeFormat('pt-BR', {
    timeZone,
    weekday: 'short',
  }).format(date)
  return normalizeWeekdayShort(formatted)
}

export function formatWeekdayLongInTimeZone(date: Date, timeZone: string): string {
  const formatted = new Intl.DateTimeFormat('pt-BR', {
    timeZone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date)
  if (!formatted) return formatted
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export function formatDayMonthCompactInTimeZone(date: Date, timeZone: string): string {
  const day = formatDayNumberInTimeZone(date, timeZone)
  const monthRaw = new Intl.DateTimeFormat('pt-BR', {
    timeZone,
    month: 'short',
  }).format(date)
  const month = monthRaw.replace(/\./g, '').trim()
  const cap = month ? month.charAt(0).toUpperCase() + month.slice(1) : ''
  return `${day} ${cap}`
}

export function formatWeekRangeLabelCompact(
  weekStart: Date,
  timeZone: string,
  periodDayCount = 15,
): string {
  const endDay = addDays(weekStart, Math.max(1, periodDayCount) - 1)
  const a = formatDayMonthCompactInTimeZone(weekStart, timeZone)
  const b = formatDayMonthCompactInTimeZone(endDay, timeZone)
  return `${a} — ${b}`
}

function dateKeyToUtcNoon(dateKey: string): number {
  const [y = 1970, m = 1, d = 1] = dateKey.split('-').map(Number)
  return Date.UTC(y, m - 1, d, 12, 0, 0, 0)
}

export function diffCalendarDays(fromKey: string, toKey: string): number {
  return Math.round(
    (dateKeyToUtcNoon(toKey) - dateKeyToUtcNoon(fromKey)) / (24 * 60 * 60 * 1000),
  )
}
