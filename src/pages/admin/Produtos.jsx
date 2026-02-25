import { useState, useRef } from 'react'
import { useApp } from '../../context/AppContext'
import { supabase } from '../../lib/supabase'
import shared from './admin.shared.module.css'
import styles from './Produtos.module.css'

const EMPTY = {
  name: '', price: '', category: '', description: '',
  ingredients: '', prep_time: '', available: true,
  image_url: '',
  has_flavors: false, flavor_slots: '', flavors: [],
}

const CATEGORIAS = ['Brigadeiros', 'Trufas', 'Especiais', 'Boxes']

export default function Produtos() {
  const { products, addProduct, updateProduct, deleteProduct } = useApp()
  const [showModal, setShowModal]     = useState(false)
  const [editing, setEditing]         = useState(null)
  const [form, setForm]               = useState(EMPTY)
  const [saving, setSaving]           = useState(false)
  const [errors, setErrors]           = useState({})
  const [uploadingImg, setUploadingImg] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [newFlavor, setNewFlavor]     = useState('')
  const fileRef = useRef()

  const openAdd = () => {
    setEditing(null); setForm(EMPTY); setErrors({}); setShowModal(true)
  }

  const openEdit = (p) => {
    setEditing(p)
    setForm({
      name:         p.name        || '',
      price:        p.price       || '',
      category:     p.category    || '',
      description:  p.description || '',
      ingredients:  p.ingredients || '',
      prep_time:    p.prep_time   || '',
      available:    p.available   ?? true,
      image_url:    p.image_url   || '',
      has_flavors:  p.has_flavors  || false,
      flavor_slots: p.flavor_slots || '',
      flavors:      p.flavors      || [],
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

    // Valida tamanho (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Imagem muito grande. Máximo 2MB.')
      return
    }

    setUploadingImg(true)
    try {
      const ext  = file.name.split('.').pop().toLowerCase()
      const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(path, file, { contentType: file.type, upsert: false })

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(path)

      setForm((prev) => ({ ...prev, image_url: data.publicUrl }))
    } catch (err) {
      console.error('Upload error:', err)
      alert('Erro ao enviar imagem: ' + err.message)
    }
    setUploadingImg(false)
    // Limpa input para permitir selecionar o mesmo arquivo novamente
    e.target.value = ''
  }

  // ── Sabores ───────────────────────────────────
  const addFlavor = () => {
    const name = newFlavor.trim()
    if (!name) return
    if (form.flavors.find(f => f.name.toLowerCase() === name.toLowerCase())) return
    setForm((prev) => ({
      ...prev,
      flavors: [...prev.flavors, { id: Date.now().toString(), name }]
    }))
    setNewFlavor('')
  }

  const removeFlavor = (id) =>
    setForm((prev) => ({ ...prev, flavors: prev.flavors.filter(f => f.id !== id) }))

  const handleFlavorKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addFlavor() }
  }

  // ── Validação e salvar ────────────────────────
  const validate = () => {
    const e = {}
    if (!form.name.trim())     e.name     = 'Nome obrigatório'
    if (!form.price)           e.price    = 'Preço obrigatório'
    if (!form.category.trim()) e.category = 'Categoria obrigatória'
    if (form.has_flavors) {
      if (!form.flavor_slots || parseInt(form.flavor_slots) < 1)
        e.flavor_slots = 'Informe quantos slots o cliente precisa preencher'
      if (form.flavors.length < 2)
        e.flavors = 'Adicione pelo menos 2 sabores'
    }
    return e
  }

  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setSaving(true)
    try {
      const payload = {
        name:         form.name.trim(),
        price:        parseFloat(form.price),
        category:     form.category.trim(),
        description:  form.description.trim(),
        ingredients:  form.ingredients.trim(),
        prep_time:    form.prep_time.trim(),
        available:    form.available,
        image_url:    form.image_url || null,
        has_flavors:  form.has_flavors,
        flavor_slots: form.has_flavors ? parseInt(form.flavor_slots) : null,
        flavors:      form.has_flavors ? form.flavors : [],
      }
      editing ? await updateProduct(editing.id, payload) : await addProduct(payload)
      setShowModal(false)
    } catch (err) {
      alert('Erro ao salvar: ' + err.message)
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    try { await deleteProduct(id) } catch (err) { alert('Erro: ' + err.message) }
    setConfirmDelete(null)
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
            <th>Produto</th><th>Categoria</th><th>Preço</th><th>Status</th><th>Ações</th>
          </tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className={styles.prodName}>
                    {p.image_url
                      ? <img src={p.image_url} alt={p.name} className={styles.thumb} />
                      : <div className={styles.thumbPlaceholder}>{p.name.charAt(0)}</div>
                    }
                    <div>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div className={styles.prodMeta}>
                        {p.prep_time && <span>{p.prep_time}</span>}
                        {p.has_flavors && <span className={styles.flavorBadge}>🎨 {p.flavor_slots} sabores</span>}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ color: 'var(--muted)', fontSize: 13 }}>{p.category}</td>
                <td style={{ fontWeight: 700, color: 'var(--brown-dark)' }}>
                  R$ {parseFloat(p.price).toFixed(2).replace('.', ',')}
                </td>
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
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Modal ── */}
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

              {/* Foto */}
              <div className={styles.section}>
                <div className={styles.sectionTitle}>Foto do produto</div>
                <div className={styles.imageRow}>
                  {form.image_url
                    ? <img src={form.image_url} alt="preview" className={styles.imagePreview} />
                    : <div className={styles.imagePlaceholder}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--muted)' }}>
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <path d="M21 15l-5-5L5 21"/>
                        </svg>
                        <span>Sem foto</span>
                      </div>
                  }
                  <div className={styles.imageActions}>
                    <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} style={{ display: 'none' }} />
                    <button className={styles.uploadBtn} onClick={() => fileRef.current.click()} disabled={uploadingImg}>
                      {uploadingImg ? 'Enviando...' : form.image_url ? 'Trocar foto' : 'Enviar foto'}
                    </button>
                    {form.image_url && (
                      <button className={styles.removeImgBtn} onClick={() => setForm(f => ({ ...f, image_url: '' }))}>
                        Remover
                      </button>
                    )}
                    <p className={styles.imageHint}>JPG, PNG ou WEBP · Máx. 2MB</p>
                  </div>
                </div>
              </div>

              {/* Informações básicas */}
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
                    <input className={styles.input}
                      value={form.prep_time} onChange={set('prep_time')}
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

              {/* Ingredientes */}
              <div className={styles.section}>
                <div className={styles.sectionTitle}>Ingredientes & Alérgenos</div>
                <textarea className={styles.textarea} rows={3}
                  value={form.ingredients} onChange={set('ingredients')}
                  placeholder="Ex: Leite condensado, manteiga, chocolate belga. Contém: leite, glúten." />
                <span className={styles.hint}>Inclua os alérgenos ao final (Contém: ...)</span>
              </div>

              {/* Sabores */}
              <div className={styles.section}>
                <div className={styles.sectionTitle}>Escolha de sabores</div>

                <label className={styles.toggle}>
                  <input type="checkbox" checked={form.has_flavors} onChange={set('has_flavors')} />
                  <span className={styles.toggleTrack}>
                    <span className={styles.toggleThumb} />
                  </span>
                  <span className={styles.toggleLabel}>
                    Permitir que o cliente escolha os sabores
                  </span>
                </label>

                {form.has_flavors && (
                  <div className={styles.flavorsConfig}>
                    {/* Quantidade de slots */}
                    <div className={styles.field} style={{ maxWidth: 220, marginBottom: 16 }}>
                      <label className={styles.label}>Quantos sabores o cliente escolhe? *</label>
                      <input className={`${styles.input} ${errors.flavor_slots ? styles.inputErr : ''}`}
                        type="number" min="1" max="100"
                        value={form.flavor_slots} onChange={set('flavor_slots')}
                        placeholder="Ex: 4 para uma caixa de 4" />
                      {errors.flavor_slots && <span className={styles.err}>{errors.flavor_slots}</span>}
                      <span className={styles.hint}>Total de unidades que o cliente vai distribuir entre os sabores</span>
                    </div>

                    {/* Lista de sabores disponíveis */}
                    <label className={styles.label}>Sabores disponíveis *</label>
                    {errors.flavors && <span className={styles.err} style={{ display: 'block', marginBottom: 8 }}>{errors.flavors}</span>}

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
                      <input
                        className={styles.input}
                        value={newFlavor}
                        onChange={(e) => setNewFlavor(e.target.value)}
                        onKeyDown={handleFlavorKeyDown}
                        placeholder="Nome do sabor (Ex: Chocolate, Morango...)"
                        style={{ marginBottom: 0 }}
                      />
                      <button className={styles.flavorAddBtn} onClick={addFlavor} type="button">
                        + Adicionar
                      </button>
                    </div>
                    <span className={styles.hint}>Pressione Enter ou clique em Adicionar</span>
                  </div>
                )}
              </div>

              {/* Visibilidade */}
              <div className={styles.section}>
                <div className={styles.sectionTitle}>Visibilidade</div>
                <label className={styles.toggle}>
                  <input type="checkbox" checked={form.available} onChange={set('available')} />
                  <span className={styles.toggleTrack}>
                    <span className={styles.toggleThumb} />
                  </span>
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
            <p className={styles.confirmText}>
              "<strong>{confirmDelete.name}</strong>" será removido permanentemente do cardápio.
            </p>
            <div className={styles.confirmActions}>
              <button className={styles.cancelBtn} onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button className={styles.deleteConfirmBtn} onClick={() => handleDelete(confirmDelete.id)}>Sim, excluir</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}