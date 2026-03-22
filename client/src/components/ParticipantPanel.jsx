export default function ParticipantPanel({ participants = [], typing = {} }) {
  const list = participants.slice(0, 2)

  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <div className="mb-3 text-sm font-semibold text-text-primary">Participants</div>
      <div className="space-y-3">
        {list.map((p) => {
          const initials = (p.userName || '?')
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((s) => s[0]?.toUpperCase())
            .join('')
          return (
            <div key={p.userId} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full border"
                  style={{ borderColor: p.color || '#7C3AED' }}
                >
                  <span className="text-xs font-semibold text-text-primary">{initials}</span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-text-primary">{p.userName}</div>
                  <div className="text-[11px] text-text-secondary">
                    <span className="mr-1 inline-block h-2 w-2 rounded-full bg-success" />
                    online {typing[p.userId] ? '· thinking…' : ''}
                  </div>
                </div>
              </div>
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: p.color || '#7C3AED' }}
                title="Cursor color"
              />
            </div>
          )
        })}
        {list.length < 2 ? (
          <div className="rounded-md border border-border bg-[#0f141b] p-3 text-xs text-text-secondary">
            <div className="mb-1 font-semibold text-text-primary">Waiting for partner…</div>
            <div className="h-3 w-40 animate-pulse rounded bg-[#1f2630]" />
          </div>
        ) : null}
      </div>
    </div>
  )
}

