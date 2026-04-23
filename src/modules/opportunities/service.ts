import { api } from '@/lib/api'
import type { OpportunityDetail, OpportunityListResponse } from './types'

export async function fetchOpportunities(params?: {
  page?: number
  limit?: number
}): Promise<OpportunityListResponse> {
  const { data } = await api.get<OpportunityListResponse>('/open-offers/available', {
    params: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 50,
    },
  })

  return data
}

export async function fetchOpportunityDetail(id: string): Promise<OpportunityDetail> {
  const { data } = await api.get<OpportunityDetail>(`/open-offers/available/${id}`)
  return data
}
