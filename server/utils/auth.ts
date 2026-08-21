import type { H3Event } from 'h3'

/** LINE access token 驗證結果 */
interface LineVerifyAccessTokenResponse {
  scope: string
  client_id: string
  expires_in: number
}

/** LINE 使用者基本資料（僅列出實際用得到的欄位） */
interface LineProfileResponse {
  userId: string
  displayName?: string
  pictureUrl?: string
}

/**
 * 驗證請求夾帶的 LINE access token，回傳可信任的 lineUserId。
 *
 * 前端須以 `Authorization: Bearer <accessToken>` 帶入 `liff.getAccessToken()` 的結果。
 *
 * 使用 access token 而非 ID token 的原因：
 * - access token 有效期 12 小時，且 liff.init() 會自動更新
 * - ID token 有效期僅 1 小時，且 liff.init() 不會更新，逾期後 liff.isLoggedIn()
 *   仍為 true，會造成前端拿著過期 token 反覆被拒
 *
 * 驗證分兩步，缺一不可：
 * 1. verify 端點確認 token 有效，並比對 client_id 確實是本 channel 簽發
 *    （少了這步，其他 channel 的 token 也會被接受）
 * 2. profile 端點取出 userId
 */
export async function requireLineUserId(event: H3Event): Promise<string> {
  const authHeader = getHeader(event, 'authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      message: '未提供 LINE 身分驗證資訊',
    })
  }

  const accessToken = authHeader.slice('Bearer '.length).trim()

  if (!accessToken) {
    throw createError({
      statusCode: 401,
      message: '未提供 LINE 身分驗證資訊',
    })
  }

  const config = useRuntimeConfig()
  // LIFF ID 格式為 {channelId}-{suffix}，前段即為 LINE Login channel ID
  const channelId = (config.public.liffId as string | undefined)?.split('-')[0]

  if (!channelId) {
    throw createError({
      statusCode: 500,
      message: 'LIFF ID 未設定，無法驗證身分',
    })
  }

  let verified: LineVerifyAccessTokenResponse

  try {
    verified = await $fetch<LineVerifyAccessTokenResponse>('https://api.line.me/oauth2/v2.1/verify', {
      query: { access_token: accessToken },
    })
  }
  catch (error) {
    console.error('[auth] LINE access token 驗證失敗', getLineErrorDetail(error))
    throw createError({
      statusCode: 401,
      message: 'LINE 身分驗證失敗，請重新登入',
    })
  }

  if (verified.client_id !== channelId) {
    console.error('[auth] access token 並非本 channel 簽發', {
      expected: channelId,
      got: verified.client_id,
    })
    throw createError({
      statusCode: 401,
      message: 'LINE 身分驗證失敗，請重新登入',
    })
  }

  let profile: LineProfileResponse

  try {
    profile = await $fetch<LineProfileResponse>('https://api.line.me/v2/profile', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  }
  catch (error) {
    console.error('[auth] 取得 LINE 使用者資料失敗', getLineErrorDetail(error))
    throw createError({
      statusCode: 401,
      message: 'LINE 身分驗證失敗，請重新登入',
    })
  }

  if (!profile.userId) {
    throw createError({
      statusCode: 401,
      message: '無法取得 LINE 使用者 ID',
    })
  }

  return profile.userId
}

/**
 * 驗證身分，並確認與指定的 lineUserId 相符，避免存取到他人資料。
 */
export async function requireOwnLineUserId(event: H3Event, targetLineUserId: string): Promise<string> {
  const lineUserId = await requireLineUserId(event)

  if (lineUserId !== targetLineUserId) {
    throw createError({
      statusCode: 403,
      message: '無權存取其他使用者的資料',
    })
  }

  return lineUserId
}

/** 取出 LINE 回應中的錯誤說明，方便從 log 直接看出失敗原因 */
function getLineErrorDetail(error: unknown): unknown {
  const fetchError = error as { statusCode?: number, data?: unknown, message?: string }
  return {
    statusCode: fetchError.statusCode,
    lineResponse: fetchError.data,
    message: fetchError.message,
  }
}
