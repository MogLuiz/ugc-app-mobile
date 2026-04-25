import { api } from '@/lib/api'
import type { UpdateProfileData, UpdateCreatorProfileData } from './types'

export async function updateProfile(data: UpdateProfileData): Promise<void> {
  await api.patch('/profiles/me', data)
}

export async function updateCreatorProfile(data: UpdateCreatorProfileData): Promise<void> {
  await api.patch('/profiles/me/creator', data)
}

export async function uploadAvatar(uri: string, mimeType: string, fileName: string): Promise<void> {
  const formData = new FormData()
  formData.append('file', { uri, name: fileName, type: mimeType } as unknown as Blob)
  await api.post('/uploads/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export async function uploadPortfolioMedia(uri: string, mimeType: string, fileName: string): Promise<void> {
  const formData = new FormData()
  formData.append('file', { uri, name: fileName, type: mimeType } as unknown as Blob)
  await api.post('/uploads/portfolio-media', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export async function deletePortfolioMedia(mediaId: string): Promise<void> {
  await api.delete(`/profiles/me/portfolio/media/${mediaId}`)
}
