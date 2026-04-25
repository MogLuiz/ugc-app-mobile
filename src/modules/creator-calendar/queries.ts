import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { calendarKeys } from '@/lib/query-keys'
import { getCreatorAvailability, replaceCreatorAvailability } from './service'
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
