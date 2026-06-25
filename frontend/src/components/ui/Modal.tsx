import { useEffect, type ReactNode } from 'react'
import { useBackToClose } from '../../hooks/useBackToClose'

type ModalProps = {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

// Reusable bottom-sheet overlay.
// - Locks body scroll while open (prevents nested-scroll jitter on mobile).
// - Hardware Back closes it (via useBackToClose).
export default function Modal({ open, onClose, title, children }: ModalProps) {
  useBackToClose(open, onClose)

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="modal-sheet" role="dialog" aria-modal="true">
        <div className="modal-handle" />
        {title && <div className="modal-title">{title}</div>}
        {children}
      </div>
    </div>
  )
}
