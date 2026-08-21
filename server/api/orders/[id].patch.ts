export default defineEventHandler(async (event) => {
  const orderId = getRouterParam(event, 'id')

  if (!orderId) {
    throw createError({ statusCode: 400, message: '缺少訂單 ID' })
  }

  // 至少要求登入。訂單擁有者的比對需由 Backstation 支援（LIFF 端無訂單歸屬資料）
  await requireLineUserId(event)

  const body = await readBody(event)

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await backstationFetch(`/api/orders/${orderId}`, {
      method: 'PATCH' as any,
      body,
    })
  }
  catch (error) {
    const fetchError = error as { statusCode?: number, data?: unknown, message?: string }
    console.error('[orders.patch] Backstation rejected', {
      orderId,
      statusCode: fetchError.statusCode,
      backstationResponse: fetchError.data,
      requestBody: body,
    })

    throw toBackstationError(error, '更新訂單失敗')
  }
})
