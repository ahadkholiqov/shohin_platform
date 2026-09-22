import { useLocation, useNavigate } from 'react-router-dom'
import { useUI } from '../ui/UIContext'

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function TabBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { openContacts, activeSection } = useUI()

  const path = location.pathname
  const onLanding = path === '/'

  const isHome = onLanding && activeSection === 'home'
  const isCatalog = path === '/catalog'
  const isChessboard = path === '/chessboard'
  const isGallery = onLanding && activeSection === 'gallery'
  const isContacts = onLanding && activeSection === 'contacts'

  const goHome = () => {
    if (onLanding) window.scrollTo({ top: 0, behavior: 'smooth' })
    else navigate('/')
  }

  const goGallery = () => {
    if (onLanding) scrollToId('gallery')
    else navigate('/', { state: { scrollTo: 'gallery' } })
  }

  const goContacts = () => {
    if (onLanding) scrollToId('contacts')
    else openContacts()
  }

  return (
    <nav className="tabbar">
      <button className={`tab${isHome ? ' active' : ''}`} onClick={goHome} aria-label="Главная">
        <svg viewBox="0 0 24 24">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span className="tab-label">Главная</span>
        {isHome && <div className="tab-dot" />}
      </button>

      <button
        className={`tab${isCatalog ? ' active' : ''}`}
        onClick={() => navigate('/catalog')}
        aria-label="Каталог"
      >
        <svg viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        <span className="tab-label">Каталог</span>
        {isCatalog && <div className="tab-dot" />}
      </button>

      <button
        className={`tab tab-flagship${isChessboard ? ' active' : ''}`}
        onClick={() => navigate('/chessboard')}
        aria-label="Шахматка"
      >
        <svg viewBox="0 0 24 24">
          <rect x="2" y="3" width="6" height="6" rx="1" />
          <rect x="9" y="3" width="6" height="6" rx="1" />
          <rect x="16" y="3" width="6" height="6" rx="1" />
          <rect x="2" y="10" width="6" height="6" rx="1" />
          <rect x="9" y="10" width="6" height="6" rx="1" />
          <rect x="16" y="10" width="6" height="6" rx="1" />
          <rect x="2" y="17" width="6" height="6" rx="1" />
          <rect x="9" y="17" width="6" height="6" rx="1" />
          <rect x="16" y="17" width="6" height="6" rx="1" />
        </svg>
        <span className="tab-label">Шахматка</span>
        {isChessboard && <div className="tab-dot" />}
      </button>

      <button className={`tab${isGallery ? ' active' : ''}`} onClick={goGallery} aria-label="Галерея">
        <svg viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="m3 9 4-4 4 4 4-5 4 5" />
          <circle cx="8.5" cy="6.5" r="1.5" />
        </svg>
        <span className="tab-label">Галерея</span>
        {isGallery && <div className="tab-dot" />}
      </button>

      <button className={`tab${isContacts ? ' active' : ''}`} onClick={goContacts} aria-label="Контакты">
        <svg viewBox="0 0 24 24">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.82 19 19.5 19.5 0 0 1 5 12.18 19.79 19.79 0 0 1 2.08 3.18 2 2 0 0 1 4.11 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.96 5.96l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
        <span className="tab-label">Контакты</span>
        {isContacts && <div className="tab-dot" />}
      </button>
    </nav>
  )
}
