const LANGS = [
  { label: 'Python', value: 'python' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Java', value: 'java' },
  { label: 'C++', value: 'cpp' },
  { label: 'Go', value: 'go' },
  { label: 'Rust', value: 'rust' },
]

export default function LanguageSelector({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-xs text-text-secondary">Language</div>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="rounded-md border border-border bg-[#0b0f14] px-2 py-1 text-xs text-text-primary outline-none focus:border-accent"
      >
        {LANGS.map((l) => (
          <option key={l.value} value={l.value}>
            {l.label}
          </option>
        ))}
      </select>
    </div>
  )
}

