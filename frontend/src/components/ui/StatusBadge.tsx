import type { ApartmentStatus } from '../../api/types'

const LABELS: Record<ApartmentStatus, string> = {
  Available: 'Свободна',
  Reserved: 'Бронь',
  Sold: 'Продана',
}

// Color-coded apartment status pill.
export default function StatusBadge({ status }: { status: ApartmentStatus }) {
  return <span className={`status-badge status-${status.toLowerCase()}`}>{LABELS[status]}</span>
}
