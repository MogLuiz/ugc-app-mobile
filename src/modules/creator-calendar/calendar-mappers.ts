import type { AvailabilityDay, AvailabilityDayOfWeek, CreatorAvailabilityResponse } from './types'

const DAY_ORDER: AvailabilityDayOfWeek[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
]

const DAY_METADATA: Record<AvailabilityDayOfWeek, { id: string; label: string }> = {
  MONDAY:    { id: 'monday',    label: 'Segunda-feira' },
  TUESDAY:   { id: 'tuesday',   label: 'Terça-feira'   },
  WEDNESDAY: { id: 'wednesday', label: 'Quarta-feira'  },
  THURSDAY:  { id: 'thursday',  label: 'Quinta-feira'  },
  FRIDAY:    { id: 'friday',    label: 'Sexta-feira'   },
  SATURDAY:  { id: 'saturday',  label: 'Sábado'        },
  SUNDAY:    { id: 'sunday',    label: 'Domingo'       },
}

// Normalizes "09:00:00" → "09:00", null → fallback
function normalizeTime(time: string | null | undefined, fallback: string): string {
  if (!time) return fallback
  const parts = time.split(':')
  if (parts.length >= 2) {
    return `${String(parts[0]).padStart(2, '0')}:${String(parts[1]).padStart(2, '0')}`
  }
  return fallback
}

export function mapAvailabilityDays(response?: CreatorAvailabilityResponse): AvailabilityDay[] {
  type ServerDay = { dayOfWeek: AvailabilityDayOfWeek; isActive: boolean; startTime: string | null; endTime: string | null }
  const serverMap = new Map<AvailabilityDayOfWeek, ServerDay>()

  if (response?.days) {
    for (const day of response.days) {
      serverMap.set(day.dayOfWeek, day)
    }
  }

  return DAY_ORDER.map((dayOfWeek) => {
    const meta = DAY_METADATA[dayOfWeek]
    const server = serverMap.get(dayOfWeek)
    return {
      id: meta.id,
      dayOfWeek,
      label: meta.label,
      enabled: server?.isActive ?? false,
      start: normalizeTime(server?.startTime, '09:00'),
      end: normalizeTime(server?.endTime, '18:00'),
    }
  })
}

function buildHalfHourOptions(): string[] {
  const options: string[] = []
  for (let h = 0; h < 24; h++) {
    options.push(`${String(h).padStart(2, '0')}:00`)
    options.push(`${String(h).padStart(2, '0')}:30`)
  }
  return options
}

export const TIME_OPTIONS = buildHalfHourOptions()
