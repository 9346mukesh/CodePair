import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthModal from '../components/AuthModal'
import { useAuthOptional } from '../hooks/useAuth'
import { api } from '../lib/api'
import { supabase } from '../lib/supabase'

function getOrCreateUserId() {
  const k = 'codepair:userId'
  const existing = sessionStorage.getItem(k)
  if (existing) return existing
  const id = crypto.randomUUID()
  sessionStorage.setItem(k, id)
  return id
}

function Pill({ children }) {
  return (
    <div className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-text-secondary">
      {children}
    </div>
  )
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-xl rounded-xl border border-border bg-surface shadow-lg">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="text-sm font-semibold text-text-primary">{title}</div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border bg-[#0f141b] px-2 py-1 text-xs text-text-secondary hover:text-text-primary"
          >
            Close
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}

export default function Landing() {
  const nav = useNavigate()
  const auth = useAuthOptional()
  const [createOpen, setCreateOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('signin')

  const userId = useMemo(() => auth?.user?.id || getOrCreateUserId(), [auth?.user?.id])

  const [name, setName] = useState('')
  useEffect(() => {
    if (auth?.displayName && !name) setName(auth.displayName)
  }, [auth?.displayName, name])
  const [difficulty, setDifficulty] = useState('Easy')
  const [language, setLanguage] = useState('Python')
  const [type, setType] = useState('Mixed')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const languages = useMemo(
    () => ['Python', 'JavaScript', 'Java', 'C++', 'Go', 'Rust', 'TypeScript'],
    [],
  )
  const types = useMemo(
    () => ['Arrays & Strings', 'Trees & Graphs', 'Dynamic Programming', 'System Design', 'Mixed'],
    [],
  )

  async function createRoom() {
    setErr('')
    setBusy(true)
    try {
      const res = await api.post('/api/rooms/create', {
        userName: name,
        difficulty,
        language,
        type,
        creatorId: userId,
      })
      nav(`/lobby/${res.data.code}`, {
        state: {
          userName: name,
          isCreator: true,
          userId,
          difficulty,
          language,
          type,
          room: { difficulty, language, type },
        },
      })
    } catch (e) {
      setErr(e?.response?.data?.error || 'Failed to create room.')
    } finally {
      setBusy(false)
    }
  }

  async function joinRoom() {
    setErr('')
    setBusy(true)
    try {
      const upper = (code || '').trim().toUpperCase()
      await api.get(`/api/rooms/${upper}`)
      nav(`/lobby/${upper}`, { state: { userName: name, isCreator: false, userId } })
    } catch (e) {
      setErr(e?.response?.data?.error || 'Invalid room code.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-6 py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="mono text-sm font-semibold text-text-primary">
            CodePair
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/library" className="text-xs text-text-secondary hover:text-text-primary">
              Problems Library
            </Link>
            {supabase && auth?.signedIn && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-secondary">{auth.displayName}</span>
                <button
                  type="button"
                  onClick={() => auth.signOut()}
                  className="rounded-md border border-border bg-[#0b0f14] px-2 py-1 text-xs text-text-secondary hover:text-text-primary"
                >
                  Sign out
                </button>
              </div>
            )}
            {supabase && !auth?.signedIn && (
              <button
                type="button"
                onClick={() => { setAuthMode('signin'); setAuthOpen(true) }}
                className="rounded-md border border-border bg-[#0b0f14] px-2 py-1 text-xs text-text-secondary hover:text-text-primary"
              >
                Sign in
              </button>
            )}
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
            >
              Create Room
            </button>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
          <div>
            <div className="text-4xl font-semibold leading-tight text-text-primary">
              Practice interviews. Together.
            </div>
            <div className="mt-3 max-w-xl text-sm leading-relaxed text-text-secondary">
              Real-time collaborative coding with an AI interviewer that actually pushes back.
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Create Room
              </button>
              <button
                type="button"
                onClick={() => setJoinOpen(true)}
                className="rounded-md border border-accent bg-transparent px-4 py-2 text-sm font-semibold text-text-primary hover:bg-[#0f141b]"
              >
                Join Room
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Pill>Monaco + live cursors</Pill>
              <Pill>AI interviewer + scoring</Pill>
              <Pill>Run code with Judge0</Pill>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-xs font-semibold text-text-primary">Live preview</div>
              <div className="text-[11px] text-text-secondary">CSS demo</div>
            </div>
            <div className="relative h-64 overflow-hidden rounded-lg border border-border bg-[#0b0f14] shadow-accent-glow">
              <div className="mono p-4 text-xs leading-relaxed text-text-secondary">
                <div className="text-text-primary">function twoSum(nums, target) {'{'}</div>
                <div>&nbsp;&nbsp;const seen = new Map()</div>
                <div>&nbsp;&nbsp;for (let i = 0; i &lt; nums.length; i++) {'{'}</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;const need = target - nums[i]</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;if (seen.has(need)) return [seen.get(need), i]</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;seen.set(nums[i], i)</div>
                <div>&nbsp;&nbsp;{'}'}</div>
                <div>{'}'}</div>
              </div>
              <div className="absolute left-10 top-12 h-5 w-0.5 bg-accent animate-[cursorMove1_2.2s_ease-in-out_infinite]" />
              <div className="absolute left-10 top-12 -translate-y-6 rounded bg-[#0f141b] px-2 py-1 text-[10px] text-text-primary">
                Creator
              </div>
              <div className="absolute left-28 top-24 h-5 w-0.5 bg-teal-400 animate-[cursorMove2_2.6s_ease-in-out_infinite]" />
              <div className="absolute left-28 top-24 -translate-y-6 rounded bg-[#0f141b] px-2 py-1 text-[10px] text-text-primary">
                Partner
              </div>
            </div>
            <style>{`
              @keyframes cursorMove1 { 0%{transform:translate(0,0)} 50%{transform:translate(180px,40px)} 100%{transform:translate(0,0)} }
              @keyframes cursorMove2 { 0%{transform:translate(0,0)} 50%{transform:translate(120px,90px)} 100%{transform:translate(0,0)} }
            `}</style>
          </div>
        </div>

        <div className="mt-14 rounded-xl border border-border bg-surface p-6">
          <div className="mb-6 text-lg font-semibold text-text-primary">How it works</div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {[
              ['01', 'Create a room', 'Pick difficulty, topic, and language.'],
              ['02', 'Invite a partner', 'Share the 6-character code or link.'],
              ['03', 'Interview with AI', 'Solve together, run tests, get scored.'],
            ].map(([n, t, d]) => (
              <div key={n} className="rounded-lg border border-border bg-[#0f141b] p-4">
                <div className="mono text-sm font-semibold text-accent">{n}</div>
                <div className="mt-2 text-sm font-semibold text-text-primary">{t}</div>
                <div className="mt-1 text-xs text-text-secondary">{d}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-border py-6 text-xs text-text-secondary">
          <div>© {new Date().getFullYear()} CodePair</div>
          <a href="#" className="hover:text-text-primary">
            GitHub (placeholder)
          </a>
        </div>
      </div>

      {createOpen ? (
        <Modal title="Create Room" onClose={() => setCreateOpen(false)}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs text-text-secondary">
              Name
              <input
                className="mt-1 w-full rounded-md border border-border bg-[#0b0f14] px-3 py-2 text-xs text-text-primary outline-none focus:border-accent"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </label>

            <div className="text-xs text-text-secondary">
              Difficulty
              <div className="mt-2 flex gap-2">
                {['Easy', 'Medium', 'Hard'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={[
                      'rounded-md border px-3 py-2 text-xs',
                      difficulty === d
                        ? 'border-accent bg-[#0f141b] text-text-primary'
                        : 'border-border bg-[#0b0f14] text-text-secondary hover:text-text-primary',
                    ].join(' ')}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <label className="text-xs text-text-secondary">
              Language
              <select
                className="mt-1 w-full rounded-md border border-border bg-[#0b0f14] px-3 py-2 text-xs text-text-primary outline-none focus:border-accent"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {languages.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs text-text-secondary">
              Interview Type
              <select
                className="mt-1 w-full rounded-md border border-border bg-[#0b0f14] px-3 py-2 text-xs text-text-primary outline-none focus:border-accent"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {types.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {err ? <div className="mt-3 text-xs text-red-400">{err}</div> : null}

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="rounded-md border border-border bg-[#0b0f14] px-3 py-2 text-xs text-text-secondary hover:text-text-primary"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={busy || !name.trim()}
              onClick={createRoom}
              className="rounded-md bg-accent px-3 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              {busy ? 'Creating…' : 'Create'}
            </button>
          </div>
        </Modal>
      ) : null}

      {joinOpen ? (
        <Modal title="Join Room" onClose={() => setJoinOpen(false)}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs text-text-secondary">
              Name
              <input
                className="mt-1 w-full rounded-md border border-border bg-[#0b0f14] px-3 py-2 text-xs text-text-primary outline-none focus:border-accent"
                value={name}
                onChange={(e) => setName(e.target.value)}
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

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setJoinOpen(false)}
              className="rounded-md border border-border bg-[#0b0f14] px-3 py-2 text-xs text-text-secondary hover:text-text-primary"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={busy || !name.trim() || (code || '').trim().length !== 6}
              onClick={joinRoom}
              className="rounded-md border border-accent bg-transparent px-3 py-2 text-xs font-semibold text-text-primary hover:bg-[#0f141b] disabled:opacity-60"
            >
              {busy ? 'Joining…' : 'Join'}
            </button>
          </div>
        </Modal>
      ) : null}

      {authOpen && supabase ? (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthOpen(false)}
          onSuccess={() => setAuthOpen(false)}
          onSwitchMode={(m) => setAuthMode(m)}
        />
      ) : null}
    </div>
  )
}

