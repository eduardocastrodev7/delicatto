import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import styles from './Checkout.module.css'

const POLOS = {
  franca: {
    cidade: 'Franca',
    uf: 'SP',
    endereco: 'Estr. José Ovídio de Assis, 5261 - Recanto Elimar, Franca - SP, 14403-837',
    frete: 10.0,
  },
  cassia: {
    cidade: 'Cássia',
    uf: 'MG',
    endereco: 'R. Azárias Azevedo de Melo, 170 - Peixotos, Cássia - MG, 37980-000',
    frete: 5.0,
  },
}

const detectarPolo = (cidade, uf) => {
  const c = cidade?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (c === 'franca' && uf === 'SP') return 'franca'
  if ((c === 'cassia' || c === 'cássia') && uf === 'MG') return 'cassia'
  return null
}

export default function Checkout({ onBack, onConcluir }) {
  const { cart, cartTotal, addOrder } = useApp()

  const [form, setForm] = useState({
    name: '', phone: '', instagram: '',
    cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '',
  })
  const [errors, setErrors]     = useState({})
  const [entrega, setEntrega]   = useState(null)
  const [cepLoading, setCepLoading] = useState(false)
  const [cepError, setCepError] = useState('')
  const [poloCep, setPoloCep]   = useState(null)

  const frete = entrega === 'entrega'
    ? (poloCep === 'franca' ? POLOS.franca.frete : poloCep === 'cassia' ? POLOS.cassia.frete : 0)
    : 0
  const totalFinal = cartTotal + frete

  const buscarCep = async (cep) => {
    const raw = cep.replace(/\D/g, '')
    if (raw.length !== 8) return
    setCepLoading(true)
    setCepError('')
    try {
      const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`)
      const data = await res.json()
      if (data.erro) { setCepError('CEP não encontrado.'); setCepLoading(false); return }
      setForm((f) => ({
        ...f,
        logradouro: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        uf: data.uf || '',
      }))
      setPoloCep(detectarPolo(data.localidade, data.uf))
    } catch { setCepError('Erro ao buscar CEP. Tente novamente.') }
    setCepLoading(false)
  }

  const handleCepChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 8)
    if (val.length > 5) val = val.slice(0, 5) + '-' + val.slice(5)
    setForm((f) => ({ ...f, cep: val }))
    setErrors((err) => ({ ...err, cep: undefined }))
    if (val.replace(/\D/g, '').length === 8) buscarCep(val)
  }

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    setErrors((err) => ({ ...err, [field]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim())  e.name  = 'Informe seu nome'
    if (!form.phone.trim()) e.phone = 'Informe seu WhatsApp'
    if (!entrega)           e.entrega = 'Selecione uma opção de entrega'
    if (entrega === 'entrega') {
      if (!form.cep.trim())       e.cep = 'Informe seu CEP'
      if (!form.logradouro.trim()) e.logradouro = 'Informe o logradouro'
      if (!form.numero.trim())     e.numero = 'Informe o número'
      if (!poloCep)                e.cep = 'Entrega disponível apenas em Franca-SP e Cássia-MG'
    }
    return e
  }

  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setSubmitting(true)
    try {
      const enderecoEntrega = entrega === 'entrega'
        ? `${form.logradouro}, ${form.numero}${form.complemento ? ', ' + form.complemento : ''} — ${form.bairro}, ${form.cidade}-${form.uf}, CEP ${form.cep}`
        : entrega === 'retirada_franca'
          ? `Retirada — ${POLOS.franca.endereco}`
          : `Retirada — ${POLOS.cassia.endereco}`

      const id = await addOrder({ ...form, entrega, enderecoEntrega, frete })
      onConcluir({ id, total: totalFinal, frete, entrega })
    } catch (err) {
      alert('Erro ao registrar pedido. Tente novamente.')
      console.error(err)
    }
    setSubmitting(false)
  }

  const opcoesEntrega = [
    { id: 'retirada_franca', label: 'Retirada em Franca-SP', sub: POLOS.franca.endereco, valor: 'Grátis' },
    { id: 'retirada_cassia', label: 'Retirada em Cássia-MG', sub: POLOS.cassia.endereco, valor: 'Grátis' },
    {
      id: 'entrega',
      label: 'Entrega no endereço',
      sub: poloCep
        ? `Disponível para ${poloCep === 'franca' ? 'Franca-SP' : 'Cássia-MG'}`
        : 'Preencha o CEP para calcular',
      valor: poloCep
        ? `R$ ${(poloCep === 'franca' ? POLOS.franca.frete : POLOS.cassia.frete).toFixed(2).replace('.', ',')}`
        : '—',
    },
  ]

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={onBack}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M9 2L4 7l5 5"/>
        </svg>
        Voltar ao cardápio
      </button>

      <div className={styles.eyebrow}>Finalizar pedido</div>
      <h1 className={styles.pageTitle}>Confirme seu pedido</h1>

      <div className={styles.container}>
        {/* Resumo */}
        <div className={styles.summaryBox}>
          <div className={styles.summaryTitle}>Resumo</div>
          {cart.map((i, idx) => {
            // Formata sabores escolhidos
            const saboresTexto = i.flavorChoices && i.flavors
              ? Object.entries(i.flavorChoices)
                  .map(([id, qty]) => {
                    const s = i.flavors.find(f => f.id === id || f.id === String(id))
                    return s ? `${qty}× ${s.name}` : null
                  })
                  .filter(Boolean).join(', ')
              : null

            return (
              <div key={i.cartItemId || idx} className={styles.summaryItem}>
                <div className={styles.summaryItemLeft}>
                  <span className={styles.summaryItemName}>
                    {i.name} <span className={styles.summaryItemQty}>×{i.qty}</span>
                  </span>
                  {saboresTexto && (
                    <span className={styles.summaryItemFlavors}>{saboresTexto}</span>
                  )}
                </div>
                <span className={styles.summaryItemPrice}>
                  R$ {(i.price * i.qty).toFixed(2).replace('.', ',')}
                </span>
              </div>
            )
          })}
          <div className={styles.summaryDivider} />
          {frete > 0 && (
            <div className={styles.summaryFrete}>
              <span>Entrega</span>
              <span>R$ {frete.toFixed(2).replace('.', ',')}</span>
            </div>
          )}
          <div className={styles.summaryTotal}>
            <span className={styles.summaryTotalLabel}>Total</span>
            <span className={styles.summaryTotalValue}>R$ {totalFinal.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>

        <div className={styles.formCol}>
          {/* Dados pessoais */}
          <div className={styles.formBox}>
            <div className={styles.formTitle}>Seus dados</div>

            <div className={styles.field}>
              <label className={styles.label}>Nome completo *</label>
              <input className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                value={form.name} onChange={set('name')} placeholder="Marcia Melo" />
              {errors.name && <span className={styles.error}>{errors.name}</span>}
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>WhatsApp *</label>
                <input className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                  value={form.phone} onChange={set('phone')} placeholder="16 99999-0000" type="tel" />
                {errors.phone && <span className={styles.error}>{errors.phone}</span>}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>
                  Instagram <span className={styles.optional}>(opcional)</span>
                </label>
                <div className={styles.inputPrefix}>
                  <span className={styles.prefix}>@</span>
                  <input
                    className={`${styles.input} ${styles.inputWithPrefix}`}
                    value={form.instagram}
                    onChange={set('instagram')}
                    placeholder="seuuser"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Entrega */}
          <div className={styles.formBox}>
            <div className={styles.formTitle}>Entrega ou retirada</div>
            {errors.entrega && (
              <span className={styles.error} style={{ display: 'block', marginBottom: 12 }}>
                {errors.entrega}
              </span>
            )}
            <div className={styles.entregaOpcoes}>
              {opcoesEntrega.map((op) => (
                <button
                  key={op.id}
                  type="button"
                  className={`${styles.entregaOpcao} ${entrega === op.id ? styles.entregaAtiva : ''}`}
                  onClick={() => { setEntrega(op.id); setErrors((e) => ({ ...e, entrega: undefined })) }}
                >
                  <div className={styles.entregaRadio}>
                    {entrega === op.id && <div className={styles.entregaRadioDot} />}
                  </div>
                  <div className={styles.entregaInfo}>
                    <span className={styles.entregaLabel}>{op.label}</span>
                    <span className={styles.entregaSub}>{op.sub}</span>
                  </div>
                  <span className={styles.entregaValor}>{op.valor}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Endereço — só se entrega */}
          {entrega === 'entrega' && (
            <div className={styles.formBox}>
              <div className={styles.formTitle}>Endereço de entrega</div>

              <div className={styles.field}>
                <label className={styles.label}>CEP *</label>
                <div className={styles.cepRow}>
                  <input
                    className={`${styles.input} ${errors.cep ? styles.inputError : ''}`}
                    value={form.cep} onChange={handleCepChange}
                    placeholder="00000-000" maxLength={9}
                  />
                  {cepLoading && <span className={styles.cepLoader}>Buscando...</span>}
                </div>
                {cepError  && <span className={styles.error}>{cepError}</span>}
                {errors.cep && <span className={styles.error}>{errors.cep}</span>}
                {poloCep && !errors.cep && (
                  <span className={styles.cepOk}>
                    Entrega em {poloCep === 'franca' ? 'Franca-SP' : 'Cássia-MG'} — R$ {(poloCep === 'franca' ? POLOS.franca.frete : POLOS.cassia.frete).toFixed(2).replace('.', ',')}
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

              <div className={styles.field}>
                <label className={styles.label}>Bairro</label>
                <input className={styles.input} value={form.bairro} onChange={set('bairro')} />
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

          <button className={styles.confirmBtn} onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Registrando pedido...' : 'Confirmar pedido'}
          </button>
        </div>
      </div>
    </div>
  )
}