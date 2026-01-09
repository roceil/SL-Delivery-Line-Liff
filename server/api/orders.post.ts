interface CreateOrderRequest {
  deliveryDate: string
  pickupTime: string
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

export default defineEventHandler(async (event): Promise<CreateOrderResponse> => {
  const config = useRuntimeConfig()
  const backstationApiUrl = config.public.backstationApiUrl as string

  try {
    // 讀取請求 body
    const body = await readBody<CreateOrderRequest>(event)

    // 代理請求到 Backstation API
    const response = await $fetch<CreateOrderResponse>(`${backstationApiUrl}/api/orders`, {
      method: 'POST',
      body,
    })

    return response
  }
  catch (error) {
    console.error('Failed to create order in Backstation:', error)

    // 如果是 Backstation 回傳的錯誤，保留狀態碼和訊息
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    // 其他錯誤
    throw createError({
      statusCode: 500,
      message: '建立訂單失敗',
    })
  }
})
