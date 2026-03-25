import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import CartPanel from './CartPanel'
import styles from './Header.module.css'

export default function Header({ view, setView }) {
  const { cartCount } = useApp()
  const { admin, logoutAdmin } = useAuth()
  const [showCart, setShowCart] = useState(false)

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <button className={styles.logoBtn} onClick={() => setView('loja')}>
            <img src="/logo-lettering-light.png" alt="Delicatto Doceria" className={styles.logoImg} />
          </button>

          <nav className={styles.nav}>
            <button
              className={`${styles.navBtn} ${view === 'loja' ? styles.active : ''}`}
              onClick={() => setView('loja')}
            >
              Cardápio
            </button>

            {/* Botão Admin — só aparece se logado como admin */}
            {admin && (
              <button
                className={`${styles.navBtn} ${view === 'admin' ? styles.active : ''}`}
                onClick={() => setView('admin')}
              >
                Admin
              </button>
            )}

            {/* Logout — só aparece se admin logado */}
            {admin && (
              <button className={styles.logoutBtn} onClick={logoutAdmin} title="Sair do admin">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                <span className={styles.logoutName}>{admin.name}</span>
              </button>
            )}

            {/* Botão de login admin discreto — só para quem sabe que existe */}
            {!admin && (
              <button
                className={styles.adminAccessBtn}
                onClick={() => setView('admin')}
                title="Acesso restrito"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              </button>
            )}

            {view === 'loja' && (
              <button className={styles.cartBtn} onClick={() => setShowCart(true)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                <span>{cartCount} {cartCount === 1 ? 'item' : 'itens'}</span>
              </button>
            )}
          </nav>
        </div>
      </header>

      {showCart && <CartPanel onClose={() => setShowCart(false)} />}
    </>
  )
}