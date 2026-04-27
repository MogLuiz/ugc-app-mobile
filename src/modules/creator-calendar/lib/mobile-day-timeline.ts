import { formatIsoDateInTimeZone } from './calendar-tz'
import type { UiCalendarEvent } from '../types'

const MIN_FREE_MS = 30 * 60 * 1000

export type MobileTimelineEventItem = {
  type: 'event'
  event: UiCalendarEvent
}

export type MobileTimelineFreeGapItem = {
  type: 'freeGap'
  durationMinutes: number
  key: string
}

export type MobileTimelineNowItem = {
  type: 'nowDivider'
  key: string
}

export type MobileTimelineItem =
  | MobileTimelineEventItem
  | MobileTimelineFreeGapItem
  | MobileTimelineNowItem

function minutesFloor(ms: number): number {
  return Math.floor(ms / 60_000)
}

function appendFreeIfNeeded(
  items: MobileTimelineItem[],
  durationMinutes: number,
  key: string,
): void {
  if (durationMinutes > 30) {
    items.push({ type: 'freeGap', durationMinutes, key })
  }
}

export function buildMobileDayTimelineItems(
  events: UiCalendarEvent[],
  dateKey: string,
  todayDateKey: string,
  timeZone: string,
  now: Date,
): MobileTimelineItem[] {
  if (events.length === 0) return []

  const items: MobileTimelineItem[] = []
  const nowTs = now.getTime()
  const isToday =
    dateKey === todayDateKey && formatIsoDateInTimeZone(now, timeZone) === dateKey

  let nowPlaced = false

  if (isToday && events[0] && nowTs < events[0].startAt.getTime()) {
    items.push({ type: 'nowDivider', key: 'now-before-first' })
    nowPlaced = true
  }

  for (let i = 0; i < events.length; i++) {
    const ev = events[i]!
    items.push({ type: 'event', event: ev })

    if (isToday && !nowPlaced) {
      const start = ev.startAt.getTime()
      const end = ev.endAt.getTime()
      if (nowTs >= start && nowTs < end) {
        items.push({ type: 'nowDivider', key: `now-during-${ev.id}` })
        nowPlaced = true
      }
    }

    const next = events[i + 1]
    if (!next) break

    const gapStartTs = ev.endAt.getTime()
    const gapEndTs = next.startAt.getTime()
    const gapMs = gapEndTs - gapStartTs

    if (gapMs <= MIN_FREE_MS) {
      if (isToday && !nowPlaced && nowTs > gapStartTs && nowTs < gapEndTs) {
        items.push({ type: 'nowDivider', key: `now-small-gap-${ev.id}-${next.id}` })
        nowPlaced = true
      }
      continue
    }

    const totalMinutes = minutesFloor(gapMs)

    if (!isToday) {
      appendFreeIfNeeded(items, totalMinutes, `free-${ev.id}-${next.id}`)
      continue
    }

    if (nowTs <= gapStartTs) {
      appendFreeIfNeeded(items, totalMinutes, `free-${ev.id}-${next.id}`)
    } else if (nowTs >= gapEndTs) {
      appendFreeIfNeeded(items, totalMinutes, `free-${ev.id}-${next.id}`)
    } else {
      const beforeMin = minutesFloor(nowTs - gapStartTs)
      const afterMin = minutesFloor(gapEndTs - nowTs)
      appendFreeIfNeeded(items, beforeMin, `free-before-${ev.id}-${next.id}`)
      if (!nowPlaced) {
        items.push({ type: 'nowDivider', key: `now-in-gap-${ev.id}-${next.id}` })
        nowPlaced = true
      }
      appendFreeIfNeeded(items, afterMin, `free-after-${ev.id}-${next.id}`)
    }
  }

  if (isToday && !nowPlaced) {
    items.push({ type: 'nowDivider', key: 'now-after-last' })
  }

  return items
}
