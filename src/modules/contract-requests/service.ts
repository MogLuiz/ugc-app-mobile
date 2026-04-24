import { api } from '@/lib/api'
import type {
  ContractRequestItem,
  ContractReviewsResponse,
  CreateReviewPayload,
  ReviewItem,
} from './types'
import type { CreatorOffersHubResponse } from './creator-hub.types'

export async function getCreatorOffersHub(): Promise<CreatorOffersHubResponse> {
  const { data } = await api.get<CreatorOffersHubResponse>('/creator/offers/hub')
  return data
}

export async function getMyCreatorPendingContractRequests(): Promise<ContractRequestItem[]> {
  const { data } = await api.get<ContractRequestItem[]>('/contract-requests/my-creator/pending')
  return data
}

export async function getMyCreatorContractRequests(
  status:
    | 'ACCEPTED'
    | 'COMPLETED'
    | 'REJECTED'
    | 'CANCELLED'
    | 'AWAITING_COMPLETION_CONFIRMATION'
    | 'COMPLETION_DISPUTE',
): Promise<ContractRequestItem[]> {
  const { data } = await api.get<ContractRequestItem[]>('/contract-requests/my-creator', {
    params: { status },
  })
  return data
}

export async function acceptContractRequest(
  contractRequestId: string,
): Promise<ContractRequestItem> {
  const { data } = await api.patch<ContractRequestItem>(
    `/contract-requests/${contractRequestId}/accept`,
  )
  return data
}

export async function rejectContractRequest(
  contractRequestId: string,
  rejectionReason?: string,
): Promise<ContractRequestItem> {
  const { data } = await api.patch<ContractRequestItem>(
    `/contract-requests/${contractRequestId}/reject`,
    rejectionReason ? { rejectionReason } : {},
  )
  return data
}

export async function cancelContractRequest(
  contractRequestId: string,
): Promise<ContractRequestItem> {
  const { data } = await api.patch<ContractRequestItem>(
    `/contract-requests/${contractRequestId}/cancel`,
  )
  return data
}

export async function getContractRequestById(
  contractRequestId: string,
): Promise<ContractRequestItem> {
  const { data } = await api.get<ContractRequestItem>(
    `/contract-requests/${contractRequestId}`,
  )
  return data
}

export async function confirmCompletion(
  contractRequestId: string,
): Promise<ContractRequestItem> {
  const { data } = await api.patch<ContractRequestItem>(
    `/contract-requests/${contractRequestId}/confirm-completion`,
  )
  return data
}

export async function disputeCompletion(
  contractRequestId: string,
  reason: string,
): Promise<ContractRequestItem> {
  const { data } = await api.patch<ContractRequestItem>(
    `/contract-requests/${contractRequestId}/dispute-completion`,
    { reason },
  )
  return data
}

export async function submitReview(
  contractRequestId: string,
  payload: CreateReviewPayload,
): Promise<ReviewItem> {
  const { data } = await api.post<ReviewItem>(
    `/contract-requests/${contractRequestId}/reviews`,
    payload,
  )
  return data
}

export async function getContractReviews(
  contractRequestId: string,
): Promise<ContractReviewsResponse> {
  const { data } = await api.get<ContractReviewsResponse>(
    `/contract-requests/${contractRequestId}/reviews`,
  )
  return data
}
