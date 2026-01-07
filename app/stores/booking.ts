import type { BookingOrder, BookingStatus, QRCodeData } from '~/types/booking'

export const useBookingStore = defineStore('booking', () => {
  // State
  const orders = ref<BookingOrder[]>([])
  const currentOrder = ref<BookingOrder | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const ordersByStatus = computed(() => (status: BookingStatus) => {
    return orders.value.filter(order => order.status === status)
  })

  const activeOrders = computed(() => {
    return orders.value.filter(order =>
      ['pending', 'confirmed', 'in_transit'].includes(order.status),
    )
  })

  const completedOrders = computed(() => {
    return orders.value.filter(order =>
      ['delivered', 'cancelled'].includes(order.status),
    )
  })

  const totalOrders = computed(() => orders.value.length)

  const getOrderById = computed(() => (id: string) => {
    return orders.value.find(order => order.id === id)
  })

  // Actions
  async function createOrder(orderData: Omit<BookingOrder, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'qrCode'>) {
    try {
      isLoading.value = true
      error.value = null

      const { generateUUID } = useUUID()
      const { generateOrderQRCode } = useQRCode()

      const newOrder: BookingOrder = {
        ...orderData,
        id: generateUUID(),
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // 生成 QR Code
      newOrder.qrCode = await generateOrderQRCode(newOrder.id)

      orders.value.push(newOrder)
      currentOrder.value = newOrder

      // 持久化到 LocalStorage
      await saveToLocalStorage()

      return newOrder
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '建立訂單失敗'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  async function updateOrder(orderId: string, updates: Partial<Omit<BookingOrder, 'id' | 'createdAt'>>): Promise<BookingOrder> {
    try {
      isLoading.value = true
      error.value = null

      const index = orders.value.findIndex(order => order.id === orderId)

      if (index === -1)
        throw new Error('訂單不存在')

      orders.value[index] = {
        ...orders.value[index]!,
        ...updates,
        updatedAt: new Date().toISOString(),
      } as BookingOrder

      await saveToLocalStorage()

      return orders.value[index]!
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '更新訂單失敗'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  async function cancelOrder(orderId: string) {
    return updateOrder(orderId, { status: 'cancelled' })
  }

  function setCurrentOrder(order: BookingOrder | null) {
    currentOrder.value = order
  }

  async function queryOrderByQRCode(qrData: QRCodeData): Promise<BookingOrder | null> {
    try {
      isLoading.value = true
      error.value = null

      if (qrData.type !== 'booking_order')
        throw new Error('QR Code 格式不正確')

      const order = getOrderById.value(qrData.orderId)

      if (!order)
        throw new Error('找不到對應的訂單')

      currentOrder.value = order
      return order
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '查詢訂單失敗'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  async function loadFromLocalStorage() {
    try {
      const lineStore = useLineStore()

      if (!lineStore.userId)
        return

      const key = `booking_orders_${lineStore.userId}`
      const stored = localStorage.getItem(key)

      if (stored) {
        const parsed = JSON.parse(stored)
        orders.value = parsed.orders || []
      }
    }
    catch (err) {
      console.error('載入資料失敗:', err)
    }
  }

  async function saveToLocalStorage() {
    try {
      const lineStore = useLineStore()

      if (!lineStore.userId)
        return

      const key = `booking_orders_${lineStore.userId}`
      const data = {
        orders: orders.value,
        lastUpdated: new Date().toISOString(),
      }

      localStorage.setItem(key, JSON.stringify(data))
    }
    catch (err) {
      console.error('儲存資料失敗:', err)
    }
  }

  function clearAllOrders() {
    orders.value = []
    currentOrder.value = null
    const lineStore = useLineStore()
    if (lineStore.userId)
      localStorage.removeItem(`booking_orders_${lineStore.userId}`)
  }

  return {
    // State
    orders,
    currentOrder,
    isLoading,
    error,

    // Getters
    ordersByStatus,
    activeOrders,
    completedOrders,
    totalOrders,
    getOrderById,

    // Actions
    createOrder,
    updateOrder,
    cancelOrder,
    setCurrentOrder,
    queryOrderByQRCode,
    loadFromLocalStorage,
    saveToLocalStorage,
    clearAllOrders,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useBookingStore, import.meta.hot))
