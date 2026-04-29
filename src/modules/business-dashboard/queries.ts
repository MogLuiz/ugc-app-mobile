import { useQuery } from '@tanstack/react-query'
import { businessDashboardKeys } from '@/lib/query-keys'
import { getCompanyOffersHub } from './service'

export function useCompanyOffersHubQuery() {
  return useQuery({
    queryKey: businessDashboardKeys.companyOffersHub(),
    queryFn: getCompanyOffersHub,
    staleTime: 60_000,
  })
}
