interface CreateOrderRequest {
  deliveryDate: string
  pickupTime: string
  luggageCount: number
  pickupLocationId: string
  deliveryLocationId: string
  // 旅客姓名與電話（Backstation 必填）
  lineName?: string
  phone?: string
  // 領件人姓名與電話（Backstation 必填）
  recipientName?: string
  recipientPhone?: string
  notes?: string
  // LINE 使用者資料（僅 LIFF 使用）
  lineUserId?: string
  displayName?: string
  email?: string
  // 平台訂單資訊
  platformType?: string // 'trip' 或 'klook'
  platformOrderId?: string // trip_orders.id 或 klook_orders.id
  // 服務方案：'round_trip' | 'one_way'，影響費用與是否建回程任務
  servicePlan?: string
}

interface CreateOrderResponse {
  id: string
  category: string
  recipientName: string
  recipientPhone: string
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

  const body = await readBody<CreateOrderRequest>(event)

  try {
    const response = await $fetch<CreateOrderResponse>(`${backstationApiUrl}/api/orders`, {
      method: 'POST',
      body,
    })

    return response
  }
  catch (error) {
    const fetchError = error as { statusCode?: number, data?: unknown, message?: string }
    console.error('[orders.post] Backstation rejected request', {
      statusCode: fetchError.statusCode,
      backstationResponse: fetchError.data,
      requestBody: body,
    })

    if (fetchError.statusCode) {
      throw createError({
        statusCode: fetchError.statusCode,
        message: typeof fetchError.data === 'string'
          ? fetchError.data
          : (fetchError.data as { message?: string })?.message || fetchError.message || '建立訂單失敗',
        data: fetchError.data,
      })
    }

    throw createError({
      statusCode: 500,
      message: '建立訂單失敗',
    })
  }
})
