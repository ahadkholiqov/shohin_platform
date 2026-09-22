import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../../api/client'
import type { ApplicationListItem, ApplicationStatus } from '../../api/types'

type LoadStatus = 'loading' | 'error' | 'ready'

const STATUS_OPTIONS: { value: ApplicationStatus; label: string; cls: string }[] = [
  { value: 'New', label: 'Новая', cls: 's-new' },
  { value: 'InProgress', label: 'В работе', cls: 's-progress' },
  { value: 'Closed', label: 'Закрыта', cls: 's-closed' },
]

function statusClass(status: ApplicationStatus): string {
  return STATUS_OPTIONS.find((s) => s.value === status)?.cls ?? 's-new'
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`
}

export default function AdminApplicationsPage() {
  const [apps, setApps] = useState<ApplicationListItem[]>([])
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [savingId, setSavingId] = useState<string | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      setApps(await api.getAdminApplications())
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const counts = useMemo(() => {
    const c = { New: 0, InProgress: 0, Closed: 0 }
    for (const a of apps) c[a.status] += 1
    return c
  }, [apps])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return apps.filter((a) => {
      if (statusFilter && a.status !== statusFilter) return false
      if (q && !a.name.toLowerCase().includes(q) && !a.phone.toLowerCase().includes(q)) return false
      return true
    })
  }, [apps, search, statusFilter])

  async function changeStatus(app: ApplicationListItem, next: ApplicationStatus) {
    if (next === app.status) return
    const previous = app.status
    setApps((list) => list.map((a) => (a.id === app.id ? { ...a, status: next } : a)))
    setSavingId(app.id)
    try {
      await api.updateApplicationStatus(app.id, next)
      setSavingId(null)
      setSavedId(app.id)
      setTimeout(() => setSavedId((curr) => (curr === app.id ? null : curr)), 1500)
    } catch {
      setApps((list) => list.map((a) => (a.id === app.id ? { ...a, status: previous } : a)))
      setSavingId(null)
    }
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Заявки</div>
          <div className="admin-page-sub">Входящие обращения от потенциальных покупателей</div>
          <div className="admin-stat-pills">
            <span className="admin-stat-pill">
              <i className="admin-stat-dot" style={{ background: '#185FA5' }} />
              Новые: <strong>{counts.New}</strong>
            </span>
            <span className="admin-stat-pill">
              <i className="admin-stat-dot" style={{ background: '#b87a00' }} />
              В работе: <strong>{counts.InProgress}</strong>
            </span>
            <span className="admin-stat-pill">
              <i className="admin-stat-dot" style={{ background: '#a0aec0' }} />
              Закрыты: <strong>{counts.Closed}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="admin-filters">
        <div className="admin-search">
          <svg viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Поиск по имени, телефону..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="admin-filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Все статусы</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <div className="admin-filters-count">
          Показано: <strong>{filtered.length}</strong> из {apps.length}
        </div>
      </div>

      {status === 'loading' && <div className="admin-placeholder-box">Загрузка…</div>}
      {status === 'error' && (
        <div className="admin-placeholder-box">
          <p>Не удалось загрузить заявки.</p>
          <button className="admin-btn-cancel" style={{ marginTop: 10 }} onClick={load}>
            Повторить
          </button>
        </div>
      )}

      {status === 'ready' && (
        <div className="admin-table-wrap">
          <table className="admin-table admin-table-apps">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Имя</th>
                <th>Телефон</th>
                <th>Комментарий</th>
                <th>Квартира</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="admin-table-empty">
                    Заявки не найдены
                  </td>
                </tr>
              )}
              {filtered.map((a) => (
                <tr key={a.id} className={a.status === 'New' ? 'admin-row-new' : undefined}>
                  <td className="admin-td-date">
                    {a.status === 'New' && <span className="admin-new-dot" />}
                    {formatDate(a.createdAt)}
                  </td>
                  <td className="admin-td-num">{a.name}</td>
                  <td className="admin-td-phone">
                    <a href={`tel:${a.phone.replace(/\s/g, '')}`}>{a.phone}</a>
                  </td>
                  <td className="admin-td-comment" title={a.comment ?? ''}>
                    {a.comment || '—'}
                  </td>
                  <td>
                    {a.apartmentNumber ? (
                      <span className="admin-td-apt">{a.apartmentNumber}</span>
                    ) : (
                      <span className="admin-pent-no">—</span>
                    )}
                  </td>
                  <td>
                    <span className="admin-status-wrap">
                      <select
                        className={`admin-status-select ${statusClass(a.status)}`}
                        value={a.status}
                        disabled={savingId === a.id}
                        onChange={(e) => changeStatus(a, e.target.value as ApplicationStatus)}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                      {savingId === a.id && <span className="admin-status-note">…</span>}
                      {savedId === a.id && <span className="admin-status-note saved">✓</span>}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
