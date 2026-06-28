import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import type { Settings } from '../api/types'
import { useUI, type LandingSection } from '../ui/UIContext'
import HeroBuilding from '../components/HeroBuilding'
import LeadForm from '../components/LeadForm'

const SPY_SECTIONS: LandingSection[] = ['home', 'gallery', 'contacts']

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function telegramHandle(link: string): string {
  return link.replace(/^https?:\/\/t\.me\//, '@').replace(/\/$/, '')
}

type LoadStatus = 'loading' | 'error' | 'ready'

export default function LandingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setActiveSection } = useUI()

  const [settings, setSettings] = useState<Settings | null>(null)
  const [status, setStatus] = useState<LoadStatus>('loading')

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

  return (
    <div className="landing">
      {/* ── HERO ── */}
      <section className="hero" id="home">
        <div className="hero-bg">
          <HeroBuilding />
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

      {/* ── ИНФРАСТРУКТУРА ── */}
      <section className="infra" id="infra">
        <div className="sec-label">Инфраструктура и локация</div>
        <h2 className="sec-title">Всё рядом</h2>
        <div className="map-ph">
          <svg viewBox="0 0 24 24">
            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <div className="map-ph-lbl">12-й микрорайон, Худжанд</div>
          <div className="map-ph-sub">Место под Google Maps</div>
        </div>
        <div className="infra-list">
          {[
            'Напротив мечети «Taqvo» — знаковый ориентир района',
            'Детские сады и школы — в шаговой доступности',
            'Супермаркеты, аптеки, кафе — рядом с домом',
            'Удобная транспортная развязка, выезд в центр',
            'Благоустроенная территория и парковка',
          ].map((text) => (
            <div className="infra-item" key={text}>
              <svg viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── ХОД СТРОИТЕЛЬСТВА + ГАЛЕРЕЯ ── */}
      <section className="progress-sec" id="gallery">
        <div className="sec-label">Ход строительства</div>
        <h2 className="sec-title">Строим. Контролируем. Сдаём в срок.</h2>
        <p className="sec-body">{settings.constructionProgressDescription}</p>
        <div className="prog-bar-wrap">
          <div className="prog-bar" style={{ width: '45%' }} />
        </div>
        <div className="prog-meta">
          <span>Готовность: 45%</span>
          <span>Сдача: 2026</span>
        </div>
        <div className="gal-grid">
          <div className="gal-ph gal-ph-main">
            <svg viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="m3 9 4-4 4 4 4-5 4 5" />
              <circle cx="8.5" cy="6.5" r="1.5" />
            </svg>
          </div>
          {[0, 1, 2, 3].map((i) => (
            <div className="gal-ph" key={i}>
              <svg viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="m3 9 4-4 4 4 4-5 4 5" />
              </svg>
            </div>
          ))}
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
              <span className="footer-contact-val">{settings.contactPhone}</span>
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
    </div>
  )
}
