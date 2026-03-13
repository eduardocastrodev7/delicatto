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

// Busca estoque disponível de um produto simples
export async function fetchAvailableStock(productId) {
  const { data, error } = await supabase
    .rpc('available_stock', { p_product_id: productId })
  if (error) throw error
  return data // null = sem controle, número = disponível
}

// Busca estoque disponível de todos os sabores de um produto
export async function fetchFlavorStocks(productId) {
  // Limpa reservas expiradas antes de ler
  await supabase.from('stock_reservations').delete().lt('expires_at', new Date().toISOString())

  const { data: flavorStocks, error } = await supabase
    .from('flavor_stock')
    .select('flavor_id, flavor_name, stock')
    .eq('product_id', productId)
  if (error) throw error
  if (!flavorStocks?.length) return {}

  // Busca reservas ativas para esses sabores
  const { data: reservations } = await supabase
    .from('stock_reservations')
    .select('flavor_id, qty')
    .eq('product_id', productId)
    .not('flavor_id', 'is', null)
    .gt('expires_at', new Date().toISOString())

  // Calcula disponível por sabor
  const reserved = {}
  reservations?.forEach(r => {
    reserved[r.flavor_id] = (reserved[r.flavor_id] || 0) + r.qty
  })

  const result = {}
  flavorStocks.forEach(f => {
    result[f.flavor_id] = {
      name:      f.flavor_name,
      stock:     f.stock,
      available: Math.max(0, f.stock - (reserved[f.flavor_id] || 0)),
    }
  })
  return result
}

// Reserva estoque ao adicionar no carrinho
// items: [{ productId, flavorId?, qty }]
export async function reserveStock(items) {
  const sessionId = getSessionId()
  const expiresAt = new Date(Date.now() + RESERVATION_MINUTES * 60 * 1000).toISOString()

  // Verifica disponibilidade antes de reservar
  for (const item of items) {
    if (item.flavorId) {
      const { data: rows } = await supabase
        .from('stock_reservations')
        .select('qty')
        .eq('product_id', item.productId)
        .eq('flavor_id', item.flavorId)
        .gt('expires_at', new Date().toISOString())

      const { data: fs } = await supabase
        .from('flavor_stock')
        .select('stock')
        .eq('product_id', item.productId)
        .eq('flavor_id', item.flavorId)
        .maybeSingle()

      if (fs) {
        const totalReserved = rows?.reduce((s, r) => s + r.qty, 0) || 0
        if (fs.stock - totalReserved < item.qty) {
          return { ok: false, reason: `Estoque insuficiente para o sabor selecionado` }
        }
      }
    } else {
      const { data: available } = await supabase
        .rpc('available_stock', { p_product_id: item.productId })
      if (available !== null && available < item.qty) {
        return { ok: false, reason: `Estoque insuficiente` }
      }
    }
  }

  // Cria as reservas
  const inserts = items.map(item => ({
    session_id: sessionId,
    product_id: item.productId,
    flavor_id:  item.flavorId || null,
    qty:        item.qty,
    expires_at: expiresAt,
  }))

  const { error } = await supabase.from('stock_reservations').insert(inserts)
  if (error) return { ok: false, reason: error.message }
  return { ok: true }
}

// Remove reserva ao tirar do carrinho
export async function releaseReservation(productId, flavorId = null) {
  const sessionId = getSessionId()
  let query = supabase
    .from('stock_reservations')
    .delete()
    .eq('session_id', sessionId)
    .eq('product_id', productId)

  if (flavorId) query = query.eq('flavor_id', flavorId)
  else          query = query.is('flavor_id', null)

  // Deleta apenas 1 registro (a reserva mais antiga)
  const { data } = await supabase
    .from('stock_reservations')
    .select('id')
    .eq('session_id', sessionId)
    .eq('product_id', productId)
    .is('flavor_id', flavorId || null)
    .order('created_at', { ascending: true })
    .limit(1)

  if (data?.[0]) {
    await supabase.from('stock_reservations').delete().eq('id', data[0].id)
  }
}

// Confirma reservas (converte em venda real ao criar pedido)
// Desconta do estoque e deleta as reservas da session
export async function confirmReservations(sessionId, cart) {
  // Desconta estoque dos produtos simples
  const simpleItems = cart.filter(i => !i.has_flavors && i.track_stock)
  for (const item of simpleItems) {
    await supabase.rpc('decrement_stock', {
      p_product_id: item.id,
      p_qty:        item.qty,
    })
  }

  // Desconta estoque dos sabores
  const flavorItems = cart.filter(i => i.has_flavors && i.flavorChoices)
  for (const item of flavorItems) {
    for (const [flavorId, qty] of Object.entries(item.flavorChoices)) {
      await supabase.rpc('decrement_flavor_stock', {
        p_product_id: item.id,
        p_flavor_id:  flavorId,
        p_qty:        qty * item.qty,
      })
    }
  }

  // Limpa todas as reservas da sessão
  await supabase
    .from('stock_reservations')
    .delete()
    .eq('session_id', sessionId)
}