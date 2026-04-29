import { computeHasAnyCampaignData, mapHubToPendingResponses } from '../adapters'
import { useCompanyOffersHubQuery } from '../queries'
import type { BusinessDashboardPendingResponseItem } from '../types'

export type BusinessPendingResponsesSectionResult = {
  items: BusinessDashboardPendingResponseItem[]
  totalCount: number
  hasOverflow: boolean
  isLoading: boolean
  errorMessage: string | null
  hasAnyCampaignData: boolean
}

export function useBusinessPendingResponsesSection(): BusinessPendingResponsesSectionResult {
  const { data, isLoading, error } = useCompanyOffersHubQuery()

  const items = mapHubToPendingResponses(data)
  const totalCount = data?.pending?.directInvites?.length ?? 0

  return {
    items,
    totalCount,
    hasOverflow: totalCount > 3,
    isLoading: isLoading && !data,
    errorMessage: !data && error ? 'Não foi possível carregar os convites agora.' : null,
    hasAnyCampaignData: computeHasAnyCampaignData(data),
  }
}
