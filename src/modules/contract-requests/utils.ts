import type { ContractRequestItem } from './types'

/** Returns the expiration Date for a direct invite (createdAt + 48h) */
export function getDirectInviteExpiresAt(createdAt: string): Date {
  return new Date(new Date(createdAt).getTime() + 48 * 60 * 60 * 1000)
}

/**
 * Returns true if a PENDING_ACCEPTANCE contract is past its expiration.
 * Uses item.expiresAt if present, falls back to createdAt + 48h.
 */
export function isContractExpired(item: ContractRequestItem, now = Date.now()): boolean {
  if (item.status !== 'PENDING_ACCEPTANCE') return false
  if (item.expiresAt) return new Date(item.expiresAt).getTime() <= now
  if (item.createdAt) return getDirectInviteExpiresAt(item.createdAt).getTime() <= now
  return false
}

/**
 * Returns the effective expiresAt string for a contract.
 * Uses item.expiresAt if present, falls back to createdAt + 48h.
 */
export function getEffectiveExpiresAt(item: ContractRequestItem): string | null {
  if (item.expiresAt) return item.expiresAt
  if (item.createdAt) return getDirectInviteExpiresAt(item.createdAt).toISOString()
  return null
}

/** Sort comparator: most recent startsAt first */
export function sortByStartsAtDesc(a: ContractRequestItem, b: ContractRequestItem): number {
  return new Date(b.startsAt ?? 0).getTime() - new Date(a.startsAt ?? 0).getTime()
}

const STATUS_LABEL: Partial<Record<string, string>> = {
  PENDING_ACCEPTANCE: 'Pendente',
  ACCEPTED: 'Aceita',
  COMPLETED: 'Concluída',
  REJECTED: 'Recusada',
  CANCELLED: 'Cancelada',
  EXPIRED: 'Expirada',
}

export function getStatusLabel(status: string): string {
  return STATUS_LABEL[status] ?? status
}
