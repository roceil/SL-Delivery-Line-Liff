import type { H3Event } from 'h3'

/**
 * 測試期間的存取限制 —— 只有白名單 IP 看得到網站，其餘一律顯示「系統開發中」。
 *
 * 啟用方式：設定環境變數 ACCESS_ALLOWED_IPS（逗號分隔）。
 * 留空或不設定即為停用，全站正常開放，因此正式上線時只要清掉變數，
 * 不需要動到程式碼。
 *
 * 這是「避免不相干的人誤入未完成的網站」，不是資安機制。
 * x-forwarded-for 可由來源端偽造，知道白名單 IP 的人有辦法繞過；
 * 真正的權限控管仍由 server/utils/auth.ts 的 LINE 身分驗證負責。
 */

/**
 * 不受白名單限制的路徑。
 *
 * 這些是「別人的伺服器」主動打進來的，來源 IP 不可能是甲方的 VPN，
 * 一旦被擋下會直接壞掉：
 * - payment/notify-server：藍新的 NotifyURL，擋掉會導致付款成功但訂單不會更新
 * - payment/notify：藍新的 ReturnURL，雖然是買家瀏覽器導回，但若中途 VPN 斷線
 *   就會連付款結果都收不到，且此路徑本身已有簽章驗證，放行不會有風險
 * - line/webhook：LINE 平台的事件通知，擋掉會讓官方帳號的自動回覆全部失效
 */
const BYPASS_PATHS = [
  '/api/payment/notify-server',
  '/api/payment/notify',
  '/api/line/webhook',
]

/**
 * 取出這次請求所經過的所有 IP。
 *
 * Zeabur 是反向代理架構，socket 上的位址是它的內部節點，真實來源在
 * x-forwarded-for 裡。而代理有幾層無法事先確定（h3 的 getRequestIP 只取
 * 第一個，層數一變就抓錯），因此整條鏈都取出來、其中任一個命中即放行。
 */
function getRequestIpChain(event: H3Event): string[] {
  const forwarded = getHeader(event, 'x-forwarded-for') ?? ''
  const socketAddress = event.node.req.socket.remoteAddress ?? ''

  return [...forwarded.split(','), socketAddress]
    .map(ip => normalizeIp(ip))
    .filter(Boolean)
}

/**
 * 正規化 IP 字串，讓白名單比對不會因為寫法不同而失敗。
 *
 * - IPv4-mapped IPv6（::ffff:203.0.113.1）還原成 IPv4
 * - IPv6 去掉方括號與埠號、統一小寫
 */
function normalizeIp(raw: string): string {
  let ip = raw.trim().toLowerCase()

  if (!ip)
    return ''

  // [2001:db8::1]:443 → 2001:db8::1
  const bracketed = ip.match(/^\[(.+)\]/)
  if (bracketed?.[1])
    return bracketed[1]

  // 203.0.113.1:54321 → 203.0.113.1（IPv6 冒號多，不能一律切）
  if (ip.split(':').length === 2)
    ip = ip.split(':')[0] ?? ip

  return ip.replace(/^::ffff:/, '')
}

/** 擋下時顯示的頁面，刻意不依賴任何外部檔案，避免靜態資源也被擋而開天窗 */
function renderMaintenancePage(detectedIp: string): string {
  return `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>系統開發中</title>
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
    padding: 24px; background: #f8fafc; color: #0f172a;
    font-family: "Noto Sans TC", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  .card { max-width: 22rem; text-align: center; }
  .icon { font-size: 48px; line-height: 1; margin-bottom: 20px; }
  h1 { font-size: 20px; font-weight: 700; margin: 0 0 12px; }
  p { font-size: 15px; line-height: 1.7; color: #475569; margin: 0; }
  .ip { margin-top: 28px; font-size: 12px; color: #94a3b8; font-family: ui-monospace, monospace; }
</style>
</head>
<body>
  <div class="card">
    <div class="icon">🚧</div>
    <h1>系統開發中</h1>
    <p>你行李來目前正在整理中，<br>暫時無法提供服務，敬請見諒。</p>
    <p class="ip">${detectedIp || 'unknown'}</p>
  </div>
</body>
</html>`
}

export default defineEventHandler((event) => {
  const allowList = (process.env.ACCESS_ALLOWED_IPS ?? '')
    .split(',')
    .map(ip => normalizeIp(ip))
    .filter(Boolean)

  // 沒設定白名單就是沒啟用，維持正常開放
  if (allowList.length === 0)
    return

  const path = event.path ?? ''

  if (BYPASS_PATHS.some(bypass => path.startsWith(bypass)))
    return

  const ipChain = getRequestIpChain(event)

  if (ipChain.some(ip => allowList.includes(ip)))
    return

  console.warn('[access-guard] 已擋下非白名單來源', { path, ipChain })

  // 回 200 而非 503：Zeabur 的健康檢查若收到 5xx 會判定服務異常而反覆重啟
  setResponseStatus(event, 200)
  setResponseHeader(event, 'content-type', 'text/html; charset=utf-8')
  // 擋下的結果不可被 CDN 或瀏覽器快取，否則白名單改了也不會生效
  setResponseHeader(event, 'cache-control', 'no-store')

  // 頁面上顯示偵測到的 IP，方便直接把甲方的 VPN 位址抄進白名單
  return renderMaintenancePage(ipChain[0] ?? '')
})
