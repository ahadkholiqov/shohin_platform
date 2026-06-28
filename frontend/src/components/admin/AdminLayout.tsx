import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { api, clearAdminToken } from '../../api/client'

const NAV = [
  { to: '/admin', end: true, label: 'Квартиры', title: 'Квартиры' },
  { to: '/admin/applications', end: false, label: 'Заявки', title: 'Заявки' },
  { to: '/admin/gallery', end: false, label: 'Галерея', title: 'Галерея' },
  { to: '/admin/settings', end: false, label: 'Настройки', title: 'Настройки' },
]

const ICONS: Record<string, React.ReactNode> = {
  Квартиры: (
    <>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </>
  ),
  Заявки: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </>
  ),
  Галерея: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="m3 9 4-4 4 4 4-5 4 5" />
      <circle cx="8.5" cy="6.5" r="1.5" />
    </>
  ),
  Настройки: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </>
  ),
}

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [newLeads, setNewLeads] = useState(0)

  const activeTitle = NAV.find((n) => (n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)))?.title ?? 'Админ'

  // Quietly load the count of new leads for the sidebar badge.
  useEffect(() => {
    let cancelled = false
    api
      .getAdminApplications('New')
      .then((items) => {
        if (!cancelled) setNewLeads(items.length)
      })
      .catch(() => {
        /* badge is best-effort; ignore errors */
      })
    return () => {
      cancelled = true
    }
  }, [location.pathname])

  // Close the mobile drawer on navigation.
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  function logout() {
    clearAdminToken()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="admin">
      <header className="admin-header">
        <button
          type="button"
          className="admin-hamburger"
          aria-label="Меню"
          onClick={() => setSidebarOpen((v) => !v)}
        >
          <svg viewBox="0 0 24 24">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className="admin-header-logo">
          <div className="admin-header-mark">
            <svg viewBox="0 0 24 24">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div>
            <div className="admin-header-name">Shohin Plaza</div>
            <div className="admin-header-sub">Админ</div>
          </div>
        </div>

        <div className="admin-header-divider" />
        <div className="admin-header-title">{activeTitle}</div>

        <div className="admin-header-user">
          <span className="admin-header-badge">Администратор</span>
          <button type="button" className="admin-btn-logout" onClick={logout}>
            <svg viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Выйти
          </button>
        </div>
      </header>

      {sidebarOpen && <div className="admin-backdrop" onClick={() => setSidebarOpen(false)} />}

      <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="admin-sidebar-label">Управление</div>
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `admin-nav-item${isActive ? ' active' : ''}`}
          >
            <svg className="admin-nav-icon" viewBox="0 0 24 24">
              {ICONS[item.label]}
            </svg>
            <span className="admin-nav-label">{item.label}</span>
            {item.label === 'Заявки' && newLeads > 0 && (
              <span className="admin-nav-badge">{newLeads}</span>
            )}
          </NavLink>
        ))}

        <div className="admin-sidebar-foot">
          <div className="admin-sidebar-foot-label">Публичный сайт</div>
          <a className="admin-sidebar-foot-link" href="/" target="_blank" rel="noreferrer">
            Открыть
            <svg viewBox="0 0 24 24">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  )
}
