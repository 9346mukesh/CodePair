function Skeleton() {
  return (
    <div className="space-y-3">
      <div className="h-4 w-2/3 animate-pulse rounded bg-[#1f2630]" />
      <div className="h-3 w-full animate-pulse rounded bg-[#1f2630]" />
      <div className="h-3 w-5/6 animate-pulse rounded bg-[#1f2630]" />
      <div className="h-3 w-2/3 animate-pulse rounded bg-[#1f2630]" />
    </div>
  )
}

export default function ProblemPanel({ problem, collapsed, onToggle, loading }) {
  return (
    <div className="rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="text-sm font-semibold text-text-primary">Problem</div>
        <button
          className="rounded-md border border-border bg-[#0f141b] px-2 py-1 text-xs text-text-secondary hover:text-text-primary"
          onClick={onToggle}
          type="button"
        >
          {collapsed ? 'Show' : 'Hide'}
        </button>
      </div>
      {!collapsed ? (
        <div className="space-y-3 p-3">
          {loading ? (
            <Skeleton />
          ) : (
            <>
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold text-text-primary">
                  {problem?.title || 'Two Sum'}
                </div>
                <span className="rounded-md border border-border bg-[#0f141b] px-2 py-1 text-[11px] text-text-secondary">
                  {problem?.difficulty || 'Easy'}
                </span>
              </div>

              <div className="text-xs leading-relaxed text-text-secondary">
                {problem?.description ||
                  'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.'}
              </div>

              <div className="rounded-md border border-border bg-[#0f141b] p-2 text-[11px] text-text-secondary">
                <div className="mb-1 font-semibold text-text-primary">Constraints</div>
                <ul className="list-disc pl-4">
                  {(problem?.constraints || [
                    '2 ≤ nums.length ≤ 10^4',
                    '-10^9 ≤ nums[i] ≤ 10^9',
                    '-10^9 ≤ target ≤ 10^9',
                  ]).map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-md border border-border bg-[#0f141b] p-2 text-[11px] text-text-secondary">
                <div className="mb-1 font-semibold text-text-primary">Example</div>
                <div className="mono whitespace-pre-wrap text-text-primary">
                  {problem?.example ||
                    'Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]'}
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="p-3 text-xs text-text-secondary">Problem hidden.</div>
      )}
    </div>
  )
}

