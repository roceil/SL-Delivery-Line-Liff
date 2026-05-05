export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const backstationApiUrl = config.public.backstationApiUrl as string
  const orderId = getRouterParam(event, 'id')

  if (!orderId) {
    throw createError({ statusCode: 400, message: '缺少訂單 ID' })
  }

  const body = await readBody(event)

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await $fetch(`${backstationApiUrl}/api/orders/${orderId}`, {
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

    if (fetchError.statusCode) {
      throw createError({
        statusCode: fetchError.statusCode,
        message: typeof fetchError.data === 'string'
          ? fetchError.data
          : (fetchError.data as { message?: string })?.message || fetchError.message || '更新訂單失敗',
        data: fetchError.data,
      })
    }

    throw createError({ statusCode: 500, message: '更新訂單失敗' })
  }
})
