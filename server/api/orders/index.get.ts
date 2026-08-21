interface OrderResponse {
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
}

export default defineEventHandler(async (event): Promise<OrderResponse[]> => {
  // 使用者身分一律以 LINE ID Token 驗證結果為準，不接受 client 傳入的參數
  const lineUserId = await requireLineUserId(event)

  try {
    // 代理請求到 Backstation API
    const response = await backstationFetch<OrderResponse[]>(`/api/orders/user/${lineUserId}`, {
      method: 'GET',
    })

    return response
  }
  catch (error) {
    console.error('Failed to fetch orders from Backstation:', error)

    throw toBackstationError(error, '無法取得訂單列表')
  }
})
