export default defineEventHandler(async (event) => {
  const voucherId = getRouterParam(event, 'voucherId')

  if (!voucherId) {
    throw createError({
      statusCode: 400,
      message: '缺少憑證號碼',
    })
  }

  // 至少要求登入。訂單擁有者的比對需由 Backstation 支援（LIFF 端無訂單歸屬資料）
  await requireLineUserId(event)

  try {
    // 代理請求到 Backstation API
    const response = await backstationFetch<{ id: string }>(`/api/orders/by-voucher/${voucherId}`)
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
