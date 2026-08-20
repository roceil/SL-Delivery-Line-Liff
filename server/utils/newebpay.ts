import { createCipheriv, createDecipheriv, createHash } from 'node:crypto'

/**
 * 使用 AES-256-CBC 加密交易資訊（輸入為物件，輸出為 hex 字串）
 */
export function encryptTradeInfo(
  params: Record<string, string | number>,
  hashKey: string,
  hashIV: string,
): string {
  const queryString = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  ).toString()

  const cipher = createCipheriv('aes-256-cbc', hashKey, hashIV)
  let encrypted = cipher.update(queryString, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return encrypted
}

/**
 * 對 TradeInfo 進行 SHA256 雜湊（格式：HashKey=x&TradeInfo=y&HashIV=z）
 */
export function hashTradeInfo(
  tradeInfo: string,
  hashKey: string,
  hashIV: string,
): string {
  const raw = `HashKey=${hashKey}&${tradeInfo}&HashIV=${hashIV}`
  return createHash('sha256').update(raw).digest('hex').toUpperCase()
}

/**
 * 解密藍新回傳的 TradeInfo（hex → 解密後嘗試 JSON parse，否則回傳 query string 物件）
 *
 * 注意：autoPadding 設為 false 並手動 strip 尾部控制字元。
 * 藍新回傳的 padding 與 Node 預設 PKCS7 驗證有時不相容（會拋 bad decrypt）。
 */
export function decryptTradeInfo(
  encrypted: string,
  hashKey: string,
  hashIV: string,
): Record<string, unknown> {
  const decipher = createDecipheriv('aes-256-cbc', hashKey, hashIV)
  decipher.setAutoPadding(false)
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  // 手動移除尾部 padding（控制字元 \x00-\x1f）
  // eslint-disable-next-line no-control-regex
  decrypted = decrypted.replace(/[\x00-\x1F]+$/g, '')

  try {
    return JSON.parse(decrypted) as Record<string, unknown>
  }
  catch {
    const result: Record<string, string> = {}
    for (const pair of decrypted.split('&')) {
      const eqIndex = pair.indexOf('=')
      if (eqIndex !== -1) {
        result[pair.slice(0, eqIndex)] = decodeURIComponent(pair.slice(eqIndex + 1))
      }
    }
    return result
  }
}
