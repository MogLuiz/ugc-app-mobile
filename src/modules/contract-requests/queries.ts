import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { contractRequestKeys, creatorDashboardKeys } from '@/lib/query-keys'
import {
  acceptContractRequest,
  cancelContractRequest,
  getMyCreatorContractRequests,
  getMyCreatorPendingContractRequests,
  rejectContractRequest,
} from './service'

export function useMyCreatorPendingContractRequestsQuery(enabled = true) {
  return useQuery({
    queryKey: contractRequestKeys.creatorPending(),
    queryFn: getMyCreatorPendingContractRequests,
    enabled,
  })
}

export function useMyCreatorContractRequestsQuery(
  status: 'ACCEPTED' | 'COMPLETED' | 'REJECTED' | 'CANCELLED',
  enabled = true,
) {
  return useQuery({
    queryKey: contractRequestKeys.creatorList(status),
    queryFn: () => getMyCreatorContractRequests(status),
    enabled,
  })
}

export function useAcceptContractRequestMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (contractRequestId: string) => acceptContractRequest(contractRequestId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: contractRequestKeys.all })
      void queryClient.invalidateQueries({ queryKey: creatorDashboardKeys.all })
    },
  })
}

export function useRejectContractRequestMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: { contractRequestId: string; rejectionReason?: string }) =>
      rejectContractRequest(params.contractRequestId, params.rejectionReason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: contractRequestKeys.all })
      void queryClient.invalidateQueries({ queryKey: creatorDashboardKeys.all })
    },
  })
}

export function useCancelContractRequestMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (contractRequestId: string) => cancelContractRequest(contractRequestId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: contractRequestKeys.all })
      void queryClient.invalidateQueries({ queryKey: creatorDashboardKeys.all })
    },
  })
}
