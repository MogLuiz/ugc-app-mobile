// ─── Currency ─────────────────────────────────────────────────────────────────

/**
 * Moeda BRL sem fração (arredonda para real inteiro).
 * Para valores com centavos (contratos, payouts, totais), use {@link formatCurrency}.
 */
export function formatAmount(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

/** Valor em reais com centavos (alinhado ao `formatCurrency` do web). */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

// ─── Duration ─────────────────────────────────────────────────────────────────

/** Ex: 30 → "30 min" | 90 → "1,5 horas" | 120 → "2 horas" */
export function formatDurationMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = minutes / 60
  const rounded = Number.isInteger(hours) ? hours : parseFloat(hours.toFixed(1))
  return `${rounded} hora${rounded !== 1 ? 's' : ''}`
}

// ─── Distance ─────────────────────────────────────────────────────────────────

/** Ex: 0 → "No local" | 5.3 → "5,3 km" */
export function formatDistance(km: number): string {
  if (km === 0) return 'No local'
  return `${km.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km`
}

// ─── Dates ────────────────────────────────────────────────────────────────────

/** Ex: "15 out" */
export function formatShortDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })
}

/** Ex: "15 out. 2023" */
export function formatFullDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/** Ex: "15/10/2023 14:00" */
export function formatDateTime(isoDate: string): string {
  return new Date(isoDate).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

/** Ex: "14:00" ou "14:00 - 16:00" */
export function formatTimeRange(startsAt: string, durationMinutes: number): string {
  const start = new Date(startsAt)
  const mins = durationMinutes ?? 0
  const fmt = (d: Date) => d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  if (mins <= 0) return fmt(start)
  const end = new Date(start.getTime() + mins * 60 * 1000)
  return `${fmt(start)} - ${fmt(end)}`
}

// ─── Relative time ────────────────────────────────────────────────────────────

/** Ex: "Há 5 min" | "Há 2h" | "Ontem" | "Há 3 dias" */
export function formatTimeAgo(iso: string | null | undefined): string {
  if (!iso) return 'Agora há pouco'
  const diffMs = Date.now() - new Date(iso).getTime()
  if (Number.isNaN(diffMs)) return 'Agora há pouco'
  const diffMinutes = Math.max(1, Math.round(diffMs / 60_000))
  if (diffMinutes < 60) return `Há ${diffMinutes} min`
  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `Há ${diffHours}h`
  const diffDays = Math.round(diffHours / 24)
  if (diffDays === 1) return 'Ontem'
  if (diffDays < 7) return `Há ${diffDays} dias`
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

// ─── Offer expiry ─────────────────────────────────────────────────────────────

/** Dias restantes até expiração. Negativo = já expirou. */
export function getDeadlineDays(expiresAt: string, now = Date.now()): number {
  return Math.ceil((new Date(expiresAt).getTime() - now) / (1000 * 60 * 60 * 24))
}

/**
 * Label de tempo restante para convites/propostas.
 * Ex: "Expira em 30 min" | "Expira em 2h" | "Expira em 1 dia" | "Expirada"
 */
export function formatOfferExpiry(expiresAt: string, now = Date.now()): string {
  const diffMs = new Date(expiresAt).getTime() - now
  if (diffMs <= 0) return 'Expirada'
  const totalMinutes = Math.ceil(diffMs / 60_000)
  const totalHours = Math.ceil(diffMs / 3_600_000)
  const totalDays = Math.ceil(diffMs / 86_400_000)
  if (totalMinutes < 60) return `Expira em ${totalMinutes} min`
  if (totalHours < 24) return `Expira em ${totalHours}h`
  return `Expira em ${totalDays} dia${totalDays > 1 ? 's' : ''}`
}

// ─── Text ─────────────────────────────────────────────────────────────────────

/** Ex: "João Silva" → "JS" */
export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}
