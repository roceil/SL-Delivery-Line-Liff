import { decryptTradeInfo, hashTradeInfo } from '../../utils/newebpay'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const hashKey = config.newebpayHashKey as string
  const hashIV = config.newebpayHashIV as string
  const backstationApiUrl = config.public.backstationApiUrl as string

  const body = await readBody<Record<string, string>>(event)
  const { Status, TradeInfo, TradeSha } = body

  console.log('[notify] received body keys=', Object.keys(body), 'Status=', Status, 'TradeInfo.len=', TradeInfo?.length, 'TradeSha.len=', TradeSha?.length)

  if (!TradeInfo || !TradeSha) {
    console.error('[notify] FAIL: 缺少 TradeInfo 或 TradeSha, body=', body)
    return sendRedirect(event, '/life/booking-complete?Status=FAILED&reason=missing-fields', 302)
  }

  const expectedSha = hashTradeInfo(TradeInfo, hashKey, hashIV)
  if (expectedSha !== TradeSha) {
    console.error('[notify] FAIL: TradeSha 驗證失敗', { expected: expectedSha, got: TradeSha, hashKeyLen: hashKey?.length, hashIVLen: hashIV?.length })
    return sendRedirect(event, '/life/booking-complete?Status=FAILED&reason=sha-mismatch', 302)
  }

  let tradeData: Record<string, unknown>
  try {
    tradeData = decryptTradeInfo(TradeInfo, hashKey, hashIV)
  }
  catch (err) {
    console.error('[notify] FAIL: TradeInfo 解密失敗', err)
    return sendRedirect(event, '/life/booking-complete?Status=FAILED&reason=decrypt-error', 302)
  }

  // 信用卡 MPG: { Status, Message, Result: { MerchantOrderNo, ... } }
  // 其他付款方式可能直接放在 top-level，兩者都支援
  const result = (tradeData.Result as Record<string, unknown> | undefined) ?? tradeData
  const merchantOrderNo = (result.MerchantOrderNo as string)
    || (tradeData.MerchantOrderNo as string)
    || ''
  console.log('[notify] decrypted', { Status, merchantOrderNo, tradeData })

  if (!merchantOrderNo) {
    console.error('[notify] FAIL: 無法從 tradeData 取得 MerchantOrderNo', tradeData)
    return sendRedirect(event, '/life/booking-complete?Status=FAILED&reason=missing-order-no', 302)
  }

  if (Status === 'SUCCESS') {
    try {
      // Backstation PATCH endpoint: /api/orders/{orderNumber} 支援 paymentStatus + paymentTradeData
      // 信用卡 MPG 的 Result 包含 TradeNo / Auth / Card4No / PayTime 等供退款/對帳使用
      const paymentTradeData = (tradeData.Result as Record<string, unknown> | undefined) ?? tradeData
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await $fetch(`${backstationApiUrl}/api/orders/${merchantOrderNo}`, {
        method: 'PATCH' as any,
        body: { paymentStatus: 'paid', paymentTradeData },
      })
      console.log('[notify] paymentStatus updated for', merchantOrderNo)
    }
    catch (err) {
      console.error('[notify] FAIL: 更新 Backstation paymentStatus 失敗', err)
    }
    return sendRedirect(event, '/life/booking-complete?Status=SUCCESS', 302)
  }

  console.error('[notify] FAIL: NewebPay 回傳非 SUCCESS Status=', Status, 'tradeData=', tradeData)
  return sendRedirect(event, `/life/booking-complete?Status=FAILED&reason=newebpay-status&code=${encodeURIComponent(Status || 'unknown')}`, 302)
})
