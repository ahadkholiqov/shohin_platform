import type {
  ApartmentDetail,
  ApartmentFilters,
  ApartmentListItem,
  ApplicationCreate,
  ChessboardBlock,
  GalleryItem,
  Settings,
} from './types'

const ADMIN_TOKEN_KEY = 'shohin_admin_token'

export function getAdminToken(): string {
  return localStorage.getItem(ADMIN_TOKEN_KEY) ?? ''
}

export function setAdminToken(token: string): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token)
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
    let message = `Запрос не выполнен (${res.status})`
    try {
      const data = await res.json()
      message = data.error ?? data.title ?? message
    } catch {
      // response had no JSON body — keep the default message
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

  // ── Admin ──
  seed: () =>
    request<{ apartmentsCreated: number; settingsCreated: boolean }>('/admin/seed', {
      method: 'POST',
      admin: true,
    }),
}
