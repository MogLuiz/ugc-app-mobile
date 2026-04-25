export type UpdateProfileData = {
  name?: string
  bio?: string
  phone?: string
  addressStreet?: string
  addressNumber?: string
  addressCity?: string
  addressState?: string
  addressZipCode?: string
}

export type UpdateCreatorProfileData = {
  instagramUsername?: string
  tiktokUsername?: string
}

const MAX_PORTFOLIO_IMAGE_SIZE_MB = 10
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']

export function validatePortfolioAsset(mimeType: string, fileSize: number | undefined): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(mimeType.toLowerCase())) {
    return 'Formato não suportado. Envie imagens JPG, PNG ou WEBP.'
  }
  if (fileSize !== undefined && fileSize > MAX_PORTFOLIO_IMAGE_SIZE_MB * 1024 * 1024) {
    return `A imagem é muito grande. Máximo ${MAX_PORTFOLIO_IMAGE_SIZE_MB}MB.`
  }
  return null
}
