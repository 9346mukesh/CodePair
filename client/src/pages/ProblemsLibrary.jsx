import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { PROBLEMS } from '../lib/problems'

function getOrCreateUserId() {
  const k = 'codepair:userId'
  const existing = sessionStorage.getItem(k)
  if (existing) return existing
  const id = crypto.randomUUID()
  sessionStorage.setItem(k, id)
  return id
}

function Badge({ children }) {
  return (
    <span className="rounded-md border border-border bg-[#0b0f14] px-2 py-1 text-[11px] text-text-secondary">
      {children}
    </span>
  )
}

export default function ProblemsLibrary() {
  const nav = useNavigate()
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedProblem, setSelectedProblem] = useState(null)
  const [userName, setUserName] = useState('')

  const userId = useMemo(() => getOrCreateUserId(), [])

  const handleCreateRoom = (problem) => {
    setSelectedProblem(problem)
    setCreateOpen(true)
  }

  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const handleConfirmCreate = async (solo) => {
    if (!selectedProblem || !userName.trim()) return
    setErr('')
    setBusy(true)
    try {
      const res = await api.post('/api/rooms/create', {
        userName: userName.trim(),
        difficulty: selectedProblem.difficulty,
        language: 'Python',
        type: 'Mixed',
        creatorId: userId,
        problemId: selectedProblem.id,
      })
      const code = res.data?.code
      if (!code) throw new Error('No room code returned')
      nav(`/lobby/${code}`, {
        state: {
          userName: userName.trim(),
          userId,
          isCreator: true,
          solo: !!solo,
          problemId: selectedProblem.id,
          room: { difficulty: selectedProblem.difficulty, language: 'Python', type: 'Mixed', problemId: selectedProblem.id },
        },
      })
      setCreateOpen(false)
      setSelectedProblem(null)
      setUserName('')
    } catch (e) {
      setErr(e?.response?.data?.error || 'Failed to create room')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link to="/" className="mono text-sm font-semibold text-text-primary">
          CodePair
        </Link>
        <button
          type="button"
          onClick={() => nav('/')}
          className="rounded-md border border-border bg-[#0b0f14] px-3 py-2 text-xs text-text-secondary hover:text-text-primary"
        >
          Back to landing
        </button>
      </div>

      <div className="mb-6">
        <div className="text-2xl font-semibold text-text-primary">Problems Library</div>
        <div className="mt-2 text-sm text-text-secondary">
          20 curated problems, organized by difficulty and topic.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {PROBLEMS.map((p) => (
          <div key={p.id} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="text-sm font-semibold text-text-primary">{p.title}</div>
              <Badge>{p.difficulty}</Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(p.topic || []).slice(0, 3).map((t) => (
                <Badge key={t}>{t.replace(' & ', ' ')}</Badge>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => handleCreateRoom(p)}
                className="flex-1 rounded-md border border-border bg-[#0b0f14] px-3 py-2 text-xs text-text-secondary hover:text-text-primary"
              >
                Practice Solo
              </button>
              <button
                type="button"
                onClick={() => handleCreateRoom(p)}
                className="flex-1 rounded-md bg-accent px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
              >
                Create Room
              </button>
            </div>
          </div>
        ))}
      </div>

      {createOpen && selectedProblem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-4">
            <div className="text-sm font-semibold text-text-primary">
              Create room for: {selectedProblem.title}
            </div>
            <label className="mt-3 block text-xs text-text-secondary">
              Your name
              <input
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="mono mt-1 w-full rounded-md border border-border bg-[#0b0f14] px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
                placeholder="Your name"
              />
            </label>
            {err ? <div className="mt-2 text-xs text-red-400">{err}</div> : null}
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setCreateOpen(false); setSelectedProblem(null); setErr('') }}
                className="rounded-md border border-border bg-[#0b0f14] px-3 py-2 text-xs text-text-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmCreate(true)}
                disabled={!userName.trim() || busy}
                className="rounded-md border border-border bg-[#0b0f14] px-3 py-2 text-xs text-text-secondary disabled:opacity-60"
              >
                Practice Solo
              </button>
              <button
                type="button"
                onClick={() => handleConfirmCreate(false)}
                disabled={!userName.trim() || busy}
                className="rounded-md bg-accent px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
              >
                {busy ? 'Creating…' : 'Create Room'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

