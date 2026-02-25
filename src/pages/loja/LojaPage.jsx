import { useState } from 'react'
import Cardapio from './Cardapio'
import Checkout from './Checkout'
import PagamentoPage from './PagamentoPage'

export default function LojaPage() {
  const [step, setStep] = useState('cardapio') // 'cardapio' | 'checkout' | 'pagamento'
  const [pedido, setPedido] = useState(null)

  const handleConcluir = (pedidoData) => {
    setPedido(pedidoData)
    setStep('pagamento')
  }

  const handleNovoPedido = () => {
    setPedido(null)
    setStep('cardapio')
  }

  return (
    <>
      {step === 'cardapio' && (
        <Cardapio onCheckout={() => setStep('checkout')} />
      )}
      {step === 'checkout' && (
        <Checkout
          onBack={() => setStep('cardapio')}
          onConcluir={handleConcluir}
        />
      )}
      {step === 'pagamento' && pedido && (
        <PagamentoPage
          pedido={pedido}
          onNovoPedido={handleNovoPedido}
        />
      )}
    </>
  )
}