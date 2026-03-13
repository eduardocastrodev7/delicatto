import { useState, useRef } from 'react'
import { useApp } from '../../context/AppContext'
import { supabase } from '../../lib/supabase'
import shared from './admin.shared.module.css'
import styles from './Produtos.module.css'

const EMPTY = {
  name: '', price: '', category: '', description: '',
  ingredients: '', prep_time: '', available: true,
  images: [],
  has_flavors: false, flavor_slots: '', flavors: [],
  // Estoque
  track_stock:    false,
  stock:          '',
  made_to_order:  false,
  order_deadline: '',
  flavor_stocks:  {}, // { flavorId: qty } — só no frontend
}

const CATEGORIAS = ['Brigadeiros', 'Trufas', 'Especiais', 'Boxes']
const MAX_IMAGES  = 3

export default function Produtos() {
  const { products, addProduct, updateProduct, deleteProduct } = useApp()
  const [showModal, setShowModal]         = useState(false)
  const [editing, setEditing]             = useState(null)
  const [form, setForm]                   = useState(EMPTY)
  const [saving, setSaving]               = useState(false)
  const [errors, setErrors]               = useState({})
  const [uploadingIdx, setUploadingIdx]   = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [newFlavor, setNewFlavor]         = useState('')
  const fileRef = useRef()

  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY)
    setErrors({})
    setShowModal(true)
  }

  const openEdit = async (p) => {
    setEditing(p)
    const imgs = p.images?.length ? p.images : (p.image_url ? [p.image_url] : [])

    // Carrega estoques por sabor do Supabase
    let flavorStocks = {}
    if (p.has_flavors && p.track_stock) {
      const { data } = await supabase
        .from('flavor_stock')
        .select('flavor_id, stock')
        .eq('product_id', p.id)
      if (data) {
        data.forEach(fs => { flavorStocks[fs.flavor_id] = fs.stock })
      }
    }

    setForm({
      name:           p.name          || '',
      price:          p.price         || '',
      category:       p.category      || '',
      description:    p.description   || '',
      ingredients:    p.ingredients   || '',
      prep_time:      p.prep_time     || '',
      available:      p.available     ?? true,
      images:         imgs,
      has_flavors:    p.has_flavors   || false,
      flavor_slots:   p.flavor_slots  || '',
      flavors:        p.flavors       || [],
      track_stock:    p.track_stock   || false,
      stock:          p.stock         ?? '',
      made_to_order:  p.made_to_order || false,
      order_deadline: p.order_deadline || '',
      flavor_stocks:  flavorStocks,
    })
    setErrors({})
    setShowModal(true)
  }

  const set = (f) => (e) =>
    setForm((prev) => ({ ...prev, [f]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  // ── Upload de foto ────────────────────────────
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (form.images.length >= MAX_IMAGES) { alert(`Máximo de ${MAX_IMAGES} fotos.`); return }
    if (file.size > 3 * 1024 * 1024) { alert('Imagem muito grande. Máximo 3MB.'); return }

    setUploadingIdx(form.images.length)
    try {
      const ext  = file.name.split('.').pop().toLowerCase()
      const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('product-images').upload(path, file, { contentType: file.type })
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('product-images').getPublicUrl(path)
      setForm((prev) => ({ ...prev, images: [...prev.images, data.publicUrl] }))
    } catch (err) { alert('Erro ao enviar: ' + err.message) }
    setUploadingIdx(null)
    e.target.value = ''
  }

  const removeImage = (idx) =>
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))

  // ── Sabores ───────────────────────────────────
  const addFlavor = () => {
    const name = newFlavor.trim()
    if (!name || form.flavors.find(f => f.name.toLowerCase() === name.toLowerCase())) return
    setForm((prev) => ({ ...prev, flavors: [...prev.flavors, { id: Date.now().toString(), name }] }))
    setNewFlavor('')
  }
  const removeFlavor = (id) =>
    setForm((prev) => ({ ...prev, flavors: prev.flavors.filter(f => f.id !== id) }))

  // ── Validação ─────────────────────────────────
  const validate = () => {
    const e = {}
    if (!form.name.trim())     e.name     = 'Nome obrigatório'
    if (!form.price)           e.price    = 'Preço obrigatório'
    if (!form.category.trim()) e.category = 'Categoria obrigatória'
    if (form.has_flavors) {
      if (!form.flavor_slots || parseInt(form.flavor_slots) < 1) e.flavor_slots = 'Informe os slots'
      if (form.flavors.length < 2) e.flavors = 'Adicione pelo menos 2 sabores'
    }
    if (form.made_to_order && !form.order_deadline.trim()) {
      e.order_deadline = 'Informe o prazo para o cliente'
    }
    return e
  }

  // ── Salvar ────────────────────────────────────
  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setSaving(true)
    try {
      const payload = {
        name:           form.name.trim(),
        price:          parseFloat(form.price),
        category:       form.category.trim(),
        description:    form.description.trim(),
        ingredients:    form.ingredients.trim(),
        prep_time:      form.prep_time.trim(),
        available:      form.available,
        images:         form.images,
        image_url:      form.images[0] || null,
        has_flavors:    form.has_flavors,
        flavor_slots:   form.has_flavors ? parseInt(form.flavor_slots) : null,
        flavors:        form.has_flavors ? form.flavors : [],
        // Estoque
        made_to_order:  form.made_to_order,
        order_deadline: form.made_to_order ? form.order_deadline.trim() : null,
        track_stock:    form.made_to_order ? false : form.track_stock,
        stock:          !form.made_to_order && form.track_stock && !form.has_flavors
                          ? (form.stock === '' ? null : parseInt(form.stock))
                          : null,
      }

      let savedId = editing?.id
      if (editing) {
        await updateProduct(editing.id, payload)
      } else {
        const data = await addProduct(payload)
        savedId = data?.id
      }

      // Salva estoque por sabor
      if (!form.made_to_order && form.track_stock && form.has_flavors && savedId) {
        for (const flavor of form.flavors) {
          const qty = form.flavor_stocks[flavor.id]
          if (qty === undefined || qty === '') continue
          await supabase.from('flavor_stock').upsert({
            product_id:  savedId,
            flavor_id:   flavor.id,
            flavor_name: flavor.name,
            stock:       parseInt(qty) || 0,
          }, { onConflict: 'product_id,flavor_id' })
        }
      }

      setShowModal(false)
    } catch (err) { alert('Erro ao salvar: ' + err.message) }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    try { await deleteProduct(id) } catch (err) { alert('Erro: ' + err.message) }
    setConfirmDelete(null)
  }

  // ── Helpers de exibição ───────────────────────
  const stockBadge = (p) => {
    if (p.made_to_order) {
      return <span className={styles.badgeMto}>Sob encomenda</span>
    }
    if (!p.track_stock) {
      return <span className={styles.badgeNone}>—</span>
    }
    if (p.stock === 0) {
      return <span className={styles.badgeEsgotado}>Esgotado</span>
    }
    return <span className={styles.badgeOk}>{p.stock ?? '?'} un.</span>
  }

  return (
    <div>
      <div className={styles.topBar}>
        <span className={styles.count}>{products.length} doces</span>
        <button className={styles.addBtn} onClick={openAdd}>+ Novo doce</button>
      </div>

      <div className={shared.tableWrap}>
        <table className={shared.table}>
          <thead><tr>
            <th>Produto</th>
            <th>Categoria</th>
            <th>Preço</th>
            <th>Estoque</th>
            <th>Status</th>
            <th>Ações</th>
          </tr></thead>
          <tbody>
            {products.map((p) => {
              const thumb = p.images?.[0] || p.image_url
              return (
                <tr key={p.id}>
                  <td>
                    <div className={styles.prodName}>
                      {thumb
                        ? <img src={thumb} alt={p.name} className={styles.thumb} />
                        : <div className={styles.thumbPlaceholder}>{p.name.charAt(0)}</div>
                      }
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        <div className={styles.prodMeta}>
                          {p.prep_time && <span>{p.prep_time}</span>}
                          {p.has_flavors && <span className={styles.flavorBadge}>🎨 {p.flavor_slots} sabores</span>}
                          {p.images?.length > 1 && <span>📷 {p.images.length} fotos</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: 13 }}>{p.category}</td>
                  <td style={{ fontWeight: 700, color: 'var(--brown-dark)' }}>
                    R$ {parseFloat(p.price).toFixed(2).replace('.', ',')}
                  </td>
                  <td>{stockBadge(p)}</td>
                  <td>
                    <span className={shared.badge}
                      style={p.available
                        ? { background: '#4a7c5918', color: '#4a7c59' }
                        : { background: '#9a887818', color: '#9a8878' }}>
                      {p.available ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <button className={styles.editBtn} onClick={() => openEdit(p)}>Editar</button>
                    <button className={styles.delBtn}  onClick={() => setConfirmDelete(p)}>Excluir</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ══════════════════════════════════════════
          MODAL
      ══════════════════════════════════════════ */}
      {showModal && (
        <>
          <div className={shared.overlay} onClick={() => setShowModal(false)} />
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{editing ? 'Editar doce' : 'Novo doce'}</h2>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 1l12 12M13 1L1 13"/>
                </svg>
              </button>
            </div>

            <div className={styles.modalBody}>

              {/* ── Fotos ── */}
              <div className={styles.section}>
                <div className={styles.sectionTitle}>
                  Fotos do produto
                  <span className={styles.sectionHint}>{form.images.length}/{MAX_IMAGES} fotos</span>
                </div>
                <div className={styles.imagesGrid}>
                  {form.images.map((url, idx) => (
                    <div key={idx} className={styles.imageThumbWrap}>
                      <img src={url} alt={`foto ${idx + 1}`} className={styles.imageThumb} />
                      {idx === 0 && <div className={styles.imagePrincipal}>Principal</div>}
                      <button className={styles.imageRemove} onClick={() => removeImage(idx)}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 1l8 8M9 1L1 9"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                  {form.images.length < MAX_IMAGES && (
                    <button className={styles.imageAddSlot} onClick={() => fileRef.current.click()}
                      disabled={uploadingIdx !== null}>
                      {uploadingIdx !== null
                        ? <span className={styles.uploadingSpinner}>↑</span>
                        : <>
                            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M11 2v18M2 11h18"/>
                            </svg>
                            <span>Adicionar foto</span>
                          </>
                      }
                    </button>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload} style={{ display: 'none' }} />
                <span className={styles.hint}>JPG, PNG ou WEBP · Máx. 3MB · A primeira foto é a principal</span>
              </div>

              {/* ── Informações básicas ── */}
              <div className={styles.section}>
                <div className={styles.sectionTitle}>Informações básicas</div>
                <div className={styles.fieldRow}>
                  <div className={styles.field} style={{ flex: 2 }}>
                    <label className={styles.label}>Nome *</label>
                    <input className={`${styles.input} ${errors.name ? styles.inputErr : ''}`}
                      value={form.name} onChange={set('name')} placeholder="Ex: Caixa de Bombons" />
                    {errors.name && <span className={styles.err}>{errors.name}</span>}
                  </div>
                  <div className={styles.field} style={{ flex: 1 }}>
                    <label className={styles.label}>Preço (R$) *</label>
                    <input className={`${styles.input} ${errors.price ? styles.inputErr : ''}`}
                      type="number" step="0.01" min="0"
                      value={form.price} onChange={set('price')} placeholder="6.50" />
                    {errors.price && <span className={styles.err}>{errors.price}</span>}
                  </div>
                </div>

                <div className={styles.fieldRow}>
                  <div className={styles.field} style={{ flex: 1 }}>
                    <label className={styles.label}>Categoria *</label>
                    <div className={styles.catBtns}>
                      {CATEGORIAS.map((c) => (
                        <button key={c} type="button"
                          className={`${styles.catBtn} ${form.category === c ? styles.catActive : ''}`}
                          onClick={() => setForm(f => ({ ...f, category: c }))}>
                          {c}
                        </button>
                      ))}
                    </div>
                    <input className={`${styles.input} ${errors.category ? styles.inputErr : ''}`}
                      style={{ marginTop: 8 }}
                      value={form.category} onChange={set('category')}
                      placeholder="Ou digite uma categoria" />
                    {errors.category && <span className={styles.err}>{errors.category}</span>}
                  </div>
                  <div className={styles.field} style={{ flex: 1 }}>
                    <label className={styles.label}>Prazo de preparo</label>
                    <input className={styles.input} value={form.prep_time} onChange={set('prep_time')}
                      placeholder="Ex: 24h de antecedência" />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Descrição</label>
                  <textarea className={styles.textarea} rows={3}
                    value={form.description} onChange={set('description')}
                    placeholder="Descrição do doce para exibir no cardápio..." />
                </div>
              </div>

              {/* ── Ingredientes ── */}
              <div className={styles.section}>
                <div className={styles.sectionTitle}>Ingredientes & Alérgenos</div>
                <textarea className={styles.textarea} rows={3}
                  value={form.ingredients} onChange={set('ingredients')}
                  placeholder="Ex: Leite condensado, manteiga, chocolate belga. Contém: leite, glúten." />
              </div>

              {/* ── Sabores ── */}
              <div className={styles.section}>
                <div className={styles.sectionTitle}>Escolha de sabores</div>
                <label className={styles.toggle}>
                  <input type="checkbox" checked={form.has_flavors} onChange={set('has_flavors')} />
                  <span className={styles.toggleTrack}><span className={styles.toggleThumb} /></span>
                  <span className={styles.toggleLabel}>Permitir que o cliente escolha os sabores</span>
                </label>

                {form.has_flavors && (
                  <div className={styles.flavorsConfig}>
                    <div className={styles.field} style={{ maxWidth: 220, marginBottom: 16 }}>
                      <label className={styles.label}>Quantos sabores o cliente escolhe? *</label>
                      <input className={`${styles.input} ${errors.flavor_slots ? styles.inputErr : ''}`}
                        type="number" min="1" max="100"
                        value={form.flavor_slots} onChange={set('flavor_slots')} placeholder="Ex: 4" />
                      {errors.flavor_slots && <span className={styles.err}>{errors.flavor_slots}</span>}
                    </div>

                    <label className={styles.label}>Sabores disponíveis *</label>
                    {errors.flavors && (
                      <span className={styles.err} style={{ display: 'block', marginBottom: 8 }}>
                        {errors.flavors}
                      </span>
                    )}
                    <div className={styles.flavorsList}>
                      {form.flavors.map((f) => (
                        <div key={f.id} className={styles.flavorTag}>
                          <span>{f.name}</span>
                          <button onClick={() => removeFlavor(f.id)} className={styles.flavorRemove}>
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 1l8 8M9 1L1 9"/>
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className={styles.flavorAdd}>
                      <input className={styles.input} value={newFlavor}
                        onChange={(e) => setNewFlavor(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFlavor())}
                        placeholder="Nome do sabor (Ex: Chocolate...)" style={{ marginBottom: 0 }} />
                      <button className={styles.flavorAddBtn} onClick={addFlavor} type="button">
                        + Adicionar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Estoque & Disponibilidade ── */}
              <div className={styles.section}>
                <div className={styles.sectionTitle}>Estoque & Disponibilidade</div>

                {/* Sob encomenda */}
                <label className={styles.toggle}>
                  <input type="checkbox" checked={form.made_to_order}
                    onChange={(e) => setForm(f => ({
                      ...f,
                      made_to_order: e.target.checked,
                      // Se marcar sob encomenda, desativa controle de estoque
                      track_stock: e.target.checked ? false : f.track_stock,
                    }))} />
                  <span className={styles.toggleTrack}><span className={styles.toggleThumb} /></span>
                  <span className={styles.toggleLabel}>Vender sob encomenda</span>
                </label>

                {form.made_to_order && (
                  <div className={styles.field} style={{ marginTop: 12 }}>
                    <label className={styles.label}>Prazo para o cliente *</label>
                    <input
                      className={`${styles.input} ${errors.order_deadline ? styles.inputErr : ''}`}
                      value={form.order_deadline} onChange={set('order_deadline')}
                      placeholder="Ex: Pedido com 2 dias de antecedência" />
                    {errors.order_deadline
                      ? <span className={styles.err}>{errors.order_deadline}</span>
                      : <span className={styles.hint}>Exibido no cardápio e no checkout</span>
                    }
                  </div>
                )}

                {/* Controle de estoque — só se não for sob encomenda */}
                {!form.made_to_order && (
                  <div style={{ marginTop: 16 }}>
                    <label className={styles.toggle}>
                      <input type="checkbox" checked={form.track_stock} onChange={set('track_stock')} />
                      <span className={styles.toggleTrack}><span className={styles.toggleThumb} /></span>
                      <span className={styles.toggleLabel}>Controlar estoque</span>
                    </label>

                    {/* Estoque de produto simples (sem sabores) */}
                    {form.track_stock && !form.has_flavors && (
                      <div className={styles.field} style={{ marginTop: 12, maxWidth: 200 }}>
                        <label className={styles.label}>Unidades em estoque</label>
                        <input className={styles.input} type="number" min="0"
                          value={form.stock} onChange={set('stock')} placeholder="Ex: 30" />
                        <span className={styles.hint}>Zera automaticamente ao confirmar pedidos</span>
                      </div>
                    )}

                    {/* Estoque por sabor */}
                    {form.track_stock && form.has_flavors && (
                      <div className={styles.field} style={{ marginTop: 12 }}>
                        <label className={styles.label}>Estoque por sabor</label>
                        <span className={styles.hint} style={{ display: 'block', marginBottom: 10 }}>
                          O kit fica disponível enquanto qualquer sabor tiver estoque.
                          Se um sabor acabar, ele some das opções.
                        </span>
                        {form.flavors.length === 0 && (
                          <span className={styles.hint} style={{ color: '#b08060' }}>
                            Adicione os sabores acima para definir o estoque de cada um.
                          </span>
                        )}
                        {form.flavors.map(f => (
                          <div key={f.id} className={styles.fieldRow} style={{ marginTop: 8, alignItems: 'center' }}>
                            <span style={{ flex: 1, fontSize: 13, color: 'var(--ink)' }}>{f.name}</span>
                            <div className={styles.field} style={{ flex: 0, minWidth: 110 }}>
                              <input className={styles.input} type="number" min="0"
                                value={form.flavor_stocks[f.id] ?? ''}
                                onChange={(e) => setForm(prev => ({
                                  ...prev,
                                  flavor_stocks: { ...prev.flavor_stocks, [f.id]: e.target.value }
                                }))}
                                placeholder="0 un." />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── Visibilidade ── */}
              <div className={styles.section}>
                <div className={styles.sectionTitle}>Visibilidade</div>
                <label className={styles.toggle}>
                  <input type="checkbox" checked={form.available} onChange={set('available')} />
                  <span className={styles.toggleTrack}><span className={styles.toggleThumb} /></span>
                  <span className={styles.toggleLabel}>
                    {form.available ? 'Disponível para venda' : 'Indisponível no momento'}
                  </span>
                </label>
              </div>

            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancelar</button>
              <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Criar doce'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Confirmar exclusão */}
      {confirmDelete && (
        <>
          <div className={shared.overlay} onClick={() => setConfirmDelete(null)} />
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.confirmTitle}>Excluir doce?</h3>
            <p className={styles.confirmText}>"{confirmDelete.name}" será removido permanentemente.</p>
            <div className={styles.confirmActions}>
              <button className={styles.cancelBtn} onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button className={styles.deleteConfirmBtn} onClick={() => handleDelete(confirmDelete.id)}>
                Sim, excluir
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}