import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import AdminPage from './AdminPage'
import styles from './AdminLayout.module.css'

export default function AdminLayout() {
  const { admin, logoutAdmin } = useAuth()

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logoWrap}>
            <img src="/logo-simbolo.png" alt="" className={styles.logoImg} />
            <div className={styles.logoText}>
              <span className={styles.logoName}>Delicatto</span>
              <span className={styles.logoPainel}>Painel Admin</span>
            </div>
          </div>

          <div className={styles.adminInfo}>
            <div className={styles.adminAvatar}>
              {admin?.name?.charAt(0).toUpperCase()}
            </div>
            <span className={styles.adminName}>{admin?.name}</span>
            <button className={styles.logoutBtn} onClick={logoutAdmin}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <AdminPage />
      </main>
    </div>
  )
}