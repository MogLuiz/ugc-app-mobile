import { useQuery } from '@tanstack/react-query'
import { creatorProfileKeys } from '@/lib/query-keys'
import { getMyCreatorProfileEditData } from './service'

export function useMyCreatorProfileEditQuery(userId: string) {
  return useQuery({
    queryKey: creatorProfileKeys.myEdit(userId),
    queryFn: getMyCreatorProfileEditData,
    staleTime: 60_000,
    enabled: Boolean(userId),
  })
}
