interface KlookOrderResponse {
  id: number
  resellerReference: string
  statusText: string
  availableQuantity: number
  departureDate: string
  quantity: number
  contacts: {
    name: string
    phone: string
  }
}

export default defineEventHandler(async (event): Promise<KlookOrderResponse> => {
  const config = useRuntimeConfig()
  const backstationApiUrl = config.public.backstationApiUrl as string
  const reference = getRouterParam(event, 'reference')

  if (!reference) {
    throw createError({
      statusCode: 400,
      message: '缺少訂單參考編號',
    })
  }

  try {
    // 代理請求到 Backstation API
    const response = await $fetch<KlookOrderResponse>(`${backstationApiUrl}/api/platform-orders/klook/${reference}`)
    return response
  }
  catch (error: any) {
    console.error('Failed to query Klook order from Backstation:', error)

    // 如果是 Backstation 回傳的錯誤，保留狀態碼和訊息
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    // 其他錯誤
    throw createError({
      statusCode: 500,
      message: '查詢 Klook 訂單失敗',
    })
  }
})
