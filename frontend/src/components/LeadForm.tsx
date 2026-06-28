import { useState, type FormEvent } from 'react'
import { api, ApiError } from '../api/client'

type LeadFormProps = {
  // When submitted from an apartment, ties the lead to it; null for general inquiries.
  apartmentId?: string | null
  // Dark variant for the landing's dark form section; light elsewhere (modals).
  dark?: boolean
  onSuccess?: () => void
}

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function LeadForm({ apartmentId = null, dark = false, onSuccess }: LeadFormProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [comment, setComment] = useState('')
  const [errors, setErrors] = useState<{ name?: boolean; phone?: boolean }>({})
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const nextErrors = {
      name: name.trim().length === 0,
      phone: phone.trim().length < 6,
    }
    setErrors(nextErrors)
    if (nextErrors.name || nextErrors.phone) return

    setStatus('loading')
    setErrorMsg('')
    try {
      await api.submitApplication({
        name: name.trim(),
        phone: phone.trim(),
        comment: comment.trim() || null,
        apartmentId,
      })
      setStatus('success')
      onSuccess?.()
    } catch (err) {
      setStatus('error')
      setErrorMsg(
        err instanceof ApiError
          ? err.message
          : 'Не удалось отправить заявку. Попробуйте ещё раз.',
      )
    }
  }

  if (status === 'success') {
    return (
      <div className={`lead-form${dark ? ' dark' : ''}`}>
        <div className="lead-success">
          <svg viewBox="0 0 24 24">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <div className="lead-success-title">Заявка принята!</div>
          <p className="lead-success-sub">
            Спасибо, <strong>{name.trim()}</strong>! Наш менеджер свяжется с вами по номеру{' '}
            <strong>{phone.trim()}</strong> в течение 30 минут.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form className={`lead-form${dark ? ' dark' : ''}`} onSubmit={handleSubmit} noValidate>
      <div className="form-field">
        <svg viewBox="0 0 24 24">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <input
          type="text"
          placeholder="Ваше имя"
          maxLength={150}
          value={name}
          className={errors.name ? 'has-error' : undefined}
          onChange={(e) => {
            setName(e.target.value)
            if (errors.name) setErrors((p) => ({ ...p, name: false }))
          }}
        />
      </div>
      {errors.name && <div className="form-err">Введите ваше имя</div>}

      <div className="form-field">
        <svg viewBox="0 0 24 24">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.82 19 19.5 19.5 0 0 1 5 12.18 19.79 19.79 0 0 1 2.08 3.18 2 2 0 0 1 4.11 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.96 5.96l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
        <input
          type="tel"
          placeholder="+992 90 000 00 00"
          maxLength={30}
          value={phone}
          className={errors.phone ? 'has-error' : undefined}
          onChange={(e) => {
            setPhone(e.target.value)
            if (errors.phone) setErrors((p) => ({ ...p, phone: false }))
          }}
        />
      </div>
      {errors.phone && <div className="form-err">Введите корректный номер телефона</div>}

      <div className="form-field">
        <svg viewBox="0 0 24 24" className="form-icon-top">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <textarea
          placeholder="Комментарий (необязательно)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      {status === 'error' && <div className="form-err form-err-api">{errorMsg}</div>}

      <button type="submit" className="btn-submit" disabled={status === 'loading'}>
        {status === 'loading' ? (
          'Отправляем...'
        ) : (
          <>
            <svg viewBox="0 0 24 24">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            Отправить заявку
          </>
        )}
      </button>

      <div className="form-note">
        Нажимая кнопку, вы соглашаетесь на обработку персональных данных
      </div>
    </form>
  )
}
