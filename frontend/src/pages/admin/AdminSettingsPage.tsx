import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { api, ApiError } from '../../api/client'
import type { SettingsInput } from '../../api/types'

type LoadStatus = 'loading' | 'error' | 'ready'

const EMPTY: SettingsInput = {
  heroTitle: '',
  heroImageUrl: '',
  constructionProgressDescription: '',
  constructionProgressPercent: 0,
  completionYear: '',
  installmentTerms: '',
  amenitiesText: '',
  contactPhone: '',
  whatsAppLink: '',
  telegramLink: '',
}

export default function AdminSettingsPage() {
  const [form, setForm] = useState<SettingsInput>(EMPTY)
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [heroUploading, setHeroUploading] = useState(false)

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const s = await api.getSettings()
      setForm({
        heroTitle: s.heroTitle,
        heroImageUrl: s.heroImageUrl ?? '',
        constructionProgressDescription: s.constructionProgressDescription,
        constructionProgressPercent: s.constructionProgressPercent,
        completionYear: s.completionYear,
        installmentTerms: s.installmentTerms ?? '',
        amenitiesText: s.amenitiesText ?? '',
        contactPhone: s.contactPhone,
        whatsAppLink: s.whatsAppLink,
        telegramLink: s.telegramLink,
      })
      setStatus('ready')
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setForm(EMPTY)
        setStatus('ready')
      } else {
        setStatus('error')
      }
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function setField<K extends keyof SettingsInput>(key: K, value: SettingsInput[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setSaved(false)
  }

  async function onHeroFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setHeroUploading(true)
    setError('')
    try {
      const { url } = await api.uploadFile(file)
      setField('heroImageUrl', url)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось загрузить изображение.')
    } finally {
      setHeroUploading(false)
      e.target.value = ''
    }
  }

  const pct = Math.max(0, Math.min(100, Number(form.constructionProgressPercent) || 0))

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const required = [
      form.heroTitle,
      form.constructionProgressDescription,
      form.completionYear,
      form.contactPhone,
      form.whatsAppLink,
      form.telegramLink,
    ]
    if (required.some((v) => v.trim() === '')) {
      setError('Заполните все обязательные поля.')
      return
    }

    setSaving(true)
    setError('')
    try {
      await api.updateSettings({ ...form, constructionProgressPercent: pct })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось сохранить настройки.')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading') return <div className="admin-placeholder-box">Загрузка…</div>
  if (status === 'error')
    return (
      <div className="admin-placeholder-box">
        <p>Не удалось загрузить настройки.</p>
        <button className="admin-btn-cancel" style={{ marginTop: 10 }} onClick={load}>
          Повторить
        </button>
      </div>
    )

  return (
    <form onSubmit={handleSubmit}>
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Настройки сайта</div>
          <div className="admin-page-sub">Данные отображаются на публичном сайте ЖК Shohin Plaza</div>
        </div>
      </div>

      <div className="admin-settings">
        {/* Главная страница */}
        <div className="admin-card">
          <div className="admin-card-title">Главная страница</div>
          <div className="admin-form-group">
            <label className="admin-form-label">Главный заголовок *</label>
            <input
              className="admin-form-input"
              type="text"
              required
              placeholder="Заголовок героя…"
              value={form.heroTitle}
              onChange={(e) => setField('heroTitle', e.target.value)}
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Описание хода строительства *</label>
            <textarea
              className="admin-form-input"
              rows={3}
              required
              style={{ resize: 'vertical' }}
              placeholder="Описание текущего состояния стройки…"
              value={form.constructionProgressDescription}
              onChange={(e) => setField('constructionProgressDescription', e.target.value)}
            />
          </div>
        </div>

        {/* Изображение hero */}
        <div className="admin-card">
          <div className="admin-card-title">Фото главного экрана</div>
          <div className="admin-form-group">
            <label className="admin-form-label">Изображение героя (необязательно)</label>
            {form.heroImageUrl ? (
              <div className="admin-preview">
                <img src={form.heroImageUrl} alt="Превью героя" />
              </div>
            ) : (
              <div className="admin-page-sub" style={{ marginBottom: 10 }}>
                Если не задано — на сайте показывается стандартная 3D-графика здания.
              </div>
            )}
            <input type="file" accept="image/*" onChange={onHeroFile} disabled={heroUploading} />
            <div className="admin-form-row" style={{ marginTop: 8 }}>
              {heroUploading && <span className="admin-page-sub">Загрузка…</span>}
              {form.heroImageUrl && !heroUploading && (
                <button
                  type="button"
                  className="admin-btn-cancel"
                  onClick={() => setField('heroImageUrl', '')}
                >
                  Убрать изображение
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Ход строительства */}
        <div className="admin-card">
          <div className="admin-card-title">Ход строительства</div>
          <div className="admin-form-group">
            <label className="admin-form-label">Процент готовности (0–100) *</label>
            <input
              className="admin-form-input"
              type="number"
              required
              min={0}
              max={100}
              value={form.constructionProgressPercent}
              onChange={(e) => setField('constructionProgressPercent', Number(e.target.value))}
            />
            <div className="admin-progress-preview">
              <div className="admin-progress-bar">
                <div className="admin-progress-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="admin-progress-val">{pct}%</span>
            </div>
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Год / дата сдачи *</label>
            <input
              className="admin-form-input"
              type="text"
              required
              placeholder="например: 2026 или IV квартал 2026"
              value={form.completionYear}
              onChange={(e) => setField('completionYear', e.target.value)}
            />
          </div>
        </div>

        {/* Продажные хуки */}
        <div className="admin-card">
          <div className="admin-card-title">Продажные предложения</div>
          <div className="admin-form-group">
            <label className="admin-form-label">Условия рассрочки</label>
            <textarea
              className="admin-form-input"
              rows={2}
              style={{ resize: 'vertical' }}
              placeholder="например: Рассрочка до 3 лет · Первоначальный взнос от 30%"
              value={form.installmentTerms ?? ''}
              onChange={(e) => setField('installmentTerms', e.target.value)}
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Удобства и инфраструктура дома</label>
            <textarea
              className="admin-form-input"
              rows={6}
              style={{ resize: 'vertical' }}
              placeholder="Подземная парковка&#10;Видеонаблюдение 24/7&#10;Высокоскоростные лифты"
              value={form.amenitiesText ?? ''}
              onChange={(e) => setField('amenitiesText', e.target.value)}
            />
            <div className="admin-page-sub" style={{ marginTop: 6 }}>
              Вводите каждый пункт с новой строки.
            </div>
          </div>
        </div>

        {/* Контакты */}
        <div className="admin-card">
          <div className="admin-card-title">Контакты</div>
          <div className="admin-form-group">
            <label className="admin-form-label">Контактный телефон *</label>
            <input
              className="admin-form-input"
              type="tel"
              required
              placeholder="+992 90 000 00 00"
              value={form.contactPhone}
              onChange={(e) => setField('contactPhone', e.target.value)}
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Ссылка на WhatsApp *</label>
            <input
              className="admin-form-input"
              type="url"
              required
              placeholder="https://wa.me/992..."
              value={form.whatsAppLink}
              onChange={(e) => setField('whatsAppLink', e.target.value)}
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Ссылка на Telegram *</label>
            <input
              className="admin-form-input"
              type="url"
              required
              placeholder="https://t.me/username"
              value={form.telegramLink}
              onChange={(e) => setField('telegramLink', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="admin-save-bar">
        {error && <span className="admin-form-error" style={{ margin: 0 }}>{error}</span>}
        {saved && <span className="admin-saved-note">✓ Сохранено</span>}
        <button type="submit" className="admin-btn-save" disabled={saving}>
          {saving ? 'Сохранение…' : 'Сохранить изменения'}
        </button>
      </div>
    </form>
  )
}
