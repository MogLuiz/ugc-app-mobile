import { api } from '@/lib/api'
import type { CreatorAvailabilityResponse, UpdateCreatorAvailabilityInput } from './types'

export async function getCreatorAvailability(): Promise<CreatorAvailabilityResponse> {
  const { data } = await api.get<CreatorAvailabilityResponse>('/creator/availability')
  return data
}

export async function replaceCreatorAvailability(
  payload: UpdateCreatorAvailabilityInput,
): Promise<CreatorAvailabilityResponse> {
  const { data } = await api.put<CreatorAvailabilityResponse>('/creator/availability', payload)
  return data
}
