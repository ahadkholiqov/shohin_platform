import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { api, ApiError } from '../../api/client'
import type { GalleryCategory, GalleryItem } from '../../api/types'

type LoadStatus = 'loading' | 'error' | 'ready'

const CATEGORIES: { value: GalleryCategory; label: string; cls: string }[] = [
  { value: 'Construction', label: 'Стройка', cls: 'cat-construction' },
  { value: 'Renders', label: 'Рендеры', cls: 'cat-renders' },
]

function catLabel(c: GalleryCategory): string {
  return CATEGORIES.find((x) => x.value === c)?.label ?? c
}
function catClass(c: GalleryCategory): string {
  return CATEGORIES.find((x) => x.value === c)?.cls ?? 'cat-construction'
}

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [tab, setTab] = useState<'' | GalleryCategory>('')

  // Upload modal.
  const [uploadOpen, setUploadOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)
  const [newCategory, setNewCategory] = useState<GalleryCategory>('Construction')
  const [newOrder, setNewOrder] = useState('10')
  const [saving, setSaving] = useState(false)
  const [uploadError, setUploadError] = useState('')

  // Delete confirm.
  const [toDelete, setToDelete] = useState<GalleryItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      setItems(await api.getGallery())
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const counts = useMemo(() => {
    const c = { Construction: 0, Renders: 0 }
    for (const i of items) c[i.category] += 1
    return c
  }, [items])

  const filtered = useMemo(
    () => (tab ? items.filter((i) => i.category === tab) : items),
    [items, tab],
  )

  // Inline edit (category / order) → PUT the whole item.
  async function updateItem(item: GalleryItem, patch: Partial<GalleryItem>) {
    const next = { ...item, ...patch }
    setItems((list) => list.map((i) => (i.id === item.id ? next : i)))
    try {
      await api.updateGalleryItem(item.id, {
        imageUrl: next.imageUrl,
        category: next.category,
        displayOrder: next.displayOrder,
      })
    } catch {
      await load() // revert to server truth on failure
    }
  }

  function openUpload() {
    setFile(null)
    setPreviewSrc(null)
    setNewCategory('Construction')
    setNewOrder('10')
    setUploadError('')
    setUploadOpen(true)
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    const reader = new FileReader()
    reader.onload = (ev) => setPreviewSrc(ev.target?.result as string)
    reader.readAsDataURL(f)
  }

  async function submitUpload(e: FormEvent) {
    e.preventDefault()
    if (!file) {
      setUploadError('Выберите файл.')
      return
    }
    if (newOrder.trim() === '') {
      setUploadError('Укажите порядок сортировки.')
      return
    }
    setSaving(true)
    setUploadError('')
    try {
      const { url } = await api.uploadFile(file)
      await api.createGalleryItem({
        imageUrl: url,
        category: newCategory,
        displayOrder: Number(newOrder) || 0,
      })
      setUploadOpen(false)
      await load()
    } catch (err) {
      setUploadError(err instanceof ApiError ? err.message : 'Не удалось загрузить фото.')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      await api.deleteGalleryItem(toDelete.id)
      setToDelete(null)
      await load()
    } catch {
      /* keep dialog open */
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Галерея</div>
          <div className="admin-page-sub">Фотографии стройки и рендеры — отображаются на публичном сайте</div>
        </div>
        <button type="button" className="admin-add-btn" onClick={openUpload}>
          <svg viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Добавить фото
        </button>
      </div>

      <div className="admin-gal-tabs">
        <button type="button" className={`admin-gal-tab${tab === '' ? ' active' : ''}`} onClick={() => setTab('')}>
          Все <span className="admin-gal-tab-count">{items.length}</span>
        </button>
        <button
          type="button"
          className={`admin-gal-tab${tab === 'Construction' ? ' active' : ''}`}
          onClick={() => setTab('Construction')}
        >
          Стройка <span className="admin-gal-tab-count">{counts.Construction}</span>
        </button>
        <button
          type="button"
          className={`admin-gal-tab${tab === 'Renders' ? ' active' : ''}`}
          onClick={() => setTab('Renders')}
        >
          Рендеры <span className="admin-gal-tab-count">{counts.Renders}</span>
        </button>
      </div>

      {status === 'loading' && <div className="admin-placeholder-box">Загрузка…</div>}
      {status === 'error' && (
        <div className="admin-placeholder-box">
          <p>Не удалось загрузить галерею.</p>
          <button className="admin-btn-cancel" style={{ marginTop: 10 }} onClick={load}>
            Повторить
          </button>
        </div>
      )}

      {status === 'ready' && filtered.length === 0 && (
        <div className="admin-placeholder-box">
          <svg viewBox="0 0 24 24" style={{ width: 32, height: 32, stroke: 'var(--aborder)', fill: 'none', strokeWidth: 1.5 }}>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="m3 9 4-4 4 4 4-5 4 5" />
            <circle cx="8.5" cy="6.5" r="1.5" />
          </svg>
          <p style={{ marginTop: 10 }}>Пока нет изображений. Нажмите «Добавить фото».</p>
        </div>
      )}

      {status === 'ready' && filtered.length > 0 && (
        <div className="admin-gallery-grid">
          {filtered.map((item) => (
            <div className="admin-photo-card" key={item.id}>
              <img className="admin-photo-thumb" src={item.imageUrl} alt="" />
              <div className="admin-photo-body">
                <div className="admin-photo-meta">
                  <span className={`admin-photo-cat ${catClass(item.category)}`}>{catLabel(item.category)}</span>
                  <span className="admin-photo-order">
                    <span className="admin-photo-order-lbl">Порядок</span>
                    <input
                      className="admin-photo-order-input"
                      type="number"
                      min={0}
                      defaultValue={item.displayOrder}
                      onBlur={(e) => {
                        // Ignore an empty value (would otherwise save 0).
                        if (e.target.value.trim() === '') {
                          e.target.value = String(item.displayOrder)
                          return
                        }
                        const v = Number(e.target.value)
                        if (v !== item.displayOrder) updateItem(item, { displayOrder: v })
                      }}
                    />
                  </span>
                </div>
                <div className="admin-photo-actions">
                  <select
                    className="admin-photo-cat-select"
                    value={item.category}
                    onChange={(e) => updateItem(item, { category: e.target.value as GalleryCategory })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <button type="button" className="admin-btn-del" onClick={() => setToDelete(item)}>
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Upload modal ── */}
      {uploadOpen && (
        <div className="admin-overlay" onClick={(e) => e.target === e.currentTarget && !saving && setUploadOpen(false)}>
          <form className="admin-modal" style={{ maxWidth: 460 }} onSubmit={submitUpload}>
            <div className="admin-modal-header">
              <div className="admin-modal-title">Добавить фото</div>
              <button type="button" className="admin-modal-close" onClick={() => setUploadOpen(false)} aria-label="Закрыть">
                <svg viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-group">
                <label className="admin-form-label">Файл *</label>
                <div className="admin-upload-area">
                  <input type="file" accept="image/*" required onChange={onFile} />
                  <svg viewBox="0 0 24 24">
                    <polyline points="16 16 12 12 8 16" />
                    <line x1="12" y1="12" x2="12" y2="21" />
                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                  </svg>
                  <p>
                    <span>{file ? 'Файл выбран' : 'Выберите файл'}</span>
                    {!file && ' или перетащите сюда'}
                  </p>
                  <p className="admin-upload-hint">JPG, PNG, WebP, GIF · до 20 МБ</p>
                </div>
                {previewSrc && (
                  <div className="admin-preview">
                    <img src={previewSrc} alt="Превью" />
                  </div>
                )}
              </div>
              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label className="admin-form-label">Категория *</label>
                  <select
                    className="admin-form-input"
                    required
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as GalleryCategory)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Порядок сортировки *</label>
                  <input
                    className="admin-form-input"
                    type="number"
                    required
                    min={0}
                    value={newOrder}
                    onChange={(e) => setNewOrder(e.target.value)}
                  />
                </div>
              </div>
              {uploadError && <div className="admin-form-error">{uploadError}</div>}
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="admin-btn-cancel" onClick={() => setUploadOpen(false)} disabled={saving}>
                Отмена
              </button>
              <button type="submit" className="admin-btn-save" disabled={saving}>
                {saving ? 'Загрузка…' : 'Загрузить'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Delete confirm ── */}
      {toDelete && (
        <div className="admin-overlay" onClick={(e) => e.target === e.currentTarget && setToDelete(null)}>
          <div className="admin-confirm">
            <div className="admin-confirm-icon">
              <svg viewBox="0 0 24 24">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </div>
            <div className="admin-confirm-title">Удалить фото?</div>
            <div className="admin-confirm-sub">Фотография будет удалена с сайта. Это действие необратимо.</div>
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
