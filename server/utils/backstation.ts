import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack'

type BackstationFetchOptions = NitroFetchOptions<NitroFetchRequest>

/**
 * 呼叫 Backstation API 的統一入口。
 *
 * 自動補上 base URL 與內部服務金鑰（x-internal-api-key），
 * Backstation 端以此辨識請求來自 LIFF 而非外部。
 *
 * path 請帶 Backstation 上的絕對路徑，例如 `/api/orders`。
 */
export async function backstationFetch<T>(path: string, options: BackstationFetchOptions = {}): Promise<T> {
  const config = useRuntimeConfig()
  const baseUrl = config.backstationApiUrl as string
  const apiKey = config.backstationApiKey as string

  return await $fetch<T>(`${baseUrl}${path}`, {
    ...options,
    headers: {
      ...(options.headers as Record<string, string> | undefined),
      ...(apiKey ? { 'x-internal-api-key': apiKey } : {}),
    },
  }) as T
}

/**
 * 將 Backstation 回傳的錯誤轉為可安全外送的錯誤。
 *
 * 直接 re-throw ofetch 的錯誤會把內部網址寫進 message 一路送到瀏覽器
 * （例如 `[GET] "http://internal-host:3000/api/..." : 404`），既洩漏後台位置，
 * 使用者也看不懂。因此只取用 Backstation 自己寫的 message（例如
 * 「找不到對應的 Trip 訂單」），取不到時才退回泛用文字。
 */
export function toBackstationError(error: unknown, fallbackMessage: string) {
  const fetchError = error as {
    statusCode?: number
    data?: { message?: string } | string
    message?: string
  }

  const data = fetchError.data
  const backendMessage = typeof data === 'string' ? data : data?.message

  return createError({
    statusCode: fetchError.statusCode ?? 500,
    message: backendMessage?.trim() || fallbackMessage,
  })
}
