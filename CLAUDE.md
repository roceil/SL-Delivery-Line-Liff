# CLAUDE.md

此檔案為 Claude Code (claude.ai/code) 在此專案中工作時提供的指引說明。

## 重要

- 回答問題時，請確保使用繁體中文進行回答。
- 生成程式碼時，如果遇到 if else 的判斷，請使用 early return 的方式來減少巢狀層級。

## 這是什麼專案

「**你行李來**」小琉球行李寄送服務的 **LINE LIFF 前台**，旅客在 LINE 內完成
預約、付款與查詢訂單。

**本專案不直接連資料庫。** `server/api/` 底下全部只是代理層，把請求轉發給
Backstation（`BACKSTATION_API_URL`）。資料庫、後台管理介面、司機派工都在
Backstation。

### 相關專案（位於同層目錄）

| 專案 | 角色 |
|---|---|
| `../SL-Delivery-Backstation` | 後台管理介面 + 所有資料庫存取 |
| `../SL-Delivery-Verification` | 司機端（直連 Supabase，不經過 Backstation）|
| `../Tripackage-Trip-API` | Trip 平台串接，會呼叫 Backstation 建立／取消訂單 |

## 開發指令

- **開發伺服器**: `pnpm dev`（port 3003）
- **建置專案**: `pnpm build`
- **預覽建置結果**: `pnpm preview`
- **程式碼檢查**: `pnpm lint`（`pnpm lint:fix` 會掃全專案並自動修改，注意波及範圍）
- **型別檢查**: `pnpm typecheck`

本機開發需同時啟動 Backstation，並以 ngrok 之類的工具提供 https 網址，
再把該網址填回 LINE Developers 的 LIFF Endpoint URL 與 Webhook URL。

## 技術堆疊

Nuxt 4、TailwindCSS v4（CSS-first）、Pinia（Composition API + HMR）、VueUse、
@line/liff、@antfu/eslint-config + better-tailwindcss。套件管理限定 pnpm。

## 目錄結構

- `app/` — 前端（Nuxt 4 使用 `app/` 而非 `src/`）
  - `components/life/` — 行李寄送相關元件，自動匯入名稱前綴為 `Life`
    （例如 `RouteSelector.vue` → `<LifeRouteSelector>`）
  - `pages/life/` — 旅客端頁面
  - `stores/` — Pinia stores
  - `composables/` — `useApiFetch`（帶身分驗證的 API 入口）、`useLiff` 等
- `server/api/` — 代理到 Backstation 的 Nitro 路由
- `server/utils/` — `auth.ts`（LINE 身分驗證）、`backstation.ts`（呼叫後台）、
  `newebpay.ts`（藍新金流加解密）

## 身分驗證

前端一律透過 `useApiFetch()` 呼叫自家 API，它會自動夾帶
`Authorization: Bearer <liff.getAccessToken()>`。

後端以 `requireLineUserId(event)` 取得可信任的 lineUserId：先向 LINE 的
verify 端點確認 token 有效且 `client_id` 屬於本 channel，再由 profile 端點
取出 `userId`。

**不要信任 client 傳來的 lineUserId**（網址參數或 body），一律以驗證結果為準。
需要比對是否為本人時使用 `requireOwnLineUserId(event, targetId)`。

使用 access token 而非 ID token：access token 有效期 12 小時且 `liff.init()`
會自動更新；ID token 僅 1 小時且不會更新，逾期後 `liff.isLoggedIn()` 仍為
true，會造成反覆被拒。

例外（維持公開）：`delivery-points`（配送點清單）、`payment/notify`
（藍新伺服器回呼，加驗證會直接壞掉）。

## 呼叫 Backstation

一律使用 `backstationFetch('/api/...')`，它會補上 base URL 與內部服務金鑰
`x-internal-api-key`。Backstation 已對所有 `/api/*` 啟用驗證，未帶金鑰會回 401。

`BACKSTATION_API_URL` 與 `BACKSTATION_API_KEY` 皆為 server-only，
**不可放進 `runtimeConfig.public`**，否則會隨頁面送到瀏覽器。

## 平台訂單整合

### 查詢平台訂單

- `GET /api/platform-orders/trip/:voucherCode`
  以 Trip 憑證號碼（`trip_orders.vouchers`）查詢，狀態 1/2/4/6/7 視為可用
- `GET /api/platform-orders/klook/:resellerReference`
  以 Klook 訂單編號查詢，狀態 1(ON_HOLD)/2(CONFIRMED) 視為可用

### 預約流程

1. 旅客在「登錄訂單」頁掃描平台訂單 QR Code
2. QR Code 支援兩種格式：
   - JSON（系統內部）：含 `type`、`platform`、`orderIdentifier`
   - 純文字（平台原生）：直接是憑證號碼或訂單編號
3. 掃到純文字時自動偵測平台：先試 Trip，失敗再試 Klook，皆失敗則顯示錯誤
4. 透過代理 API 向 Backstation 查詢並驗證狀態與可用數量
5. 通過後導向預約頁，帶入平台訂單資訊
6. 旅客填寫配送資訊後提交

### 訂單三層架構

建立訂單時 Backstation 會寫入三層關聯：

```
orders (platform_type=3) → net_orders → trip_orders / klook_orders
```

`orders.platform_id` 只是字串，**指向哪張表取決於 `platform_type`**
（3=net_orders、4=normal_orders）。寫 SQL 時務必一併帶上 `platform_type`
條件，否則散客訂單會誤配到平台訂單。

## 金流

藍新 MPG。`payment/create` 產生加密參數後由前端以隱藏表單送出，
`payment/notify` 接收回調並驗簽。

**已知問題：目前只設了 `ReturnURL`（瀏覽器導回），沒有 `NotifyURL`
（伺服器對伺服器）。** 旅客付款後若在導回前關閉 LINE，訂單會停在未付款。
