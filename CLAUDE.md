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
