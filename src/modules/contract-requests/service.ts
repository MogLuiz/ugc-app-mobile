import { api } from '@/lib/api'
import type { ContractRequestItem } from './types'

export async function getMyCreatorPendingContractRequests(): Promise<ContractRequestItem[]> {
  const { data } = await api.get<ContractRequestItem[]>('/contract-requests/my-creator/pending')
  return data
}

export async function getMyCreatorContractRequests(
  status: 'ACCEPTED' | 'COMPLETED' | 'REJECTED' | 'CANCELLED',
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
