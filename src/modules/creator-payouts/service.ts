import { api } from '@/lib/api'
import type { CreatorPayout, CreatorPayoutSettings, UpdatePayoutSettingsInput } from './types'

export async function fetchCreatorPayouts(): Promise<CreatorPayout[]> {
  const { data } = await api.get<CreatorPayout[]>('/payouts/my')
  return data
}

export async function fetchPayoutSettings(): Promise<CreatorPayoutSettings> {
  const { data } = await api.get<CreatorPayoutSettings>('/profiles/me/payout-settings')
  return data
}

export async function updatePayoutSettings(
  input: UpdatePayoutSettingsInput,
): Promise<CreatorPayoutSettings> {
  const { data } = await api.put<CreatorPayoutSettings>('/profiles/me/payout-settings', input)
  return data
}
