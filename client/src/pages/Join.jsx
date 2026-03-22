import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api'

function getOrCreateUserId() {
  const k = 'codepair:userId'
  const existing = sessionStorage.getItem(k)
  if (existing) return existing
  const id = crypto.randomUUID()
  sessionStorage.setItem(k, id)
  return id
}

export default function Join() {
  const { roomCode: roomCodeParam } = useParams()
  const nav = useNavigate()
  const userId = useMemo(() => getOrCreateUserId(), [])

  const [userName, setUserName] = useState('')
  const [code, setCode] = useState((roomCodeParam || '').toUpperCase())
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function joinRoom() {
    setErr('')
    setBusy(true)
    try {
      const upper = (code || '').trim().toUpperCase()
      await api.get(`/api/rooms/${upper}`)
      nav(`/lobby/${upper}`, { state: { userName, userId, isCreator: false } })
    } catch (e) {
      setErr(e?.response?.data?.error || 'Invalid room code.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <Link to="/" className="mono text-sm font-semibold text-text-primary">
          CodePair
        </Link>
        <Link to="/library" className="text-xs text-text-secondary hover:text-text-primary">
          Problems Library
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="text-lg font-semibold text-text-primary">Join Room</div>
        <div className="mt-2 text-sm text-text-secondary">
          Enter your name and the 6-character room code.
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-xs text-text-secondary">
            Name
            <input
              className="mt-1 w-full rounded-md border border-border bg-[#0b0f14] px-3 py-2 text-xs text-text-primary outline-none focus:border-accent"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your name"
            />
          </label>
          <label className="text-xs text-text-secondary">
            Room code
            <input
              className="mono mt-1 w-full rounded-md border border-border bg-[#0b0f14] px-3 py-2 text-xs uppercase tracking-widest text-text-primary outline-none focus:border-accent"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="XK4P2R"
            />
          </label>
        </div>

        {err ? <div className="mt-3 text-xs text-red-400">{err}</div> : null}

        <div className="mt-5 flex justify-end gap-2">
          <Link
            to="/"
            className="rounded-md border border-border bg-[#0b0f14] px-3 py-2 text-xs text-text-secondary hover:text-text-primary"
          >
            Cancel
          </Link>
          <button
            type="button"
            disabled={busy || !userName.trim() || (code || '').trim().length !== 6}
            onClick={joinRoom}
            className="rounded-md bg-accent px-3 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            {busy ? 'Joining…' : 'Join'}
          </button>
        </div>
      </div>
    </div>
  )
}

