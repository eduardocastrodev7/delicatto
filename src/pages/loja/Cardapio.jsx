import { useState, useEffect, useRef } from 'react'
import { useApp } from '../../context/AppContext'
import CartPanel from '../../components/CartPanel'
import ProdutoModal from './ProdutoModal'
import styles from './Cardapio.module.css'

export default function Cardapio({ onCheckout }) {
  const { products, addToCart, removeFromCart, cart, cartCount, cartTotal } = useApp()
  const [filterCat, setFilterCat]     = useState('Todos')
  const [showCart, setShowCart]       = useState(false)
  const [produtoAberto, setProdutoAberto] = useState(null)
  const [cartBounce, setCartBounce]   = useState(false)
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

  // Conta quantos itens do carrinho são deste produto
  const getQty = (id) => cart.filter((i) => i.id === id).reduce((s, i) => s + i.qty, 0)

  // Produtos com sabores: sempre abre o modal
  // Produtos sem sabores: botão + adiciona direto
  const handleCardAdd = (e, produto) => {
    e.stopPropagation()
    if (produto.has_flavors) {
      setProdutoAberto(produto)
    } else {
      addToCart(produto, null)
    }
  }

  const handleCardRemove = (e, produto) => {
    e.stopPropagation()
    removeFromCart(produto.id)
  }

  return (
    <div className={styles.page}>

      {/* Hero */}
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

      {/* Filtros */}
      <div className={styles.filterBar}>
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

      {/* Grid */}
      <div className={styles.grid}>
        {filtered.map((p, i) => {
          const qty = getQty(p.id)
          return (
            <div
              key={p.id}
              className={`${styles.card} ${!p.available ? styles.cardUnavailable : ''}`}
              style={{ animationDelay: `${i * 0.05}s` }}
              onClick={() => setProdutoAberto(p)}
            >
              <div className={styles.cardPhoto}>
                {p.image_url
                  ? <img src={p.image_url} alt={p.name} className={styles.cardImg} />
                  : <PlaceholderPhoto name={p.name} category={p.category} />
                }
                {!p.available && <div className={styles.unavailableOverlay}>Indisponível</div>}
                <div className={styles.cardCategoryTag}>{p.category}</div>
                {p.has_flavors && (
                  <div className={styles.flavorsBadge}>
                    🎨 Escolha os sabores
                  </div>
                )}
              </div>

              <div className={styles.cardBody}>
                <div className={styles.cardName}>{p.name}</div>
                <div className={styles.cardDesc}>{p.description}</div>
                <div className={styles.cardMeta}>
                  <StarRating rating={p.rating} reviews={p.reviews} />
                </div>
                <div className={styles.cardFooter}>
                  <span className={styles.price}>
                    R$ {parseFloat(p.price).toFixed(2).replace('.', ',')}
                  </span>

                  {p.available && (
                    <div onClick={(e) => e.stopPropagation()}>
                      {/* Produto COM sabores: sempre abre modal */}
                      {p.has_flavors ? (
                        <button
                          className={styles.addBtn}
                          onClick={(e) => handleCardAdd(e, p)}
                        >
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 1v8M1 5h8"/>
                          </svg>
                          {qty > 0 ? `+ Mais (${qty} no pedido)` : 'Escolher sabores'}
                        </button>
                      ) : (
                        /* Produto SEM sabores: controles normais */
                        qty > 0 ? (
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
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Barra flutuante */}
      {cartCount > 0 && (
        <div className={`${styles.floatingCart} ${cartBounce ? styles.floatingCartBounce : ''}`} onClick={() => setShowCart(true)}>
          <span>{cartCount} {cartCount === 1 ? 'item' : 'itens'}</span>
          <span className={styles.floatingDot} />
          <span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
          <span className={styles.floatingDot} />
          <span className={styles.floatingAction}>Ver pedido</span>
        </div>
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
      <div className={styles.placeholderRing} />
      <span className={styles.placeholderInitials}>{initials}</span>
      <span className={styles.placeholderLabel}>foto em breve</span>
    </div>
  )
}

export function StarRating({ rating, reviews, size = 'sm' }) {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  return (
    <div className={styles.stars} data-size={size}>
      {[1,2,3,4,5].map((s) => (
        <svg key={s}
          className={`${styles.star} ${s <= full ? styles.starFull : (half && s === full + 1 ? styles.starHalf : styles.starEmpty)}`}
          viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 1l1.8 3.6L14 5.4l-3 2.9.7 4.1L8 10.4l-3.7 2 .7-4.1-3-2.9 4.2-.8z"/>
        </svg>
      ))}
      <span className={styles.ratingNum}>{rating}</span>
      {reviews !== undefined && <span className={styles.ratingCount}>({reviews})</span>}
    </div>
  )
}