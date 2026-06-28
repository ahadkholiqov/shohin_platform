import { useEffect, useState } from 'react'
import { api, ApiError } from '../api/client'
import type { ApartmentDetail } from '../api/types'
import Modal from './ui/Modal'
import StatusBadge from './ui/StatusBadge'
import LeadForm from './LeadForm'
import { formatMoney } from './ui/formatMoney'

type Props = {
  apartmentId: string
  onClose: () => void
}

type Status = 'loading' | 'error' | 'ready'

function roomTitle(rooms: number): string {
  return rooms >= 1 ? `${rooms}-комн. квартира` : 'Помещение'
}

export default function ApartmentModal({ apartmentId, onClose }: Props) {
  const [detail, setDetail] = useState<ApartmentDetail | null>(null)
  const [status, setStatus] = useState<Status>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    api
      .getApartment(apartmentId)
      .then((d) => {
        if (cancelled) return
        setDetail(d)
        setStatus('ready')
      })
      .catch((err) => {
        if (cancelled) return
        setStatus('error')
        setErrorMsg(err instanceof ApiError ? err.message : 'Не удалось загрузить квартиру.')
      })
    return () => {
      cancelled = true
    }
  }, [apartmentId])

  return (
    <Modal open onClose={onClose}>
      <button type="button" className="modal-x" onClick={onClose} aria-label="Закрыть">
        <svg viewBox="0 0 24 24">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {status === 'loading' && <div className="modal-loading">Загрузка…</div>}

      {status === 'error' && <div className="form-err form-err-api">{errorMsg}</div>}

      {status === 'ready' && detail && (
        <>
          <div className={`apt-modal-stripe status-stripe-${detail.status.toLowerCase()}`} />

          <div className="apt-modal-num">
            Квартира №{detail.number}
            {detail.isPenthouse && ' · Пентхаус'}
          </div>
          <div className="apt-modal-title">{roomTitle(detail.roomsCount)}</div>
          <div className="apt-modal-badge">
            <StatusBadge status={detail.status} />
          </div>

          <div className="apt-modal-grid">
            <div className="mstat">
              <div className="mstat-lbl">Блок</div>
              <div className="mstat-val">Блок {detail.block}</div>
            </div>
            <div className="mstat">
              <div className="mstat-lbl">Этаж</div>
              <div className="mstat-val">{detail.floor} из 17</div>
            </div>
            <div className="mstat">
              <div className="mstat-lbl">Площадь</div>
              <div className="mstat-val">{detail.totalArea} м²</div>
            </div>
            <div className="mstat">
              <div className="mstat-lbl">Комнат</div>
              <div className="mstat-val">{detail.roomsCount}</div>
            </div>
          </div>

          <div className="modal-price-block">
            <div className="modal-price-lbl">Стоимость</div>
            <div className="modal-price">{formatMoney(detail.totalPrice)}</div>
            <div className="modal-ppm">{formatMoney(detail.pricePerSqm)} / м²</div>
          </div>

          <div className="floorplan-ph">
            {detail.floorPlanImageUrl ? (
              <img src={detail.floorPlanImageUrl} alt="Планировка квартиры" />
            ) : (
              <>
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
                <span>Планировка скоро появится</span>
              </>
            )}
          </div>

          {detail.description && <p className="apt-modal-desc">{detail.description}</p>}

          {detail.status === 'Sold' ? (
            <div className="sold-notice">Квартира продана</div>
          ) : (
            <LeadForm apartmentId={detail.id} onSuccess={() => undefined} />
          )}
        </>
      )}
    </Modal>
  )
}
