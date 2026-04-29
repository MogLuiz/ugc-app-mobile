import { api } from '@/lib/api'
import type { CompanyOffersHubResponse } from './types'

export async function getCompanyOffersHub(): Promise<CompanyOffersHubResponse> {
  const { data } = await api.get<CompanyOffersHubResponse>('/company/offers/hub')
  return data
}
