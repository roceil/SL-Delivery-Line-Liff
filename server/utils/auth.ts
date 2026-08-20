import type { H3Event } from 'h3'

/** LINE ID Token 驗證結果（僅列出實際用得到的欄位） */
interface LineVerifyResponse {
  iss: string
  sub: string
  aud: string
  exp: number
  name?: string
  picture?: string
}

/**
 * 驗證請求夾帶的 LINE ID Token，回傳可信任的 lineUserId。
 *
 * 前端須以 `Authorization: Bearer <idToken>` 帶入 `liff.getIDToken()` 取得的 token。
 * ID Token 由 LINE 簽發並簽章，交由 LINE 官方端點驗證後取出 `sub`（即 lineUserId），
 * 因此不需要、也不應該信任 client 自行傳來的 lineUserId 參數。
 */
export async function requireLineUserId(event: H3Event): Promise<string> {
  const authHeader = getHeader(event, 'authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      message: '未提供 LINE 身分驗證資訊',
    })
  }

  const idToken = authHeader.slice('Bearer '.length).trim()

  if (!idToken) {
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

  let verified: LineVerifyResponse

  try {
    verified = await $fetch<LineVerifyResponse>('https://api.line.me/oauth2/v2.1/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        id_token: idToken,
        client_id: channelId,
      }),
    })
  }
  catch (error) {
    // ID Token 有效期為一小時，逾期或遭竄改都會落在這裡
    console.error('[auth] LINE ID Token 驗證失敗', error)
    throw createError({
      statusCode: 401,
      message: 'LINE 身分驗證失敗，請重新登入',
    })
  }

  if (!verified.sub) {
    throw createError({
      statusCode: 401,
      message: '無法取得 LINE 使用者 ID',
    })
  }

  return verified.sub
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
