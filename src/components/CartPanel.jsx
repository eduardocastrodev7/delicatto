import { useApp } from '../context/AppContext'
import styles from './CartPanel.module.css'

const GRADIENTS = {
  'Brigadeiros': ['#3a1c0a', '#7a3f1a'],
  'Trufas':      ['#2d1f3d', '#6b4c80'],
  'Especiais':   ['#1f3028', '#4a7c59'],
  'Boxes':       ['#302010', '#8c6030'],
}

export default function CartPanel({ onClose, onCheckout }) {
  const { cart, addToCart, removeFromCart, cartTotal } = useApp()

  const handleCheckout = () => {
    onClose()
    if (onCheckout) onCheckout()
  }

  const totalQty = cart.reduce((s, i) => s + i.qty, 0)

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.panel}>

        {/* Header */}
        <div className={styles.header}>
          <div>
            <div className={styles.title}>Seu pedido</div>
            <div className={styles.subtitle}>
              {totalQty === 0 ? 'Nenhum item ainda' : `${totalQty} ${totalQty === 1 ? 'item' : 'itens'}`}
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 1l10 10M11 1L1 11"/>
            </svg>
          </button>
        </div>

        {/* Itens */}
        <div className={styles.items}>
          {cart.length === 0 && (
            <div className={styles.empty}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.2" className={styles.emptyIcon}>
                <path d="M8 8h4l4.5 18h12l3.5-12H14"/>
                <circle cx="17" cy="32" r="2" fill="currentColor" stroke="none"/>
                <circle cx="27" cy="32" r="2" fill="currentColor" stroke="none"/>
              </svg>
              <p>Nenhum item adicionado<br />ao seu pedido ainda.</p>
            </div>
          )}

          {cart.map((item) => {
            const [c1, c2] = GRADIENTS[item.category] || ['#3a1c0a', '#7a3f1a']
            const thumb = item.images?.[0] || item.image_url

            // Sabores escolhidos formatados
            const sabores = item.flavorChoices && item.flavors
              ? Object.entries(item.flavorChoices)
                  .map(([id, qty]) => {
                    const s = item.flavors.find(f => f.id === id || f.id === String(id))
                    return s ? `${qty}× ${s.name}` : null
                  }).filter(Boolean)
              : []

            return (
              <div key={item.cartItemId || item.id} className={styles.item}>
                {/* Thumb: foto real ou gradiente */}
                <div className={styles.itemThumb}>
                  {thumb
                    ? <img src={thumb} alt={item.name} className={styles.itemThumbImg} />
                    : <div className={styles.itemThumbGrad}
                        style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                        <span className={styles.itemInitials}>
                          {item.name.split(' ').slice(0,2).map(w=>w[0]).join('')}
                        </span>
                      </div>
                  }
                </div>

                {/* Info */}
                <div className={styles.info}>
                  <div className={styles.itemName}>{item.name}</div>
                  <div className={styles.itemUnit}>
                    R$ {parseFloat(item.price).toFixed(2).replace('.', ',')} / un
                  </div>
                  {/* Sabores escolhidos */}
                  {sabores.length > 0 && (
                    <div className={styles.itemFlavors}>
                      {sabores.join(' · ')}
                    </div>
                  )}
                </div>

                {/* Controles + subtotal */}
                <div className={styles.rightCol}>
                  <div className={styles.controls}>
                    <button onClick={() => removeFromCart(item.cartItemId || item.id)}>−</button>
                    <span className={styles.qty}>{item.qty}</span>
                    <button onClick={() => addToCart(item)}>+</button>
                  </div>
                  <div className={styles.subtotal}>
                    R$ {(item.price * item.qty).toFixed(2).replace('.', ',')}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
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
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 7h10M7 2l5 5-5 5"/>
            </svg>
            Finalizar pedido
          </button>
        </div>
      </div>
    </>
  )
}