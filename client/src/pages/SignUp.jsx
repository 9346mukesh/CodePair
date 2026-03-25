import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthOptional } from '../hooks/useAuth'

export default function SignUp() {
  const navigate = useNavigate()
  const auth = useAuthOptional()

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      if (!supabase || !auth?.signUp) throw new Error('Auth is not configured')
      await auth.signUp(email, password, displayName)
      navigate('/')
    } catch (e2) {
      setErr(e2?.message || 'Sign up failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-xl items-center px-6 py-10">
      <div className="w-full rounded-xl border border-border bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <Link to="/" className="mono text-sm font-semibold text-text-primary">
            CodePair
          </Link>
          <Link to="/signin" className="text-xs text-text-secondary hover:text-text-primary">
            Back to sign in
          </Link>
        </div>

        <div className="mb-3 text-lg font-semibold text-text-primary">Create account</div>
        <div className="mb-5 text-xs text-text-secondary">Create an account to save sessions and evaluations.</div>

        {!supabase ? (
          <div className="rounded-lg border border-amber-500/60 bg-[#0f141b] p-3 text-xs text-text-secondary">
            Auth is not configured. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to enable sign-up.
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-xs text-text-secondary">
            Display name
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-border bg-[#0b0f14] px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
              placeholder="e.g. Mukesh"
            />
          </label>
          <label className="block text-xs text-text-secondary">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-border bg-[#0b0f14] px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
              placeholder="you@example.com"
            />
          </label>
          <label className="block text-xs text-text-secondary">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1 w-full rounded-md border border-border bg-[#0b0f14] px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
              placeholder="••••••••"
            />
          </label>

          {err ? <div className="text-xs text-red-400">{err}</div> : null}

          <div className="flex justify-end gap-2 pt-2">
            <Link
              to="/signin"
              className="rounded-md border border-border bg-[#0b0f14] px-3 py-2 text-xs text-text-secondary hover:text-text-primary"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={busy}
              className="rounded-md bg-accent px-3 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              {busy ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

