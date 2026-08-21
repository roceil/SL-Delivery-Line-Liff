import { encryptTradeInfo, hashTradeInfo } from '../../utils/newebpay'

interface CreatePaymentRequest {
  orderId: string
  itemDesc: string
  email?: string
  paymentMethod: 'line_pay' | 'credit_card' | 'apple_pay'
}

interface OrderAmountResponse {
  totalAmount?: number | null
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

  // 要求登入，避免任意對他人訂單產生付款單
  await requireLineUserId(event)

  const { orderId, itemDesc, email, paymentMethod } = body

  // 付款金額一律由後台的費用明細決定，不接受 client 傳入的金額
  // （否則使用者可在瀏覽器把金額改成 1 元付掉整筆訂單，且藍新仍會正常簽章）
  const order = await backstationFetch<OrderAmountResponse>(`/api/orders/${orderId}`)
  const amount = order.totalAmount

  if (amount == null || amount <= 0) {
    console.error('[payment] 訂單金額無效，無法產生付款單', { orderId, amount })
    throw createError({ statusCode: 400, message: '此訂單目前無可付款金額，請聯繫客服' })
  }

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
    // ReturnURL 由買家的瀏覽器導回，客人若在導回前關閉 LINE 就收不到結果；
    // NotifyURL 由藍新伺服器直接背景通知，不受客人端行為影響，兩者都會送達
    ReturnURL: `${origin}/api/payment/notify`,
    NotifyURL: `${origin}/api/payment/notify-server`,
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
