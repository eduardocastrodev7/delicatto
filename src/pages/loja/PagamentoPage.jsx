import { useState } from 'react'
import { PIX_KEY } from '../../data/mock'
import styles from './PagamentoPage.module.css'

export default function PagamentoPage({ pedido, onNovoPedido }) {
  const [metodo, setMetodo] = useState(null) // 'pix' | 'cartao'
  const [copiado, setCopiado] = useState(false)
  const [redirecionando, setRedirecionando] = useState(false)

  const copiarPix = () => {
    navigator.clipboard?.writeText(PIX_KEY).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    })
  }

  const pagarCartao = () => {
    setRedirecionando(true)
    // Aqui será a chamada real ao backend que cria a preferência no Mercado Pago
    // e retorna o init_point (URL de checkout). Por ora, simula o redirect.
    setTimeout(() => {
      alert('Integração Mercado Pago será ativada após configuração do backend Supabase.\n\nEm produção, o cliente será redirecionado automaticamente para o checkout do Mercado Pago.')
      setRedirecionando(false)
    }, 1000)
  }

  return (
    <div className={styles.page}>
      {/* Logo */}
      <div className={styles.logoTop}>
        <img src="/logo-simbolo.png" alt="Delicatto" className={styles.logoTopImg} />
      </div>

      {/* Confirmação */}
      <div className={styles.eyebrow}>
        <div className={styles.checkCircle}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="white" strokeWidth="2">
            <path d="M1.5 5.5l2.5 2.5 5-5"/>
          </svg>
        </div>
        Pedido #{pedido.id} recebido
      </div>

      <h2 className={styles.title}>Escolha como<br />quer pagar.</h2>

      <p className={styles.subtitle}>
        Após a confirmação do pagamento, entraremos em contato pelo WhatsApp para combinar os detalhes.
      </p>

      <div className={styles.divider} />

      {/* Valor */}
      <div className={styles.valorSection}>
        <div className={styles.valorLabel}>Valor total</div>
        <div className={styles.valor}>R$ {pedido.total.toFixed(2).replace('.', ',')}</div>
      </div>

      {/* Opções de pagamento */}
      {!metodo && (
        <div className={styles.metodos}>
          <button className={styles.metodoBtn} onClick={() => setMetodo('pix')}>
            <div className={styles.metodoIcon}>
              <PixIcon />
            </div>
            <div className={styles.metodoInfo}>
              <span className={styles.metodoLabel}>Pix</span>
              <span className={styles.metodoSub}>Aprovação imediata</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M5 2l5 5-5 5"/>
            </svg>
          </button>

          <button className={styles.metodoBtn} onClick={() => setMetodo('cartao')}>
            <div className={styles.metodoIcon}>
              <CartaoIcon />
            </div>
            <div className={styles.metodoInfo}>
              <span className={styles.metodoLabel}>Cartão de crédito</span>
              <span className={styles.metodoSub}>Via Mercado Pago · até 12x</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M5 2l5 5-5 5"/>
            </svg>
          </button>
        </div>
      )}

      {/* Pix selecionado */}
      {metodo === 'pix' && (
        <div className={styles.pixSection}>
          <button className={styles.voltarMetodo} onClick={() => setMetodo(null)}>
            ← Trocar forma de pagamento
          </button>

          <div className={styles.pixLabel}>Chave Pix</div>
          <div className={styles.pixKeyBox}>
            <span className={styles.pixKey}>{PIX_KEY}</span>
            <button className={`${styles.copyBtn} ${copiado ? styles.copied : ''}`} onClick={copiarPix}>
              {copiado ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 6l3 3 7-6"/>
                  </svg>
                  Copiado
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="4" y="4" width="7" height="7" rx="1"/>
                    <path d="M8 4V2.5A1.5 1.5 0 006.5 1h-4A1.5 1.5 0 001 2.5v4A1.5 1.5 0 002.5 8H4"/>
                  </svg>
                  Copiar
                </>
              )}
            </button>
          </div>

          <div className={styles.pixSteps}>
            <div className={styles.step}><span>1</span> Abra o app do seu banco</div>
            <div className={styles.step}><span>2</span> Selecione Pix → Pagar → Chave</div>
            <div className={styles.step}><span>3</span> Cole a chave e confirme o valor <strong>R$ {pedido.total.toFixed(2).replace('.', ',')}</strong></div>
            <div className={styles.step}><span>4</span> Envie o comprovante pelo WhatsApp</div>
          </div>
        </div>
      )}

      {/* Cartão selecionado */}
      {metodo === 'cartao' && (
        <div className={styles.cartaoSection}>
          <button className={styles.voltarMetodo} onClick={() => setMetodo(null)}>
            ← Trocar forma de pagamento
          </button>

          <div className={styles.cartaoInfo}>
            <div className={styles.mpLogo}>
              <MpIcon />
              <span>Mercado Pago</span>
            </div>
            <p className={styles.cartaoDesc}>
              Você será redirecionado para o ambiente seguro do Mercado Pago para concluir o pagamento com cartão de crédito em até 12x.
            </p>
            <ul className={styles.cartaoFeatures}>
              <li>Ambiente 100% seguro</li>
              <li>Aprovação em instantes</li>
              <li>Parcelamento sem juros disponível</li>
            </ul>
          </div>

          <button
            className={styles.pagarBtn}
            onClick={pagarCartao}
            disabled={redirecionando}
          >
            {redirecionando ? 'Redirecionando...' : `Pagar R$ ${pedido.total.toFixed(2).replace('.', ',')} com cartão`}
          </button>
        </div>
      )}

      <div className={styles.note}>
        Após o pagamento, guarde o comprovante. Em caso de dúvidas, entre em contato pelo WhatsApp.
      </div>

      <button className={styles.novoBtn} onClick={onNovoPedido}>
        Fazer outro pedido
      </button>
    </div>
  )
}

// Ícones SVG
const PixIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#32BCAD' }}>
    <path d="M14.25 2.26a3.85 3.85 0 00-2.73 1.13l-2.17 2.17a.64.64 0 01-.9 0l-2.17-2.17A3.85 3.85 0 003.55 2.26H2.5l3.23 3.23a2.5 2.5 0 003.54 0l3.23-3.23h-2.25zM9.73 13.26a2.5 2.5 0 01-3.54 0L2.96 10H1.9a3.85 3.85 0 001.14 2.73l2.17 2.17a.64.64 0 010 .9l-2.17 2.17A3.85 3.85 0 002.9 20.5h1.05l3.24-3.24a2.5 2.5 0 000-3.54l-3.24-3.23H5l4.73 4.73zM14.27 10.74a2.5 2.5 0 000 3.54l3.24 3.23H19a3.85 3.85 0 00-1.14-2.74l-2.17-2.17a.64.64 0 010-.9l2.17-2.17A3.85 3.85 0 0019 6.5h-1.49l-3.24 3.24zM10.27 9.27L6.96 5.96H5.9a3.85 3.85 0 001.14 2.74l2.17 2.17a.64.64 0 010 .9l-2.17 2.17A3.85 3.85 0 005.9 16.5h1.06l3.31-3.31a2.5 2.5 0 000-3.92z"/>
  </svg>
)

const CartaoIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ color: 'var(--brown)' }}>
    <rect x="2" y="5" width="20" height="14" rx="2"/>
    <line x1="2" y1="10" x2="22" y2="10"/>
  </svg>
)

const MpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#00b1ea">
    <circle cx="12" cy="12" r="12"/>
    <text x="12" y="17" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">MP</text>
  </svg>
)