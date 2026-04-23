import type { InfiniteData } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import {
  formatAmount,
  formatDistance,
  formatDurationMinutes,
  formatShortDate,
  getDeadlineDays,
} from '@/lib/formatters'
import type {
  OpportunityFilters,
  OpportunityListItem,
  OpportunityListResponse,
  SortOption,
} from './types'

const ADDRESS_REQUIRED_MESSAGE_SNIPPET = 'Complete seu endereço'

type ApiErrorPayload = {
  message?: string
}

export function isAddressRequiredError(error: unknown): boolean {
  if (!(error instanceof AxiosError)) return false

  const message =
    (error.response?.data as ApiErrorPayload | undefined)?.message ?? error.message ?? ''

  return error.response?.status === 403 && message.includes(ADDRESS_REQUIRED_MESSAGE_SNIPPET)
}

export function selectDisplayableOpenOpportunities(
  items: OpportunityListItem[],
): OpportunityListItem[] {
  return items.filter((item) => item.status === 'OPEN')
}

export function extractWorkTypes(items: OpportunityListItem[]): string[] {
  const names = new Set<string>()

  for (const item of items) {
    if (item.jobType?.name) names.add(item.jobType.name)
  }

  return [...names].sort()
}

export function filterOpportunities(
  items: OpportunityListItem[],
  filters: OpportunityFilters,
): OpportunityListItem[] {
  return items.filter((item) => {
    if (filters.workType !== 'all' && item.jobType?.name !== filters.workType) {
      return false
    }

    if (filters.distance !== 'all') {
      const maxKm = parseInt(filters.distance, 10)
      if (item.distanceKm > maxKm) return false
    }

    return true
  })
}

export function sortOpportunities(
  items: OpportunityListItem[],
  sortBy: SortOption,
): OpportunityListItem[] {
  const copy = [...items]

  switch (sortBy) {
    case 'value':
      return copy.sort((a, b) => b.offeredAmount - a.offeredAmount)
    case 'distance':
      return copy.sort((a, b) => a.distanceKm - b.distanceKm)
    case 'recent':
    default:
      return copy.sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime())
  }
}

export function flattenOpportunityPages(
  data?: InfiniteData<OpportunityListResponse>,
): OpportunityListItem[] {
  if (!data) return []

  return data.pages.flatMap((page) => page.items)
}

export function getOpportunityDeadlineLabel(expiresAt: string, now = Date.now()): string {
  const deadlineDays = getDeadlineDays(expiresAt, now)

  if (deadlineDays <= 3) {
    if (deadlineDays <= 0) return 'Expirada'
    return `Expira em ${deadlineDays} ${deadlineDays === 1 ? 'dia' : 'dias'}`
  }

  return `Candidaturas até ${new Date(expiresAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })}`
}

export type OpportunityCardVm = {
  id: string
  title: string
  amountDisplay: string
  description: string
  dateDisplay: string
  durationDisplay: string
  locationDisplay: string
  deadlineDisplay: string
}

export function adaptOpportunityCard(item: OpportunityListItem): OpportunityCardVm {
  return {
    id: item.id,
    title: item.jobType?.name ?? 'Oportunidade',
    amountDisplay: formatAmount(item.offeredAmount),
    description: item.description || 'Sem descrição',
    dateDisplay: formatShortDate(item.startsAt),
    durationDisplay: formatDurationMinutes(item.durationMinutes),
    locationDisplay: `${item.jobFormattedAddress ?? 'Local a combinar'} · ${formatDistance(item.distanceKm)}`,
    deadlineDisplay: getOpportunityDeadlineLabel(item.expiresAt),
  }
}
