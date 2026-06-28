import { useEffect, useState } from 'react'
import Modal from './ui/Modal'

export type CatalogFilters = {
  block: string
  rooms: string
  status: string
  minFloor: string
  maxFloor: string
  minPrice: string
  maxPrice: string
}

export const EMPTY_FILTERS: CatalogFilters = {
  block: '',
  rooms: '',
  status: '',
  minFloor: '',
  maxFloor: '',
  minPrice: '',
  maxPrice: '',
}

type Props = {
  open: boolean
  initial: CatalogFilters
  onApply: (filters: CatalogFilters) => void
  onClose: () => void
}

const BLOCKS = ['A', 'B']
const ROOMS = ['1', '2', '3', '4+']
const STATUSES: { value: string; label: string }[] = [
  { value: 'Available', label: 'Свободна' },
  { value: 'Reserved', label: 'Бронь' },
  { value: 'Sold', label: 'Продана' },
]

export default function FiltersSheet({ open, initial, onApply, onClose }: Props) {
  const [draft, setDraft] = useState<CatalogFilters>(initial)

  // Re-sync the draft to the applied filters each time the sheet opens.
  useEffect(() => {
    if (open) setDraft(initial)
  }, [open, initial])

  // Single-select chips (clicking the active one clears it).
  const toggle = (key: keyof CatalogFilters, value: string) =>
    setDraft((d) => ({ ...d, [key]: d[key] === value ? '' : value }))

  const set = (key: keyof CatalogFilters, value: string) =>
    setDraft((d) => ({ ...d, [key]: value }))

  return (
    <Modal open={open} onClose={onClose} title="Фильтры">
      <div className="sheet-section">
        <div className="sheet-label">Блок</div>
        <div className="chip-row">
          {BLOCKS.map((b) => (
            <button
              key={b}
              type="button"
              className={`chip${draft.block === b ? ' active' : ''}`}
              onClick={() => toggle('block', b)}
            >
              Блок {b}
            </button>
          ))}
        </div>
      </div>

      <div className="sheet-section">
        <div className="sheet-label">Количество комнат</div>
        <div className="chip-row">
          {ROOMS.map((r) => (
            <button
              key={r}
              type="button"
              className={`chip${draft.rooms === r ? ' active' : ''}`}
              onClick={() => toggle('rooms', r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="sheet-section">
        <div className="sheet-label">Статус</div>
        <div className="chip-row">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              type="button"
              className={`chip${draft.status === s.value ? ' active' : ''}`}
              onClick={() => toggle('status', s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="sheet-section">
        <div className="sheet-label">Этаж</div>
        <div className="range-row">
          <input
            className="range-input"
            type="number"
            inputMode="numeric"
            placeholder="От"
            min={1}
            max={17}
            value={draft.minFloor}
            onChange={(e) => set('minFloor', e.target.value)}
          />
          <input
            className="range-input"
            type="number"
            inputMode="numeric"
            placeholder="До"
            min={1}
            max={17}
            value={draft.maxFloor}
            onChange={(e) => set('maxFloor', e.target.value)}
          />
        </div>
      </div>

      <div className="sheet-section">
        <div className="sheet-label">Цена (сомони)</div>
        <div className="range-row">
          <input
            className="range-input"
            type="number"
            inputMode="numeric"
            placeholder="От"
            value={draft.minPrice}
            onChange={(e) => set('minPrice', e.target.value)}
          />
          <input
            className="range-input"
            type="number"
            inputMode="numeric"
            placeholder="До"
            value={draft.maxPrice}
            onChange={(e) => set('maxPrice', e.target.value)}
          />
        </div>
      </div>

      <div className="sheet-actions">
        <button type="button" className="btn-reset" onClick={() => setDraft(EMPTY_FILTERS)}>
          Сбросить
        </button>
        <button type="button" className="btn-apply" onClick={() => onApply(draft)}>
          Показать квартиры
        </button>
      </div>
    </Modal>
  )
}
