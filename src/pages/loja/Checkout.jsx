import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import styles from './Checkout.module.css'

const POLOS = {
  franca: {
    cidade: 'Franca', uf: 'SP',
    endereco: 'Estr. José Ovídio de Assis, 5261 - Recanto Elimar, Franca - SP',
    frete: 10.0,
  },
  cassia: {
    cidade: 'Cássia', uf: 'MG',
    endereco: 'R. Azárias Azevedo de Melo, 170 - Peixotos, Cássia - MG',
    frete: 5.0,
  },
}

// ── Datas de retirada por polo ─────────────────────────────────────────
// Edite aqui para cada novo evento/período
const DATAS_RETIRADA = {
  franca: [
    { id: 'f1', label: 'Domingo, 29 de março', sublabel: 'Páscoa 2026' },
    { id: 'f2', label: 'Sábado, 04 de abril',  sublabel: 'Páscoa 2026' },
  ],
  cassia: [
    { id: 'c1', label: 'Domingo, 29 de março', sublabel: 'Páscoa 2026' },
    { id: 'c2', label: 'Sábado, 04 de abril',  sublabel: 'Páscoa 2026' },
  ],
}

const detectarPolo = (cidade, uf) => {
  const c = cidade?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (c === 'franca' && uf === 'SP') return 'franca'
  if ((c === 'cassia' || c === 'cássia') && uf === 'MG') return 'cassia'
  return null
}

const STEPS = [
  { id: 1, label: 'Dados' },
  { id: 2, label: 'Entrega' },
  { id: 3, label: 'Revisar' },
]

export default function Checkout({ onBack, onConcluir }) {
  const { cart, cartTotal, addOrder } = useApp()

  const [step, setStep]         = useState(1)
  const [form, setForm]         = useState({
    name: '', phone: '', instagram: '',
    cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '',
  })
  const [errors, setErrors]         = useState({})
  const [entrega, setEntrega]       = useState(null)
  const [dataRetirada, setDataRetirada] = useState(null)
  const [cepLoading, setCepLoading] = useState(false)
  const [cepError, setCepError]     = useState('')
  const [poloCep, setPoloCep]       = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const polo = entrega === 'retirada_franca' ? 'franca' : entrega === 'retirada_cassia' ? 'cassia' : null

  const frete = entrega === 'entrega'
    ? (poloCep === 'franca' ? POLOS.franca.frete : poloCep === 'cassia' ? POLOS.cassia.frete : 0)
    : 0
  const totalFinal = cartTotal + frete

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    setErrors(err => ({ ...err, [field]: undefined }))
  }

  const buscarCep = async (cep) => {
    const raw = cep.replace(/\D/g, '')
    if (raw.length !== 8) return
    setCepLoading(true); setCepError('')
    try {
      const res  = await fetch(`https://viacep.com.br/ws/${raw}/json/`)
      const data = await res.json()
      if (data.erro) { setCepError('CEP não encontrado.'); setCepLoading(false); return }
      setForm(f => ({ ...f, logradouro: data.logradouro || '', bairro: data.bairro || '', cidade: data.localidade || '', uf: data.uf || '' }))
      setPoloCep(detectarPolo(data.localidade, data.uf))
    } catch { setCepError('Erro ao buscar CEP.') }
    setCepLoading(false)
  }

  const handleCepChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 8)
    if (val.length > 5) val = val.slice(0, 5) + '-' + val.slice(5)
    setForm(f => ({ ...f, cep: val }))
    setErrors(err => ({ ...err, cep: undefined }))
    if (val.replace(/\D/g, '').length === 8) buscarCep(val)
  }

  const handleEntregaChange = (id) => {
    setEntrega(id)
    setDataRetirada(null) // reset data ao trocar tipo
    setErrors(e => ({ ...e, entrega: undefined, dataRetirada: undefined }))
  }

  const validateStep = (s) => {
    const e = {}
    if (s === 1) {
      if (!form.name.trim())  e.name  = 'Informe seu nome'
      if (!form.phone.trim()) e.phone = 'Informe seu WhatsApp'
    }
    if (s === 2) {
      if (!entrega) e.entrega = 'Selecione uma opção'
      if (polo && !dataRetirada) e.dataRetirada = 'Selecione a data de retirada'
      if (entrega === 'entrega') {
        if (!form.cep.trim())        e.cep = 'Informe o CEP'
        if (!form.logradouro.trim()) e.logradouro = 'Informe o logradouro'
        if (!form.numero.trim())     e.numero = 'Informe o número'
        if (!poloCep)                e.cep = 'Entrega disponível apenas em Franca-SP e Cássia-MG'
      }
    }
    return e
  }

  const goNext = () => {
    const e = validateStep(step)
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setErrors({})
    setStep(s => s + 1)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const dataSelecionada = polo
        ? DATAS_RETIRADA[polo].find(d => d.id === dataRetirada)
        : null

      const enderecoEntrega = entrega === 'entrega'
        ? `${form.logradouro}, ${form.numero}${form.complemento ? ', ' + form.complemento : ''} — ${form.bairro}, ${form.cidade}-${form.uf}, CEP ${form.cep}`
        : entrega === 'retirada_franca'
          ? `Retirada — ${POLOS.franca.endereco}${dataSelecionada ? ` · ${dataSelecionada.label}` : ''}`
          : `Retirada — ${POLOS.cassia.endereco}${dataSelecionada ? ` · ${dataSelecionada.label}` : ''}`

      const id = await addOrder({ ...form, entrega, enderecoEntrega, frete, dataRetirada: dataSelecionada?.label || null })
      onConcluir({ id, total: totalFinal, frete, entrega })
    } catch (err) {
      alert('Erro ao registrar pedido. Tente novamente.')
      console.error(err)
    }
    setSubmitting(false)
  }

  const opcoesEntrega = [
    { id: 'retirada_franca', icon: '📍', label: 'Retirada em Franca-SP', sub: POLOS.franca.endereco, valor: 'Grátis' },
    { id: 'retirada_cassia', icon: '📍', label: 'Retirada em Cássia-MG', sub: POLOS.cassia.endereco, valor: 'Grátis' },
    {
      id: 'entrega', icon: '🚚',
      label: 'Entrega no endereço',
      sub: poloCep ? `Disponível para ${poloCep === 'franca' ? 'Franca-SP' : 'Cássia-MG'}` : 'Preencha o CEP para calcular',
      valor: poloCep ? `R$ ${(poloCep === 'franca' ? POLOS.franca.frete : POLOS.cassia.frete).toFixed(2).replace('.', ',')}` : '—',
    },
  ]

  const formatarSabores = (item) => {
    if (!item.flavorChoices || !item.flavors) return null
    return Object.entries(item.flavorChoices)
      .map(([id, qty]) => {
        const s = item.flavors.find(f => f.id === id || f.id === String(id))
        return s ? `${qty}× ${s.name}` : null
      }).filter(Boolean).join(', ')
  }

  const dataSelecionadaLabel = polo && dataRetirada
    ? DATAS_RETIRADA[polo].find(d => d.id === dataRetirada)?.label
    : null

  return (
    <div className={styles.page}>

      <button className={styles.backBtn} onClick={onBack}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M9 2L4 7l5 5"/>
        </svg>
        Voltar ao cardápio
      </button>

      {/* Stepper */}
      <div className={styles.stepper}>
        {STEPS.map((s, i) => (
          <div key={s.id} className={styles.stepperItem}>
            <div className={`${styles.stepCircle} ${step > s.id ? styles.stepDone : step === s.id ? styles.stepActive : styles.stepPending}`}>
              {step > s.id
                ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2"><path d="M2 6l3 3 5-5"/></svg>
                : s.id
              }
            </div>
            <span className={`${styles.stepLabel} ${step === s.id ? styles.stepLabelActive : ''}`}>{s.label}</span>
            {i < STEPS.length - 1 && (
              <div className={`${styles.stepLine} ${step > s.id ? styles.stepLineDone : ''}`} />
            )}
          </div>
        ))}
      </div>

      <div className={styles.layout}>
        <div className={styles.formCol}>

          {/* ── ETAPA 1 — Dados ── */}
          {step === 1 && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardStep}>01</div>
                <div>
                  <div className={styles.cardTitle}>Seus dados</div>
                  <div className={styles.cardSub}>Como vamos te chamar?</div>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Nome completo *</label>
                <input className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                  value={form.name} onChange={set('name')} placeholder="Márcia Melo" autoFocus />
                {errors.name && <span className={styles.error}>{errors.name}</span>}
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>WhatsApp *</label>
                  <input className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                    value={form.phone} onChange={set('phone')} placeholder="(16) 99999-0000" type="tel" />
                  {errors.phone && <span className={styles.error}>{errors.phone}</span>}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Instagram <span className={styles.optional}>(opcional)</span></label>
                  <div className={styles.inputPrefix}>
                    <span className={styles.prefix}>@</span>
                    <input className={`${styles.input} ${styles.inputWithPrefix}`}
                      value={form.instagram} onChange={set('instagram')} placeholder="seuuser" />
                  </div>
                </div>
              </div>

              <button className={styles.nextBtn} onClick={goNext}>
                Continuar
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 2l5 5-5 5"/>
                </svg>
              </button>
            </div>
          )}

          {/* ── ETAPA 2 — Entrega ── */}
          {step === 2 && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardStep}>02</div>
                <div>
                  <div className={styles.cardTitle}>Entrega ou retirada</div>
                  <div className={styles.cardSub}>Como prefere receber seus doces?</div>
                </div>
              </div>

              {errors.entrega && <div className={styles.errorBlock}>{errors.entrega}</div>}

              <div className={styles.entregaOpcoes}>
                {opcoesEntrega.map((op) => (
                  <button key={op.id} type="button"
                    className={`${styles.entregaOpcao} ${entrega === op.id ? styles.entregaAtiva : ''}`}
                    onClick={() => handleEntregaChange(op.id)}>
                    <span className={styles.entregaEmoji}>{op.icon}</span>
                    <div className={styles.entregaInfo}>
                      <span className={styles.entregaLabel}>{op.label}</span>
                      <span className={styles.entregaSub}>{op.sub}</span>
                    </div>
                    <div className={styles.entregaRight}>
                      <span className={styles.entregaValor}>{op.valor}</span>
                      <div className={`${styles.entregaRadio} ${entrega === op.id ? styles.entregaRadioOn : ''}`}>
                        {entrega === op.id && <div className={styles.entregaRadioDot} />}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* ── Datas de retirada ── */}
              {polo && (
                <div className={styles.datasBlock}>
                  <div className={styles.datasTitle}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="1" y="2" width="12" height="11" rx="2"/>
                      <path d="M1 6h12M4 1v2M10 1v2"/>
                    </svg>
                    Escolha a data de retirada
                  </div>
                  {errors.dataRetirada && <div className={styles.errorBlock}>{errors.dataRetirada}</div>}
                  <div className={styles.datasGrid}>
                    {DATAS_RETIRADA[polo].map((data) => (
                      <button key={data.id} type="button"
                        className={`${styles.dataOpcao} ${dataRetirada === data.id ? styles.dataAtiva : ''}`}
                        onClick={() => {
                          setDataRetirada(data.id)
                          setErrors(e => ({ ...e, dataRetirada: undefined }))
                        }}>
                        <span className={styles.dataLabel}>{data.label}</span>
                        <span className={styles.dataSublabel}>{data.sublabel}</span>
                        {dataRetirada === data.id && (
                          <div className={styles.dataCheck}>
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2">
                              <path d="M1.5 5l2.5 2.5 4.5-4.5"/>
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Endereço de entrega ── */}
              {entrega === 'entrega' && (
                <div className={styles.addressBlock}>
                  <div className={styles.addressTitle}>Endereço de entrega</div>

                  <div className={styles.field}>
                    <label className={styles.label}>CEP *</label>
                    <div className={styles.cepRow}>
                      <input className={`${styles.input} ${errors.cep ? styles.inputError : ''}`}
                        value={form.cep} onChange={handleCepChange} placeholder="00000-000" maxLength={9} />
                      {cepLoading && <span className={styles.cepLoader}>Buscando…</span>}
                    </div>
                    {cepError   && <span className={styles.error}>{cepError}</span>}
                    {errors.cep && <span className={styles.error}>{errors.cep}</span>}
                    {poloCep && !errors.cep && (
                      <span className={styles.cepOk}>
                        ✓ Entrega em {poloCep === 'franca' ? 'Franca-SP' : 'Cássia-MG'} —&nbsp;
                        R$ {(poloCep === 'franca' ? POLOS.franca.frete : POLOS.cassia.frete).toFixed(2).replace('.', ',')}
                      </span>
                    )}
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Logradouro *</label>
                    <input className={`${styles.input} ${errors.logradouro ? styles.inputError : ''}`}
                      value={form.logradouro} onChange={set('logradouro')} placeholder="Rua, Avenida..." />
                    {errors.logradouro && <span className={styles.error}>{errors.logradouro}</span>}
                  </div>

                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label className={styles.label}>Número *</label>
                      <input className={`${styles.input} ${errors.numero ? styles.inputError : ''}`}
                        value={form.numero} onChange={set('numero')} placeholder="123" />
                      {errors.numero && <span className={styles.error}>{errors.numero}</span>}
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Complemento <span className={styles.optional}>(opcional)</span></label>
                      <input className={styles.input} value={form.complemento} onChange={set('complemento')} placeholder="Apto, bloco..." />
                    </div>
                  </div>

                  <div className={styles.row}>
                    <div className={styles.field} style={{ flex: 2 }}>
                      <label className={styles.label}>Cidade</label>
                      <input className={styles.input} value={form.cidade} readOnly />
                    </div>
                    <div className={styles.field} style={{ flex: 1 }}>
                      <label className={styles.label}>UF</label>
                      <input className={styles.input} value={form.uf} readOnly />
                    </div>
                  </div>
                </div>
              )}

              <div className={styles.stepActions}>
                <button className={styles.backStepBtn} onClick={() => setStep(1)}>← Voltar</button>
                <button className={styles.nextBtn} onClick={goNext}>
                  Revisar pedido
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 2l5 5-5 5"/>
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* ── ETAPA 3 — Revisão ── */}
          {step === 3 && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardStep}>03</div>
                <div>
                  <div className={styles.cardTitle}>Revisar pedido</div>
                  <div className={styles.cardSub}>Confira tudo antes de confirmar</div>
                </div>
              </div>

              <div className={styles.reviewBlock}>
                <div className={styles.reviewBlockHeader}>
                  <span className={styles.reviewBlockTitle}>Seus dados</span>
                  <button className={styles.reviewEdit} onClick={() => setStep(1)}>Editar</button>
                </div>
                <div className={styles.reviewRow}><span>Nome</span><strong>{form.name}</strong></div>
                <div className={styles.reviewRow}><span>WhatsApp</span><strong>{form.phone}</strong></div>
                {form.instagram && <div className={styles.reviewRow}><span>Instagram</span><strong>@{form.instagram}</strong></div>}
              </div>

              <div className={styles.reviewBlock}>
                <div className={styles.reviewBlockHeader}>
                  <span className={styles.reviewBlockTitle}>Entrega</span>
                  <button className={styles.reviewEdit} onClick={() => setStep(2)}>Editar</button>
                </div>
                <div className={styles.reviewRow}>
                  <span>Tipo</span>
                  <strong>
                    {entrega === 'retirada_franca' ? 'Retirada — Franca-SP'
                     : entrega === 'retirada_cassia' ? 'Retirada — Cássia-MG'
                     : `Entrega — ${form.cidade}-${form.uf}`}
                  </strong>
                </div>
                {dataSelecionadaLabel && (
                  <div className={styles.reviewRow}>
                    <span>Data de retirada</span>
                    <strong>{dataSelecionadaLabel}</strong>
                  </div>
                )}
                {frete > 0 && (
                  <div className={styles.reviewRow}><span>Frete</span><strong>R$ {frete.toFixed(2).replace('.', ',')}</strong></div>
                )}
              </div>

              <div className={styles.reviewBlock}>
                <div className={styles.reviewBlockHeader}>
                  <span className={styles.reviewBlockTitle}>Itens ({cart.length})</span>
                </div>
                {cart.map((item, idx) => {
                  const sabores = formatarSabores(item)
                  const thumb   = item.images?.[0] || item.image_url
                  return (
                    <div key={item.cartItemId || idx} className={styles.reviewItem}>
                      {thumb
                        ? <img src={thumb} alt={item.name} className={styles.reviewItemThumb} />
                        : <div className={styles.reviewItemThumbBlank}>{item.name[0]}</div>
                      }
                      <div className={styles.reviewItemInfo}>
                        <span className={styles.reviewItemName}>{item.name} ×{item.qty}</span>
                        {sabores && <span className={styles.reviewItemFlavors}>{sabores}</span>}
                      </div>
                      <span className={styles.reviewItemPrice}>
                        R$ {(item.price * item.qty).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  )
                })}
                <div className={styles.reviewTotal}>
                  <span>Total</span>
                  <strong>R$ {totalFinal.toFixed(2).replace('.', ',')}</strong>
                </div>
              </div>

              <div className={styles.stepActions}>
                <button className={styles.backStepBtn} onClick={() => setStep(2)}>← Voltar</button>
                <button className={styles.confirmBtn} onClick={handleSubmit} disabled={submitting}>
                  {submitting
                    ? <><span className={styles.spinner} /> Registrando…</>
                    : <>Confirmar pedido ✓</>
                  }
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Resumo lateral (desktop) ── */}
        <div className={styles.summaryBox}>
          <div className={styles.summaryTitle}>Resumo</div>
          {cart.map((i, idx) => {
            const sabores = formatarSabores(i)
            return (
              <div key={i.cartItemId || idx} className={styles.summaryItem}>
                <div className={styles.summaryItemLeft}>
                  <span className={styles.summaryItemName}>{i.name} <span className={styles.summaryItemQty}>×{i.qty}</span></span>
                  {sabores && <span className={styles.summaryItemFlavors}>{sabores}</span>}
                </div>
                <span className={styles.summaryItemPrice}>R$ {(i.price * i.qty).toFixed(2).replace('.', ',')}</span>
              </div>
            )
          })}
          <div className={styles.summaryDivider} />
          {frete > 0 && (
            <div className={styles.summaryFrete}><span>Entrega</span><span>R$ {frete.toFixed(2).replace('.', ',')}</span></div>
          )}
          <div className={styles.summaryTotal}>
            <span className={styles.summaryTotalLabel}>Total</span>
            <span className={styles.summaryTotalValue}>R$ {totalFinal.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}