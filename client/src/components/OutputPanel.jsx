export default function OutputPanel({ result, activeTab, onTabChange }) {
  const tabs = ['Output', 'Test Cases', 'Console']
  const tab = activeTab || 'Output'
  const status = result?.status || '—'
  const meta = (() => {
    if (result?.execution_time != null && result?.memory_used != null) {
      return `Ran in ${result.execution_time}ms · ${result.memory_used} MB`
    }
    if (Array.isArray(result?.tests) && result.tests.length) {
      const times = result.tests.map((t) => t.execution_time).filter((x) => x != null)
      const mems = result.tests.map((t) => t.memory_used).filter((x) => x != null)
      const totalTime = times.length ? times.reduce((a, b) => a + b, 0) : null
      const maxMem = mems.length ? Math.max(...mems.map(Number)) : null
      return totalTime != null && maxMem != null ? `Total ${totalTime}ms · Max ${maxMem} MB` : null
    }
    return null
  })()

  return (
    <div className="rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onTabChange?.(t)}
              className={[
                'rounded-md px-2 py-1 text-xs',
                tab === t
                  ? 'bg-[#0f141b] text-text-primary'
                  : 'text-text-secondary hover:text-text-primary',
              ].join(' ')}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="text-[11px] text-text-secondary">
          <span className="mr-2">
            Status: <span className="text-text-primary">{status}</span>
          </span>
          {meta ? <span className="mono">{meta}</span> : null}
        </div>
      </div>
      {tab === 'Test Cases' ? (
        <div className="p-3">
          {(result?.tests || []).length ? (
            <div className="space-y-2">
              {result.tests.map((t, idx) => {
                const ok = t.pass === true
                const tone = ok ? 'border-success bg-[#0b1410]' : 'border-red-500/60 bg-[#140b0b]'
                return (
                  <div key={idx} className={`rounded-md border ${tone} p-2`}>
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="text-text-secondary">Test {idx + 1}</div>
                      <div className="mono text-text-primary">{t.status}</div>
                    </div>
                    <div className="mt-1 mono max-h-24 overflow-auto whitespace-pre-wrap text-xs text-text-primary">
                      {(t.stdout || t.stderr || '').trim() || 'No output'}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="mono text-xs text-text-secondary">No test results available.</div>
          )}
        </div>
      ) : (
        <pre className="mono max-h-44 overflow-auto p-3 text-xs leading-relaxed text-text-primary">
          {tab === 'Console'
            ? result?.stderr || ''
            : result?.stdout || result?.stderr || 'Run code to see output.'}
        </pre>
      )}
    </div>
  )
}

