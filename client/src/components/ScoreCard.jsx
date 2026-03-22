export default function ScoreCard({ name, scores }) {
  const rows = [
    ['Problem Solving', scores?.problem_solving ?? 0],
    ['Communication', scores?.communication ?? 0],
    ['Code Quality', scores?.code_quality ?? 0],
    ['Complexity Awareness', scores?.time_complexity_awareness ?? 0],
  ]

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="mb-3 text-sm font-semibold text-text-primary">{name}</div>
      <div className="space-y-3">
        {rows.map(([label, v]) => (
          <div key={label} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-secondary">{label}</span>
              <span className="mono text-text-primary">{v}/25</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded bg-[#0b0f14]">
              <div className="h-full bg-accent" style={{ width: `${(v / 25) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

