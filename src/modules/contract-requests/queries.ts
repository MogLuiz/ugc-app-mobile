import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { contractRequestKeys, creatorDashboardKeys, creatorHubKeys } from '@/lib/query-keys'
import {
  acceptContractRequest,
  cancelContractRequest,
  confirmCompletion,
  disputeCompletion,
  getContractReviews,
  getContractRequestById,
  getCreatorOffersHub,
  rejectContractRequest,
  submitReview,
} from './service'
import type { CreateReviewPayload } from './types'

export function useCreatorOffersHubQuery(enabled = true) {
  return useQuery({
    queryKey: creatorHubKeys.hub(),
    queryFn: getCreatorOffersHub,
    staleTime: 60_000,
    enabled,
  })
}

export function useContractRequestDetailQuery(contractRequestId: string, enabled = true) {
  return useQuery({
    queryKey: contractRequestKeys.detail(contractRequestId),
    queryFn: () => getContractRequestById(contractRequestId),
    enabled,
  })
}

export function useAcceptContractRequestMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (contractRequestId: string) => acceptContractRequest(contractRequestId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: contractRequestKeys.creatorPending() })
      void queryClient.invalidateQueries({ queryKey: creatorDashboardKeys.summary() })
      void queryClient.invalidateQueries({ queryKey: creatorHubKeys.all })
    },
  })
}

export function useRejectContractRequestMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: { contractRequestId: string; rejectionReason?: string }) =>
      rejectContractRequest(params.contractRequestId, params.rejectionReason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: contractRequestKeys.creatorPending() })
      void queryClient.invalidateQueries({ queryKey: creatorDashboardKeys.summary() })
      void queryClient.invalidateQueries({ queryKey: creatorHubKeys.all })
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
      void queryClient.invalidateQueries({ queryKey: creatorHubKeys.all })
    },
  })
}

export function useConfirmCompletionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (contractRequestId: string) => confirmCompletion(contractRequestId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: contractRequestKeys.all })
      void queryClient.invalidateQueries({ queryKey: creatorHubKeys.all })
    },
  })
}

export function useDisputeCompletionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: { contractRequestId: string; reason: string }) =>
      disputeCompletion(params.contractRequestId, params.reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: contractRequestKeys.all })
      void queryClient.invalidateQueries({ queryKey: creatorHubKeys.all })
    },
  })
}

export function useContractReviewsQuery(contractRequestId: string, enabled = true) {
  return useQuery({
    queryKey: contractRequestKeys.reviews(contractRequestId),
    queryFn: () => getContractReviews(contractRequestId),
    enabled,
  })
}

export function useSubmitReviewMutation(contractRequestId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => submitReview(contractRequestId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: contractRequestKeys.reviews(contractRequestId),
      })
    },
  })
}
