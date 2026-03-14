import { createContext, useContext, useState, useEffect } from 'react'
import { fetchProducts, createProduct, updateProduct as updateProductDB, deleteProduct as deleteProductDB } from '../lib/products'
import { fetchOrders, createOrder as createOrderDB, updateOrderStatus as updateOrderStatusDB } from '../lib/orders'
import { fetchCustomers } from '../lib/customers'
import { reserveStock, releaseReservation, confirmReservations, getSessionId } from '../lib/stock'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [products, setProducts]       = useState([])
  const [orders, setOrders]           = useState([])
  const [customers, setCustomers]     = useState([])
  const [cart, setCart]               = useState([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    loadProducts()
    loadOrders()
    loadCustomers()
  }, [])

  const loadProducts = async () => {
    try {
      const data = await fetchProducts()
      setProducts(data)
    } catch (err) {
      console.error('Erro ao carregar produtos:', err)
    } finally {
      setLoadingData(false)
    }
  }

  const loadOrders = async () => {
    try {
      const data = await fetchOrders()
      setOrders(data.map(normalizeOrder))
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err)
    }
  }

  const loadCustomers = async () => {
    try {
      const data = await fetchCustomers()
      setCustomers(data.map(normalizeCustomer))
    } catch (err) {
      console.error('Erro ao carregar clientes:', err)
    }
  }

  // ── Normalização ──────────────────────────────
  const normalizeOrder = (o) => {
    const createdAt = new Date(o.created_at)
    return {
      id:                o.id,
      customerName:      o.customer_name,
      customerPhone:     o.customer_phone,
      customerInstagram: o.customer_instagram,
      endereco:          o.address,
      entrega:           o.delivery_type,
      items:             (o.order_items || []).map((i) => ({
        name: i.name, qty: i.qty, price: i.price,
        flavorChoices: i.flavor_choices || null,
      })),
      subtotal:        parseFloat(o.subtotal),
      frete:           parseFloat(o.shipping),
      total:           parseFloat(o.total),
      status:          o.status,
      metodoPagamento: o.payment_method,
      pickupDate:      o.pickup_date || null,
      created_at:      o.created_at,
      createdAtDate:   createdAt,
      date:            createdAt.toLocaleDateString('pt-BR'),
    }
  }

  const normalizeCustomer = (c) => ({
    id:          c.id,
    name:        c.name      || '',
    phone:       c.phone     || '',
    instagram:   c.instagram || '',
    endereco:    c.address   || '',
    totalOrders: (c.orders || []).length,
    pedidos:     (c.orders || []).map((o) => ({
      id:    o.id,
      date:  new Date(o.created_at).toLocaleDateString('pt-BR'),
      total: parseFloat(o.total),
      items: (o.order_items || []).map((i) => ({ name: i.name, qty: i.qty })),
    })),
  })

  // ── Carrinho com reserva de estoque por produto ──
  const addToCart = async (product, flavorChoices = null) => {
    // Reserva se há controle de estoque
    if (product.track_stock && !product.made_to_order) {
      const result = await reserveStock([{ productId: product.id, qty: 1 }])
      if (!result.ok) {
        throw new Error(result.reason || 'Estoque insuficiente')
      }
    }

    // Adiciona no carrinho local
    setCart((prev) => {
      if (product.has_flavors) {
        const cartItemId = `${product.id}_${Date.now()}`
        return [...prev, { ...product, cartItemId, qty: 1, flavorChoices }]
      }
      const exists = prev.find((i) => i.id === product.id && !i.has_flavors)
      if (exists) {
        return prev.map((i) =>
          i.id === product.id && !i.has_flavors ? { ...i, qty: i.qty + 1 } : i
        )
      }
      return [...prev, { ...product, cartItemId: product.id, qty: 1, flavorChoices: null }]
    })
  }

  const removeFromCart = (removeId) => {
    setCart((prev) => {
      const byCartId = prev.find((i) => i.cartItemId === removeId)
      const item     = byCartId || prev.find((i) => i.id === removeId)

      // Libera reserva em background
      if (item && item.track_stock && !item.made_to_order) {
        releaseReservation(item.id)
      }

      if (byCartId) {
        if (byCartId.qty === 1) return prev.filter((i) => i.cartItemId !== removeId)
        return prev.map((i) => i.cartItemId === removeId ? { ...i, qty: i.qty - 1 } : i)
      }
      const byId = prev.find((i) => i.id === removeId)
      if (!byId) return prev
      if (byId.qty === 1) return prev.filter((i) => i.id !== removeId)
      return prev.map((i) => i.id === removeId ? { ...i, qty: i.qty - 1 } : i)
    })
  }

  const clearCart = () => setCart([])
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const cartCount = cart.reduce((s, i) => s + i.qty, 0)

  // ── Pedidos ───────────────────────────────────
  const addOrder = async (customerData, paymentMethod) => {
    const shipping  = customerData.frete || 0
    const sessionId = getSessionId()
    try {
      const order = await createOrderDB({
        customerData, cart,
        subtotal: cartTotal,
        shipping,
        total:    cartTotal + shipping,
        paymentMethod,
      })
      // Confirma reservas → desconta estoque real
      await confirmReservations(sessionId, cart)
      clearCart()
      return order.id
    } catch (err) {
      console.error('Erro ao criar pedido:', err)
      throw err
    }
  }

  const updateOrderStatus = async (id, status) => {
    try {
      await updateOrderStatusDB(id, status)
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o))
    } catch (err) {
      console.error('Erro ao atualizar status:', err)
    }
  }

  // ── Produtos (admin) ──────────────────────────
  const addProduct = async (product) => {
    try {
      const data = await createProduct({ ...product, price: parseFloat(product.price) })
      setProducts((prev) => [...prev, data])
      return data
    } catch (err) {
      console.error('Erro ao criar produto:', err)
      throw err
    }
  }

  const updateProduct = async (id, product) => {
    try {
      const data = await updateProductDB(id, { ...product, price: parseFloat(product.price) })
      setProducts((prev) => prev.map((p) => p.id === id ? data : p))
      return data
    } catch (err) {
      console.error('Erro ao atualizar produto:', err)
      throw err
    }
  }

  const deleteProduct = async (id) => {
    try {
      await deleteProductDB(id)
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      console.error('Erro ao deletar produto:', err)
      throw err
    }
  }

  // ── Stats ─────────────────────────────────────
  const stats = {
    totalOrders:    orders.length,
    totalRevenue:   orders.filter((o) => o.status === 'entregue').reduce((s, o) => s + o.total, 0),
    pending:        orders.filter((o) => o.status === 'aguardando_pagamento').length,
    preparing:      orders.filter((o) => o.status === 'em_preparo').length,
    totalCustomers: customers.length,
  }

  return (
    <AppContext.Provider value={{
      products, loadingData, loadProducts,
      orders, loadOrders, addOrder, updateOrderStatus,
      customers, loadCustomers,
      cart, addToCart, removeFromCart, clearCart, cartTotal, cartCount,
      addProduct, updateProduct, deleteProduct,
      stats,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp deve ser usado dentro de AppProvider')
  return ctx
}