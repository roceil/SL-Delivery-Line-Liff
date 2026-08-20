import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack'

type ApiFetchOptions = NitroFetchOptions<NitroFetchRequest>

/**
 * 呼叫自家 server API 的統一入口，會自動夾帶 LINE ID Token 供後端驗證身分。
 *
 * 後端只信任 token 驗證出來的 lineUserId，因此呼叫端不需要（也不應該）
 * 再把 lineUserId 放進網址或 body。
 */
export function useApiFetch() {
  const lineStore = useLineStore()

  async function apiFetch<T>(url: string, options: ApiFetchOptions = {}): Promise<T> {
    const idToken = lineStore.liffInstance?.getIDToken()

    if (!idToken) {
      lineStore.login()
      throw new Error('尚未登入 LINE，請重新開啟頁面')
    }

    try {
      return await $fetch<T>(url, {
        ...options,
        headers: {
          ...(options.headers as Record<string, string> | undefined),
          Authorization: `Bearer ${idToken}`,
        },
      }) as T
    }
    catch (error) {
      // ID Token 有效期一小時，逾期後後端回 401，直接觸發重新登入
      if ((error as { statusCode?: number })?.statusCode === 401) {
        lineStore.login()
      }

      throw error
    }
  }

  return { apiFetch }
}
