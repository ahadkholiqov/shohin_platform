import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import type { GalleryItem, Settings } from '../api/types'
import { useUI, type LandingSection } from '../ui/UIContext'
import { useBackToClose } from '../hooks/useBackToClose'
import { telegramHandle, whatsAppNumber } from '../utils/formatters'
import HeroBuilding from '../components/HeroBuilding'
import LeadForm from '../components/LeadForm'

const SPY_SECTIONS: LandingSection[] = ['home', 'gallery', 'contacts']

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

type LoadStatus = 'loading' | 'error' | 'ready'

export default function LandingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setActiveSection } = useUI()

  const [settings, setSettings] = useState<Settings | null>(null)
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const closeLightbox = useCallback(() => setLightboxUrl(null), [])

  const loadSettings = useCallback(async () => {
    setStatus('loading')
    try {
      const data = await api.getSettings()
      setSettings(data)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  // Real gallery images (if any); falls back to static placeholders when empty.
  useEffect(() => {
    api
      .getGallery()
      .then(setGallery)
      .catch(() => setGallery([]))
  }, [])

  // Cross-page anchor scroll (e.g. Gallery tapped from another page).
  useEffect(() => {
    const target = (location.state as { scrollTo?: string } | null)?.scrollTo
    if (target && status === 'ready') {
      requestAnimationFrame(() => scrollToId(target))
    }
  }, [location.state, status])

  // Scroll-spy: report the visible section to the tab bar.
  useEffect(() => {
    if (status !== 'ready') return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id as LandingSection)
        }
      },
      { rootMargin: '-40% 0px -55% 0px' },
    )
    for (const id of SPY_SECTIONS) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [status, setActiveSection])

  // Lightbox: hardware Back closes it, and the background scroll is locked while open.
  useBackToClose(!!lightboxUrl, closeLightbox)

  useEffect(() => {
    if (!lightboxUrl) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [lightboxUrl])

  if (status === 'loading') {
    return <div className="page-state">Загрузка…</div>
  }

  if (status === 'error' || !settings) {
    return (
      <div className="page-state">
        <p>Не удалось загрузить данные.</p>
        <button className="btn-secondary" onClick={loadSettings}>
          Повторить
        </button>
      </div>
    )
  }

  // Construction progress is admin-managed; fall back safely if missing.
  const progressPercent = Math.max(0, Math.min(100, settings.constructionProgressPercent ?? 0))
  const completionYear = settings.completionYear ?? ''

  // Real images sorted by display order; empty → static placeholders below.
  const sortedGallery = [...gallery].sort((a, b) => a.displayOrder - b.displayOrder)

  // Admin-managed amenities: one item per line (items may contain commas).
  const amenities = (settings.amenitiesText ?? '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)

  return (
    <div className="landing">
      {/* ── HERO ── */}
      <section className="hero" id="home">
        <div className="hero-bg">
          {settings.heroImageUrl ? (
            <img className="hero-photo" src={settings.heroImageUrl} alt="" />
          ) : (
            <HeroBuilding />
          )}
        </div>
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-badge">
            <svg viewBox="0 0 24 24">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Avrupo Sokhtmon · Худжанд
          </div>
          <h1 className="hero-title">{settings.heroTitle}</h1>
          <p className="hero-sub">16 этажей + пентхаус · Блок A и B · 12-й микрорайон</p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => navigate('/catalog')}>
              Каталог квартир
            </button>
            <button className="btn-outline" onClick={() => scrollToId('contacts')}>
              Оставить заявку
            </button>
          </div>
          <div className="hero-stats">
            <div>
              <div className="hstat-val">2</div>
              <div className="hstat-lbl">Блока</div>
            </div>
            <div>
              <div className="hstat-val">17</div>
              <div className="hstat-lbl">Этажей</div>
            </div>
            <div>
              <div className="hstat-val">6 180</div>
              <div className="hstat-lbl">сомони/м²</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── О ПРОЕКТЕ ── */}
      <section className="about" id="about">
        <div className="sec-label">О проекте</div>
        <h2 className="sec-title">Современный жилой комплекс в сердце Худжанда</h2>
        <p className="sec-body">
          ЖК «Shohin Plaza» — два блока (A и B) по 16 жилых этажей и эксклюзивный пентхаус на
          17-м. Этажи 1–2 коммерческие. Напротив мечети «Taqvo», 12-й микрорайон.
        </p>
        <div className="adv-grid">
          <div className="adv-card">
            <svg viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <div className="adv-title">Надёжный застройщик</div>
            <div className="adv-desc">Avrupo Sokhtmon — опыт строительства в Таджикистане</div>
          </div>
          <div className="adv-card">
            <svg viewBox="0 0 24 24">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <div className="adv-title">Отличная локация</div>
            <div className="adv-desc">12-й микрорайон, напротив мечети «Taqvo»</div>
          </div>
          <div className="adv-card">
            <svg viewBox="0 0 24 24">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            <div className="adv-title">Коммерция внизу</div>
            <div className="adv-desc">1–2 этажи — торговые и офисные помещения</div>
          </div>
          <div className="adv-card">
            <svg viewBox="0 0 24 24">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <div className="adv-title">Пентхаус</div>
            <div className="adv-desc">Эксклюзивные квартиры на 17-м этаже</div>
          </div>
        </div>
      </section>

      {/* ── РАССРОЧКА (sales hook) ── */}
      {settings.installmentTerms && (
        <section className="installment" id="installment">
          <div className="install-card">
            <div className="install-icon">
              <svg viewBox="0 0 24 24">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
            <div className="install-body">
              <div className="install-label">Гибкая оплата</div>
              <div className="install-title">Рассрочка от застройщика</div>
              <p className="install-text">{settings.installmentTerms}</p>
              <button className="install-cta" onClick={() => scrollToId('contacts')}>
                Узнать условия
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── ИНФРАСТРУКТУРА ── */}
      <section className="infra" id="infra">
        <div className="sec-label">Инфраструктура и локация</div>
        <h2 className="sec-title">Всё рядом</h2>
        <div className="map-embed">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1207.7491079696397!2d69.58962031425011!3d40.29047839388525!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38b1b3c442017801%3A0x444ad5bc0dca68f6!2zN0hSUSs2VzMsINCl0YPQtNC20LDQvdC0LCDQotCw0LTQttC40LrQuNGB0YLQsNC9!5e0!3m2!1sru!2s!4v1782833200447!5m2!1sru!2s"
            title="ЖК Shohin Plaza на карте"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
        <div className="map-caption">
          <svg viewBox="0 0 24 24">
            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>г. Худжанд, 12-й микрорайон, напротив мечети Такво</span>
        </div>
        {/* Fully admin-managed list (Settings → amenitiesText); hidden when empty. */}
        {amenities.length > 0 && (
          <div className="infra-list">
            {amenities.map((text) => (
              <div className="infra-item" key={text}>
                <svg viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{text}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── ХОД СТРОИТЕЛЬСТВА + ГАЛЕРЕЯ ── */}
      <section className="progress-sec" id="gallery">
        <div className="sec-label">Ход строительства</div>
        <h2 className="sec-title">Строим. Контролируем. Сдаём в срок.</h2>
        <p className="sec-body">{settings.constructionProgressDescription}</p>
        <div className="prog-bar-wrap">
          <div className="prog-bar" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="prog-meta">
          <span>Готовность: {progressPercent}%</span>
          {completionYear && <span>Сдача: {completionYear}</span>}
        </div>
        <div className="gal-carousel">
          {sortedGallery.length > 0 ? (
            sortedGallery.map((g) => (
              <button
                type="button"
                className="gal-slide"
                key={g.id}
                onClick={() => setLightboxUrl(g.imageUrl)}
                aria-label="Открыть фото на весь экран"
              >
                <img className="gal-img" src={g.imageUrl} alt="" />
              </button>
            ))
          ) : (
            [0, 1, 2, 3].map((i) => (
              <div className="gal-slide gal-slide-empty" key={i}>
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="m3 9 4-4 4 4 4-5 4 5" />
                  <circle cx="8.5" cy="6.5" r="1.5" />
                </svg>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── ФОРМА ── */}
      <section className="form-sec" id="contacts">
        <div className="sec-label">Заявка</div>
        <h2 className="sec-title">Интересует квартира?</h2>
        <p className="sec-body">
          Оставьте заявку — менеджер свяжется с вами в течение 30 минут.
        </p>
        <LeadForm dark apartmentId={null} />
      </section>

      {/* ── FOOTER ── */}
      <footer className="landing-footer">
        <div className="footer-logo">ЖК Shohin Plaza</div>
        <div className="footer-dev">Застройщик: Avrupo Sokhtmon</div>
        <div className="footer-addr">
          <svg viewBox="0 0 24 24">
            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          Худжанд, 12-й микрорайон, напротив мечети «Taqvo»
        </div>
        <div className="footer-contacts">
          <a className="footer-contact" href={settings.whatsAppLink} target="_blank" rel="noreferrer">
            <span className="footer-contact-icon icon-wa">
              <svg viewBox="0 0 24 24" fill="#fff">
                <path d="M20.52 3.48A11.93 11.93 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.16 1.6 5.97L0 24l6.19-1.62A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52zM12 22c-1.85 0-3.67-.5-5.24-1.44l-.37-.22-3.87 1.02 1.04-3.78-.24-.39A9.93 9.93 0 0 1 2 12C2 6.49 6.49 2 12 2c2.67 0 5.18 1.04 7.07 2.93A9.95 9.95 0 0 1 22 12c0 5.51-4.49 10-10 10z" />
              </svg>
            </span>
            <span>
              <span className="footer-contact-label">WhatsApp</span>
              <span className="footer-contact-val">{whatsAppNumber(settings.whatsAppLink)}</span>
            </span>
          </a>
          <a className="footer-contact" href={settings.telegramLink} target="_blank" rel="noreferrer">
            <span className="footer-contact-icon icon-tg">
              <svg viewBox="0 0 24 24" fill="#fff">
                <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.94 8.19l-2.02 9.52c-.15.67-.54.83-1.09.52l-3-2.21-1.45 1.39c-.16.16-.3.3-.61.3l.21-3.02 5.5-4.97c.24-.21-.05-.33-.37-.12L6.49 14.4l-2.94-.92c-.64-.2-.65-.64.13-.95l11.5-4.43c.53-.19 1 .13.76.09z" />
              </svg>
            </span>
            <span>
              <span className="footer-contact-label">Telegram</span>
              <span className="footer-contact-val">{telegramHandle(settings.telegramLink)}</span>
            </span>
          </a>
          <a className="footer-contact" href={`tel:${settings.contactPhone.replace(/\s/g, '')}`}>
            <span className="footer-contact-icon icon-phone">
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.82 19 19.5 19.5 0 0 1 5 12.18 19.79 19.79 0 0 1 2.08 3.18 2 2 0 0 1 4.11 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.96 5.96l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </span>
            <span>
              <span className="footer-contact-label">Телефон</span>
              <span className="footer-contact-val">{settings.contactPhone}</span>
            </span>
          </a>
        </div>
        <div className="footer-copy">© 2025 Avrupo Sokhtmon. Все права защищены.</div>
      </footer>

      {lightboxUrl && (
        <div
          className="lightbox"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLightbox()
          }}
        >
          <button type="button" className="lightbox-close" onClick={closeLightbox} aria-label="Закрыть">
            <svg viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <img className="lightbox-img" src={lightboxUrl} alt="" />
        </div>
      )}
    </div>
  )
}
