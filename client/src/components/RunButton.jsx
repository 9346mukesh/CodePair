export default function RunButton({ onRun, running }) {
  return (
    <button
      type="button"
      onClick={onRun}
      disabled={running}
      className="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
      title="Cmd+Enter"
    >
      {running ? 'Running…' : 'Run'}
    </button>
  )
}

