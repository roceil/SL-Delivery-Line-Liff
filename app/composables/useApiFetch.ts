import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack'

type ApiFetchOptions = NitroFetchOptions<NitroFetchRequest>

/** 重新登入的節流旗標；記在 sessionStorage 才能跨越 login() 造成的頁面跳轉 */
const RELOGIN_FLAG = 'liff-relogin-attempted'

/**
 * 是否可以觸發重新登入。
 *
 * 每個瀏覽器分頁最多只重新登入一次 —— 若重新登入後仍被拒，代表問題不在
 * token 本身，繼續跳轉只會變成無限迴圈，此時應把錯誤交給畫面呈現。
 */
function canRetryLogin(): boolean {
  if (import.meta.server)
    return false

  if (sessionStorage.getItem(RELOGIN_FLAG))
    return false

  sessionStorage.setItem(RELOGIN_FLAG, '1')
  return true
}

function clearReloginFlag() {
  if (import.meta.client)
    sessionStorage.removeItem(RELOGIN_FLAG)
}

/**
 * 呼叫自家 server API 的統一入口，會自動夾帶 LINE access token 供後端驗證身分。
 *
 * 使用 access token（12 小時、liff.init() 會自動更新）而非 ID token
 * （1 小時、不會更新），避免使用者在 LIFF 開著超過一小時後被反覆登出。
 *
 * 後端只信任 token 驗證出來的 lineUserId，因此呼叫端不需要（也不應該）
 * 再把 lineUserId 放進網址或 body。
 */
export function useApiFetch() {
  const lineStore = useLineStore()

  async function apiFetch<T>(url: string, options: ApiFetchOptions = {}): Promise<T> {
    const accessToken = lineStore.liffInstance?.getAccessToken()

    if (!accessToken) {
      if (canRetryLogin()) {
        lineStore.login()
      }

      throw new Error('尚未登入 LINE，請重新開啟頁面')
    }

    try {
      const response = await $fetch<T>(url, {
        ...options,
        headers: {
          ...(options.headers as Record<string, string> | undefined),
          Authorization: `Bearer ${accessToken}`,
        },
      }) as T

      // 有成功的請求就代表登入狀態正常，解除節流讓下次逾期時還能自動重新登入
      clearReloginFlag()

      return response
    }
    catch (error) {
      if ((error as { statusCode?: number })?.statusCode === 401 && canRetryLogin()) {
        lineStore.login()
      }

      throw error
    }
  }

  return { apiFetch }
}
