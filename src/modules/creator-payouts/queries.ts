import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { creatorPayoutKeys, payoutSettingsKeys } from '@/lib/query-keys'
import { fetchCreatorPayouts, fetchPayoutSettings, updatePayoutSettings } from './service'
import type { UpdatePayoutSettingsInput } from './types'

export function useCreatorPayoutsQuery() {
  return useQuery({
    queryKey: creatorPayoutKeys.list(),
    queryFn: fetchCreatorPayouts,
    staleTime: 60_000,
  })
}

export function usePayoutSettingsQuery() {
  return useQuery({
    queryKey: payoutSettingsKeys.mine(),
    queryFn: fetchPayoutSettings,
    staleTime: 60_000,
  })
}

export function useUpdatePayoutSettingsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdatePayoutSettingsInput) => updatePayoutSettings(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: payoutSettingsKeys.mine() })
    },
  })
}
