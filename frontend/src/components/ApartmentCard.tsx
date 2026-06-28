import type { ApartmentListItem } from '../api/types'
import { formatMoney } from './ui/formatMoney'
import StatusBadge from './ui/StatusBadge'

type Props = {
  apartment: ApartmentListItem
  onClick: () => void
}

export default function ApartmentCard({ apartment, onClick }: Props) {
  const sold = apartment.status === 'Sold'

  return (
    <button type="button" className={`apt-card${sold ? ' sold' : ''}`} onClick={onClick}>
      <div className={`apt-card-stripe status-stripe-${apartment.status.toLowerCase()}`} />
      <div className="apt-card-body">
        <div className="apt-card-num">
          Блок {apartment.block} · №{apartment.number}
        </div>
        <div className="apt-card-rooms">
          {apartment.roomsCount}
          <span> комн.</span>
          {apartment.isPenthouse && <span className="apt-penthouse">Пентхаус</span>}
        </div>
        <div className="apt-card-area">{apartment.totalArea} м²</div>
        <div className="apt-card-floor">{apartment.floor} этаж</div>
        <div className="apt-card-price">{formatMoney(apartment.totalPrice)}</div>
        <div className="apt-card-badge">
          <StatusBadge status={apartment.status} />
        </div>
      </div>
    </button>
  )
}
