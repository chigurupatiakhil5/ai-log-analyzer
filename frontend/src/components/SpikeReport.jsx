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

      <div className="grid grid-cols-3 gap-3">
        {LEVELS.map(({ key, label, color, bg, border, dot }) => {
          const count = report.total_counts[key] || 0
          const spiked = report.spikes?.some((s) => s.level === key)
          const active = count > 0

          return (
            <div
              key={key}
              className="rounded-2xl p-5 transition-all duration-200"
              style={{
                background: active ? bg : 'rgba(255,255,255,0.02)',
                border: `1px solid ${active ? border : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: active ? dot : 'rgba(255,255,255,0.15)' }}
                  />
                  <span className="text-xs font-medium" style={{ color: active ? color : 'rgba(255,255,255,0.2)' }}>
                    {label}
                  </span>
                </div>
                {spiked && (
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>↑</span>
                )}
              </div>
              <p className="text-3xl font-bold" style={{ color: active ? color : 'rgba(255,255,255,0.15)' }}>
                {count}
              </p>
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
