import { useEffect, useState } from 'react'
import { StarRating } from './Cardapio'
import styles from './ProdutoModal.module.css'

export default function ProdutoModal({ produto, qty, onAdd, onRemove, onClose, onVerCarrinho }) {
  const [flavorChoices, setFlavorChoices] = useState({})
  // Controla se está no modo "escolher sabores para nova unidade"
  const [choosingNew, setChoosingNew] = useState(qty === 0 || produto.has_flavors)

  const totalEscolhido = Object.values(flavorChoices).reduce((s, v) => s + v, 0)
  const slotsTotal     = produto.flavor_slots || 0
  const slotsRestantes = slotsTotal - totalEscolhido
  const saboresOk      = !produto.has_flavors || totalEscolhido === slotsTotal

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', handler); document.body.style.overflow = '' }
  }, [onClose])

  const gradients = {
    'Brigadeiros': ['#3a2010', '#6e3e20'],
    'Trufas':      ['#28183a', '#5a3870'],
    'Especiais':   ['#182818', '#385830'],
    'Boxes':       ['#2a1a08', '#7a4e20'],
  }
  const [c1, c2] = gradients[produto.category] || ['#281808', '#503010']
  const initials  = produto.name.split(' ').slice(0, 2).map(w => w[0]).join('')

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

  // Confirma sabores e adiciona ao carrinho
  const handleConfirmar = () => {
    if (!saboresOk) return
    onAdd(flavorChoices)
    // Reseta para nova escolha se quiser adicionar mais
    setFlavorChoices({})
    setChoosingNew(false)
  }

  // Inicia escolha de nova unidade
  const handleMaisUma = () => {
    setFlavorChoices({})
    setChoosingNew(true)
  }

  const resumoSabores = (choices) => {
    if (!choices || Object.keys(choices).length === 0) return null
    return Object.entries(choices)
      .map(([id, q]) => {
        const sabor = (produto.flavors || []).find(f => f.id === id)
        return sabor ? `${q}× ${sabor.name}` : null
      })
      .filter(Boolean)
      .join(', ')
  }

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>

        <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 1l12 12M13 1L1 13"/>
          </svg>
        </button>

        {/* Foto */}
        <div className={styles.photo}
          style={{ background: produto.image_url ? 'transparent' : `linear-gradient(145deg, ${c1} 0%, ${c2} 100%)` }}>
          {produto.image_url
            ? <img src={produto.image_url} alt={produto.name} className={styles.photoImg} />
            : <>
                <div className={styles.photoRing} />
                <div className={styles.photoRing2} />
                <span className={styles.photoInitials}>{initials}</span>
                <span className={styles.photoLabel}>foto em breve</span>
              </>
          }
          <div className={styles.photoCategory}>{produto.category}</div>
          {!produto.available && <div className={styles.photoUnavailable}>Indisponível no momento</div>}
        </div>

        {/* Conteúdo */}
        <div className={styles.content}>
          <div className={styles.header}>
            <div>
              <h2 className={styles.name}>{produto.name}</h2>
              <div><StarRating rating={produto.rating} reviews={produto.reviews} /></div>
            </div>
            <div className={styles.price}>
              R$ {parseFloat(produto.price).toFixed(2).replace('.', ',')}
            </div>
          </div>

          <p className={styles.description}>{produto.description}</p>

          {/* Info cards */}
          <div className={styles.infoGrid}>
            {produto.ingredients && (
              <div className={styles.infoCard}>
                <div className={styles.infoIcon}>
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M10 2C6.13 2 3 5.13 3 9c0 3.5 2.33 6.48 5.5 7.5v1.5h3V16.5C14.67 15.48 17 12.5 17 9c0-3.87-3.13-7-7-7z"/>
                    <line x1="10" y1="9" x2="10" y2="13"/>
                    <circle cx="10" cy="6.5" r="0.5" fill="currentColor"/>
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

          {/* ── Produto COM sabores ── */}
          {produto.has_flavors && produto.available && (
            <div className={styles.flavorsSection}>

              {/* Já tem unidades no carrinho e não está escolhendo nova */}
              {qty > 0 && !choosingNew && (
                <div className={styles.unidadesAdicionadas}>
                  <div className={styles.unidadesHeader}>
                    <div className={styles.flavorsTitle}>
                      {qty} {qty === 1 ? 'unidade' : 'unidades'} no pedido
                    </div>
                    <button className={styles.maisUmaBtn} onClick={handleMaisUma}>
                      + Adicionar mais uma
                    </button>
                  </div>
                  <p className={styles.unidadesDica}>
                    Cada caixa tem sabores independentes. Clique em "Adicionar mais uma" para escolher sabores de uma nova unidade.
                  </p>
                  <div className={styles.modalActions}>
                    <button className={styles.verCarrinhoBtn} onClick={onVerCarrinho}>
                      Ver carrinho ({qty})
                    </button>
                  </div>
                </div>
              )}

              {/* Escolhendo sabores (primeira unidade ou nova) */}
              {(qty === 0 || choosingNew) && (
                <>
                  <div className={styles.flavorsHeader}>
                    <div className={styles.flavorsTitle}>
                      {qty > 0 ? `Escolha os sabores da unidade ${qty + 1}` : 'Escolha os sabores'}
                    </div>
                    <div className={`${styles.flavorsCounter} ${totalEscolhido === slotsTotal ? styles.counterDone : ''}`}>
                      {totalEscolhido}/{slotsTotal}
                      {slotsRestantes > 0 && <span className={styles.counterHint}> · faltam {slotsRestantes}</span>}
                      {slotsRestantes === 0 && <span className={styles.counterOk}> · completo!</span>}
                    </div>
                  </div>

                  {/* Barra de progresso */}
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
                    onClick={handleConfirmar}
                    disabled={!saboresOk}
                  >
                    {!saboresOk
                      ? `Escolha mais ${slotsRestantes} sabor${slotsRestantes !== 1 ? 'es' : ''}`
                      : qty > 0
                        ? `Confirmar unidade ${qty + 1}`
                        : 'Adicionar ao pedido'}
                  </button>

                  {qty > 0 && choosingNew && (
                    <button className={styles.cancelarNovaBtn} onClick={() => setChoosingNew(false)}>
                      Cancelar
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── Produto SEM sabores ── */}
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
                <button className={styles.addBtn} onClick={() => onAdd(null)}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 1v12M1 7h12"/>
                  </svg>
                  Adicionar ao pedido
                </button>
              )}
            </div>
          )}

          {!produto.available && (
            <div className={styles.unavailableMsg}>
              Este doce não está disponível no momento.
            </div>
          )}
        </div>
      </div>
    </>
  )
}