import { buildCheckCode, decryptTradeInfo, hashTradeInfo } from './newebpay'

/** 驗證失敗的原因，會作為 query 參數帶到完成頁，方便對照 log */
export type NewebpayCallbackFailure
  = | 'missing-fields'
    | 'sha-mismatch'
    | 'decrypt-error'
    | 'missing-order-no'
    | 'checkcode-mismatch'

export interface NewebpayCallbackResult {
  ok: boolean
  reason?: NewebpayCallbackFailure
  /** 藍新回傳的交易狀態，SUCCESS 以外皆視為未完成付款 */
  status?: string
  merchantOrderNo?: string
  amount?: number
  /** 供退款與對帳使用的交易明細（TradeNo / Auth / Card4No / PayTime 等） */
  tradeData?: Record<string, unknown>
}

/**
 * 驗證並解析藍新的付款回呼。
 *
 * ReturnURL（瀏覽器導回）與 NotifyURL（藍新伺服器背景通知）送來的內容格式相同，
 * 因此兩個入口共用這段邏輯，避免驗證規則各寫一份而逐漸走樣。
 *
 * 驗證分三層，缺一不可：
 * 1. TradeSha —— 確認整包 TradeInfo 確實由持有相同 HashKey/HashIV 的一方簽出
 * 2. CheckCode —— 確認解密後的關鍵欄位未被竄改
 * 3. 金額比對 —— 由呼叫端以 amount 對照訂單應付金額（見 verifyAmount）
 */
export function parseNewebpayCallback(
  body: Record<string, string>,
  hashKey: string,
  hashIV: string,
): NewebpayCallbackResult {
  const { Status, TradeInfo, TradeSha } = body

  if (!TradeInfo || !TradeSha) {
    console.error('[payment] 回呼缺少 TradeInfo 或 TradeSha, body keys =', Object.keys(body))
    return { ok: false, reason: 'missing-fields' }
  }

  if (hashTradeInfo(TradeInfo, hashKey, hashIV) !== TradeSha) {
    console.error('[payment] TradeSha 驗證失敗')
    return { ok: false, reason: 'sha-mismatch' }
  }

  let tradeInfo: Record<string, unknown>

  try {
    tradeInfo = decryptTradeInfo(TradeInfo, hashKey, hashIV)
  }
  catch (error) {
    console.error('[payment] TradeInfo 解密失敗', error)
    return { ok: false, reason: 'decrypt-error' }
  }

  // 信用卡 MPG 為 { Status, Message, Result: {...} }，其他付款方式可能直接放在頂層
  const result = (tradeInfo.Result as Record<string, unknown> | undefined) ?? tradeInfo
  const status = (Status as string | undefined) ?? (tradeInfo.Status as string | undefined) ?? ''
  const merchantOrderNo = (result.MerchantOrderNo as string)
    || (tradeInfo.MerchantOrderNo as string)
    || ''

  if (!merchantOrderNo) {
    console.error('[payment] 無法從回呼取得 MerchantOrderNo', tradeInfo)
    return { ok: false, reason: 'missing-order-no' }
  }

  // CheckCode 僅在付款成功且欄位齊全時才會出現，缺少時不阻擋（例如失敗交易）
  const checkCode = result.CheckCode as string | undefined

  if (checkCode) {
    const expected = buildCheckCode(
      {
        Amt: result.Amt as string | number,
        MerchantID: result.MerchantID as string,
        MerchantOrderNo: merchantOrderNo,
        TradeNo: result.TradeNo as string,
      },
      hashKey,
      hashIV,
    )

    if (expected !== checkCode) {
      console.error('[payment] CheckCode 驗證失敗', { merchantOrderNo })
      return { ok: false, reason: 'checkcode-mismatch' }
    }
  }

  const rawAmount = result.Amt
  const amount = typeof rawAmount === 'number' ? rawAmount : Number(rawAmount)

  return {
    ok: true,
    status,
    merchantOrderNo,
    amount: Number.isFinite(amount) ? amount : undefined,
    tradeData: result,
  }
}

interface OrderPaymentState {
  paymentStatus?: string | null
  totalAmount?: number | null
}

export type MarkOrderPaidOutcome
  = | 'updated'
    | 'already-paid'
    | 'already-settled'
    | 'amount-mismatch'
    | 'sync-failed'

/**
 * 已進入退款流程的付款狀態。
 *
 * 這些狀態一旦被回呼覆寫回 paid，帳目會與實際金流相反，且 payment_trade_data
 * 會被新的交易資料蓋掉，導致後續無法追溯原始退款依據，因此一律不覆寫。
 */
const SETTLED_PAYMENT_STATUSES = new Set([
  'refunded',
  'refunding',
  'pending_refund',
  'no_refund_required',
])

/**
 * 將訂單標記為已付款。
 *
 * - 冪等：已是 paid 就直接返回，避免兩條回呼路徑重複寫入而蓋掉退款所需的
 *   payment_trade_data
 * - 不覆寫退款狀態：已退款／退款中的訂單不會被回呼翻回已付款
 * - 金額比對：藍新回傳金額與訂單應付金額不符時拒絕標記
 * - 重試：Backstation 短暫故障時重試三次（1s / 2s / 4s）
 *
 * 注意：三次都失敗時只會留下 log，LIFF 端沒有可落地的儲存空間。
 * 永久失敗需人工對帳補單。
 */
export async function markOrderPaid(
  merchantOrderNo: string,
  amount: number | undefined,
  tradeData: Record<string, unknown>,
): Promise<MarkOrderPaidOutcome> {
  let order: OrderPaymentState | null = null

  try {
    order = await backstationFetch<OrderPaymentState>(`/api/orders/${merchantOrderNo}`)
  }
  catch (error) {
    // 查不到訂單不代表付款無效，仍嘗試寫入，讓下方重試與告警機制接手
    console.error('[payment] 查詢訂單現況失敗，略過冪等與金額檢查', { merchantOrderNo, error })
  }

  if (order?.paymentStatus === 'paid') {
    console.warn('[payment] 訂單已標記為已付款，略過重複處理', { merchantOrderNo })
    return 'already-paid'
  }

  if (order?.paymentStatus && SETTLED_PAYMENT_STATUSES.has(order.paymentStatus)) {
    console.error('[payment][需人工處理] 已進入退款流程的訂單收到付款通知，未覆寫狀態', {
      merchantOrderNo,
      currentPaymentStatus: order.paymentStatus,
      tradeData,
    })
    return 'already-settled'
  }

  if (amount != null && order?.totalAmount != null && amount !== order.totalAmount) {
    console.error('[payment] 付款金額與訂單金額不符，拒絕標記已付款', {
      merchantOrderNo,
      paidAmount: amount,
      orderAmount: order.totalAmount,
    })
    return 'amount-mismatch'
  }

  const delays = [1000, 2000, 4000]

  for (let attempt = 0; attempt <= delays.length; attempt++) {
    try {
      await backstationFetch(`/api/orders/${merchantOrderNo}`, {
        method: 'PATCH',
        body: { paymentStatus: 'paid', paymentTradeData: tradeData },
      })

      console.warn('[payment] 已標記為已付款', { merchantOrderNo, attempt })
      return 'updated'
    }
    catch (error) {
      const delay = delays[attempt]

      if (delay == null) {
        console.error(
          `[payment][需人工處理] 訂單 ${merchantOrderNo} 已於藍新付款成功，但寫入 Backstation 失敗`,
          { merchantOrderNo, tradeData, error },
        )
        return 'sync-failed'
      }

      console.error('[payment] 標記已付款失敗，稍後重試', { merchantOrderNo, attempt, delay, error })
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  return 'sync-failed'
}
