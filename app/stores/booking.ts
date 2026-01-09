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

      const { createOrder: createOrderApi } = useBackstationApi()
      const { generateOrderQRCode } = useQRCode()
      const lineStore = useLineStore()
      const profileStore = useProfileStore()

      // 準備 API 請求資料
      const apiRequest = {
        deliveryDate: orderData.bookingDate,
        pickupTime: orderData.pickupTime,
        luggageCount: orderData.luggageCount,
        pickupLocationId: orderData.pickupLocation.id.toString(),
        deliveryLocationId: orderData.deliveryLocation.id.toString(),
        lineName: orderData.userName,
        phone: profileStore.phoneNumber || undefined,
        notes: orderData.specialNote || undefined,
        // LINE 使用者資料（用於建立/更新 users 表）
        lineUserId: lineStore.userId || undefined,
        displayName: lineStore.displayName || undefined,
        email: profileStore.email || undefined,
      }

      // 呼叫 Backstation API 建立訂單
      const apiResponse = await createOrderApi(apiRequest)

      // 轉換 API 回應為本地格式
      const newOrder: BookingOrder = {
        id: apiResponse.id,
        userId: orderData.userId,
        userName: apiResponse.lineName,
        status: 'pending',
        bookingDate: apiResponse.deliveryDate,
        pickupTime: apiResponse.pickupTime,
        luggageCount: apiResponse.luggageCount,
        pickupLocation: {
          id: Number.parseInt(apiResponse.pickupLocation.id, 10),
          name: apiResponse.pickupLocation.name,
          address: apiResponse.pickupLocation.address,
          area: apiResponse.pickupLocation.area,
        },
        deliveryLocation: {
          id: Number.parseInt(apiResponse.deliveryLocation.id, 10),
          name: apiResponse.deliveryLocation.name,
          address: apiResponse.deliveryLocation.address,
          area: apiResponse.deliveryLocation.area,
        },
        specialNote: apiResponse.notes,
        createdAt: apiResponse.createdAt,
        updatedAt: apiResponse.updatedAt,
      }

      // 生成 QR Code
      newOrder.qrCode = await generateOrderQRCode(newOrder.id)

      orders.value.push(newOrder)
      currentOrder.value = newOrder

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

  async function loadOrders() {
    try {
      isLoading.value = true
      error.value = null

      const lineStore = useLineStore()

      if (!lineStore.userId) {
        orders.value = []
        return
      }

      // 從 API 載入訂單列表
      const response = await $fetch<{
        id: string
        userId: number
        category: string
        lineName: string
        phone: string
        deliveryDate: string
        pickupTime: string
        luggageCount: number
        status: string
        pickupLocation: {
          id: string
          name: string
          address: string
          area: string
        }
        deliveryLocation: {
          id: string
          name: string
          address: string
          area: string
        }
        notes: string
        createdAt: string
        updatedAt: string
      }[]>(`/api/orders?lineUserId=${lineStore.userId}`)

      const { generateOrderQRCode } = useQRCode()

      // 轉換為本地格式並生成 QR Code
      orders.value = await Promise.all(
        response.map(async (apiOrder) => {
          const order: BookingOrder = {
            id: apiOrder.id,
            userId: lineStore.userId || '',
            userName: apiOrder.lineName,
            status: apiOrder.status as BookingStatus,
            bookingDate: apiOrder.deliveryDate,
            pickupTime: apiOrder.pickupTime,
            luggageCount: apiOrder.luggageCount,
            pickupLocation: {
              id: Number.parseInt(apiOrder.pickupLocation.id, 10),
              name: apiOrder.pickupLocation.name,
              address: apiOrder.pickupLocation.address,
              area: apiOrder.pickupLocation.area,
            },
            deliveryLocation: {
              id: Number.parseInt(apiOrder.deliveryLocation.id, 10),
              name: apiOrder.deliveryLocation.name,
              address: apiOrder.deliveryLocation.address,
              area: apiOrder.deliveryLocation.area,
            },
            specialNote: apiOrder.notes || undefined,
            createdAt: apiOrder.createdAt,
            updatedAt: apiOrder.updatedAt,
          }

          // 生成 QR Code
          order.qrCode = await generateOrderQRCode(order.id)

          return order
        }),
      )
    }
    catch (err: any) {
      console.error('載入訂單失敗:', err)
      error.value = err instanceof Error ? err.message : '載入訂單失敗'
      orders.value = []
    }
    finally {
      isLoading.value = false
    }
  }

  async function fetchOrderById(orderId: string): Promise<BookingOrder | null> {
    try {
      isLoading.value = true
      error.value = null

      const lineStore = useLineStore()

      if (!lineStore.userId) {
        throw new Error('LINE 使用者 ID 不存在')
      }

      // 從 API 載入單一訂單
      const apiOrder = await $fetch<{
        id: string
        category: string
        lineName: string
        phone: string
        deliveryDate: string
        pickupTime: string
        luggageCount: number
        status: string
        pickupLocation: {
          id: string
          name: string
          address: string
          area: string
        }
        deliveryLocation: {
          id: string
          name: string
          address: string
          area: string
        }
        notes: string
        createdAt: string
        updatedAt: string
      }>(`/api/orders/${orderId}`)

      const { generateOrderQRCode } = useQRCode()

      // 轉換為本地格式
      const order: BookingOrder = {
        id: apiOrder.id,
        userId: lineStore.userId || '',
        userName: apiOrder.lineName,
        status: apiOrder.status as BookingStatus,
        bookingDate: apiOrder.deliveryDate,
        pickupTime: apiOrder.pickupTime,
        luggageCount: apiOrder.luggageCount,
        pickupLocation: {
          id: Number.parseInt(apiOrder.pickupLocation.id, 10),
          name: apiOrder.pickupLocation.name,
          address: apiOrder.pickupLocation.address,
          area: apiOrder.pickupLocation.area,
        },
        deliveryLocation: {
          id: Number.parseInt(apiOrder.deliveryLocation.id, 10),
          name: apiOrder.deliveryLocation.name,
          address: apiOrder.deliveryLocation.address,
          area: apiOrder.deliveryLocation.area,
        },
        specialNote: apiOrder.notes || undefined,
        createdAt: apiOrder.createdAt,
        updatedAt: apiOrder.updatedAt,
      }

      // 生成 QR Code
      order.qrCode = await generateOrderQRCode(order.id)

      // 更新本地快取
      const existingIndex = orders.value.findIndex(o => o.id === orderId)
      if (existingIndex !== -1) {
        orders.value[existingIndex] = order
      }
      else {
        orders.value.push(order)
      }

      return order
    }
    catch (err: any) {
      console.error('載入訂單詳情失敗:', err)
      error.value = err instanceof Error ? err.message : '載入訂單詳情失敗'
      return null
    }
    finally {
      isLoading.value = false
    }
  }

  function clearAllOrders() {
    orders.value = []
    currentOrder.value = null
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
    loadOrders,
    fetchOrderById,
    clearAllOrders,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useBookingStore, import.meta.hot))
