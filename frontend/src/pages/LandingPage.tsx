import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useUI, type LandingSection } from '../ui/UIContext'

const SECTIONS: LandingSection[] = ['home', 'gallery', 'contacts']

// Placeholder landing. Real hero/sections come in the next phase.
// Sets up: (1) scroll-spy to highlight the active tab, (2) cross-page
// anchor scroll when arriving via navigate('/', { state: { scrollTo } }).
export default function LandingPage() {
  const { setActiveSection } = useUI()
  const location = useLocation()

  // Cross-page anchor scroll (Gallery tapped from another page).
  useEffect(() => {
    const target = (location.state as { scrollTo?: string } | null)?.scrollTo
    if (target) {
      // Wait a frame so the sections are mounted before scrolling.
      requestAnimationFrame(() =>
        document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      )
    }
  }, [location.state])

  // Scroll-spy: report the currently visible section to the tab bar.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id as LandingSection)
          }
        }
      },
      { rootMargin: '-40% 0px -55% 0px' },
    )

    for (const id of SECTIONS) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [setActiveSection])

  return (
    <div>
      <section id="home" className="landing-section">
        <h2>ЖК «Shohin Plaza»</h2>
        <p>Лендинг — заглушка. Hero, преимущества и форма заявки появятся на следующем этапе.</p>
      </section>

      <section id="gallery" className="landing-section">
        <h2>Галерея</h2>
        <p>Раздел галереи — заглушка (статичные изображения в MVP).</p>
      </section>

      <section id="contacts" className="landing-section">
        <h2>Контакты</h2>
        <p>WhatsApp · Telegram · Звонок — заглушка.</p>
      </section>
    </div>
  )
}
