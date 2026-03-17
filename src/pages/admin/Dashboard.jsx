import { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { STATUS_LABEL, STATUS_COLOR } from '../../data/mock'
import styles from './Dashboard.module.css'

const STAT_ACCENTS = ['#5c2d0e', '#3d6b45', '#9a6010', '#5b4070', '#2a6090', '#3a1c0a']
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const PAGAMENTO_CONFIRMADO = ['pagamento_aprovado', 'em_preparo', 'pronto', 'entregue', 'concluido']

export default function Dashboard() {
  const { orders, customers } = useApp()
  const now = new Date()
  const [mes, setMes] = useState(now.getMonth())
  const [ano, setAno] = useState(now.getFullYear())

  const anosDisponiveis = useMemo(() => {
    const s = new Set(orders.map(o => (o.createdAtDate || new Date(o.created_at)).getFullYear()).filter(a => !isNaN(a)))
    s.add(now.getFullYear())
    return [...s].sort((a, b) => b - a)
  }, [orders])

  const pedidosFiltrados = useMemo(() => orders.filter(o => {
    const d = o.createdAtDate || new Date(o.created_at)
    return d instanceof Date && !isNaN(d) && d.getMonth() === mes && d.getFullYear() === ano
  }), [orders, mes, ano])

  const pedidosConfirmados = pedidosFiltrados.filter(o => PAGAMENTO_CONFIRMADO.includes(o.status))
  const pedidosCancelados  = pedidosFiltrados.filter(o => o.status === 'cancelado')

  const receita      = pedidosConfirmados.reduce((s, o) => s + (o.total || 0), 0)
  const pendentes    = pedidosFiltrados.filter(o => o.status === 'aguardando_pagamento').length
  const ticketMedio  = pedidosConfirmados.length > 0 ? receita / pedidosConfirmados.length : 0
  const taxaCancel   = pedidosFiltrados.length > 0 ? (pedidosCancelados.length / pedidosFiltrados.length) * 100 : 0

  const { totalItens, rankingProdutos } = useMemo(() => {
    const contagem = {}
    let total = 0
    pedidosConfirmados.forEach(o => {
      ;(o.items || []).forEach(item => {
        total += item.qty
        contagem[item.name] = (contagem[item.name] || 0) + item.qty
      })
    })
    const ranking = Object.entries(contagem)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5)
    return { totalItens: total, rankingProdutos: ranking }
  }, [pedidosConfirmados])

  const pedidosPorData = useMemo(() => {
    const mapa = {}
    pedidosFiltrados
      .filter(o => o.pickupDate && o.status !== 'cancelado')
      .forEach(o => { mapa[o.pickupDate] = (mapa[o.pickupDate] || 0) + 1 })
    return Object.entries(mapa).sort((a, b) => a[0].localeCompare(b[0]))
  }, [pedidosFiltrados])

  const diasNoMes = new Date(ano, mes + 1, 0).getDate()
  const receitaPorDia = useMemo(() => {
    const dias = Array(diasNoMes).fill(0)
    pedidosConfirmados.forEach(o => {
      const d = new Date(o.created_at || o.date).getDate()
      if (d >= 1 && d <= diasNoMes) dias[d - 1] += (o.total || 0)
    })
    return dias
  }, [pedidosConfirmados, diasNoMes])
  const maxReceita = Math.max(...receitaPorDia, 1)

  const fmtR = (v) => 'R$ ' + v.toFixed(2).replace('.', ',')

  const statItems = [
    { value: pedidosFiltrados.length,                    label: 'Pedidos no mês',     fmt: v => String(v) },
    { value: receita,                                    label: 'Receita confirmada', fmt: fmtR },
    { value: ticketMedio,                                label: 'Ticket médio',       fmt: fmtR },
    { value: totalItens,                                 label: 'Itens vendidos',     fmt: v => String(v) },
    { value: pendentes,                                  label: 'Pendentes',          fmt: v => String(v) },
    { value: customers.length,                           label: 'Clientes totais',    fmt: v => String(v) },
  ]

  return (
    <div>
      {/* Filtro */}
      <div className={styles.filterRow}>
        <select className={styles.select} value={mes} onChange={e => setMes(Number(e.target.value))}>
          {MESES.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <select className={styles.select} value={ano} onChange={e => setAno(Number(e.target.value))}>
          {anosDisponiveis.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <span className={styles.filterLabel}>{pedidosFiltrados.length} pedidos em {MESES[mes]} {ano}</span>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        {statItems.map((s, i) => (
          <div key={i} className={styles.statCard} style={{ animationDelay: `${i * 0.05}s` }}>
            <div className={styles.accentBar} style={{ background: STAT_ACCENTS[i] }} />
            <div className={styles.statNum}>{s.fmt(s.value)}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Linha do meio */}
      <div className={styles.midRow}>

        {/* Gráfico de barras */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Receita confirmada por dia — {MESES[mes]}</div>
          <div className={styles.chartWrap}>
            {/* Linhas guia */}
            <div className={styles.chartGuides}>
              <div className={styles.chartGuideLine} />
              <div className={styles.chartGuideLine} />
              <div className={styles.chartGuideLine} />
              <div className={styles.chartGuideLine} />
            </div>
            {/* Barras */}
            <div className={styles.chart}>
              {receitaPorDia.map((v, i) => (
                <div key={i} className={styles.chartCol} title={`Dia ${i + 1}: ${fmtR(v)}`}>
                  <div className={styles.chartBar}
                    style={{ height: `${(v / maxReceita) * 100}%`, opacity: v > 0 ? 1 : 0.08 }} />
                </div>
              ))}
            </div>
            {/* Eixo X */}
            <div className={styles.chartAxis}>
              {receitaPorDia.map((_, i) => (
                <div key={i} className={styles.chartAxisCol}>
                  {(i + 1) % 5 === 0 && (
                    <span className={styles.chartAxisLabel}>{i + 1}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ranking */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Produtos mais vendidos</div>
          {rankingProdutos.length === 0
            ? <div className={styles.empty}>Nenhum item vendido ainda</div>
            : <div className={styles.rankingList}>
                {rankingProdutos.map((p, i) => (
                  <div key={i} className={styles.rankingItem}>
                    <div className={styles.rankingPos}>{i + 1}</div>
                    <div className={styles.rankingInfo}>
                      <div className={styles.rankingName}>{p.name}</div>
                      <div className={styles.rankingTrack}>
                        <div className={styles.rankingFill}
                          style={{ width: `${(p.qty / rankingProdutos[0].qty) * 100}%` }} />
                      </div>
                    </div>
                    <div className={styles.rankingQty}>{p.qty} un.</div>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>

      {/* Linha inferior */}
      <div className={styles.bottomRow}>

        {/* Datas de retirada */}
        {pedidosPorData.length > 0 && (
          <div className={styles.card}>
            <div className={styles.cardTitle}>Pedidos por data de retirada</div>
            {pedidosPorData.map(([data, qty]) => (
              <div key={data} className={styles.dataRow}>
                <span className={styles.dataRowLabel}>
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <rect x="0.5" y="1.5" width="10" height="9" rx="1.5"/>
                    <path d="M0.5 5h10M3 0.5v2M8 0.5v2"/>
                  </svg>
                  {data}
                </span>
                <span className={styles.dataRowQty}>{qty} pedido{qty !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        )}

        {/* Cancelamentos */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Cancelamentos</div>
          <div className={styles.cancelNum}>{pedidosCancelados.length}</div>
          <div className={styles.cancelLabel}>pedido{pedidosCancelados.length !== 1 ? 's' : ''} cancelado{pedidosCancelados.length !== 1 ? 's' : ''}</div>
          {pedidosFiltrados.length > 0 && (
            <>
              <div className={styles.cancelTaxa}>{taxaCancel.toFixed(1).replace('.', ',')}% do total</div>
              <div className={styles.progressTrack}>
                <div className={styles.progressFillRed} style={{ width: `${Math.min(taxaCancel, 100)}%` }} />
              </div>
            </>
          )}
        </div>

        {/* Distribuição por status */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Distribuição por status</div>
          {['aguardando_pagamento','pagamento_aprovado','em_preparo','pronto','entregue','cancelado'].map(s => {
            const count = pedidosFiltrados.filter(o => o.status === s).length
            if (!count) return null
            return (
              <div key={s} className={styles.statusRow}>
                <span className={styles.statusDot} style={{ background: STATUS_COLOR[s] }} />
                <span className={styles.statusRowLabel}>{STATUS_LABEL[s]}</span>
                <span className={styles.statusRowCount}>{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tabela de pedidos recentes */}
      <div className={styles.sectionTitle}>Pedidos de {MESES[mes]}</div>
      <div className={styles.tableWrap}>
        {pedidosFiltrados.length === 0
          ? <div className={styles.empty}>Nenhum pedido neste mês.</div>
          : <table className={styles.table}>
              <thead><tr>
                <th>#</th><th>Cliente</th><th>Total</th><th>Status</th><th>Data</th>
              </tr></thead>
              <tbody>
                {pedidosFiltrados.slice(0, 10).map(o => (
                  <tr key={o.id}>
                    <td className={styles.tdId}>#{o.id?.toString().slice(-6)}</td>
                    <td>{o.customerName}</td>
                    <td className={styles.tdTotal}>{fmtR(o.total || 0)}</td>
                    <td>
                      <span className={styles.badge}
                        style={{ background: STATUS_COLOR[o.status] + '18', color: STATUS_COLOR[o.status] }}>
                        {STATUS_LABEL[o.status]}
                      </span>
                    </td>
                    <td className={styles.tdMuted}>{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
        }
      </div>
    </div>
  )
}