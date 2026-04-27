import type { BookingStatus, JobMode, UiCalendarEvent } from '../types'

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function getMobileCardDescriptionTitle(event: UiCalendarEvent): string {
  const t = event.title.trim()
  const company = event.company.trim()
  if (!company) return t
  const reDash = new RegExp(`^Oferta aceita\\s*-\\s*${escapeRegExp(company)}$`, 'i')
  const reMdash = new RegExp(`^Oferta aceita\\s*—\\s*${escapeRegExp(company)}$`, 'i')
  if (reDash.test(t) || reMdash.test(t)) {
    return 'Oferta aceita'
  }
  return t
}

export function getMobilePinLineText(event: UiCalendarEvent): string {
  if (
    event.distanceKm != null &&
    Number.isFinite(event.distanceKm) &&
    event.distanceKm <= 0.3
  ) {
    return '📍 No local'
  }
  if (event.distanceLabel) return event.distanceLabel
  if (event.locationLine?.trim()) return event.locationLine.trim()
  return event.modeLine
}

export function formatCalendarDurationLabel(durationMinutes: number): string {
  const hours = durationMinutes / 60
  if (durationMinutes % 60 === 0) return `${hours}h`
  return `${hours.toFixed(1).replace('.', ',')}h`
}

export function formatMobileFreeGapDurationLabel(durationMinutes: number): string {
  if (durationMinutes < 60) return `${durationMinutes}min`
  if (durationMinutes % 60 === 0) return formatCalendarDurationLabel(durationMinutes)
  const h = Math.floor(durationMinutes / 60)
  const m = durationMinutes % 60
  return `${h}h${m}`
}

const MODE_LABEL: Record<JobMode, string> = {
  PRESENTIAL: 'Presencial',
  REMOTE: 'Remoto',
  HYBRID: 'Híbrido',
}

export function formatJobKindLabel(jobTypeName: string, mode: JobMode): string {
  return `${jobTypeName} · ${MODE_LABEL[mode]}`
}

export function formatDistanceLabel(distanceKm: number | null | undefined): string | null {
  if (distanceKm == null || Number.isNaN(distanceKm)) return null
  return `${distanceKm.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  })} km`
}

export function bookingStatusBorderColor(status: BookingStatus): string {
  switch (status) {
    case 'CONFIRMED': return '#10b981'
    case 'PENDING': return '#f59e0b'
    case 'CANCELLED':
    case 'REJECTED': return '#ef4444'
    case 'COMPLETED': return '#94a3b8'
    default: return '#cbd5e1'
  }
}
