// TypeScript mirrors of the backend DTOs (plaza/DTOs).
// Enums are string unions — the API serializes them as strings.

export type ApartmentStatus = 'Available' | 'Reserved' | 'Sold'
export type ApplicationStatus = 'New' | 'InProgress' | 'Closed'
export type GalleryCategory = 'Construction' | 'Renders'

export interface ApartmentListItem {
  id: string
  block: string
  floor: number
  number: string
  roomsCount: number
  totalArea: number
  totalPrice: number
  status: ApartmentStatus
  isPenthouse: boolean
}

export interface ApartmentDetail {
  id: string
  block: string
  floor: number
  number: string
  roomsCount: number
  totalArea: number
  pricePerSqm: number
  totalPrice: number
  status: ApartmentStatus
  floorPlanImageUrl: string | null
  description: string | null
  isPenthouse: boolean
}

export interface ChessboardCell {
  id: string
  number: string
  roomsCount: number
  totalArea: number
  totalPrice: number
  status: ApartmentStatus
  isPenthouse: boolean
}

export interface ChessboardFloor {
  floor: number
  apartments: ChessboardCell[]
}

export interface ChessboardBlock {
  block: string
  floors: ChessboardFloor[]
}

export interface Settings {
  heroTitle: string
  heroImageUrl: string | null
  constructionProgressDescription: string
  constructionProgressPercent: number
  completionYear: string
  contactPhone: string
  whatsAppLink: string
  telegramLink: string
}

export interface GalleryItem {
  id: string
  imageUrl: string
  category: GalleryCategory
  displayOrder: number
}

// Public lead capture (POST /api/applications).
export interface ApplicationCreate {
  name: string
  phone: string
  comment?: string | null
  apartmentId?: string | null
}

// Optional catalog filters (GET /api/apartments).
export interface ApartmentFilters {
  block?: string
  floor?: number
  rooms?: number
  status?: ApartmentStatus
  minPrice?: number
  maxPrice?: number
}

// ── Admin write payloads ──
export interface ApartmentInput {
  block: string
  floor: number
  number: string
  roomsCount: number
  totalArea: number
  pricePerSqm: number
  status: ApartmentStatus
  floorPlanImageUrl?: string | null
  description?: string | null
}

export interface GalleryItemInput {
  imageUrl: string
  category: GalleryCategory
  displayOrder: number
}

export interface SettingsInput {
  heroTitle: string
  heroImageUrl?: string | null
  constructionProgressDescription: string
  constructionProgressPercent: number
  completionYear: string
  contactPhone: string
  whatsAppLink: string
  telegramLink: string
}

// Admin leads inbox row (GET /api/admin/applications).
export interface ApplicationListItem {
  id: string
  name: string
  phone: string
  comment: string | null
  apartmentId: string | null
  apartmentNumber: string | null
  apartmentBlock: string | null
  createdAt: string
  status: ApplicationStatus
}
