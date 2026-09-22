type WindowGrid = {
  cols: number[]
  rows: number[]
  w: number
  h: number
}

function windows({ cols, rows, w, h }: WindowGrid) {
  const rects: { x: number; y: number }[] = []
  for (const y of rows) for (const x of cols) rects.push({ x, y })
  return rects.map((r, i) => <rect key={i} x={r.x} y={r.y} width={w} height={h} rx={1} />)
}

const A_COLS = [72, 92, 112, 132, 152]
const A_ROWS = [155, 182, 209, 236, 263, 290]
const A_LIT = [
  { x: 92, y: 155 },
  { x: 132, y: 182 },
  { x: 72, y: 209 },
  { x: 152, y: 236 },
  { x: 112, y: 263 },
]

const B_COLS = [222, 242, 262, 282, 302]
const B_ROWS = [175, 202, 229, 256, 283]
const B_LIT = [
  { x: 242, y: 175 },
  { x: 302, y: 202 },
  { x: 222, y: 256 },
  { x: 262, y: 283 },
]

export default function HeroBuilding() {
  return (
    <svg viewBox="0 0 390 700" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <rect width="390" height="700" fill="#b8d49a" />
      <rect width="390" height="420" fill="#c8e4b0" />
      <rect y="560" width="390" height="140" fill="#8aad5a" />
      <rect y="600" width="390" height="40" fill="#6a9040" opacity=".6" />

      {/* trees */}
      <ellipse cx="40" cy="530" rx="28" ry="36" fill="#4a7a20" opacity=".7" />
      <ellipse cx="80" cy="540" rx="22" ry="28" fill="#5a8a28" opacity=".6" />
      <ellipse cx="350" cy="525" rx="30" ry="38" fill="#4a7a20" opacity=".7" />
      <ellipse cx="315" cy="538" rx="20" ry="26" fill="#5a8a28" opacity=".6" />

      {/* Block A */}
      <rect x="60" y="140" width="120" height="420" rx="3" fill="#e8f0e0" />
      <rect x="68" y="130" width="104" height="14" rx="2" fill="#cfdfc0" />
      <g fill="#b8cfa0" opacity=".7">{windows({ cols: A_COLS, rows: A_ROWS, w: 14, h: 16 })}</g>
      <g fill="#f5e87a" opacity=".85">
        {A_LIT.map((r, i) => (
          <rect key={i} x={r.x} y={r.y} width={14} height={16} rx={1} />
        ))}
      </g>
      <rect x="100" y="500" width="40" height="18" rx="3" fill="#3B6D11" opacity=".7" />
      <text x="120" y="513" fill="#fff" fontSize="10" textAnchor="middle" fontFamily="system-ui">
        Блок A
      </text>

      {/* Block B */}
      <rect x="210" y="160" width="120" height="400" rx="3" fill="#dce8ce" />
      <rect x="218" y="150" width="104" height="14" rx="2" fill="#c5d8b5" />
      <g fill="#aac490" opacity=".65">{windows({ cols: B_COLS, rows: B_ROWS, w: 14, h: 16 })}</g>
      <g fill="#f5e87a" opacity=".85">
        {B_LIT.map((r, i) => (
          <rect key={i} x={r.x} y={r.y} width={14} height={16} rx={1} />
        ))}
      </g>
      <rect x="250" y="510" width="40" height="18" rx="3" fill="#3B6D11" opacity=".7" />
      <text x="270" y="523" fill="#fff" fontSize="10" textAnchor="middle" fontFamily="system-ui">
        Блок B
      </text>

      {/* commercial bases */}
      <rect x="60" y="500" width="120" height="60" fill="#d0e4b8" />
      <rect x="210" y="510" width="120" height="50" fill="#c8ddb0" />
    </svg>
  )
}
