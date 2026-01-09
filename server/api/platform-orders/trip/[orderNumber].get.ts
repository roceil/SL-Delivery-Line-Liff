interface TripOrderResponse {
  id: number
  orderNumber: string
  statusText: string
  availableQuantity: number
  vouchers?: string
  departureDate: string
  quantity: number
  contacts: {
    name: string
    phone: string
  }
}

export default defineEventHandler(async (event): Promise<TripOrderResponse> => {
  const config = useRuntimeConfig()
  const backstationApiUrl = config.public.backstationApiUrl as string
  const voucherCode = getRouterParam(event, 'orderNumber')

  if (!voucherCode) {
    throw createError({
      statusCode: 400,
      message: '缺少憑證號碼',
    })
  }

  try {
    // 代理請求到 Backstation API (使用憑證號碼查詢)
    const response = await $fetch<TripOrderResponse>(`${backstationApiUrl}/api/platform-orders/trip/${voucherCode}`)
    return response
  }
  catch (error: any) {
    console.error('Failed to query Trip order from Backstation:', error)

    // 如果是 Backstation 回傳的錯誤，保留狀態碼和訊息
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    // 其他錯誤
    throw createError({
      statusCode: 500,
      message: '查詢 Trip 訂單失敗',
    })
  }
})
