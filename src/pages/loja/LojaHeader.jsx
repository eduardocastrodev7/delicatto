import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import CartPanel from '../../components/CartPanel'
import styles from '../../components/Header.module.css'

// Header limpo — zero referência ao admin
export default function LojaHeader() {
  const { cartCount } = useApp()
  const [showCart, setShowCart] = useState(false)

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <a href="/" className={styles.logoBtn}>
            <img src="/logo-lettering.png" alt="Delicatto Doceria" className={styles.logoImg} />
          </a>

          <nav className={styles.nav}>
            <button className={styles.cartBtn} onClick={() => setShowCart(true)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              <span>{cartCount} {cartCount === 1 ? 'item' : 'itens'}</span>
            </button>
          </nav>
        </div>
      </header>

      {showCart && <CartPanel onClose={() => setShowCart(false)} />}
    </>
  )
}