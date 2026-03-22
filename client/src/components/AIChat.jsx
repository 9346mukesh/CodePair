import { useEffect, useMemo, useRef, useState } from 'react'

function ChatSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-3 w-2/3 animate-pulse rounded bg-[#1f2630]" />
      <div className="h-3 w-1/2 animate-pulse rounded bg-[#1f2630]" />
      <div className="h-3 w-3/4 animate-pulse rounded bg-[#1f2630]" />
    </div>
  )
}

export default function AIChat({
  messages,
  onSend,
  sending,
  collapsed,
  onToggle,
  showSkeleton = false,
}) {
  const [draft, setDraft] = useState('')
  const listRef = useRef(null)

  const quick = useMemo(
    () => [
      { label: 'Request hint', value: 'Request hint.' },
      { label: 'Clarify constraints', value: 'Can you clarify the constraints and edge cases?' },
      { label: "I'm ready to code", value: "I'm ready to start coding." },
      { label: 'Explain my approach', value: 'Here is my approach:' },
    ],
    [],
  )

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages?.length])

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="text-sm font-semibold text-text-primary">AI Interviewer</div>
        <button
          className="rounded-md border border-border bg-[#0f141b] px-2 py-1 text-xs text-text-secondary hover:text-text-primary"
          onClick={onToggle}
          type="button"
        >
          {collapsed ? 'Show' : 'Hide'}
        </button>
      </div>

      {!collapsed ? (
        <>
          <div ref={listRef} className="flex-1 space-y-2 overflow-auto p-3">
            {showSkeleton ? (
              <ChatSkeleton />
            ) : (
              (messages || []).map((m) => (
                <div
                  key={m.id}
                  className={[
                    'max-w-[92%] rounded-md px-3 py-2 text-xs leading-relaxed',
                    m.role === 'ai'
                      ? 'border-l-2 border-accent bg-[#0f141b] text-text-primary'
                      : 'ml-auto bg-[#0b0f14] text-text-primary',
                  ].join(' ')}
                >
                  {m.content}
                </div>
              ))
            )}
          </div>

          <div className="border-t border-border p-3">
            <div className="mb-2 flex flex-wrap gap-2">
              {quick.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  className="rounded-md border border-border bg-[#0f141b] px-2 py-1 text-[11px] text-text-secondary hover:border-accent hover:text-text-primary"
                  onClick={() => onSend?.(q.value)}
                  disabled={sending}
                >
                  {q.label}
                </button>
              ))}
            </div>

            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                onSend?.(draft)
                setDraft('')
              }}
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask a clarifying question…"
                className="w-full rounded-md border border-border bg-[#0b0f14] px-3 py-2 text-xs text-text-primary outline-none focus:border-accent"
              />
              <button
                type="submit"
                disabled={sending}
                className="rounded-md bg-accent px-3 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                Send
              </button>
            </form>

            <div className="mt-2 text-[11px] text-text-secondary">
              Cmd+H: hint · Cmd+/: toggle chat
            </div>
          </div>
        </>
      ) : (
        <div className="p-3 text-xs text-text-secondary">Chat hidden (Cmd+/).</div>
      )}
    </div>
  )
}

