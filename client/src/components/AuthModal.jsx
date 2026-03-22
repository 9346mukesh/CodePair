import { useState } from 'react'
import { useAuthOptional } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface shadow-lg">
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

export default function AuthModal({ mode = 'signin', onClose, onSuccess, onSwitchMode }) {
  const auth = useAuthOptional()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const signIn = auth?.signIn
  const signUp = auth?.signUp

  if (!supabase) {
    return (
      <Modal title="Sign in" onClose={onClose}>
        <p className="text-xs text-text-secondary">
          Auth is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable sign-in.
        </p>
      </Modal>
    )
  }

  if (!signIn || !signUp) return null
  const isSignUp = mode === 'signup'

  async function handleSubmit(e) {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      if (isSignUp) {
        await signUp(email, password, displayName)
      } else {
        await signIn(email, password)
      }
      onSuccess?.()
      onClose?.()
    } catch (e) {
      setErr(e?.message || 'Auth failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title={isSignUp ? 'Create account' : 'Sign in'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        {isSignUp ? (
          <label className="block text-xs text-text-secondary">
            Display name
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-[#0b0f14] px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
              placeholder="Your name"
            />
          </label>
        ) : null}
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
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => (isSignUp ? onSwitchMode?.('signin') : onSwitchMode?.('signup'))}
            className="text-xs text-accent hover:underline"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="rounded-md border border-border bg-[#0b0f14] px-3 py-2 text-xs text-text-secondary hover:text-text-primary">
              Cancel
            </button>
          <button type="submit" disabled={busy} className="rounded-md bg-accent px-3 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60">
            {busy ? 'Please wait…' : isSignUp ? 'Sign up' : 'Sign in'}
          </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
