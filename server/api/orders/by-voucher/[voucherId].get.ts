export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const backstationApiUrl = config.public.backstationApiUrl as string
  const voucherId = getRouterParam(event, 'voucherId')

  if (!voucherId) {
    throw createError({
      statusCode: 400,
      message: '缺少憑證號碼',
    })
  }

  try {
    // 代理請求到 Backstation API
    const response = await $fetch<{ id: string }>(`${backstationApiUrl}/api/orders/by-voucher/${voucherId}`)
    return response
  }
  catch (error: any) {
    console.error('Failed to query order by voucher from Backstation:', error)

    // 如果是 Backstation 回傳的錯誤，保留狀態碼和訊息
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    // 其他錯誤
    throw createError({
      statusCode: 500,
      message: '查詢訂單失敗',
    })
  }
})
