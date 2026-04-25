export type AvailabilityDayOfWeek =
  | 'SUNDAY'
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'

export type CreatorAvailabilityResponse = {
  creatorUserId: string
  timezone: string
  days: Array<{
    dayOfWeek: AvailabilityDayOfWeek
    isActive: boolean
    startTime: string | null
    endTime: string | null
  }>
}

export type UpdateCreatorAvailabilityInput = {
  days: Array<{
    dayOfWeek: AvailabilityDayOfWeek
    isActive: boolean
    startTime?: string | null
    endTime?: string | null
  }>
}

export type AvailabilityDay = {
  id: string
  dayOfWeek: AvailabilityDayOfWeek
  label: string
  enabled: boolean
  start: string
  end: string
}
