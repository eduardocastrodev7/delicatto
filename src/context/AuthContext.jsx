import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [admin, setAdmin]   = useState(null)
  const [loading, setLoading] = useState(true)  // aguarda verificar sessão

  // Verifica sessão existente ao carregar
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAdmin({ id: session.user.id, email: session.user.email, name: session.user.user_metadata?.name || 'Admin' })
      }
      setLoading(false)
    })

    // Escuta mudanças de auth (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAdmin({ id: session.user.id, email: session.user.email, name: session.user.user_metadata?.name || 'Admin' })
      } else {
        setAdmin(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loginAdmin = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        console.error('Supabase auth error:', error.message)
        if (error.message.includes('Email not confirmed')) {
          return { ok: false, error: 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.' }
        }
        return { ok: false, error: 'E-mail ou senha incorretos.' }
      }
      return { ok: true }
    } catch (err) {
      console.error('Login error:', err)
      return { ok: false, error: 'Erro de conexão. Verifique sua internet.' }
    }
  }

  const logoutAdmin = async () => {
    await supabase.auth.signOut()
    setAdmin(null)
  }

  return (
    <AuthContext.Provider value={{ admin, loading, loginAdmin, logoutAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}