import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'
import type { ChessboardBlock, ChessboardCell } from '../api/types'
import ApartmentModal from '../components/ApartmentModal'

type LoadStatus = 'loading' | 'error' | 'ready'

const COMMERCIAL_FLOORS = [2, 1]

function cellMeta(cell: ChessboardCell): string {
  return `${cell.roomsCount}к · ${cell.totalArea} м²`
}

export default function ChessboardPage() {
  const [blocks, setBlocks] = useState<ChessboardBlock[]>([])
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [activeBlock, setActiveBlock] = useState('A')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const data = await api.getChessboard()
      setBlocks(data)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const blockKeys = blocks.map((b) => b.block)

  useEffect(() => {
    if (blockKeys.length > 0 && !blockKeys.includes(activeBlock)) {
      setActiveBlock(blockKeys[0])
    }
  }, [blockKeys, activeBlock])

  const current = blocks.find((b) => b.block === activeBlock)

  const floors = useMemo(
    () => (current ? [...current.floors].sort((a, b) => b.floor - a.floor) : []),
    [current],
  )

  if (status === 'loading') {
    return <div className="page-state">Загрузка…</div>
  }

  if (status === 'error') {
    return (
      <div className="page-state">
        <p>Не удалось загрузить шахматку.</p>
        <button className="btn-secondary" onClick={load}>
          Повторить
        </button>
      </div>
    )
  }

  return (
    <div className="chessboard">
      <header className="cb-header">
        <div className="cb-tabs">
          {(blockKeys.length ? blockKeys : ['A', 'B']).map((b) => (
            <button
              key={b}
              type="button"
              className={`cb-tab${activeBlock === b ? ' active' : ''}`}
              onClick={() => setActiveBlock(b)}
            >
              Блок {b}
            </button>
          ))}
        </div>
        <div className="cb-legend">
          <span className="cb-leg">
            <i className="cb-dot cb-dot-available" />
            Свободно
          </span>
          <span className="cb-leg">
            <i className="cb-dot cb-dot-reserved" />
            Бронь
          </span>
          <span className="cb-leg">
            <i className="cb-dot cb-dot-sold" />
            Продано
          </span>
        </div>
      </header>

      <div className="cb-scroll">
        <div className="cb-rows">
          {floors.map((f) => {
            const penthouse = f.floor === 17
            return (
              <div className={`cb-row${penthouse ? ' cb-row-penthouse' : ''}`} key={f.floor}>
                <div className="cb-floor-label">
                  <span className="cb-floor-num">{f.floor}</span>
                  {penthouse && <span className="cb-floor-sub">Пентхаус</span>}
                </div>
                <div className="cb-cells">
                  {f.apartments.map((cell) => (
                    <button
                      key={cell.id}
                      type="button"
                      className={`cb-cell cb-cell-${cell.status.toLowerCase()}${
                        penthouse ? ' cb-cell-penthouse' : ''
                      }`}
                      onClick={() => setSelectedId(cell.id)}
                    >
                      <span className="cb-cell-num">{cell.number}</span>
                      <span className="cb-cell-meta">{cellMeta(cell)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Commercial foundation (static, non-interactive) */}
          <div className="cb-commercial-banner">
            <svg viewBox="0 0 24 24">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            Коммерческие помещения
          </div>
          {COMMERCIAL_FLOORS.map((fl) => (
            <div className="cb-row cb-row-commercial" key={`com-${fl}`}>
              <div className="cb-floor-label">
                <span className="cb-floor-num">{fl}</span>
                <span className="cb-floor-sub">Ком.</span>
              </div>
              <div className="cb-cells">
                {[0, 1, 2].map((i) => (
                  <div className="cb-cell cb-cell-commercial" key={i} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedId && <ApartmentModal apartmentId={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  )
}
