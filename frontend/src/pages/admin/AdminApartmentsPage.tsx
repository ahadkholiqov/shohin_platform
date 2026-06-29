import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { api, ApiError } from '../../api/client'
import type { ApartmentInput, ApartmentListItem, ApartmentStatus } from '../../api/types'
import StatusBadge from '../../components/ui/StatusBadge'
import { formatMoney } from '../../components/ui/formatMoney'

type LoadStatus = 'loading' | 'error' | 'ready'

const STATUS_OPTIONS: { value: ApartmentStatus; label: string }[] = [
  { value: 'Available', label: 'Свободна' },
  { value: 'Reserved', label: 'Бронь' },
  { value: 'Sold', label: 'Продана' },
]

type FormState = {
  id: string | null
  block: string
  floor: string
  number: string
  roomsCount: string
  totalArea: string
  pricePerSqm: string
  status: ApartmentStatus
  floorPlanImageUrl: string | null
  description: string
}

function emptyForm(): FormState {
  return {
    id: null,
    block: 'A',
    floor: '',
    number: '',
    roomsCount: '',
    totalArea: '',
    pricePerSqm: '6180',
    status: 'Available',
    floorPlanImageUrl: null,
    description: '',
  }
}

export default function AdminApartmentsPage() {
  const [apartments, setApartments] = useState<ApartmentListItem[]>([])
  const [status, setStatus] = useState<LoadStatus>('loading')

  // Filters (client-side).
  const [search, setSearch] = useState('')
  const [blockFilter, setBlockFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Edit/create modal.
  const [modalOpen, setModalOpen] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  // Delete confirmation.
  const [toDelete, setToDelete] = useState<ApartmentListItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      setApartments(await api.getApartments())
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return apartments.filter((a) => {
      if (q && !a.number.toLowerCase().includes(q)) return false
      if (blockFilter && a.block !== blockFilter) return false
      if (statusFilter && a.status !== statusFilter) return false
      return true
    })
  }, [apartments, search, blockFilter, statusFilter])

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function openCreate() {
    setForm(emptyForm())
    setPreviewSrc(null)
    setFormError('')
    setModalOpen(true)
  }

  async function openEdit(item: ApartmentListItem) {
    setFormError('')
    setModalOpen(true)
    setModalLoading(true)
    try {
      const d = await api.getApartment(item.id)
      setForm({
        id: d.id,
        block: d.block,
        floor: String(d.floor),
        number: d.number,
        roomsCount: String(d.roomsCount),
        totalArea: String(d.totalArea),
        pricePerSqm: String(d.pricePerSqm),
        status: d.status,
        floorPlanImageUrl: d.floorPlanImageUrl,
        description: d.description ?? '',
      })
      setPreviewSrc(d.floorPlanImageUrl)
    } catch {
      setFormError('Не удалось загрузить квартиру.')
    } finally {
      setModalLoading(false)
    }
  }

  function closeModal() {
    if (saving) return
    setModalOpen(false)
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    // Instant local preview, then upload to the server for the stored URL.
    const reader = new FileReader()
    reader.onload = (ev) => setPreviewSrc(ev.target?.result as string)
    reader.readAsDataURL(file)

    setUploading(true)
    setFormError('')
    try {
      const { url } = await api.uploadFile(file)
      setField('floorPlanImageUrl', url)
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Не удалось загрузить изображение.')
      setPreviewSrc(form.floorPlanImageUrl)
    } finally {
      setUploading(false)
    }
  }

  const totalPreview =
    Number(form.totalArea) > 0 && Number(form.pricePerSqm) > 0
      ? Number(form.totalArea) * Number(form.pricePerSqm)
      : 0

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const floor = Number(form.floor)
    const rooms = Number(form.roomsCount)
    if (!/^[AB]$/.test(form.block)) return setFormError('Выберите блок (A или B).')
    if (form.floor.trim() === '' || !Number.isInteger(floor) || floor < 1 || floor > 17)
      return setFormError('Этаж обязателен и должен быть от 1 до 17.')
    if (!form.number.trim()) return setFormError('Укажите номер квартиры.')
    if (form.roomsCount.trim() === '' || !Number.isInteger(rooms) || rooms < 1 || rooms > 20)
      return setFormError('Количество комнат обязательно и должно быть от 1 до 20.')
    if (Number(form.totalArea) <= 0) return setFormError('Площадь должна быть больше нуля.')
    if (Number(form.pricePerSqm) <= 0) return setFormError('Цена за м² должна быть больше нуля.')

    const payload: ApartmentInput = {
      block: form.block,
      floor,
      number: form.number.trim(),
      roomsCount: rooms,
      totalArea: Number(form.totalArea),
      pricePerSqm: Number(form.pricePerSqm),
      status: form.status,
      floorPlanImageUrl: form.floorPlanImageUrl,
      description: form.description.trim() || null,
    }

    setSaving(true)
    setFormError('')
    try {
      if (form.id) await api.updateApartment(form.id, payload)
      else await api.createApartment(payload)
      setModalOpen(false)
      await load()
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setFormError('Квартира с таким блоком и номером уже существует.')
      } else if (err instanceof ApiError && err.status === 400) {
        setFormError('Проверьте правильность заполнения полей.')
      } else {
        setFormError('Не удалось сохранить квартиру.')
      }
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      await api.deleteApartment(toDelete.id)
      setToDelete(null)
      await load()
    } catch {
      // keep the dialog open; surface a minimal message
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Квартиры</div>
          <div className="admin-page-sub">Управление объектами ЖК Shohin Plaza</div>
        </div>
        <button type="button" className="admin-add-btn" onClick={openCreate}>
          <svg viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Добавить квартиру
        </button>
      </div>

      <div className="admin-filters">
        <div className="admin-search">
          <svg viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Поиск по номеру..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="admin-filter-select" value={blockFilter} onChange={(e) => setBlockFilter(e.target.value)}>
          <option value="">Все блоки</option>
          <option value="A">Блок A</option>
          <option value="B">Блок B</option>
        </select>
        <select className="admin-filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Все статусы</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <div className="admin-filters-count">
          Показано: <strong>{filtered.length}</strong> из {apartments.length}
        </div>
      </div>

      {status === 'loading' && <div className="admin-placeholder-box">Загрузка…</div>}
      {status === 'error' && (
        <div className="admin-placeholder-box">
          <p>Не удалось загрузить квартиры.</p>
          <button className="admin-btn-cancel" style={{ marginTop: 10 }} onClick={load}>
            Повторить
          </button>
        </div>
      )}

      {status === 'ready' && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Блок</th>
                <th>№</th>
                <th>Этаж</th>
                <th>Комнат</th>
                <th>Площадь, м²</th>
                <th>Цена, сомони</th>
                <th>Статус</th>
                <th>Пентхаус</th>
                <th style={{ textAlign: 'right' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="admin-table-empty">
                    Квартиры не найдены
                  </td>
                </tr>
              )}
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td>{a.block}</td>
                  <td className="admin-td-num">{a.number}</td>
                  <td>{a.floor}</td>
                  <td>{a.roomsCount}</td>
                  <td>{a.totalArea}</td>
                  <td className="admin-td-price">{formatMoney(a.totalPrice)}</td>
                  <td>
                    <StatusBadge status={a.status} />
                  </td>
                  <td>
                    {a.isPenthouse ? (
                      <span className="admin-pent-yes">Да</span>
                    ) : (
                      <span className="admin-pent-no">—</span>
                    )}
                  </td>
                  <td>
                    <div className="admin-td-actions">
                      <button type="button" className="admin-btn-edit" onClick={() => openEdit(a)}>
                        Ред.
                      </button>
                      <button type="button" className="admin-btn-del" onClick={() => setToDelete(a)}>
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Create / Edit modal ── */}
      {modalOpen && (
        <div className="admin-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <form className="admin-modal" onSubmit={handleSubmit}>
            <div className="admin-modal-header">
              <div className="admin-modal-title">
                {form.id ? `Редактировать: ${form.number}` : 'Добавить квартиру'}
              </div>
              <button type="button" className="admin-modal-close" onClick={closeModal} aria-label="Закрыть">
                <svg viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="admin-modal-body">
              {modalLoading ? (
                <div className="admin-placeholder-box">Загрузка…</div>
              ) : (
                <>
                  <div className="admin-form-grid">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Блок *</label>
                      <select className="admin-form-input" value={form.block} onChange={(e) => setField('block', e.target.value)}>
                        <option value="A">A</option>
                        <option value="B">B</option>
                      </select>
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label">Этаж *</label>
                      <input
                        className="admin-form-input"
                        type="number"
                        required
                        min={1}
                        max={17}
                        placeholder="1–17"
                        value={form.floor}
                        onChange={(e) => setField('floor', e.target.value)}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label">Номер квартиры *</label>
                      <input
                        className="admin-form-input"
                        type="text"
                        placeholder="А-701"
                        value={form.number}
                        onChange={(e) => setField('number', e.target.value)}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label">Количество комнат *</label>
                      <input
                        className="admin-form-input"
                        type="number"
                        required
                        min={1}
                        max={20}
                        placeholder="1–4"
                        value={form.roomsCount}
                        onChange={(e) => setField('roomsCount', e.target.value)}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label">Площадь, м² *</label>
                      <input
                        className="admin-form-input"
                        type="number"
                        step="0.1"
                        placeholder="0.00"
                        value={form.totalArea}
                        onChange={(e) => setField('totalArea', e.target.value)}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label">Цена за м², сомони *</label>
                      <input
                        className="admin-form-input"
                        type="number"
                        placeholder="6180"
                        value={form.pricePerSqm}
                        onChange={(e) => setField('pricePerSqm', e.target.value)}
                      />
                    </div>
                    <div className="admin-form-group admin-span2">
                      <label className="admin-form-label">Итоговая цена (авторасчёт)</label>
                      <div className="admin-price-auto">
                        <span className="admin-price-auto-lbl">Площадь × Цена за м²</span>
                        <span className="admin-price-auto-val">
                          {totalPreview > 0 ? formatMoney(totalPreview) : '—'}
                        </span>
                      </div>
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label">Статус *</label>
                      <select
                        className="admin-form-input"
                        value={form.status}
                        onChange={(e) => setField('status', e.target.value as ApartmentStatus)}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="admin-form-group admin-pent-hint">
                      {Number(form.floor) === 17
                        ? 'Пентхаус (17 этаж) — присваивается автоматически'
                        : ''}
                    </div>
                  </div>

                  <hr className="admin-divider" />

                  <div className="admin-form-group">
                    <label className="admin-form-label">Планировка квартиры</label>
                    <div className="admin-upload-area">
                      <input type="file" accept="image/*" onChange={handleFile} />
                      <svg viewBox="0 0 24 24">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="m3 9 4-4 4 4 4-5 4 5" />
                        <circle cx="8.5" cy="6.5" r="1.5" />
                      </svg>
                      <p>
                        <span>{uploading ? 'Загрузка…' : 'Выберите файл'}</span>
                        {!uploading && ' или перетащите сюда'}
                      </p>
                      <p className="admin-upload-hint">JPG, PNG, WebP, GIF · до 20 МБ</p>
                    </div>
                    {previewSrc && (
                      <div className="admin-preview">
                        <img src={previewSrc} alt="Превью планировки" />
                      </div>
                    )}
                  </div>

                  <div className="admin-form-group" style={{ marginTop: 14 }}>
                    <label className="admin-form-label">Описание (необязательно)</label>
                    <textarea
                      className="admin-form-input"
                      rows={3}
                      style={{ resize: 'vertical' }}
                      placeholder="Дополнительная информация о квартире…"
                      value={form.description}
                      onChange={(e) => setField('description', e.target.value)}
                    />
                  </div>

                  {formError && <div className="admin-form-error">{formError}</div>}
                </>
              )}
            </div>

            <div className="admin-modal-footer">
              <button type="button" className="admin-btn-cancel" onClick={closeModal} disabled={saving}>
                Отмена
              </button>
              <button type="submit" className="admin-btn-save" disabled={saving || uploading || modalLoading}>
                {saving ? 'Сохранение…' : 'Сохранить'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Delete confirmation ── */}
      {toDelete && (
        <div className="admin-overlay" onClick={(e) => e.target === e.currentTarget && setToDelete(null)}>
          <div className="admin-confirm">
            <div className="admin-confirm-icon">
              <svg viewBox="0 0 24 24">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </div>
            <div className="admin-confirm-title">Удалить квартиру?</div>
            <div className="admin-confirm-sub">
              Квартира <strong>{toDelete.number}</strong> будет удалена. Это действие необратимо.
            </div>
            <div className="admin-confirm-actions">
              <button type="button" className="admin-btn-cancel" onClick={() => setToDelete(null)} disabled={deleting}>
                Отмена
              </button>
              <button type="button" className="admin-btn-confirm-del" onClick={confirmDelete} disabled={deleting}>
                {deleting ? 'Удаление…' : 'Удалить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
