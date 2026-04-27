import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { calendarKeys, creatorDashboardKeys } from '@/lib/query-keys'
import {
  acceptCreatorBooking,
  getCreatorAvailability,
  getCreatorCalendar,
  replaceCreatorAvailability,
} from './service'
import type { UpdateCreatorAvailabilityInput } from './types'

export function useCreatorAvailabilityQuery() {
  return useQuery({
    queryKey: calendarKeys.availability(),
    queryFn: getCreatorAvailability,
    staleTime: 60_000,
  })
}

export function useReplaceAvailabilityMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateCreatorAvailabilityInput) => replaceCreatorAvailability(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: calendarKeys.all })
    },
  })
}

export function useCreatorCalendarQuery(params: { start: string; end: string }) {
  return useQuery({
    queryKey: calendarKeys.range(params.start, params.end),
    queryFn: () => getCreatorCalendar(params),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  })
}

export function useAcceptCreatorBookingMutation(rangeParams: { start: string; end: string }) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (bookingId: string) => acceptCreatorBooking(bookingId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: calendarKeys.range(rangeParams.start, rangeParams.end),
      })
      void queryClient.invalidateQueries({ queryKey: creatorDashboardKeys.all })
    },
  })
}
