import { useMemo } from 'react'
import { PHASES } from './timerPhases'

function fmt(ms) {
  const s = Math.max(0, Math.floor(ms / 1000))
  const mm = String(Math.floor(s / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

export default function TimerBar({ elapsedMs = 0, phase = 'Understand', phaseElapsedMs = 0 }) {
  const phaseLimitMs = useMemo(() => {
    const p = PHASES.find((x) => x.key === phase) || PHASES[0]
    return p.minutes * 60_000
  }, [phase])

  const pct = phaseLimitMs ? Math.min(1, phaseElapsedMs / phaseLimitMs) : 0
  const color =
    pct >= 0.95 ? 'bg-red-500' : pct >= 0.8 ? 'bg-amber-500' : 'bg-success'

  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2">
      <div className="mb-2 flex items-center justify-between text-xs">
        <div className="text-text-secondary">
          Phase: <span className="font-semibold text-text-primary">{phase}</span>
        </div>
        <div className="mono text-text-secondary">
          Elapsed <span className="text-text-primary">{fmt(elapsedMs)}</span> · Phase{' '}
          <span className="text-text-primary">{fmt(phaseElapsedMs)}</span>
        </div>
      </div>
      <div className="h-2 w-full overflow-hidden rounded bg-[#0b0f14]">
        <div className={`h-full ${color}`} style={{ width: `${pct * 100}%` }} />
      </div>
    </div>
  )
}

