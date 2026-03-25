import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './LoginAdmin.module.css'

export default function LoginAdmin() {
  const { loginAdmin } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const set = (f) => (e) => {
    setForm((p) => ({ ...p, [f]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Preencha e-mail e senha.')
      return
    }
    setLoading(true)
    const result = await loginAdmin(form.email, form.password)
    if (result.ok) {
      navigate('/admin', { replace: true })
    } else {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoWrap}>
          <img src="/logo-simbolo.png" alt="Delicatto" className={styles.logo} />
        </div>

        <h1 className={styles.title}>Acesso Admin</h1>
        <p className={styles.sub}>Entre com suas credenciais para acessar o painel de gestão.</p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label}>E-mail</label>
            <input
              className={styles.input}
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="seu@email.com"
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Senha</label>
            <input
              className={styles.input}
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <a href="/" className={styles.backBtn}>← Voltar à loja</a>
      </div>
    </div>
  )
}