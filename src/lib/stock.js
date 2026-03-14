import { supabase } from './supabase'

const RESERVATION_MINUTES = 15

// Gera ou recupera session_id único por aba
export function getSessionId() {
  let id = sessionStorage.getItem('cart_session_id')
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`
    sessionStorage.setItem('cart_session_id', id)
  }
  return id
}

// Busca estoque disponível de um produto (total - reservado)
export async function fetchAvailableStock(productId) {
  const { data, error } = await supabase
    .rpc('available_stock', { p_product_id: productId })
  if (error) throw error
  return data // null = sem controle
}

// Reserva estoque ao adicionar no carrinho
// items: [{ productId, qty }]
export async function reserveStock(items) {
  const sessionId = getSessionId()
  const expiresAt = new Date(Date.now() + RESERVATION_MINUTES * 60 * 1000).toISOString()

  // Verifica disponibilidade antes de reservar
  for (const item of items) {
    const { data: available } = await supabase
      .rpc('available_stock', { p_product_id: item.productId })
    if (available !== null && available < item.qty) {
      return { ok: false, reason: 'Estoque insuficiente' }
    }
  }

  // Cria as reservas
  const inserts = items.map(item => ({
    session_id: sessionId,
    product_id: item.productId,
    flavor_id:  null,
    qty:        item.qty,
    expires_at: expiresAt,
  }))

  const { error } = await supabase.from('stock_reservations').insert(inserts)
  if (error) return { ok: false, reason: error.message }
  return { ok: true }
}

// Remove uma reserva ao tirar do carrinho
export async function releaseReservation(productId) {
  const sessionId = getSessionId()

  // Pega a reserva mais antiga desse produto nessa sessão e deleta
  const { data } = await supabase
    .from('stock_reservations')
    .select('id')
    .eq('session_id', sessionId)
    .eq('product_id', productId)
    .is('flavor_id', null)
    .order('created_at', { ascending: true })
    .limit(1)

  if (data?.[0]) {
    await supabase.from('stock_reservations').delete().eq('id', data[0].id)
  }
}

// Confirma reservas ao finalizar pedido:
// desconta o estoque real e limpa todas as reservas da sessão
export async function confirmReservations(sessionId, cart) {
  // Desconta estoque de cada produto que tem controle
  const trackedItems = cart.filter(i => i.track_stock && !i.made_to_order)
  for (const item of trackedItems) {
    await supabase.rpc('decrement_stock', {
      p_product_id: item.id,
      p_qty:        item.qty,
    })
  }

  // Limpa todas as reservas da sessão
  await supabase
    .from('stock_reservations')
    .delete()
    .eq('session_id', sessionId)
}