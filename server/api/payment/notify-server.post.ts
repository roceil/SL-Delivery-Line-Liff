import { markOrderPaid, parseNewebpayCallback } from '../../utils/newebpay-notify'

/**
 * 藍新 NotifyURL —— 由藍新伺服器背景 POST 通知。
 *
 * 與 ReturnURL 的差別：
 * - 不做任何導向，回應純文字 OK 讓藍新知道已收到
 * - 不受買家是否關閉 LINE 影響，是付款結果真正可靠的來源
 *
 * 由於藍新未保證會重送，這裡即使我方寫入失敗也回 200，
 * 失敗情形改由 markOrderPaid 內的重試與告警 log 處理。
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const hashKey = config.newebpayHashKey as string
  const hashIV = config.newebpayHashIV as string

  const body = await readBody<Record<string, string>>(event)
  const callback = parseNewebpayCallback(body, hashKey, hashIV)

  if (!callback.ok) {
    // 驗證失敗代表這通請求不可信，直接拒絕
    throw createError({ statusCode: 400, message: `invalid callback: ${callback.reason}` })
  }

  if (callback.status !== 'SUCCESS') {
    console.error('[payment] NotifyURL 收到非 SUCCESS 狀態', {
      status: callback.status,
      merchantOrderNo: callback.merchantOrderNo,
    })
    return 'OK'
  }

  await markOrderPaid(
    callback.merchantOrderNo!,
    callback.amount,
    callback.tradeData!,
  )

  return 'OK'
})
