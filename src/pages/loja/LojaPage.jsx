import { useState, useEffect } from 'react'
import Cardapio from './Cardapio'
import Checkout from './Checkout'
import PagamentoPage from './PagamentoPage'

export default function LojaPage() {
  // Recupera step e pedido do sessionStorage para sobreviver a refresh no Vercel
  const [step, setStep] = useState(() => {
    try { return sessionStorage.getItem('loja_step') || 'cardapio' } catch { return 'cardapio' }
  })
  const [pedido, setPedido] = useState(() => {
    try {
      const saved = sessionStorage.getItem('loja_pedido')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })

  const goTo = (newStep, newPedido = null) => {
    try {
      sessionStorage.setItem('loja_step', newStep)
      if (newPedido) sessionStorage.setItem('loja_pedido', JSON.stringify(newPedido))
    } catch {}
    setStep(newStep)
    if (newPedido !== null) setPedido(newPedido)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleConcluir = (pedidoData) => goTo('pagamento', pedidoData)

  const handleNovoPedido = () => {
    try {
      sessionStorage.removeItem('loja_step')
      sessionStorage.removeItem('loja_pedido')
    } catch {}
    setPedido(null)
    setStep('cardapio')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      {step === 'cardapio' && (
        <Cardapio onCheckout={() => goTo('checkout')} />
      )}
      {step === 'checkout' && (
        <Checkout
          onBack={() => goTo('cardapio')}
          onConcluir={handleConcluir}
        />
      )}
      {step === 'pagamento' && pedido && (
        <PagamentoPage
          pedido={pedido}
          onNovoPedido={handleNovoPedido}
        />
      )}
      {/* Fallback: se pagamento mas sem pedido, volta pro cardápio */}
      {step === 'pagamento' && !pedido && (
        <Cardapio onCheckout={() => goTo('checkout')} />
      )}
    </>
  )
}