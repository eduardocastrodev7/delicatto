import { supabase } from './supabase'

export async function fetchCustomers() {
  const { data, error } = await supabase
    .from('customers')
    .select(`
      *,
      orders (id, total, status, created_at,
        order_items (name, qty)
      )
    `)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}