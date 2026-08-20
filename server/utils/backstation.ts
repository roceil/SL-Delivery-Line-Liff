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
