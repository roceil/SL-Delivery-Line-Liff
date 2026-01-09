interface UpdateUserRequest {
  phone?: string
  email?: string
}

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
  const config = useRuntimeConfig()
  const backstationApiUrl = config.public.backstationApiUrl as string
  const lineUserId = getRouterParam(event, 'lineUserId')
  const body = await readBody<UpdateUserRequest>(event)

  if (!lineUserId) {
    throw createError({
      statusCode: 400,
      message: '缺少 LINE 使用者 ID',
    })
  }

  try {
    // 代理請求到 Backstation API
    const response = await $fetch<UserResponse>(`${backstationApiUrl}/api/users/${lineUserId}`, {
      method: 'PUT',
      body,
    })

    return response
  }
  catch (error) {
    console.error('Failed to update user in Backstation:', error)

    // 如果是 Backstation 回傳的錯誤，保留狀態碼和訊息
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: '無法更新使用者資料',
    })
  }
})
