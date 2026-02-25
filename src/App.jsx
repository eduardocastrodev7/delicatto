import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LojaLayout from './pages/loja/LojaLayout'
import AdminLayout from './pages/admin/AdminLayout'
import LoginAdmin from './pages/admin/LoginAdmin'

function AdminGuard({ children }) {
  const { admin, loading } = useAuth()

  // Aguarda verificar sessão antes de redirecionar
  if (loading) {
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--beige-light)', fontFamily: 'var(--font-body)',
        color: 'var(--muted)', fontSize: '14px', letterSpacing: '0.05em'
      }}>
        Carregando...
      </div>
    )
  }

  if (!admin) return <Navigate to="/admin/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/*" element={<LojaLayout />} />
      <Route path="/admin/login" element={<LoginAdminGuard />} />
      <Route
        path="/admin/*"
        element={
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        }
      />
    </Routes>
  )
}

// Se já está logado e tenta ir para /admin/login, manda direto pro painel
function LoginAdminGuard() {
  const { admin, loading } = useAuth()
  if (loading) return null
  if (admin) return <Navigate to="/admin" replace />
  return <LoginAdmin />
}