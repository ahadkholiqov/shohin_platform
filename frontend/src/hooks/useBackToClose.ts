import { useEffect } from 'react'

// Makes the hardware/browser Back button close an open overlay instead of
// navigating away. (v1 decision: Back closes modals, no deep-link params.)
//
// We push a history entry with the SAME url when the overlay opens, then close
// on popstate. Using the same url means react-router sees no location change on
// Back, so it doesn't navigate — it just pops our entry and we close the modal.
// We deliberately do NOT call history.back() on cleanup: doing so fights
// react-router's own history listener (and React StrictMode's double-invoke).
// The trade-off is a harmless leftover entry when a modal is closed via the UI.
export function useBackToClose(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return

    window.history.pushState({ shohinModal: true }, '')
    const onPop = () => onClose()
    window.addEventListener('popstate', onPop)

    return () => window.removeEventListener('popstate', onPop)
  }, [isOpen, onClose])
}
