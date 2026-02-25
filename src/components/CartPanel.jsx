import { useApp } from '../context/AppContext'
import styles from './CartPanel.module.css'

const CandyIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
    <circle cx="12" cy="9" r="2.5"/>
  </svg>
)

export default function CartPanel({ onClose, onCheckout }) {
  const { cart, addToCart, removeFromCart, cartTotal } = useApp()

  const handleCheckout = () => {
    onClose()
    if (onCheckout) onCheckout()
  }

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.panel}>
        <div className={styles.header}>
          <div>
            <div className={styles.title}>Seu pedido</div>
            <div className={styles.subtitle}>{cart.length} {cart.length === 1 ? 'item selecionado' : 'itens selecionados'}</div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 1l12 12M13 1L1 13"/>
            </svg>
          </button>
        </div>

        <div className={styles.items}>
          {cart.length === 0 && (
            <div className={styles.empty}>
              <div className={styles.emptyLine} />
              Nenhum item adicionado
              <br />ao seu pedido ainda.
              <div className={styles.emptyLine} />
            </div>
          )}

          {cart.map((item) => (
            <div key={item.id} className={styles.item}>
              <div className={styles.itemThumb}>
                <CandyIcon className={styles.itemIcon} />
              </div>
              <div className={styles.info}>
                <div className={styles.itemName}>{item.name}</div>
                <div className={styles.itemUnit}>R$ {parseFloat(item.price).toFixed(2).replace('.', ',')} / un</div>
              </div>
              <div className={styles.controls}>
                <button onClick={() => removeFromCart(item.id)}>−</button>
                <span className={styles.qty}>{item.qty}</span>
                <button onClick={() => addToCart(item)}>+</button>
              </div>
              <div className={styles.subtotal}>
                R$ {(item.price * item.qty).toFixed(2).replace('.', ',')}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Total</span>
            <span className={styles.totalValue}>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
          </div>
          <button
            className={styles.checkoutBtn}
            onClick={handleCheckout}
            disabled={cart.length === 0}
          >
            Finalizar pedido
          </button>
        </div>
      </div>
    </>
  )
}