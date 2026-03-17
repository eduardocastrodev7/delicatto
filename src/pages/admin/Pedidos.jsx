import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { STATUS_LABEL, STATUS_COLOR, STATUS_FLOW } from '../../data/mock'
import shared from './admin.shared.module.css'
import styles from './Pedidos.module.css'

const ENTREGA_LABEL = {
  retirada_franca: 'Retirada · Franca-SP',
  retirada_cassia: 'Retirada · Cássia-MG',
  entrega:         'Entrega no endereço',
}

const METODO_LABEL = {
  pix:    'Pix',
  cartao: 'Cartão',
}

const MESES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
]

export default function Pedidos() {
  const { orders, updateOrderStatus } = useApp()

  const now   = new Date()
  const [mes, setMes]       = useState(now.getMonth())
  const [ano, setAno]       = useState(now.getFullYear())
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [busca, setBusca]   = useState('')

  const [anosDisponiveis, setAnosDisponiveis] = useState([now.getFullYear()])
  const [pedidosFiltrados, setPedidosFiltrados] = useState([])

  useEffect(() => {
    const anos = new Set(orders.map(o => {
      const d = o.createdAtDate || new Date(o.created_at)
      return isNaN(d) ? null : d.getFullYear()
    }).filter(Boolean))
    anos.add(now.getFullYear())
    setAnosDisponiveis([...anos].sort((a, b) => b - a))
  }, [orders])

  useEffect(() => {
    const resultado = orders.filter(o => {
      const d        = o.createdAtDate || new Date(o.created_at)
      const mesOk    = !isNaN(d) && d.getMonth() === mes && d.getFullYear() === ano
      const statusOk = filtroStatus === 'todos' || o.status === filtroStatus
      const q        = busca.toLowerCase().trim()
      const nome     = (o.customerName  || '').toLowerCase()
      const tel      = (o.customerPhone || '').replace(/\D/g, '')
      const qTel     = q.replace(/\D/g, '')
      const buscaOk  = !q || nome.includes(q) || (qTel && tel.includes(qTel))
      return mesOk && statusOk && buscaOk
    })
    setPedidosFiltrados(resultado)
  }, [orders, mes, ano, filtroStatus, busca])

  // Próximos status disponíveis para cada status atual
  const proximosStatus = (atual) => {
    if (atual === 'cancelado') return []
    const idx = STATUS_FLOW.indexOf(atual)
    const proximos = idx < STATUS_FLOW.length - 1 ? [STATUS_FLOW[idx + 1]] : []
    return [...proximos, 'cancelado']
  }

  return (
    <div>
      {/* ── Filtros ── */}
      <div className={styles.filterBar}>
        <select className={styles.filterSelect} value={mes} onChange={e => setMes(Number(e.target.value))}>
          {MESES.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <select className={styles.filterSelect} value={ano} onChange={e => setAno(Number(e.target.value))}>
          {anosDisponiveis.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select className={styles.filterSelect} value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
          <option value="todos">Todos os status</option>
          <option value="aguardando_pagamento">Aguardando pagamento</option>
          <option value="pagamento_aprovado">Pagamento aprovado</option>
          <option value="em_preparo">Em preparo</option>
          <option value="pronto">Pronto</option>
          <option value="entregue">Entregue</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <input
          className={styles.filterSearch}
          placeholder="Buscar cliente..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
        <span className={styles.filterCount}>
          {pedidosFiltrados.length} pedido{pedidosFiltrados.length !== 1 ? 's' : ''}
        </span>
      </div>

      {pedidosFiltrados.length === 0 && (
        <div className={styles.emptyState}>Nenhum pedido encontrado.</div>
      )}

      <div className={styles.list}>
        {pedidosFiltrados.map((o) => (
          <div key={o.id} className={styles.pedidoCard}>
            {/* Cabeçalho do card */}
            <div className={styles.pedidoHeader}>
              <div className={styles.pedidoId}>#{o.id}</div>
              <div className={styles.pedidoMeta}>
                <span className={styles.data}>{o.date}</span>
                {o.metodoPagamento && (
                  <span className={styles.metodo}>{METODO_LABEL[o.metodoPagamento] || o.metodoPagamento}</span>
                )}
              </div>
              <span
                className={shared.badge}
                style={{ background: STATUS_COLOR[o.status] + '20', color: STATUS_COLOR[o.status] }}
              >
                {STATUS_LABEL[o.status]}
              </span>
            </div>

            {/* Info do cliente e entrega */}
            <div className={styles.pedidoBody}>
              <div className={styles.clienteCol}>
                <div className={styles.clienteName}>{o.customerName}</div>
                <a
                  href={`https://wa.me/55${o.customerPhone.replace(/\D/g, '')}`}
                  target="_blank" rel="noreferrer"
                  className={styles.waLink}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#25d366">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  {o.customerPhone}
                </a>
                {o.customerInstagram && (
                  <span className={styles.insta}>@{o.customerInstagram}</span>
                )}
              </div>

              <div className={styles.entregaCol}>
                <div className={styles.entregaTipo}>{ENTREGA_LABEL[o.entrega] || o.entrega}</div>
                {o.entrega === 'entrega' && o.endereco && (
                  <div className={styles.entregaEnd}>{o.endereco}</div>
                )}
                {o.pickupDate && (
                  <div className={styles.pickupDate}>
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <rect x="0.5" y="1.5" width="10" height="9" rx="1.5"/>
                      <path d="M0.5 5h10M3.5 0.5v2M7.5 0.5v2"/>
                    </svg>
                    {o.pickupDate}
                  </div>
                )}
                {o.frete > 0 && (
                  <div className={styles.frete}>Frete: R$ {o.frete.toFixed(2).replace('.', ',')}</div>
                )}
              </div>

              <div className={styles.itensCol}>
                {o.items.map((i, idx) => {
                  // flavor_choices pode ser array [{ flavorName, qty }]
                  const sabores = Array.isArray(i.flavorChoices) && i.flavorChoices.length > 0
                    ? i.flavorChoices.map(f => `${f.qty}× ${f.flavorName}`).join(', ')
                    : null
                  return (
                    <div key={idx} className={styles.item}>
                      <div className={styles.itemInfo}>
                        <span>{i.name} <span className={styles.itemQty}>×{i.qty}</span></span>
                        {sabores && (
                          <span className={styles.itemFlavors}>{sabores}</span>
                        )}
                      </div>
                      <span className={styles.itemPrice}>
                        R$ {(i.price * i.qty).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  )
                })}
                <div className={styles.total}>
                  R$ {o.total.toFixed(2).replace('.', ',')}
                </div>
              </div>
            </div>

            {/* Ações de status */}
            {proximosStatus(o.status).length > 0 && (
              <div className={styles.pedidoFooter}>
                <span className={styles.atualizarLabel}>Avançar status:</span>
                <div className={styles.statusBtns}>
                  {proximosStatus(o.status).map((s) => (
                    <button
                      key={s}
                      className={`${styles.statusBtn} ${s === 'cancelado' ? styles.cancelBtn : styles.avancarBtn}`}
                      onClick={() => updateOrderStatus(o.id, s)}
                    >
                      {STATUS_LABEL[s]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}