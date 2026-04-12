import { decryptTradeInfo, hashTradeInfo } from '../../utils/newebpay'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const hashKey = config.newebpayHashKey as string
  const hashIV = config.newebpayHashIV as string
  const backstationApiUrl = config.public.backstationApiUrl as string

  const body = await readBody<Record<string, string>>(event)
  const { Status, TradeInfo, TradeSha } = body

  if (!TradeInfo || !TradeSha) {
    console.error('NewebPay notify: 缺少 TradeInfo 或 TradeSha')
    return sendRedirect(event, '/life/booking-complete?Status=FAILED', 302)
  }

  // 驗證 TradeSha 正確性
  const expectedSha = hashTradeInfo(TradeInfo, hashKey, hashIV)
  if (expectedSha !== TradeSha) {
    console.error('NewebPay notify: TradeSha 驗證失敗')
    return sendRedirect(event, '/life/booking-complete?Status=FAILED', 302)
  }

  // 解密 TradeInfo 取得付款結果
  let tradeData: Record<string, unknown>
  try {
    tradeData = decryptTradeInfo(TradeInfo, hashKey, hashIV)
  }
  catch (err) {
    console.error('NewebPay notify: TradeInfo 解密失敗', err)
    return sendRedirect(event, '/life/booking-complete?Status=FAILED', 302)
  }

  const merchantOrderNo = (tradeData.MerchantOrderNo as string) ?? ''
  console.log(`NewebPay notify: Status=${Status}, MerchantOrderNo=${merchantOrderNo}`)

  if (Status === 'SUCCESS') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await $fetch(`${backstationApiUrl}/api/orders/${merchantOrderNo}/payment`, {
        method: 'PATCH' as any,
        body: { paymentStatus: 'paid', tradeData },
      })
    }
    catch (err) {
      console.error('NewebPay notify: 更新訂單付款狀態失敗', err)
    }
    return sendRedirect(event, '/life/booking-complete?Status=SUCCESS', 302)
  }

  return sendRedirect(event, '/life/booking-complete?Status=FAILED', 302)
})
