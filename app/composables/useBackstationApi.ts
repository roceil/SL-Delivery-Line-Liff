export function useBackstationApi() {
  interface DeliveryPoint {
    id: number
    name: string
    type: string
    typeId: number
    address: string
    area: string
    latitude: number | null
    longitude: number | null
    createdAt: string
  }

  interface CreateOrderRequest {
    deliveryDate: string // YYYY-MM-DD
    pickupTime: string // HH:MM
    luggageCount: number
    pickupLocationId: string
    deliveryLocationId: string
    lineName?: string
    phone?: string
    notes?: string
    // LINE 使用者資料（僅 LIFF 使用）
    lineUserId?: string
    displayName?: string
    email?: string
    // 平台訂單資訊
    platformType?: string // 'trip' 或 'klook'
    platformOrderId?: string // trip_orders.id 或 klook_orders.id
  }

  interface CreateOrderResponse {
    id: string
    voucherId: string
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
  }

  async function fetchDeliveryPoints(): Promise<DeliveryPoint[]> {
    try {
      // 呼叫 LIFF 自己的 server API（無 CORS 問題）
      const response = await $fetch<DeliveryPoint[]>('/api/delivery-points')
      return response
    }
    catch (error) {
      console.error('Failed to fetch delivery points:', error)
      throw new Error('無法載入配送地點')
    }
  }

  async function createOrder(orderData: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
      // 呼叫 LIFF 自己的 server API（無 CORS 問題）
      const response = await $fetch<CreateOrderResponse>('/api/orders', {
        method: 'POST',
        body: orderData,
      })
      return response
    }
    catch (error) {
      console.error('Failed to create order:', error)
      throw new Error('建立訂單失敗')
    }
  }

  interface TripOrderResponse {
    id: number
    orderNumber: string
    productId: number
    status: number
    statusText: string
    departureDate: string
    quantity: number
    useQuantity: number
    cancelQuantity: number
    availableQuantity: number
    contacts: {
      name: string
      phone: string
    }
    vouchers?: string
    itemId?: string
    sequenceId?: string
    createdAt: string
    updatedAt: string
  }

  interface KlookOrderResponse {
    id: number
    resellerReference: string
    status: number
    statusText: string
    statusCode?: string
    productId: number
    departureDate: string
    quantity: number
    useQuantity: number
    cancelQuantity: number
    availableQuantity: number
    contacts: {
      name: string
      phone: string
    }
    unitItems?: any
    notes?: string
    optionId?: string
    uuid?: string
    createdAt: string
    updatedAt: string
  }

  async function queryTripOrder(voucherCode: string): Promise<TripOrderResponse> {
    try {
      // 透過 LIFF server API 代理到 Backstation (使用憑證號碼查詢)
      const response = await $fetch<TripOrderResponse>(`/api/platform-orders/trip/${voucherCode}`)
      return response
    }
    catch (error) {
      console.error('Failed to query Trip order:', error)
      throw new Error('查詢 Trip 訂單失敗')
    }
  }

  async function queryKlookOrder(resellerReference: string): Promise<KlookOrderResponse> {
    try {
      // 透過 LIFF server API 代理到 Backstation
      const response = await $fetch<KlookOrderResponse>(`/api/platform-orders/klook/${resellerReference}`)
      return response
    }
    catch (error) {
      console.error('Failed to query Klook order:', error)
      throw new Error('查詢 Klook 訂單失敗')
    }
  }

  return {
    fetchDeliveryPoints,
    createOrder,
    queryTripOrder,
    queryKlookOrder,
  }
}
