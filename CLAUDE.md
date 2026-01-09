# CLAUDE.md

此檔案為 Claude Code (claude.ai/code) 在此專案中工作時提供的指引說明。

## 開發指令

- **開發伺服器**: `pnpm dev`
- **建置專案**: `pnpm build`
- **預覽建置結果**: `pnpm preview`
- **靜態生成**: `pnpm generate`
- **程式碼檢查**: `pnpm lint` (使用 `pnpm lint:fix` 自動修復)
- **型別檢查**: `pnpm typecheck`
- **ESLint 設定檢視器**: `pnpm lint:view`

## 專案架構

這是一個使用 **Nuxt 4** 與 **TailwindCSS v4** 的起始專案模板。

### 核心技術堆疊

- **Nuxt 4** - 全端 Vue 框架
- **TailwindCSS v4** - Utility-first CSS 框架，採用全新的 CSS-first 架構
- **Pinia** - 狀態管理，使用 Composition API 模式
- **VueUse** - Vue Composition 實用工具
- **ESLint** - 程式碼檢查，使用 @antfu/eslint-config + better-tailwindcss 外掛

### 目錄結構

- `app/` - 主要應用程式程式碼 (Nuxt 4 使用 `app/` 而非 `src/`)
  - `components/` - Vue 元件
  - `pages/` - 檔案路由頁面
  - `layouts/` - 版面配置元件
  - `stores/` - Pinia stores (使用 Composition API 模式)
  - `constants/` - 應用程式常數
  - `assets/css/` - 全域 CSS 與 TailwindCSS 進入點
- `server/api/` - 伺服器 API 路由 (Nitro)
- `public/` - 靜態資源

### 主要設定說明

**Nuxt 設定 (`nuxt.config.ts`)**:

- TailwindCSS v4 透過 Vite 外掛整合
- Pinia stores 目錄: `./app/stores/**`
- ESLint 整合設定 standalone: false

**ESLint 設定 (`eslint.config.js`)**:

- 以 @antfu/eslint-config 為基礎
- 透過 eslint-plugin-better-tailwindcss 自訂 TailwindCSS 規則
- TailwindCSS 進入點: `./app/assets/css/main.css`
- 嚴格的 Vue 模板規則 (max-attributes-per-line, html-self-closing)

**套件管理工具**:

- 專用 **pnpm** (透過 preinstall hook 強制執行)
- 最低 pnpm 版本需求: 10.0.0

### 狀態管理模式

Pinia stores 使用 Composition API 模式，採用 `defineStore(() => {})` 語法，而非 Options API。所有 stores 皆包含 HMR 支援 (`acceptHMRUpdate`)。

## 重要

- 回答問題時，請確保使用繁體中文進行回答。
- 生成程式碼時，如果遇到 if else 的判斷，請使用 early return 的方式來減少巢狀層級。

## 平台訂單整合架構

### Backstation API 端點

已實作以下 API 端點用於查詢平台訂單狀態與可用數量：

1. **查詢 Trip 訂單 API**
   - 路徑: `GET /api/platform-orders/trip/:voucherCode`
   - 參數: `voucherCode` (Trip 憑證號碼，對應 `trip_orders.vouchers` 欄位)
   - 功能: 使用憑證號碼查詢並驗證 Trip 訂單狀態，回傳訂單詳情與剩餘可用數量
   - 狀態驗證: 1=新訂待確認, 2=新訂已確認, 4=部份取消, 6=已取物品, 7=部份使用

2. **查詢 Klook 訂單 API**
   - 路徑: `GET /api/platform-orders/klook/:resellerReference`
   - 功能: 查詢並驗證 Klook 訂單狀態，回傳訂單詳情與剩餘可用數量
   - 狀態驗證: 1=待確認(ON_HOLD), 2=已確認(CONFIRMED)

### LIFF 整合流程

1. 用戶在「登錄訂單」頁面掃描平台訂單 QR Code
2. **QR Code 格式支援**：
   - JSON 格式（系統內部使用）：包含 `type`、`platform`、`orderIdentifier` 等欄位
   - 純文字格式（平台原生 QR Code）：直接是憑證號碼或訂單編號
3. **自動平台偵測**：當掃描純文字 QR Code 時
   - 先嘗試查詢 Trip 訂單（使用 `vouchers` 欄位）
   - 若 Trip 查詢失敗，再嘗試查詢 Klook 訂單（使用 `reseller_reference` 欄位）
   - 若兩個平台都查詢失敗，顯示錯誤訊息
4. LIFF 透過代理 API 向 Backstation 查詢訂單
5. Backstation 驗證訂單狀態與可用數量
6. 驗證通過後導向預約頁面，顯示平台訂單資訊
7. 用戶填寫配送資訊後提交
8. **建立訂單記錄**（三層架構）：
   - 建立 `net_orders` 記錄，關聯到 `trip_orders` 或 `klook_orders`
   - 建立 `orders` 記錄，`platform_type=3` (Net)，`platform_id` 指向 `net_orders.id`
   - 完成三層訂單關聯：`orders` → `net_orders` → `trip_orders/klook_orders`
