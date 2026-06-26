import { useState } from 'react'

const LEVELS = [
  {
    key: 'ERROR',
    label: 'Errors',
    color: '#fca5a5',
    bg: 'rgba(239,68,68,0.07)',
    border: 'rgba(239,68,68,0.2)',
    dot: '#f87171',
  },
  {
    key: 'WARN',
    label: 'Warnings',
    color: '#fcd34d',
    bg: 'rgba(245,158,11,0.07)',
    border: 'rgba(245,158,11,0.2)',
    dot: '#fbbf24',
  },
  {
    key: 'CRITICAL',
    label: 'Critical',
    color: '#fdba74',
    bg: 'rgba(249,115,22,0.07)',
    border: 'rgba(249,115,22,0.2)',
    dot: '#fb923c',
  },
]

export default function SpikeReport({ report }) {
  const [expanded, setExpanded] = useState(null)

  if (!report) return null

  const hasAny = LEVELS.some((l) => (report.total_counts[l.key] || 0) > 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(167,139,250,0.5)' }}>
          Spike Report
        </h2>
        {report.flagged ? (
          <span
            className="text-xs px-2.5 py-1 rounded-full"
            style={{ color: '#fca5a5', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            Spikes detected
          </span>
        ) : (
          <span
            className="text-xs px-2.5 py-1 rounded-full"
            style={{ color: '#86efac', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}
          >
            All clear
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {LEVELS.map(({ key, label, color, bg, border, dot }) => {
          const count = report.total_counts[key] || 0
          const spiked = report.spikes?.some((s) => s.level === key)
          const active = count > 0
          const lines = report.sample_lines?.[key] || []
          const isOpen = expanded === key

          return (
            <div key={key}>
              <button
                onClick={() => active && setExpanded(isOpen ? null : key)}
                className="w-full rounded-xl px-4 py-3 flex items-center justify-between transition-all duration-200 text-left"
                style={{
                  background: active ? bg : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${active ? border : 'rgba(255,255,255,0.06)'}`,
                  cursor: active ? 'pointer' : 'default',
                  borderBottomLeftRadius: isOpen ? 0 : undefined,
                  borderBottomRightRadius: isOpen ? 0 : undefined,
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: active ? dot : 'rgba(255,255,255,0.15)' }}
                  />
                  <span className="text-xs font-medium" style={{ color: active ? color : 'rgba(255,255,255,0.2)' }}>
                    {label}
                  </span>
                  {spiked && <span className="text-xs" style={{ color }}>↑</span>}
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold" style={{ color: active ? color : 'rgba(255,255,255,0.15)' }}>
                    {count}
                  </p>
                  {active && (
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {isOpen ? '▲' : '▼'}
                    </span>
                  )}
                </div>
              </button>

              {isOpen && lines.length > 0 && (
                <div
                  className="rounded-b-xl px-3 py-2 space-y-1 overflow-y-auto"
                  style={{
                    background: 'rgba(0,0,0,0.25)',
                    border: `1px solid ${border}`,
                    borderTop: 'none',
                    maxHeight: '180px',
                  }}
                >
                  {lines.map((line, i) => (
                    <p
                      key={i}
                      className="text-xs font-mono break-all leading-relaxed"
                      style={{ color: 'rgba(255,255,255,0.5)' }}
                    >
                      {line}
                    </p>
                  ))}
                  {count > lines.length && (
                    <p className="text-xs pt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                      +{count - lines.length} more — ask the AI for details
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {!hasAny && (
        <p className="text-sm" style={{ color: '#86efac' }}>✓ No errors or warnings found in this log</p>
      )}
    </div>
  )
}
