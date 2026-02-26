import { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { STATUS_LABEL, STATUS_COLOR } from '../../data/mock'
import styles from './Dashboard.module.css'

const STAT_ACCENTS = ['#5c2d0e', '#3d6b45', '#9a6010', '#5b4070', '#3a1c0a']

const MESES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
]

export default function Dashboard() {
  const { orders, customers } = useApp()

  const now      = new Date()
  const [mes, setMes]   = useState(now.getMonth())
  const [ano, setAno]   = useState(now.getFullYear())

  // Anos disponíveis baseados nos pedidos
  const anosDisponiveis = useMemo(() => {
    const s = new Set(orders.map(o => (o.createdAtDate || new Date(o.created_at)).getFullYear()).filter(a => !isNaN(a)))
    s.add(now.getFullYear())
    return [...s].sort((a, b) => b - a)
  }, [orders])

  // Filtra pedidos do mês/ano selecionado
  const pedidosFiltrados = useMemo(() => orders.filter(o => {
    const d = o.createdAtDate || new Date(o.created_at)
    return d instanceof Date && !isNaN(d) && d.getMonth() === mes && d.getFullYear() === ano
  }), [orders, mes, ano])

  const receita   = pedidosFiltrados
    .filter(o => o.status === 'entregue' || o.status === 'concluido')
    .reduce((s, o) => s + (o.total || 0), 0)

  const pendentes  = pedidosFiltrados.filter(o => o.status === 'aguardando_pagamento').length
  const em_preparo = pedidosFiltrados.filter(o => o.status === 'em_preparo').length

  const statItems = [
    { value: pedidosFiltrados.length, label: 'Pedidos no mês',      prefix: '' },
    { value: receita,                  label: 'Receita confirmada',  prefix: 'R$ ' },
    { value: pendentes,                label: 'Pendentes',           prefix: '' },
    { value: em_preparo,               label: 'Em preparo',          prefix: '' },
    { value: customers.length,         label: 'Clientes totais',     prefix: '' },
  ]

  const fmt = (v) => typeof v === 'number' && v % 1 !== 0
    ? v.toFixed(2).replace('.', ',')
    : String(v ?? 0)

  // Gráfico de receita por dia no mês
  const diasNoMes = new Date(ano, mes + 1, 0).getDate()
  const receitaPorDia = useMemo(() => {
    const dias = Array(diasNoMes).fill(0)
    pedidosFiltrados
      .filter(o => o.status === 'entregue' || o.status === 'concluido')
      .forEach(o => {
        const d = new Date(o.created_at || o.date).getDate()
        if (d >= 1 && d <= diasNoMes) dias[d - 1] += (o.total || 0)
      })
    return dias
  }, [pedidosFiltrados, diasNoMes])

  const maxReceita = Math.max(...receitaPorDia, 1)

  return (
    <div>
      {/* ── Filtro de mês ── */}
      <div className={styles.filterRow}>
        <select className={styles.select} value={mes} onChange={e => setMes(Number(e.target.value))}>
          {MESES.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <select className={styles.select} value={ano} onChange={e => setAno(Number(e.target.value))}>
          {anosDisponiveis.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <span className={styles.filterLabel}>
          {pedidosFiltrados.length} pedidos em {MESES[mes]} {ano}
        </span>
      </div>

      {/* ── Stats ── */}
      <div className={styles.statsGrid}>
        {statItems.map((s, i) => (
          <div key={i} className={styles.statCard}>
            <div className={styles.accentBar} style={{ background: STAT_ACCENTS[i] }} />
            <div className={styles.statNum}>{s.prefix}{fmt(s.value)}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Gráfico receita por dia ── */}
      {pedidosFiltrados.length > 0 && (
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>Receita confirmada por dia — {MESES[mes]}</div>
          <div className={styles.chart}>
            {receitaPorDia.map((v, i) => (
              <div key={i} className={styles.chartCol} title={`Dia ${i+1}: R$ ${v.toFixed(2).replace('.',',' )}`}>
                <div
                  className={styles.chartBar}
                  style={{ height: `${(v / maxReceita) * 100}%`, opacity: v > 0 ? 1 : 0.15 }}
                />
                {(i + 1) % 5 === 0 && (
                  <div className={styles.chartLabel}>{i + 1}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Pedidos recentes ── */}
      <div className={styles.sectionTitle}>Pedidos de {MESES[mes]}</div>
      <div className={styles.tableWrap}>
        {pedidosFiltrados.length === 0 ? (
          <div className={styles.empty}>Nenhum pedido neste mês.</div>
        ) : (
          <table className={styles.table}>
            <thead><tr>
              <th>#</th><th>Cliente</th><th>Total</th><th>Status</th><th>Data</th>
            </tr></thead>
            <tbody>
              {pedidosFiltrados.slice(0, 10).map((o) => (
                <tr key={o.id}>
                  <td className={styles.tdId}>#{o.id?.toString().slice(-6)}</td>
                  <td>{o.customerName}</td>
                  <td className={styles.tdTotal}>R$ {(o.total||0).toFixed(2).replace('.', ',')}</td>
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
        )}
      </div>
    </div>
  )
}