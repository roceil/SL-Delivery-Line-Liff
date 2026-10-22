/**
 * 測試機不給搜尋引擎收錄，避免跟正式站搶搜尋結果。
 *
 * Fly 會在每台機器放 FLY_APP_NAME，測試機的 app 名稱結尾是 -dev（見 fly.dev.toml）。
 * 正式機、Zeabur、本機都沒有這個結尾，維持原樣。
 */
export default defineEventHandler((event) => {
  if (process.env.FLY_APP_NAME?.endsWith('-dev'))
    setResponseHeader(event, 'X-Robots-Tag', 'noindex, nofollow')
})
