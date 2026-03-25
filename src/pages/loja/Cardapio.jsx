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
        <div className={styles.heroInner}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>Doces<br /><em>Artesanais.</em></h1>
            <p className={styles.heroSub}>Exclusividade e sabor em cada mordida.<br />Faça sua encomenda dos personalizados para a Páscoa de 2026.</p>
            <p className={styles.heroUrgency}>Unidades limitadas!</p>
          </div>
          <img src="/logo-simbolo.png" aria-hidden="true" className={styles.heroLogo} />
        </div>

        <div className={styles.heroFilters}>
          {categories.map((c) => (
            <button
              key={c}
              className={`${styles.filterChip} ${filterCat === c ? styles.filterChipActive : ''}`}
              onClick={() => setFilterCat(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* ── Conteúdo ── */}
      <div className={styles.content}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            {filterCat === 'Todos' ? 'Todos os produtos' : filterCat}
          </h2>
          <span className={styles.sectionCount}>{filtered.length} itens</span>
        </div>

        <div className={styles.grid}>
          {filtered.length === 0 && (
            <div className={styles.emptyState}>
              <span>🍫</span>
              <p>Nenhum produto disponível.</p>
            </div>
          )}

          {filtered.map((p, i) => {
            const qty   = getQty(p.id)
            const thumb = p.images?.[0] || p.image_url
            return (
              <div
                key={p.id}
                className={`${styles.card} ${!p.available ? styles.cardUnavailable : ''}`}
                style={{ animationDelay: `${i * 0.04}s` }}
                onClick={() => setProdutoAberto(p)}
              >
                <div className={styles.cardPhoto}>
                  {thumb
                    ? <img src={thumb} alt={p.name} className={styles.cardImg} loading="lazy" />
                    : <PlaceholderPhoto name={p.name} category={p.category} />
                  }
                  {!p.available && <div className={styles.unavailableOverlay}>Indisponível</div>}
                  {p.available && !p.made_to_order && p.track_stock && p.stock === 0 && (
                    <div className={styles.esgotadoOverlay}>Esgotado</div>
                  )}
                </div>

                <div className={styles.cardBody}>
                  <p className={styles.cardCategory}>{p.category}</p>
                  <p className={styles.cardName}>{p.name}</p>
                  {p.description && <p className={styles.cardDesc}>{p.description}</p>}
                </div>

                {(() => {
                  const esgotado = !p.made_to_order && p.track_stock && p.stock === 0
                  return (
                    <div className={styles.cardFooter}>
                      <div className={styles.cardPrice}>
                        <span className={styles.cardPriceFrom}>a partir de</span>
                        <span className={styles.cardPriceValue}>
                          R$ {parseFloat(p.price).toFixed(2).replace('.', ',')}
                        </span>
                      </div>

                      {p.available && !esgotado && (
                        <div onClick={(e) => e.stopPropagation()}>
                          {qty > 0 && !p.has_flavors ? (
                            <div className={styles.qtyControls}>
                              <button onClick={(e) => handleCardRemove(e, p)}>−</button>
                              <span>{qty}</span>
                              <button onClick={(e) => handleCardAdd(e, p)}>+</button>
                            </div>
                          ) : (
                            <button className={styles.addBtn} onClick={(e) => handleCardAdd(e, p)}>
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <path d="M6 1v10M1 6h10"/>
                              </svg>
                              {p.has_flavors && qty > 0 ? `(${qty}) Mais` : 'Adicionar'}
                            </button>
                          )}
                        </div>
                      )}

                      {esgotado && (
                        <span className={styles.esgotadoBtn}>Esgotado</span>
                      )}
                    </div>
                  )
                })()}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Carrinho flutuante ── */}
      {cartCount > 0 && (
        <button
          className={`${styles.floatingCart} ${cartBounce ? styles.floatingCartBounce : ''}`}
          onClick={() => setShowCart(true)}
        >
          <span className={styles.floatingCartCount}>{cartCount}</span>
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

export function PlaceholderPhoto({ name, category }) {
  const gradients = {
    'Brigadeiros': ['#2e1508', '#5c3218'],
    'Trufas':      ['#1e1228', '#3d2455'],
    'Especiais':   ['#0e2018', '#1e4830'],
    'Boxes':       ['#241408', '#5c3c18'],
  }
  const [c1, c2] = gradients[category] || ['#241408', '#5c3218']
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('')
  return (
    <div className={styles.placeholder}
      style={{ background: `linear-gradient(145deg, ${c1}, ${c2})` }}>
      <span className={styles.placeholderInitials}>{initials}</span>
      <span className={styles.placeholderLabel}>Foto em breve</span>
    </div>
  )
}

export function StarRating({ rating, reviews }) {
  if (!rating) return null
  return (
    <div className={styles.cardRating}>
      <span className={styles.starFilled}>★</span>
      <span className={styles.cardRatingValue}>{rating}</span>
      {reviews && <span className={styles.cardRatingCount}>({reviews})</span>}
    </div>
  )
}