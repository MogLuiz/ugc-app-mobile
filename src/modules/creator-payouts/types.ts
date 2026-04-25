export type PayoutStatus = 'not_due' | 'pending' | 'scheduled' | 'paid' | 'failed' | 'canceled'

export type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'phone' | 'random'

export type CreatorPayout = {
  id: string
  paymentId: string
  creatorUserId: string
  amountCents: number
  currency: string
  status: PayoutStatus
  scheduledFor: string | null
  paidAt: string | null
  createdAt: string
  updatedAt: string
  payment?: {
    grossAmountCents: number
    platformFeeCents: number
    contractRequestId: string
    gatewayName: string
  }
}

export type CreatorPayoutSettings = {
  isConfigured: boolean
  pixKeyType: PixKeyType | null
  pixKey: string | null
  pixKeyMasked: string | null
  holderName: string | null
  holderDocument: string | null
}

export type UpdatePayoutSettingsInput = {
  pixKeyType: PixKeyType
  pixKey: string
  holderName?: string | null
  holderDocument?: string | null
}
