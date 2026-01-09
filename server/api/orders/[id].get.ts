interface OrderDetailResponse {
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

export default defineEventHandler(async (event): Promise<OrderDetailResponse> => {
  const config = useRuntimeConfig()
  const backstationApiUrl = config.public.backstationApiUrl as string
  const orderId = getRouterParam(event, 'id')

  if (!orderId) {
    throw createError({
      statusCode: 400,
      message: '缺少訂單 ID',
    })
  }

  try {
    // 代理請求到 Backstation API
    const response = await $fetch<OrderDetailResponse>(`${backstationApiUrl}/api/orders/${orderId}`, {
      method: 'GET',
    })

    return response
  }
  catch (error) {
    console.error('Failed to fetch order from Backstation:', error)

    // 如果是 Backstation 回傳的錯誤，保留狀態碼和訊息
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: '無法取得訂單詳情',
    })
  }
})
