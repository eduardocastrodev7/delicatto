import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import Dashboard from './Dashboard'
import Produtos from './Produtos'
import Pedidos from './Pedidos'
import Clientes from './Clientes'
import styles from './AdminPage.module.css'

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'pedidos',   label: 'Pedidos'   },
  { id: 'produtos',  label: 'Produtos'  },
  { id: 'clientes',  label: 'Clientes'  },
]

export default function AdminPage() {
  const [tab, setTab] = useState('dashboard')
  const { loadOrders, loadCustomers, loadProducts } = useApp()

  // Carrega dados do banco ao entrar no admin
  useEffect(() => {
    loadOrders()
    loadCustomers()
    loadProducts()
  }, [])

  return (
    <div className={styles.page}>
      <nav className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className={styles.content}>
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'pedidos'   && <Pedidos />}
        {tab === 'produtos'  && <Produtos />}
        {tab === 'clientes'  && <Clientes />}
      </div>
    </div>
  )
}