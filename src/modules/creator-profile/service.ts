import { api } from '@/lib/api'
import type { BootstrapPayload, PortfolioMedia } from '@/types'
import type { CreatorPortfolioItem, MyCreatorProfileEditData } from './types'

type CreatorProfileExt = {
  instagramUsername?: string
  tiktokUsername?: string
}

function calculateAgeYears(birthDate: string | undefined | null): number | null {
  if (!birthDate) return null
  const birth = new Date(birthDate)
  if (isNaN(birth.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--
  return age >= 0 ? age : null
}

function mapPortfolioMedia(media: PortfolioMedia[]): CreatorPortfolioItem[] {
  return media
    .filter((item) => item.status === 'READY')
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => {
      const isVideo = item.type === 'VIDEO'
      return {
        id: item.id,
        imageUrl: isVideo ? (item.thumbnailUrl ?? '') : item.url,
        mediaType: isVideo ? ('video' as const) : ('image' as const),
        videoUrl: isVideo ? item.url : undefined,
      }
    })
    .filter((item) =>
      item.mediaType === 'video' ? Boolean(item.videoUrl) : Boolean(item.imageUrl),
    )
}

export async function getMyCreatorProfileEditData(): Promise<MyCreatorProfileEditData> {
  const { data } = await api.get<BootstrapPayload>('/profiles/me')
  const { profile, portfolio } = data
  const creatorProfile = data.creatorProfile as CreatorProfileExt | undefined

  return {
    id: data.id,
    name: profile?.name ?? '',
    avatarUrl: profile?.photoUrl ?? null,
    bio: profile?.bio ?? null,
    phone: profile?.phone ?? null,
    ageYears: calculateAgeYears(profile?.birthDate),
    location: {
      city: profile?.addressCity ?? null,
      state: profile?.addressState ?? null,
      street: profile?.addressStreet ?? null,
      number: profile?.addressNumber ?? null,
      zipCode: profile?.addressZipCode ?? null,
    },
    socials: {
      instagramUsername: creatorProfile?.instagramUsername ?? null,
      tiktokUsername: creatorProfile?.tiktokUsername ?? null,
    },
    portfolio: mapPortfolioMedia(portfolio?.media ?? []),
  }
}
