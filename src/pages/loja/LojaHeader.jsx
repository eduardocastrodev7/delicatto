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
            <img src="/logo-lettering-light.png" alt="Delicatto Doceria" className={styles.logoImg} />
          </a>

          <nav className={styles.nav}>
            <button className={styles.cartBtn} onClick={() => setShowCart(true)} aria-label={`Carrinho — ${cartCount} itens`}>
              <div className={styles.cartIconWrap}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                {cartCount > 0 && (
                  <span className={styles.cartBadge}>{cartCount > 9 ? '9+' : cartCount}</span>
                )}
              </div>
              <span className={styles.cartLabel}>Carrinho</span>
            </button>
          </nav>
        </div>
      </header>

      {showCart && <CartPanel onClose={() => setShowCart(false)} />}
    </>
  )
}