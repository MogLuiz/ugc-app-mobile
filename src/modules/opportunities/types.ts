export type OpportunityStatus = 'OPEN' | 'FILLED' | 'CANCELLED' | 'EXPIRED'

export type OpportunityListItem = {
  id: string
  status: OpportunityStatus
  description: string
  startsAt: string
  durationMinutes: number
  jobFormattedAddress: string | null
  serviceGrossAmountCents: number
  creatorNetServiceAmountCents: number
  expiresAt: string
  jobType: { id: string; name: string } | null
  createdAt: string
  updatedAt: string
  distanceKm: number
}

export type OpportunityDetail = OpportunityListItem & {
  myApplication: { id: string; status: string } | null
}

export type OpportunityListResponse = {
  items: OpportunityListItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type OpportunityFilters = {
  workType: 'all' | string
  distance: 'all' | '5' | '10' | '20' | '50'
}

export type SortOption = 'recent' | 'value' | 'distance'
