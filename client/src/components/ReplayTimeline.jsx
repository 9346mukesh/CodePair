import { useEffect, useState } from 'react'
import { api } from '../lib/api'

function formatTime(iso) {
  if (!iso) return '--:--'
  const d = new Date(iso)
  return `${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

export default function ReplayTimeline({ sessionId }) {
  const [snapshots, setSnapshots] = useState([])
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionId) return
    api
      .get(`/api/sessions/${sessionId}/snapshots`)
      .then((res) => setSnapshots(res.data?.snapshots || []))
      .catch(() => setSnapshots([]))
      .finally(() => setLoading(false))
  }, [sessionId])

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="text-sm font-semibold text-text-primary">Session Replay</div>
        <div className="mt-3 h-24 animate-pulse rounded bg-[#0f141b]" />
      </div>
    )
  }

  if (!snapshots.length) {
    return (
      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="text-sm font-semibold text-text-primary">Session Replay</div>
        <div className="mt-3 text-xs text-text-secondary">No snapshots available.</div>
      </div>
    )
  }

  const current = snapshots[selectedIdx]

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="text-sm font-semibold text-text-primary">Session Replay</div>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
        {snapshots.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setSelectedIdx(idx)}
            className={[
              'shrink-0 rounded-md px-3 py-1.5 text-xs',
              selectedIdx === idx
                ? 'bg-accent text-white'
                : 'border border-border bg-[#0b0f14] text-text-secondary hover:text-text-primary',
            ].join(' ')}
          >
            {formatTime(snapshots[idx]?.taken_at)}
          </button>
        ))}
      </div>
      <pre className="mono mt-2 max-h-48 overflow-auto rounded border border-border bg-[#0b0f14] p-3 text-xs leading-relaxed text-text-primary">
        {current?.code || '(empty)'}
      </pre>
    </div>
  )
}
