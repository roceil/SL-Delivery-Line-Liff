interface UserResponse {
  userId: number
  lineUserId: string
  displayName: string
  phone: string | null
  email: string | null
  memberLevel: number
  createdAt: string
  updatedAt: string
}

export default defineEventHandler(async (event): Promise<UserResponse> => {
  const lineUserId = getRouterParam(event, 'lineUserId')

  if (!lineUserId) {
    throw createError({
      statusCode: 400,
      message: '缺少 LINE 使用者 ID',
    })
  }

  // 僅允許查詢自己的資料
  await requireOwnLineUserId(event, lineUserId)

  try {
    // 代理請求到 Backstation API
    const response = await backstationFetch<UserResponse>(`/api/users/${lineUserId}`, {
      method: 'GET',
    })

    return response
  }
  catch (error) {
    console.error('Failed to fetch user from Backstation:', error)

    // 如果是 Backstation 回傳的錯誤，保留狀態碼和訊息
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: '無法取得使用者資料',
    })
  }
})
