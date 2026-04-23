import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { opportunityKeys } from '@/lib/query-keys'
import { fetchOpportunityDetail, fetchOpportunities } from './service'

export function useOpportunityPreviewQuery(limit = 2) {
  return useQuery({
    queryKey: opportunityKeys.preview(limit),
    queryFn: () => fetchOpportunities({ page: 1, limit }),
    retry: false,
  })
}

export function useInfiniteOpportunitiesQuery(limit = 24) {
  return useInfiniteQuery({
    queryKey: opportunityKeys.infiniteList(limit),
    queryFn: ({ pageParam }) => fetchOpportunities({ page: pageParam, limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination
      return page < totalPages ? page + 1 : undefined
    },
    retry: false,
  })
}

export function useOpportunityDetailQuery(id?: string) {
  return useQuery({
    queryKey: opportunityKeys.detail(id ?? 'none'),
    queryFn: () => fetchOpportunityDetail(id!),
    enabled: Boolean(id),
    retry: false,
  })
}
