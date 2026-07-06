import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Settings } from '../api/types'
import { useUI } from '../ui/UIContext'
import Modal from './ui/Modal'
import { telegramHandle, whatsAppNumber } from '../utils/formatters'

// Global contacts overlay opened from Catalog/Chessboard (decision #5).
// Fetches live settings the first time it opens; real WhatsApp / Telegram / phone
// come from GET /api/settings and are formatted the same way as the landing footer.
const lineStyle = { display: 'flex', flexDirection: 'column' as const, lineHeight: 1.3 }

export default function ContactsModal() {
  const { contactsOpen, closeContacts } = useUI()
  const [settings, setSettings] = useState<Settings | null>(null)
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading')

  // Fetch once, the first time the modal is opened (then cache in state).
  useEffect(() => {
    if (!contactsOpen || settings) return
    setStatus('loading')
    let cancelled = false
    api
      .getSettings()
      .then((s) => {
        if (cancelled) return
        setSettings(s)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [contactsOpen, settings])

  return (
    <Modal open={contactsOpen} onClose={closeContacts} title="Связаться с нами">
      <div className="modal-sub">Менеджер ответит на все вопросы по ЖК «Shohin Plaza».</div>

      {status === 'loading' && <div className="modal-loading">Загрузка…</div>}
      {status === 'error' && <div className="form-err form-err-api">Не удалось загрузить контакты.</div>}

      {status === 'ready' && settings && (
        <>
          <a className="contact-btn" href={settings.whatsAppLink} target="_blank" rel="noreferrer">
            <svg viewBox="0 0 24 24" fill="#25D366">
              <path d="M12 2a10 10 0 0 0-8.6 15l-1.4 5 5.1-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20zm4.4-5.6c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3c-.3.3-.9.9-.9 2.1s.9 2.5 1 2.6c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.7 3.1.6.5 0 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1z" />
            </svg>
            <span style={lineStyle}>
              <strong>WhatsApp</strong>
              <span>{whatsAppNumber(settings.whatsAppLink)}</span>
            </span>
          </a>

          <a className="contact-btn" href={settings.telegramLink} target="_blank" rel="noreferrer">
            <svg viewBox="0 0 24 24" fill="#229ED9">
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.6 6.8-1.6 7.5c-.1.5-.4.7-.9.4l-2.5-1.8-1.2 1.1c-.1.1-.2.2-.5.2l.2-2.5 4.5-4c.2-.2 0-.3-.3-.1L9 13.6l-2.4-.8c-.5-.2-.5-.5.1-.8l9.4-3.6c.4-.2.8.1.5 1.4z" />
            </svg>
            <span style={lineStyle}>
              <strong>Telegram</strong>
              <span>{telegramHandle(settings.telegramLink)}</span>
            </span>
          </a>

          <a className="contact-btn" href={`tel:${settings.contactPhone.replace(/\s/g, '')}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.82 19 19.5 19.5 0 0 1 5 12.18 19.79 19.79 0 0 1 2.08 3.18 2 2 0 0 1 4.11 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.96 5.96l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span style={lineStyle}>
              <strong>Позвонить</strong>
              <span>{settings.contactPhone}</span>
            </span>
          </a>
        </>
      )}

      <button className="btn-secondary" onClick={closeContacts}>
        Закрыть
      </button>
    </Modal>
  )
}
