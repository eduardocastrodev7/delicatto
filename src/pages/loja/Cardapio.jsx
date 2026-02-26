import { useState, useEffect, useRef } from 'react'
import { useApp } from '../../context/AppContext'
import CartPanel from '../../components/CartPanel'
import ProdutoModal from './ProdutoModal'
import styles from './Cardapio.module.css'

export default function Cardapio({ onCheckout }) {
  const { products, addToCart, removeFromCart, cart, cartCount, cartTotal } = useApp()
  const [filterCat, setFilterCat]         = useState('Todos')
  const [showCart, setShowCart]           = useState(false)
  const [produtoAberto, setProdutoAberto] = useState(null)
  const [cartBounce, setCartBounce]       = useState(false)
  const prevCount = useRef(cartCount)

  useEffect(() => {
    if (cartCount > prevCount.current) {
      setCartBounce(true)
      setTimeout(() => setCartBounce(false), 400)
    }
    prevCount.current = cartCount
  }, [cartCount])

  const categories = ['Todos', ...new Set(products.map((p) => p.category))]
  const filtered   = filterCat === 'Todos' ? products : products.filter((p) => p.category === filterCat)
  const getQty     = (id) => cart.filter((i) => i.id === id).reduce((s, i) => s + i.qty, 0)

  const handleCardAdd = (e, produto) => {
    e.stopPropagation()
    if (produto.has_flavors) setProdutoAberto(produto)
    else addToCart(produto, null)
  }
  const handleCardRemove = (e, produto) => {
    e.stopPropagation()
    removeFromCart(produto.id)
  }

  return (
    <div className={styles.page}>

      {/* ── Hero ── */}
      <div className={styles.hero}>
        <div className={styles.heroText}>
          <div className={styles.heroEyebrow}>Confeitaria Artesanal</div>
          <h1 className={styles.heroTitle}>
            Doces feitos<br />com <em>requinte</em>
          </h1>
          <p className={styles.heroSub}>
            Escolha seus favoritos, monte seu pedido e finalize com Pix.
          </p>
        </div>
        <div className={styles.heroSymbol}>
          <img src="/logo-simbolo.png" alt="Delicatto" className={styles.heroSymbolImg} />
        </div>
      </div>

      {/* ── Filtros ── */}
      <div className={styles.filterSection}>
        <div className={styles.filterRow}>
          <span className={styles.filterLabel}>Filtrar</span>
          {categories.map((c) => (
            <button
              key={c}
              className={`${styles.catBtn} ${filterCat === c ? styles.catActive : ''}`}
              onClick={() => setFilterCat(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* ── Divisor ── */}
      <div className={styles.sectionDivider}>
        <span className={styles.sectionDividerTitle}>
          {filterCat === 'Todos' ? 'Todos os doces' : filterCat}
        </span>
        <div className={styles.sectionDividerLine} />
        <span className={styles.sectionDividerCount}>{filtered.length} itens</span>
      </div>

      {/* ── Grid ── */}
      <div className={styles.grid}>
        {filtered.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>🍫</div>
            <div className={styles.emptyStateText}>Nenhum produto disponível.</div>
          </div>
        )}

        {filtered.map((p, i) => {
          const qty = getQty(p.id)
          return (
            <div
              key={p.id}
              className={`${styles.card} ${!p.available ? styles.cardUnavailable : ''}`}
              style={{ animationDelay: `${i * 0.05}s` }}
              onClick={() => setProdutoAberto(p)}
            >
              {/* Foto */}
              <div className={styles.cardPhoto}>
                {(p.images?.[0] || p.image_url)
                  ? <img src={p.images?.[0] || p.image_url} alt={p.name} className={styles.cardImg} loading="lazy" />
                  : <PlaceholderPhoto name={p.name} category={p.category} />
                }
                {!p.available && <div className={styles.unavailableOverlay}>Indisponível</div>}
                <div className={styles.cardCatBadge}>{p.category}</div>
                {p.has_flavors && (
                  <div className={styles.cardFlavorBadge}>🎨 Escolha sabores</div>
                )}
              </div>

              {/* Corpo */}
              <div className={styles.cardBody}>
                <div className={styles.cardName}>{p.name}</div>
                {p.description && <div className={styles.cardDesc}>{p.description}</div>}
                <StarRating rating={p.rating} reviews={p.reviews} />
              </div>

              {/* Footer */}
              <div className={styles.cardFooter}>
                <div className={styles.cardPrice}>
                  <span className={styles.cardPriceLabel}>a partir de</span>
                  <span className={styles.cardPriceValue}>
                    R$ {parseFloat(p.price).toFixed(2).replace('.', ',')}
                  </span>
                </div>

                {p.available && (
                  <div onClick={(e) => e.stopPropagation()}>
                    {p.has_flavors ? (
                      <button className={styles.addBtn} onClick={(e) => handleCardAdd(e, p)}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 1v8M1 5h8"/>
                        </svg>
                        {qty > 0 ? `+ Mais (${qty})` : 'Escolher sabores'}
                      </button>
                    ) : qty > 0 ? (
                      <div className={styles.qtyControls}>
                        <button onClick={(e) => handleCardRemove(e, p)}>−</button>
                        <span>{qty}</span>
                        <button onClick={(e) => handleCardAdd(e, p)}>+</button>
                      </div>
                    ) : (
                      <button className={styles.addBtn} onClick={(e) => handleCardAdd(e, p)}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 1v8M1 5h8"/>
                        </svg>
                        Adicionar
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Carrinho flutuante ── */}
      {cartCount > 0 && (
        <button
          className={`${styles.floatingCart} ${cartBounce ? styles.floatingCartBounce : ''}`}
          onClick={() => setShowCart(true)}
        >
          <div className={styles.floatingCartIcon}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M2 2h2l2.5 10h9l2-7H6"/>
              <circle cx="9" cy="17" r="1.2" fill="currentColor" stroke="none"/>
              <circle cx="15" cy="17" r="1.2" fill="currentColor" stroke="none"/>
            </svg>
            <span className={styles.floatingCartBadge}>{cartCount}</span>
          </div>
          <span className={styles.floatingCartLabel}>Ver carrinho</span>
          <span className={styles.floatingCartTotal}>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
        </button>
      )}

      {showCart && <CartPanel onClose={() => setShowCart(false)} onCheckout={onCheckout} />}

      {produtoAberto && (
        <ProdutoModal
          produto={produtoAberto}
          qty={getQty(produtoAberto.id)}
          onAdd={(flavorChoices) => addToCart(produtoAberto, flavorChoices)}
          onRemove={() => removeFromCart(produtoAberto.id)}
          onClose={() => setProdutoAberto(null)}
          onVerCarrinho={() => { setProdutoAberto(null); setShowCart(true) }}
        />
      )}
    </div>
  )
}

// ── Placeholder sem foto ────────────────────────────────────────────
export function PlaceholderPhoto({ name, category }) {
  const gradients = {
    'Brigadeiros': ['#3a2010', '#6e3e20'],
    'Trufas':      ['#28183a', '#5a3870'],
    'Especiais':   ['#182818', '#385830'],
    'Boxes':       ['#2a1a08', '#7a4e20'],
  }
  const [c1, c2] = gradients[category] || ['#281808', '#503010']
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('')
  return (
    <div className={styles.placeholder}
      style={{ background: `linear-gradient(145deg, ${c1} 0%, ${c2} 100%)` }}>
      <span className={styles.placeholderInitials}>{initials}</span>
      <span className={styles.placeholderLabel}>foto em breve</span>
    </div>
  )
}

// ── StarRating ──────────────────────────────────────────────────────
export function StarRating({ rating, reviews }) {
  if (!rating) return null
  const full = Math.floor(rating)
  return (
    <div className={styles.cardRating}>
      <div className={styles.cardStars}>
        {[1,2,3,4,5].map((s) => (
          <span key={s} className={s <= full ? styles.starFilled : styles.starEmpty}>★</span>
        ))}
      </div>
      <span className={styles.cardReviews}>{rating} {reviews ? `(${reviews})` : ''}</span>
    </div>
  )
}