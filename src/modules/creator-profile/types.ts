export type CreatorPortfolioItem = {
  id: string
  imageUrl: string
  mediaType: 'image' | 'video'
  videoUrl?: string
}

export type MyCreatorProfileEditData = {
  id: string
  name: string
  avatarUrl: string | null
  bio: string | null
  phone: string | null
  ageYears: number | null
  location: {
    city: string | null
    state: string | null
    street: string | null
    number: string | null
    zipCode: string | null
  }
  socials: {
    instagramUsername: string | null
    tiktokUsername: string | null
  }
  portfolio: CreatorPortfolioItem[]
}
