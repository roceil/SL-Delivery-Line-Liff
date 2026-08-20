import { markOrderPaid, parseNewebpayCallback } from '../../utils/newebpay-notify'

/**
 * 藍新 ReturnURL —— 由買家的瀏覽器 POST 導回。
 *
 * 與 notify-server 共用同一套驗證與更新邏輯，差別只在這裡要把使用者導向完成頁。
 * 兩條路徑都可能先抵達，因此更新本身必須是冪等的。
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const hashKey = config.newebpayHashKey as string
  const hashIV = config.newebpayHashIV as string

  const body = await readBody<Record<string, string>>(event)
  const callback = parseNewebpayCallback(body, hashKey, hashIV)

  if (!callback.ok) {
    return sendRedirect(event, `/life/booking-complete?Status=FAILED&reason=${callback.reason}`, 302)
  }

  if (callback.status !== 'SUCCESS') {
    console.error('[payment] 藍新回傳非 SUCCESS', {
      status: callback.status,
      merchantOrderNo: callback.merchantOrderNo,
    })
    const code = encodeURIComponent(callback.status || 'unknown')
    return sendRedirect(event, `/life/booking-complete?Status=FAILED&reason=newebpay-status&code=${code}`, 302)
  }

  const outcome = await markOrderPaid(
    callback.merchantOrderNo!,
    callback.amount,
    callback.tradeData!,
  )

  // 帶上訂單編號，讓完成頁不必依賴 sessionStorage 才能顯示訂單內容
  // （分頁被關閉、在新分頁開啟或重新整理時 sessionStorage 都會取不到）
  const orderNo = encodeURIComponent(callback.merchantOrderNo!)

  if (outcome === 'amount-mismatch') {
    return sendRedirect(event, `/life/booking-complete?Status=FAILED&reason=amount-mismatch&orderNo=${orderNo}`, 302)
  }

  // 付款本身已成功，只是我方尚未同步；不謊稱失敗，但也不宣告已完成付款
  if (outcome === 'sync-failed') {
    return sendRedirect(event, `/life/booking-complete?Status=SUCCESS&reason=sync-pending&orderNo=${orderNo}`, 302)
  }

  return sendRedirect(event, `/life/booking-complete?Status=SUCCESS&orderNo=${orderNo}`, 302)
})
