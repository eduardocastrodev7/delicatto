import { supabase } from './supabase'

export async function fetchOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select(`*, order_items (*)`)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createOrder({ customerData, cart, subtotal, shipping, total, paymentMethod }) {
  const phone = customerData.phone?.replace(/\D/g, '')

  let customer = null
  const { data: existing } = await supabase
    .from('customers')
    .select('*')
    .or(`phone.eq.${customerData.phone},phone.eq.${phone}`)
    .maybeSingle()

  if (existing) {
    customer = existing
  } else {
    const { data: created, error: createError } = await supabase
      .from('customers')
      .insert([{
        name:      customerData.name,
        phone:     customerData.phone,
        instagram: customerData.instagram || null,
        address:   customerData.entrega === 'entrega' ? customerData.enderecoEntrega : null,
      }])
      .select()
      .single()
    if (createError) throw createError
    customer = created
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([{
      customer_id:        customer.id,
      customer_name:      customerData.name,
      customer_phone:     customerData.phone,
      customer_instagram: customerData.instagram || null,
      delivery_type:      customerData.entrega,
      address:            customerData.enderecoEntrega || null,
      pickup_date:        customerData.dataRetirada || null,   // ← novo campo
      subtotal,
      shipping,
      total,
      status:         'aguardando_pagamento',
      payment_method: paymentMethod,
    }])
    .select()
    .single()
  if (orderError) throw orderError

  const items = cart.map((i) => {
    let flavor_choices = null
    if (i.flavorChoices && i.flavors) {
      const entries = Object.entries(i.flavorChoices)
      if (entries.length > 0) {
        flavor_choices = entries.map(([id, qty]) => {
          const sabor = i.flavors.find(f => f.id === id || f.id === String(id))
          return { flavorId: id, flavorName: sabor?.name || id, qty }
        })
      }
    }
    return {
      order_id:       order.id,
      product_id:     i.id,
      name:           i.name,
      price:          i.price,
      qty:            i.qty,
      flavor_choices,
    }
  })

  const { error: itemsError } = await supabase.from('order_items').insert(items)
  if (itemsError) throw itemsError

  return order
}

export async function updateOrderStatus(id, status) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}