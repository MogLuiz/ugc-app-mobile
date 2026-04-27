import { api } from '@/lib/api'
import type {
  CreatorAvailabilityResponse,
  CreatorCalendarResponse,
  UpdateCreatorAvailabilityInput,
} from './types'

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

export async function getCreatorCalendar(params: {
  start: string
  end: string
}): Promise<CreatorCalendarResponse> {
  const { data } = await api.get<CreatorCalendarResponse>('/creator/calendar', {
    params: { start: params.start, end: params.end },
  })
  return data
}

export async function acceptCreatorBooking(bookingId: string): Promise<void> {
  await api.post(`/bookings/${bookingId}/accept`)
}
