export type ItemType = 'flight' | 'train' | 'hotel' | 'activity' | 'restaurant'

export interface Trip {
  id: string
  name: string
  destination: string
  startDate: string
  endDate: string
  homeCurrency: string
}

export interface Item {
  id: string
  tripId: string
  type: ItemType
  title: string
  status: string
  startAt: string
  endAt?: string
  confirmationCode?: string
  notes?: string
  plannedCost?: number
  plannedCurrency?: string
  plannedCostUsd?: number
  locName?: string
  locLat?: number
  locLng?: number
  destName?: string
  destLat?: number
  destLng?: number
}
