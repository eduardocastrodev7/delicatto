import { useApp } from '../../context/AppContext'
import { STATUS_LABEL, STATUS_COLOR } from '../../data/mock'
import styles from './Dashboard.module.css'

const STAT_ACCENTS = ['#6b4c30', '#4a7c59', '#b07830', '#6b5080', '#3d2810']

export default function Dashboard() {
  const { stats, orders } = useApp()

  const statItems = [
    { value: stats.totalOrders,    label: 'Total de pedidos',      prefix: '' },
    { value: stats.totalRevenue,   label: 'Receita confirmada',    prefix: 'R$ ' },
    { value: stats.pending,        label: 'Pendentes',             prefix: '' },
    { value: stats.preparing,      label: 'Em preparo',            prefix: '' },
    { value: stats.totalCustomers, label: 'Clientes cadastrados',  prefix: '' },
  ]

  const fmt = (v) => typeof v === 'number' && v % 1 !== 0
    ? v.toFixed(2).replace('.', ',')
    : String(v)

  return (
    <div>
      <div className={styles.statsGrid}>
        {statItems.map((s, i) => (
          <div key={i} className={styles.statCard}>
            <div className={styles.accentBar} style={{ background: STAT_ACCENTS[i] }} />
            <div className={styles.statNum}>{s.prefix}{fmt(s.value)}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.sectionTitle}>Pedidos recentes</div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr>
            <th>#</th><th>Cliente</th><th>Total</th><th>Status</th><th>Data</th>
          </tr></thead>
          <tbody>
            {orders.slice(0, 6).map((o) => (
              <tr key={o.id}>
                <td className={styles.tdId}>#{o.id}</td>
                <td>{o.customerName}</td>
                <td className={styles.tdTotal}>R$ {o.total.toFixed(2).replace('.', ',')}</td>
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
      </div>
    </div>
  )
}