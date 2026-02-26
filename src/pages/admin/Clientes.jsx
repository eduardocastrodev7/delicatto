import { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import shared from './admin.shared.module.css'
import styles from './Clientes.module.css'

const WhatsAppIcon = () => (
  <svg className={styles.waIcon} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

export default function Clientes() {
  const { customers } = useApp()
  const [expandido, setExpandido] = useState(null)
  const [busca, setBusca]         = useState('')
  const [exportando, setExportando] = useState(false)

  const toggle = (id) => setExpandido((prev) => prev === id ? null : id)

  // Busca por nome, telefone ou instagram
  const filtrados = useMemo(() => {
    const q = busca.toLowerCase().trim().replace(/^@/, '') // remove @ se digitado
    if (!q) return customers
    return customers.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.phone?.replace(/\D/g, '').includes(q.replace(/\D/g, '')) ||
      c.instagram?.toLowerCase().replace(/^@/, '').includes(q)
    )
  }, [customers, busca])

  // Exportar CSV
  const exportarCSV = () => {
    setExportando(true)
    try {
      const linhas = [
        ['Nome', 'Telefone', 'Instagram', 'Total de Pedidos', 'Endereço'],
        ...customers.map(c => [
          c.name || '',
          c.phone || '',
          c.instagram ? `@${c.instagram}` : '',
          c.totalOrders || 0,
          c.endereco || '',
        ])
      ]
      const csv = linhas
        .map(l => l.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
        .join('\n')
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
      const url  = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href     = url
      link.download = `clientes-delicatto-${new Date().toISOString().slice(0,10)}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (e) { alert('Erro ao exportar: ' + e.message) }
    setExportando(false)
  }

  return (
    <div>
      {/* ── Barra de busca + exportar ── */}
      <div className={styles.topBar}>
        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="6.5" cy="6.5" r="4.5"/>
            <path d="M10.5 10.5L14 14"/>
          </svg>
          <input
            className={styles.searchInput}
            placeholder="Buscar por nome, telefone ou @instagram..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
          {busca && (
            <button className={styles.clearBtn} onClick={() => setBusca('')}>×</button>
          )}
        </div>

        <button
          className={styles.exportBtn}
          onClick={exportarCSV}
          disabled={exportando || customers.length === 0}
        >
          {exportando ? 'Exportando...' : (
            <>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6.5 1v8M3.5 6l3 3 3-3"/>
                <path d="M1 10v1a1 1 0 001 1h9a1 1 0 001-1v-1"/>
              </svg>
              Exportar CSV
            </>
          )}
        </button>
      </div>

      {/* Contador */}
      <div className={styles.contador}>
        {busca
          ? `${filtrados.length} resultado${filtrados.length !== 1 ? 's' : ''} para "${busca}"`
          : `${customers.length} cliente${customers.length !== 1 ? 's' : ''} cadastrado${customers.length !== 1 ? 's' : ''}`
        }
      </div>

      {customers.length === 0 && (
        <div className={styles.empty}>Nenhum cliente cadastrado ainda.</div>
      )}

      {filtrados.length === 0 && busca && (
        <div className={styles.empty}>Nenhum cliente encontrado para "{busca}".</div>
      )}

      <div className={styles.list}>
        {filtrados.map((c) => (
          <div key={c.id} className={styles.clienteCard}>
            <div className={styles.clienteMain}>
              <div className={styles.clienteAvatar}>
                {c.name.charAt(0).toUpperCase()}
              </div>

              <div className={styles.clienteInfo}>
                <div className={styles.clienteName}>{c.name}</div>
                <div className={styles.clienteMeta}>
                  {c.instagram && (
                    <span className={styles.instagram}>@{c.instagram}</span>
                  )}
                  {c.endereco && (
                    <span className={styles.endereco} title={c.endereco}>
                      {c.endereco.length > 40 ? c.endereco.slice(0, 40) + '…' : c.endereco}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.clienteActions}>
                <a
                  href={`https://wa.me/55${c.phone.replace(/\D/g, '')}`}
                  target="_blank" rel="noreferrer"
                  className={styles.waLink}
                >
                  <WhatsAppIcon />
                  {c.phone}
                </a>

                <span className={shared.badge} style={{ background: '#6b4c3018', color: 'var(--brown)' }}>
                  {c.totalOrders} {c.totalOrders === 1 ? 'pedido' : 'pedidos'}
                </span>

                {c.pedidos?.length > 0 && (
                  <button className={styles.expandBtn} onClick={() => toggle(c.id)}>
                    {expandido === c.id ? 'Fechar' : 'Ver pedidos'}
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8"
                      style={{ transform: expandido === c.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                      <path d="M2 3.5l3 3 3-3"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {expandido === c.id && c.pedidos?.length > 0 && (
              <div className={styles.historico}>
                <div className={styles.historicoTitle}>Histórico de pedidos</div>
                {c.pedidos.map((p) => (
                  <div key={p.id} className={styles.historicoPedido}>
                    <span className={styles.historicoId}>#{p.id?.toString().slice(-6)}</span>
                    <span className={styles.historicoData}>{p.date}</span>
                    <span className={styles.historicoItens}>
                      {p.items?.map((i) => `${i.name} ×${i.qty}`).join(', ')}
                    </span>
                    <span className={styles.historicoTotal}>
                      R$ {(p.total||0).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}