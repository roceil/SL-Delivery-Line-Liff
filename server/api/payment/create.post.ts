import { encryptTradeInfo, hashTradeInfo } from '../../utils/newebpay'

interface CreatePaymentRequest {
  orderId: string
  amount: number
  itemDesc: string
  email?: string
  paymentMethod: 'line_pay' | 'credit_card' | 'apple_pay'
}

interface CreatePaymentResponse {
  merchantId: string
  tradeInfo: string
  tradeSha: string
  version: string
  apiUrl: string
}

export default defineEventHandler(async (event): Promise<CreatePaymentResponse> => {
  const config = useRuntimeConfig()
  const body = await readBody<CreatePaymentRequest>(event)

  const { orderId, amount, itemDesc, email, paymentMethod } = body

  const merchantId = config.newebpayMerchantId as string
  const hashKey = config.newebpayHashKey as string
  const hashIV = config.newebpayHashIV as string
  const apiUrl = config.newebpayApiUrl as string
  const appUrl = config.public.appUrl as string

  if (!merchantId || !hashKey || !hashIV || !apiUrl) {
    throw createError({ statusCode: 500, message: '藍新金流設定不完整' })
  }

  // 取得 origin（去除 /life 等路徑後綴，確保 notify URL 指向正確 host）
  const origin = new URL(appUrl).origin

  const timeStamp = Math.floor(Date.now() / 1000).toString()

  // MerchantOrderNo 長度限制 30 字元，UUID 去除連字號後取前 30 碼
  const merchantOrderNo = orderId.replace(/-/g, '').slice(0, 30)

  // 付款方式 mapping
  const paymentParams: Record<string, number> = {}
  if (paymentMethod === 'line_pay') {
    paymentParams.LINEPAY = 1
  }
  else if (paymentMethod === 'credit_card') {
    paymentParams.CREDIT = 1
  }
  else if (paymentMethod === 'apple_pay') {
    paymentParams.APPLEPAY = 1
  }

  const tradeParams: Record<string, string | number> = {
    MerchantID: merchantId,
    RespondType: 'JSON',
    TimeStamp: timeStamp,
    Version: '2.0',
    MerchantOrderNo: merchantOrderNo,
    Amt: amount,
    ItemDesc: itemDesc,
    ReturnURL: `${origin}/api/payment/notify`,
    ClientBackURL: `${origin}/life/booking-complete`,
    ...paymentParams,
  }

  if (email) {
    tradeParams.Email = email
  }

  const tradeInfo = encryptTradeInfo(tradeParams, hashKey, hashIV)
  const tradeSha = hashTradeInfo(tradeInfo, hashKey, hashIV)

  return {
    merchantId,
    tradeInfo,
    tradeSha,
    version: '2.0',
    apiUrl,
  }
})
