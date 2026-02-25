import { useState } from 'react'
import { PIX_KEY } from '../../data/mock'
import styles from './PixConfirmacao.module.css'

export default function PixConfirmacao({ pedido, onNovoPedido }) {
  const [copiado, setCopiado] = useState(false)

  const copiar = () => {
    navigator.clipboard?.writeText(PIX_KEY).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    })
  }

  return (
    <div className={styles.page}>
      <div className={styles.logoTop}><img src="/logo-simbolo.png" alt="" className={styles.logoTopImg} /></div>
      <div className={styles.eyebrow}>
        <div className={styles.checkCircle}>
          <svg className={styles.checkIcon} viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1.5 5l2.5 2.5 4.5-5"/>
          </svg>
        </div>
        Pedido #{pedido.id} recebido
      </div>

      <h2 className={styles.title}>Quase lá.<br />Pague com Pix.</h2>

      <p className={styles.subtitle}>
        Após o pagamento, entraremos em contato no seu WhatsApp para confirmar e combinar a entrega.
      </p>

      <div className={styles.divider} />

      <div className={styles.valorSection}>
        <div className={styles.valorLabel}>Valor a pagar</div>
        <div className={styles.valor}>R$ {pedido.total.toFixed(2).replace('.', ',')}</div>
      </div>

      <div className={styles.pixSection}>
        <div className={styles.pixLabel}>Chave Pix</div>
        <div className={styles.pixKeyBox}>
          <span className={styles.pixKey}>{PIX_KEY}</span>
          <button className={`${styles.copyBtn} ${copiado ? styles.copied : ''}`} onClick={copiar}>
            {copiado ? (
              <>
                <svg className={styles.copyIcon} viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 6.5l3.5 3.5L12 2"/>
                </svg>
                Copiado
              </>
            ) : (
              <>
                <svg className={styles.copyIcon} viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="4" y="4" width="8" height="8" rx="1.5"/>
                  <path d="M9 4V2.5A1.5 1.5 0 007.5 1h-5A1.5 1.5 0 001 2.5v5A1.5 1.5 0 002.5 9H4"/>
                </svg>
                Copiar
              </>
            )}
          </button>
        </div>
      </div>

      <div className={styles.note}>
        Após o pagamento, guarde o comprovante. Em caso de dúvidas, entre em contato pelo WhatsApp.
      </div>

      <button className={styles.novoBtn} onClick={onNovoPedido}>
        Fazer outro pedido
      </button>
    </div>
  )
}