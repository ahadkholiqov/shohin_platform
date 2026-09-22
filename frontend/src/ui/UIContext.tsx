import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type LandingSection = 'home' | 'gallery' | 'contacts'

type UIContextValue = {
  contactsOpen: boolean
  openContacts: () => void
  closeContacts: () => void

  activeSection: LandingSection
  setActiveSection: (s: LandingSection) => void
}

const UIContext = createContext<UIContextValue | null>(null)

export function UIProvider({ children }: { children: ReactNode }) {
  const [contactsOpen, setContactsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<LandingSection>('home')

  const openContacts = useCallback(() => setContactsOpen(true), [])
  const closeContacts = useCallback(() => setContactsOpen(false), [])

  const value = useMemo<UIContextValue>(
    () => ({ contactsOpen, openContacts, closeContacts, activeSection, setActiveSection }),
    [contactsOpen, openContacts, closeContacts, activeSection],
  )

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

export function useUI(): UIContextValue {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI must be used within a UIProvider')
  return ctx
}
