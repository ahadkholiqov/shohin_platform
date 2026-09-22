import type {
  ApartmentDetail,
  ApartmentFilters,
  ApartmentInput,
  ApartmentListItem,
  ApplicationCreate,
  ApplicationListItem,
  ApplicationStatus,
  ChessboardBlock,
  GalleryItem,
  GalleryItemInput,
  Settings,
  SettingsInput,
} from './types'

const ADMIN_TOKEN_KEY = 'shohin_admin_token'

export const ADMIN_UNAUTHORIZED_EVENT = 'admin-unauthorized'

export function getAdminToken(): string {
  return localStorage.getItem(ADMIN_TOKEN_KEY) ?? ''
}

export function setAdminToken(token: string): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token)
}

export function clearAdminToken(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY)
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  admin?: boolean
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, admin = false } = options

  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (admin) headers['X-Admin-Token'] = getAdminToken()

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    if (admin && res.status === 401) {
      clearAdminToken()
      window.dispatchEvent(new Event(ADMIN_UNAUTHORIZED_EVENT))
    }
    let message = `Запрос не выполнен (${res.status})`
    try {
      const data = await res.json()
      message = data.error ?? data.title ?? message
    } catch {
    }
    throw new ApiError(res.status, message)
  }

  if (res.status === 204) return undefined as T
  const text = await res.text()
  return (text ? JSON.parse(text) : undefined) as T
}

function buildQuery(params: object): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, String(value))
    }
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export const api = {
  // ── Public ──
  getApartments: (filters: ApartmentFilters = {}) =>
    request<ApartmentListItem[]>(`/apartments${buildQuery(filters)}`),

  getApartment: (id: string) => request<ApartmentDetail>(`/apartments/${id}`),

  getChessboard: () => request<ChessboardBlock[]>('/apartments/chessboard'),

  getSettings: () => request<Settings>('/settings'),

  getGallery: (category?: string) =>
    request<GalleryItem[]>(`/gallery${buildQuery({ category })}`),

  submitApplication: (payload: ApplicationCreate) =>
    request<{ id: string }>('/applications', { method: 'POST', body: payload }),

  // ── Admin: auth ──
  login: (token: string) =>
    request<{ success: boolean }>('/admin/login', { method: 'POST', body: { token } }),

  // ── Admin: apartments ──
  createApartment: (payload: ApartmentInput) =>
    request<ApartmentDetail>('/admin/apartments', { method: 'POST', body: payload, admin: true }),

  updateApartment: (id: string, payload: ApartmentInput) =>
    request<void>(`/admin/apartments/${id}`, { method: 'PUT', body: payload, admin: true }),

  deleteApartment: (id: string) =>
    request<void>(`/admin/apartments/${id}`, { method: 'DELETE', admin: true }),

  // ── Admin: applications ──
  getAdminApplications: (status?: ApplicationStatus) =>
    request<ApplicationListItem[]>(`/admin/applications${buildQuery({ status })}`, { admin: true }),

  updateApplicationStatus: (id: string, status: ApplicationStatus) =>
    request<void>(`/admin/applications/${id}/status`, { method: 'PUT', body: { status }, admin: true }),

  // ── Admin: gallery ──
  createGalleryItem: (payload: GalleryItemInput) =>
    request<GalleryItem>('/admin/gallery', { method: 'POST', body: payload, admin: true }),

  updateGalleryItem: (id: string, payload: GalleryItemInput) =>
    request<void>(`/admin/gallery/${id}`, { method: 'PUT', body: payload, admin: true }),

  deleteGalleryItem: (id: string) =>
    request<void>(`/admin/gallery/${id}`, { method: 'DELETE', admin: true }),

  // ── Admin: settings ──
  updateSettings: (payload: SettingsInput) =>
    request<void>('/admin/settings', { method: 'PUT', body: payload, admin: true }),

  // ── Admin: seed (dev) ──
  seed: () =>
    request<{ apartmentsCreated: number; settingsCreated: boolean }>('/admin/seed', {
      method: 'POST',
      admin: true,
    }),

  // ── Admin: file upload (multipart) ──
  uploadFile: async (file: File): Promise<{ url: string }> => {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { 'X-Admin-Token': getAdminToken() },
      body: form,
    })
    if (!res.ok) {
      if (res.status === 401) {
        clearAdminToken()
        window.dispatchEvent(new Event(ADMIN_UNAUTHORIZED_EVENT))
      }
      let message = `Загрузка не выполнена (${res.status})`
      try {
        const data = await res.json()
        message = data.error ?? message
      } catch {
      }
      throw new ApiError(res.status, message)
    }
    return (await res.json()) as { url: string }
  },
}
