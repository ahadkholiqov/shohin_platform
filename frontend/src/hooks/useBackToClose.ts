import { useEffect } from 'react'


export function useBackToClose(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return

    window.history.pushState({ shohinModal: true }, '')
    const onPop = () => onClose()
    window.addEventListener('popstate', onPop)

    return () => window.removeEventListener('popstate', onPop)
  }, [isOpen, onClose])
}
