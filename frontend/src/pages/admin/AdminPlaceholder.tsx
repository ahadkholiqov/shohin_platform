export default function AdminPlaceholder({ title, sub }: { title: string; sub: string }) {
  return (
    <div>
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">{title}</div>
          <div className="admin-page-sub">{sub}</div>
        </div>
      </div>
      <div className="admin-placeholder-box">
        <svg viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
        <p>Раздел в разработке — следующий шаг</p>
      </div>
    </div>
  )
}
