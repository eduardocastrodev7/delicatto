import { useEffect, useState, useCallback } from 'react'
import { StarRating } from './Cardapio'
import styles from './ProdutoModal.module.css'

// ── Lightbox ──────────────────────────────────────────────────────────
function Lightbox({ images, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex)

  const prev = useCallback(() => setCurrent(i => (i - 1 + images.length) % images.length), [images.length])
  const next = useCallback(() => setCurrent(i => (i + 1) % images.length), [images.length])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, prev, next])

  return (
    <div className={styles.lightboxOverlay} onClick={onClose}>
      <button className={styles.lightboxClose} onClick={onClose}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="white" strokeWidth="2.5">
          <path d="M1 1l16 16M17 1L1 17"/>
        </svg>
      </button>

      <div className={styles.lightboxContent} onClick={e => e.stopPropagation()}>
        <img
          src={images[current]}
          alt={`foto ${current + 1}`}
          className={styles.lightboxImg}
        />

        {images.length > 1 && (
          <>
            <button className={`${styles.lightboxNav} ${styles.lightboxPrev}`} onClick={prev}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M13 4l-6 6 6 6"/>
              </svg>
            </button>
            <button className={`${styles.lightboxNav} ${styles.lightboxNext}`} onClick={next}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M7 4l6 6-6 6"/>
              </svg>
            </button>
            <div className={styles.lightboxDots}>
              {images.map((_, i) => (
                <button key={i}
                  className={`${styles.lightboxDot} ${i === current ? styles.lightboxDotActive : ''}`}
                  onClick={() => setCurrent(i)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Carrossel de fotos ────────────────────────────────────────────────
function PhotoCarousel({ images, name, category, available, onOpenLightbox }) {
  const [current, setCurrent] = useState(0)

  const gradients = {
    'Brigadeiros': ['#3a2010', '#6e3e20'],
    'Trufas':      ['#28183a', '#5a3870'],
    'Especiais':   ['#182818', '#385830'],
    'Boxes':       ['#2a1a08', '#7a4e20'],
  }
  const [c1, c2] = gradients[category] || ['#281808', '#503010']
  const initials  = name.split(' ').slice(0, 2).map(w => w[0]).join('')

  if (!images || images.length === 0) {
    return (
      <div className={styles.photo}
        style={{ background: `linear-gradient(145deg, ${c1} 0%, ${c2} 100%)` }}>
        <div className={styles.photoRing} />
        <div className={styles.photoRing2} />
        <span className={styles.photoInitials}>{initials}</span>
        <span className={styles.photoLabel}>foto em breve</span>
        <div className={styles.photoCategory}>{category}</div>
        {!available && <div className={styles.photoUnavailable}>Indisponível no momento</div>}
      </div>
    )
  }

  return (
    <div className={styles.photo}>
      {/* Imagem principal */}
      <img
        src={images[current]}
        alt={`${name} - foto ${current + 1}`}
        className={styles.photoImg}
        onClick={() => onOpenLightbox(current)}
        style={{ cursor: 'zoom-in' }}
      />

      {/* Badge lupa */}
      <div className={styles.zoomHint}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="1.8">
          <circle cx="5" cy="5" r="3.5"/>
          <path d="M8 8l2.5 2.5"/>
          <path d="M4 5h2M5 4v2"/>
        </svg>
      </div>

      {/* Navegação do carrossel */}
      {images.length > 1 && (
        <>
          <button className={`${styles.carouselBtn} ${styles.carouselPrev}`}
            onClick={() => setCurrent(i => (i - 1 + images.length) % images.length)}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M9 2L4 7l5 5"/>
            </svg>
          </button>
          <button className={`${styles.carouselBtn} ${styles.carouselNext}`}
            onClick={() => setCurrent(i => (i + 1) % images.length)}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M5 2l5 5-5 5"/>
            </svg>
          </button>

          {/* Dots */}
          <div className={styles.carouselDots}>
            {images.map((_, i) => (
              <button key={i}
                className={`${styles.carouselDot} ${i === current ? styles.carouselDotActive : ''}`}
                onClick={() => setCurrent(i)}
              />
            ))}
          </div>

          {/* Thumbnails */}
          <div className={styles.carouselThumbs}>
            {images.map((url, i) => (
              <button key={i}
                className={`${styles.carouselThumb} ${i === current ? styles.carouselThumbActive : ''}`}
                onClick={() => setCurrent(i)}>
                <img src={url} alt={`thumb ${i + 1}`} />
              </button>
            ))}
          </div>
        </>
      )}

      <div className={styles.photoCategory}>{category}</div>
      {!available && <div className={styles.photoUnavailable}>Indisponível no momento</div>}
    </div>
  )
}

// ── Modal principal ───────────────────────────────────────────────────
export default function ProdutoModal({ produto, qty, onAdd, onRemove, onClose, onVerCarrinho }) {
  const [flavorChoices, setFlavorChoices] = useState({})
  const [choosingNew, setChoosingNew]     = useState(true) // sempre inicia escolhendo
  const [lightboxIdx, setLightboxIdx]     = useState(null)

  // Normaliza images
  const images = produto.images?.length ? produto.images
    : produto.image_url ? [produto.image_url] : []

  const totalEscolhido = Object.values(flavorChoices).reduce((s, v) => s + v, 0)
  const slotsTotal     = produto.flavor_slots || 0
  const slotsRestantes = slotsTotal - totalEscolhido
  const saboresOk      = !produto.has_flavors || totalEscolhido === slotsTotal

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && lightboxIdx === null) onClose() }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', handler); document.body.style.overflow = '' }
  }, [onClose, lightboxIdx])

  const setFlavor = (id, delta) => {
    setFlavorChoices((prev) => {
      const current = prev[id] || 0
      const next    = current + delta
      if (next < 0) return prev
      if (delta > 0 && slotsRestantes <= 0) return prev
      const updated = { ...prev, [id]: next }
      if (updated[id] === 0) delete updated[id]
      return updated
    })
  }

  const handleConfirmar = () => {
    if (!saboresOk) return
    try {
      onAdd(flavorChoices)
    } catch(e) {
      console.error('Erro ao adicionar ao carrinho:', e)
    }
    setFlavorChoices({})
    setChoosingNew(false)
  }

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal} role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>

        <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 1l12 12M13 1L1 13"/>
          </svg>
        </button>

        {/* Carrossel de fotos */}
        <PhotoCarousel
          images={images}
          name={produto.name}
          category={produto.category}
          available={produto.available}
          onOpenLightbox={(idx) => setLightboxIdx(idx)}
        />

        {/* Conteúdo */}
        <div className={styles.content}>
          <div className={styles.header}>
            <div>
              <h2 className={styles.name}>{produto.name}</h2>
              <StarRating rating={produto.rating} reviews={produto.reviews} />
            </div>
            <div className={styles.price}>
              R$ {parseFloat(produto.price).toFixed(2).replace('.', ',')}
            </div>
          </div>

          <p className={styles.description}>{produto.description}</p>

          <div className={styles.infoGrid}>
            {produto.ingredients && (
              <div className={styles.infoCard}>
                <div className={styles.infoIcon}>
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M10 2C6.13 2 3 5.13 3 9c0 3.5 2.33 6.48 5.5 7.5v1.5h3V16.5C14.67 15.48 17 12.5 17 9c0-3.87-3.13-7-7-7z"/>
                  </svg>
                </div>
                <div>
                  <div className={styles.infoLabel}>Ingredientes & Alérgenos</div>
                  <div className={styles.infoText}>{produto.ingredients}</div>
                </div>
              </div>
            )}
            {produto.prep_time && (
              <div className={styles.infoCard}>
                <div className={styles.infoIcon}>
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="10" cy="10" r="7"/>
                    <path d="M10 6v4l2.5 2.5"/>
                  </svg>
                </div>
                <div>
                  <div className={styles.infoLabel}>Prazo de preparo</div>
                  <div className={styles.infoText}>{produto.prep_time}</div>
                </div>
              </div>
            )}
          </div>

          {/* Sabores */}
          {produto.has_flavors && produto.available && (
            <div className={styles.flavorsSection}>
              {qty > 0 && !choosingNew ? (
                <div className={styles.unidadesAdicionadas}>
                  <div className={styles.unidadesHeader}>
                    <div className={styles.flavorsTitle}>{qty} {qty === 1 ? 'unidade' : 'unidades'} no pedido</div>
                    <button className={styles.maisUmaBtn} onClick={() => { setFlavorChoices({}); setChoosingNew(true) }}>
                      + Adicionar mais uma
                    </button>
                  </div>
                  <p className={styles.unidadesDica}>Cada caixa tem sabores independentes.</p>
                  <div className={styles.modalActions}>
                    <button className={styles.verCarrinhoBtn} onClick={onVerCarrinho}>Ver carrinho ({qty})</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className={styles.flavorsHeader}>
                    <div className={styles.flavorsTitle}>
                      {qty > 0 ? `Sabores da unidade ${qty + 1}` : 'Escolha os sabores'}
                    </div>
                    <div className={`${styles.flavorsCounter} ${totalEscolhido === slotsTotal ? styles.counterDone : ''}`}>
                      {totalEscolhido}/{slotsTotal}
                      {slotsRestantes > 0 && <span className={styles.counterHint}> · faltam {slotsRestantes}</span>}
                      {slotsRestantes === 0 && <span className={styles.counterOk}> · completo!</span>}
                    </div>
                  </div>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill}
                      style={{ width: `${slotsTotal ? (totalEscolhido / slotsTotal) * 100 : 0}%` }} />
                  </div>
                  <div className={styles.flavorsList}>
                    {(produto.flavors || []).map((f) => {
                      const chosen = flavorChoices[f.id] || 0
                      return (
                        <div key={f.id} className={styles.flavorRow}>
                          <span className={styles.flavorName}>{f.name}</span>
                          <div className={styles.flavorQty}>
                            <button className={styles.flavorQtyBtn}
                              onClick={() => setFlavor(f.id, -1)} disabled={chosen === 0}>−</button>
                            <span className={`${styles.flavorQtyNum} ${chosen > 0 ? styles.flavorQtyActive : ''}`}>
                              {chosen}
                            </span>
                            <button className={styles.flavorQtyBtn}
                              onClick={() => setFlavor(f.id, 1)} disabled={slotsRestantes === 0}>+</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <button
                    className={`${styles.addBtn} ${!saboresOk ? styles.addBtnDisabled : ''}`}
                    onClick={handleConfirmar} disabled={!saboresOk}>
                    {!saboresOk
                      ? `Escolha mais ${slotsRestantes} sabor${slotsRestantes !== 1 ? 'es' : ''}`
                      : qty > 0 ? `Confirmar unidade ${qty + 1}` : 'Adicionar ao pedido'}
                  </button>
                  {qty > 0 && choosingNew && (
                    <button className={styles.cancelarNovaBtn} onClick={() => setChoosingNew(false)}>Cancelar</button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Produto sem sabores */}
          {!produto.has_flavors && produto.available && (
            <div className={styles.actions}>
              {qty > 0 ? (
                <div className={styles.qtyRow}>
                  <div className={styles.qtyControls}>
                    <button onClick={onRemove}>−</button>
                    <span>{qty}</span>
                    <button onClick={() => onAdd(null)}>+</button>
                  </div>
                  <button className={styles.verCarrinhoBtn} onClick={onVerCarrinho}>
                    Ver carrinho ({qty})
                  </button>
                </div>
              ) : (
                <button className={styles.addBtn} onClick={() => { try { onAdd(null) } catch(e) { console.error(e) } }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 1v12M1 7h12"/>
                  </svg>
                  Adicionar ao pedido
                </button>
              )}
            </div>
          )}

          {!produto.available && (
            <div className={styles.unavailableMsg}>Este doce não está disponível no momento.</div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <Lightbox
          images={images}
          startIndex={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </>
  )
}