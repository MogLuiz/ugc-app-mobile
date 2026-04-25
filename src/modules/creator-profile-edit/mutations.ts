import { useMutation, useQueryClient } from '@tanstack/react-query'
import { creatorProfileKeys } from '@/lib/query-keys'
import { useSession } from '@/hooks/useSession'
import {
  updateProfile,
  updateCreatorProfile,
  uploadAvatar,
  uploadPortfolioMedia,
  deletePortfolioMedia,
} from './service'
import type { UpdateProfileData, UpdateCreatorProfileData } from './types'

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()
  const { user } = useSession()
  return useMutation({
    mutationFn: (data: UpdateProfileData) => updateProfile(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: creatorProfileKeys.myEdit(user?.id ?? ''),
      })
    },
  })
}

export function useUpdateCreatorProfileMutation() {
  const queryClient = useQueryClient()
  const { user } = useSession()
  return useMutation({
    mutationFn: (data: UpdateCreatorProfileData) => updateCreatorProfile(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: creatorProfileKeys.myEdit(user?.id ?? ''),
      })
    },
  })
}

export function useUploadAvatarMutation() {
  const queryClient = useQueryClient()
  const { user } = useSession()
  return useMutation({
    mutationFn: ({
      uri,
      mimeType,
      fileName,
    }: {
      uri: string
      mimeType: string
      fileName: string
    }) => uploadAvatar(uri, mimeType, fileName),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: creatorProfileKeys.myEdit(user?.id ?? ''),
      })
    },
  })
}

export function useUploadPortfolioMediaMutation() {
  const queryClient = useQueryClient()
  const { user } = useSession()
  return useMutation({
    mutationFn: ({
      uri,
      mimeType,
      fileName,
    }: {
      uri: string
      mimeType: string
      fileName: string
    }) => uploadPortfolioMedia(uri, mimeType, fileName),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: creatorProfileKeys.myEdit(user?.id ?? ''),
      })
    },
  })
}

export function useDeletePortfolioMediaMutation() {
  const queryClient = useQueryClient()
  const { user } = useSession()
  return useMutation({
    mutationFn: (mediaId: string) => deletePortfolioMedia(mediaId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: creatorProfileKeys.myEdit(user?.id ?? ''),
      })
    },
  })
}
