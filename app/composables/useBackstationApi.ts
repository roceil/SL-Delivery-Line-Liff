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
  }

  interface CreateOrderResponse {
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

  return {
    fetchDeliveryPoints,
    createOrder,
  }
}
