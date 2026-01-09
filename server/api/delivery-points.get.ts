interface DeliveryPoint {
  id: number
  name: string
  type: string
  typeId: number
  address: string
  area: string
  latitude: number | null
  longitude: number | null
  createdAt: string
}

export default defineEventHandler(async (_event): Promise<DeliveryPoint[]> => {
  const config = useRuntimeConfig()
  const backstationApiUrl = config.public.backstationApiUrl as string

  try {
    // 代理請求到 Backstation API
    const response = await $fetch<DeliveryPoint[]>(`${backstationApiUrl}/api/delivery-points`, {
      method: 'GET',
    })

    return response
  }
  catch (error) {
    console.error('Failed to fetch delivery points from Backstation:', error)
    throw createError({
      statusCode: 500,
      message: '無法載入配送地點',
    })
  }
})
