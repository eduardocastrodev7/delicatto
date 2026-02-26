import { useState } from 'react'
import styles from './PagamentoPage.module.css'

const PIX_KEY  = 'l.tasso@hotmail.com'
const PIX_NAME = 'Lucas Tasso'
const WHATSAPP = '5516992379037'

// ─── Ícone Pix — SVG oficial (SVG Repo) ────────────────────────────
const PixLogo = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="#00BDAE" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pix">
    <path d="M11.917 11.71a2.046 2.046 0 0 1-1.454-.602l-2.1-2.1a.4.4 0 0 0-.551 0l-2.108 2.108a2.044 2.044 0 0 1-1.454.602h-.414l2.66 2.66c.83.83 2.177.83 3.007 0l2.667-2.668h-.253zM4.25 4.282c.55 0 1.066.214 1.454.602l2.108 2.108a.39.39 0 0 0 .552 0l2.1-2.1a2.044 2.044 0 0 1 1.453-.602h.253L9.503 1.623a2.127 2.127 0 0 0-3.007 0l-2.66 2.66h.414z"/>
    <path d="m14.377 6.496-1.612-1.612a.307.307 0 0 1-.114.023h-.733c-.379 0-.75.154-1.017.422l-2.1 2.1a1.005 1.005 0 0 1-1.425 0L5.268 5.32a1.448 1.448 0 0 0-1.018-.422h-.9a.306.306 0 0 1-.109-.021L1.623 6.496c-.83.83-.83 2.177 0 3.008l1.618 1.618a.305.305 0 0 1 .108-.022h.901c.38 0 .75-.153 1.018-.421L7.375 8.57a1.034 1.034 0 0 1 1.426 0l2.1 2.1c.267.268.638.421 1.017.421h.733c.04 0 .079.01.114.024l1.612-1.612c.83-.83.83-2.178 0-3.008z"/>
  </svg>
)

// ─── Ícone WhatsApp — path oficial do Simple Icons ───────────────────
const WhatsAppLogo = ({ size = 40, color = '#25D366' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="WhatsApp">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.031-.967-.272-.099-.47-.148-.67.15-.196.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.064 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.999-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
  </svg>
)

// ─── Ícone cartão de crédito (Lucide CreditCard paths) ───────────────
const CreditCardIcon = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#5c3218" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
    <line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
)

export default function PagamentoPage({ pedido, onNovoPedido }) {
  const [metodo, setMetodo]   = useState(null)
  const [copiado, setCopiado] = useState(false)

  const total = pedido?.total ?? 0

  const copiarPix = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY)
    } catch {
      const el = document.createElement('textarea')
      el.value = PIX_KEY
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2500)
  }

  const msgWhatsApp = encodeURIComponent(
    `Olá! Fiz um pedido na Delicatto e gostaria de pagar no cartão.\n\n` +
    `Pedido #${pedido?.id || '—'} — Total: R$ ${total.toFixed(2).replace('.', ',')}\n\n` +
    `Pode me enviar o link de pagamento?`
  )
  const msgComprovante = encodeURIComponent(
    `Olá! Segue o comprovante do meu pedido na Delicatto.\n\n` +
    `Pedido #${pedido?.id || '—'} — R$ ${total.toFixed(2).replace('.', ',')}`
  )
  const whatsappCartao     = `https://wa.me/${WHATSAPP}?text=${msgWhatsApp}`
  const whatsappComprovante = `https://wa.me/${WHATSAPP}?text=${msgComprovante}`

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* ── Confirmação ── */}
        <div className={styles.confirmCard}>
          <div className={styles.checkIcon}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 14l6 6L23 8"/>
            </svg>
          </div>
          <h1 className={styles.title}>Pedido recebido!</h1>
          <p className={styles.subtitle}>
            Pedido <strong>#{pedido?.id}</strong> · R$ {total.toFixed(2).replace('.', ',')}
          </p>
          <p className={styles.desc}>
            Escolha como deseja pagar. Após enviarmos a confirmação, começamos a preparar seus doces. 🍫
          </p>
        </div>

        {/* ── Seleção de método ── */}
        {!metodo && (
          <div className={styles.metodosGrid}>
            <button className={styles.metodoCard} onClick={() => setMetodo('pix')}>
              <div className={styles.metodoIconWrap}>
                <PixLogo size={32} />
              </div>
              <div className={styles.metodoInfo}>
                <div className={styles.metodoNome}>Pix</div>
                <div className={styles.metodoDesc}>Rápido e sem taxas</div>
              </div>
              <span className={styles.metodoArrow}>›</span>
            </button>

            <button className={styles.metodoCard} onClick={() => setMetodo('cartao')}>
              <div className={styles.metodoIconWrap} style={{ background: 'rgba(92,50,24,0.08)' }}>
                <CreditCardIcon size={28} />
              </div>
              <div className={styles.metodoInfo}>
                <div className={styles.metodoNome}>Cartão de crédito</div>
                <div className={styles.metodoDesc}>Link via WhatsApp</div>
              </div>
              <span className={styles.metodoArrow}>›</span>
            </button>
          </div>
        )}

        {/* ── PIX ── */}
        {metodo === 'pix' && (
          <div className={styles.metodoPainel}>
            <button className={styles.voltarBtn} onClick={() => setMetodo(null)}>← Voltar</button>

            <div className={styles.pixCard}>
              <div className={styles.pixHeader}>
                <span className={styles.pixTitulo}>Pague via Pix</span>
                <span className={styles.pixValor}>R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>

              <div className={styles.pixPassos}>
                {[
                  <>Abra o app do seu banco e acesse a área <strong>Pix</strong></>,
                  <>Escolha <strong>Pix Copia e Cola</strong> ou <strong>Pagar com chave</strong></>,
                  <>Cole a chave abaixo e confira o nome <strong>{PIX_NAME}</strong></>,
                  <>Digite o valor <strong>R$ {total.toFixed(2).replace('.', ',')}</strong> e confirme</>,
                  <>Envie o <strong>comprovante</strong> para nosso WhatsApp para confirmarmos seu pedido</>,
                ].map((texto, i) => (
                  <div key={i} className={styles.pixPasso}>
                    <span className={styles.pixNum}>{i + 1}</span>
                    <span>{texto}</span>
                  </div>
                ))}
              </div>

              <div className={styles.pixKeyBox}>
                <div className={styles.pixKeyLabel}>Chave Pix (e-mail)</div>
                <div className={styles.pixKeyRow}>
                  <span className={styles.pixKey}>{PIX_KEY}</span>
                  <button
                    className={`${styles.copiarBtn} ${copiado ? styles.copiado : ''}`}
                    onClick={copiarPix}
                  >
                    {copiado ? '✓ Copiado!' : 'Copiar chave'}
                  </button>
                </div>
              </div>

              <div className={styles.comprovWrapper}>
                <div className={styles.comprovTitle}>Pagou? Manda o comprovante! 🎉</div>
                <p className={styles.comprovDesc}>
                  Assim que confirmarmos, seu pedido entra em produção imediatamente.
                </p>
                <a
                  href={whatsappComprovante}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.comprovBtn}
                >
                  <WhatsAppLogo size={18} color="white" />
                  Enviar comprovante pelo WhatsApp
                </a>
              </div>
            </div>

            <button className={styles.novoPedidoBtn} onClick={onNovoPedido}>
              Fazer novo pedido
            </button>
          </div>
        )}

        {/* ── CARTÃO ── */}
        {metodo === 'cartao' && (
          <div className={styles.metodoPainel}>
            <button className={styles.voltarBtn} onClick={() => setMetodo(null)}>← Voltar</button>

            <div className={styles.cartaoCard}>
              <div className={styles.cartaoIconWrap}>
                <WhatsAppLogo size={48} />
              </div>
              <h2 className={styles.cartaoTitulo}>Pagar no cartão</h2>
              <p className={styles.cartaoDesc}>
                Vamos te enviar um link de pagamento seguro direto pelo WhatsApp. É só clicar e inserir os dados do seu cartão.
              </p>
              <div className={styles.cartaoChecks}>
                <div className={styles.cartaoCheck}>✓ Link seguro e criptografado</div>
                <div className={styles.cartaoCheck}>✓ Resposta em minutos</div>
              </div>
              <a
                href={whatsappCartao}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.whatsappBtn}
              >
                <WhatsAppLogo size={20} color="white" />
                Falar no WhatsApp
              </a>
            </div>

            <button className={styles.novoPedidoBtn} onClick={onNovoPedido}>
              Fazer novo pedido
            </button>
          </div>
        )}

      </div>
    </div>
  )
}