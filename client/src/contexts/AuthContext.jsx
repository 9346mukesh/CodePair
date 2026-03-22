import { createContext, useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      queueMicrotask(() => setLoading(false))
      return
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    return () => subscription?.unsubscribe?.()
  }, [])

  const signIn = useCallback(async (email, password) => {
    if (!supabase) throw new Error('Auth not configured')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [])

  const signUp = useCallback(async (email, password, displayName) => {
    if (!supabase) throw new Error('Auth not configured')
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: displayName } } })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  const value = {
    user,
    loading,
    signedIn: !!user,
    displayName: user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User',
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext }
