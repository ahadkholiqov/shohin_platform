import { useEffect } from 'react'

// Makes the hardware/browser Back button close an open overlay instead of
// navigating away. When the overlay opens we push a throwaway history entry;
// Back pops it and triggers onClose. Closing via the UI consumes that entry.
// (v1 decision: Back closes modals, no deep-link params.)
export function useBackToClose(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return

    let closedByBack = false
    window.history.pushState({ shohinModal: true }, '')

    const onPopState = () => {
      closedByBack = true
      onClose()
    }
    window.addEventListener('popstate', onPopState)

    return () => {
      window.removeEventListener('popstate', onPopState)
      // Closed via the UI (not Back): remove the history entry we added.
      if (!closedByBack && window.history.state?.shohinModal) {
        window.history.back()
      }
    }
  }, [isOpen, onClose])
}
