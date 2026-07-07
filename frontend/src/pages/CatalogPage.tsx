import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client'
import type { ApartmentFilters, ApartmentListItem, ApartmentStatus } from '../api/types'
import ApartmentCard from '../components/ApartmentCard'
import ApartmentModal from '../components/ApartmentModal'
import FiltersSheet, { EMPTY_FILTERS, type CatalogFilters } from '../components/FiltersSheet'

type LoadStatus = 'loading' | 'error' | 'ready'

const STATUS_RU: Record<string, string> = {
  Available: 'Свободна',
  Reserved: 'Бронь',
  Sold: 'Продана',
}

export default function CatalogPage() {
  const [filters, setFilters] = useState<CatalogFilters>(EMPTY_FILTERS)
  const [apartments, setApartments] = useState<ApartmentListItem[]>([])
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const load = useCallback(async (f: CatalogFilters) => {
    setStatus('loading')
    try {
      const isPenthouse = f.rooms === 'penthouse'

      // Server-side filters supported by the API.
      const params: ApartmentFilters = {}
      if (f.block) params.block = f.block
      if (f.rooms && !isPenthouse) params.rooms = Number(f.rooms)
      if (f.status) params.status = f.status as ApartmentStatus
      if (f.minPrice) params.minPrice = Number(f.minPrice)
      if (f.maxPrice) params.maxPrice = Number(f.maxPrice)

      let list = await api.getApartments(params)

      // Penthouse is a derived flag (floor 17), not a room count → filter client-side.
      // Its floor is fixed, so the floor-range inputs are ignored while it's active.
      if (isPenthouse) {
        list = list.filter((a) => a.isPenthouse)
      } else {
        if (f.minFloor) list = list.filter((a) => a.floor >= Number(f.minFloor))
        if (f.maxFloor) list = list.filter((a) => a.floor <= Number(f.maxFloor))
      }

      setApartments(list)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    load(filters)
  }, [filters, load])

  const hasFilters = Object.values(filters).some(Boolean)

  const clearKeys = (keys: (keyof CatalogFilters)[]) =>
    setFilters((f) => {
      const next = { ...f }
      for (const k of keys) next[k] = ''
      return next
    })

  // Active filter chips shown below the results bar.
  const tags: { label: string; keys: (keyof CatalogFilters)[] }[] = []
  if (filters.block) tags.push({ label: `Блок ${filters.block}`, keys: ['block'] })
  if (filters.rooms)
    tags.push({
      label: filters.rooms === 'penthouse' ? 'Пентхаус' : `${filters.rooms} комн.`,
      keys: ['rooms'],
    })
  if (filters.status) tags.push({ label: STATUS_RU[filters.status], keys: ['status'] })
  if (filters.minFloor || filters.maxFloor)
    tags.push({
      label: `Этаж ${filters.minFloor || '1'}–${filters.maxFloor || '17'}`,
      keys: ['minFloor', 'maxFloor'],
    })
  if (filters.minPrice || filters.maxPrice)
    tags.push({
      label: `Цена ${filters.minPrice || '...'}–${filters.maxPrice || '...'}`,
      keys: ['minPrice', 'maxPrice'],
    })

  return (
    <div className="catalog">
      <header className="cat-topbar">
        <div className="cat-title">Каталог квартир</div>
        <button
          type="button"
          className={`cat-filter-btn${hasFilters ? ' active' : ''}`}
          onClick={() => setFiltersOpen(true)}
        >
          <svg viewBox="0 0 24 24">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="8" y1="12" x2="16" y2="12" />
            <line x1="11" y1="18" x2="13" y2="18" />
          </svg>
          Фильтры
        </button>
      </header>

      <div className="cat-results">
        Найдено: <span>{apartments.length}</span> квартир
      </div>

      {tags.length > 0 && (
        <div className="cat-tags">
          {tags.map((t) => (
            <button type="button" className="cat-tag" key={t.label} onClick={() => clearKeys(t.keys)}>
              {t.label}
              <svg viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          ))}
        </div>
      )}

      {status === 'loading' && <div className="page-state">Загрузка…</div>}

      {status === 'error' && (
        <div className="page-state">
          <p>Не удалось загрузить квартиры.</p>
          <button className="btn-secondary" onClick={() => load(filters)}>
            Повторить
          </button>
        </div>
      )}

      {status === 'ready' && apartments.length === 0 && (
        <div className="cat-empty">
          <svg viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <p>Нет доступных квартир по заданным фильтрам</p>
        </div>
      )}

      {status === 'ready' && apartments.length > 0 && (
        <div className="apt-grid">
          {apartments.map((a) => (
            <ApartmentCard key={a.id} apartment={a} onClick={() => setSelectedId(a.id)} />
          ))}
        </div>
      )}

      <FiltersSheet
        open={filtersOpen}
        initial={filters}
        onClose={() => setFiltersOpen(false)}
        onApply={(f) => {
          setFilters(f)
          setFiltersOpen(false)
        }}
      />

      {selectedId && <ApartmentModal apartmentId={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  )
}
