# LQ Porter Design System

設計規範來源：Figma — LQ Porter Design System

---

## Color

### Primary

| Token | Hex |
|-------|-----|
| Primary/100 | `#F4F9FF` |
| Primary/200 | `#EEF6FF` |
| Primary/300 | `#436CCC` |
| Primary/400 | `#2449A0` |
| Primary/500 | `#0D2E7C` |

### Gradient

| Token | 色碼 |
|-------|------|
| Gradient/Neutral | `#FFFFFF 100%` → `#FFFFFF 50%`（16.83° linear）|
| Gradient/Primary/100 | `#8CBCF1` → `#83A7FA`（150.49° linear）|
| Gradient/Primary/200 | `#4090E8` → `#306CF7`（150.49° linear）|

### Neutral

| Token | Hex |
|-------|-----|
| Neutral/0   | `#FFFFFF` |
| Neutral/100 | `#F8F9FA` |
| Neutral/200 | `#E9ECEF` |
| Neutral/300 | `#DEE2E6` |
| Neutral/400 | `#CED4DA` |
| Neutral/500 | `#ADB5BD` |
| Neutral/600 | `#6C757D` |
| Neutral/700 | `#495057` |
| Neutral/800 | `#343A40` |
| Neutral/900 | `#212529` |

### Functional

#### Danger

| Token | Hex |
|-------|-----|
| Functional/Danger/100 | `#FEF0F0` |
| Functional/Danger/200 | `#EBA7A7` |
| Functional/Danger/300 | `#D74F4F` |
| Functional/Danger/400 | `#BD3131` |
| Functional/Danger/500 | `#9B2020` |

#### Success

| Token | Hex |
|-------|-----|
| Functional/Success/100 | `#E9F4EF` |
| Functional/Success/200 | `#9AD1BA` |
| Functional/Success/300 | `#229464` |
| Functional/Success/400 | `#13794E` |
| Functional/Success/500 | `#085C38` |

#### Warning

| Token | Hex |
|-------|-----|
| Functional/Warning/100 | `#FFEFDB` |
| Functional/Warning/200 | `#F9C588` |
| Functional/Warning/300 | `#D87500` |
| Functional/Warning/400 | `#B26000` |
| Functional/Warning/500 | `#8D4C00` |

#### Info

| Token | Hex |
|-------|-----|
| Functional/Info/100 | `#F4F9FF` |
| Functional/Info/200 | `#97C3ED` |
| Functional/Info/300 | `#3087DB` |
| Functional/Info/400 | `#1365B5` |
| Functional/Info/500 | `#014281` |

### Text Colors

| Token | 對應色 | Hex |
|-------|--------|-----|
| text-primary   | Neutral/900 | `#212529` |
| text-secondary | Neutral/600 | `#6C757D` |
| text-muted     | Neutral/500 | `#ADB5BD` |
| text-highlight | Primary/300 | `#436CCC` |
| text-on-dark   | Neutral/White | `#FFFFFF` |

---

## Typography

**字型**：Noto Sans TC
**字重**：Regular（400）、Medium（500）、Bold（700）

### Heading（font-weight: Bold, line-height: 120%）

| Token | Size | Letter Spacing |
|-------|------|----------------|
| H1 | 40px | 5em |
| H2 | 32px | 5em |
| H3 | 28px | 5em |
| H4 | 24px | 5em |
| H5 | 20px | 5em |
| H6 | 18px | 5em |
| H7 | 16px | 5em |
| H8 | 14px | 5em |

### Body Text（font-weight: Regular, line-height: 150%）

| Token | Size | Letter Spacing |
|-------|------|----------------|
| text-xl  | 20px | 5em |
| text-lg  | 18px | 5em |
| text-md  | 16px | 5em |
| text-sm  | 14px | 5em |
| text-xs  | 12px | 5em |
| text-2xs | 11px | 5em |

### Label（font-weight: Medium, line-height: 150%）

| Token | Size | Letter Spacing |
|-------|------|----------------|
| Label/md  | 16px | 5em |
| Label/sm  | 14px | 5em |
| Label/xs  | 12px | 5em |
| Label/2xs | 11px | 5em |

---

## Spacing

| Token | Value |
|-------|-------|
| `#spacing-3xs` | 2px   |
| `#spacing-2xs` | 4px   |
| `#spacing-xs`  | 8px   |
| `#spacing-s`   | 12px  |
| `#spacing-m`   | 16px  |
| `#spacing-l`   | 20px  |
| `#spacing-xl`  | 24px  |
| `#spacing-2xl` | 32px  |
| `#spacing-3xl` | 40px  |
| `#spacing-4xl` | 48px  |
| `#spacing-5xl` | 56px  |
| `#spacing-6xl` | 64px  |
| `#spacing-7xl` | 80px  |
| `#spacing-8xl` | 100px |

---

## Radius

| Token | Value |
|-------|-------|
| `#radius-xs`      | 8px    |
| `#radius-sm`      | 12px   |
| `#radius-lg`      | 24px   |
| `#radius-rounded` | 1000px |

---

## Shadow

| Token | CSS Value |
|-------|-----------|
| `#down-100` | `box-shadow: 0px 4px 12px 0px rgba(32, 78, 184, 0.04)` |
| `#down-200` | `box-shadow: 0px 4px 32px 0px rgba(32, 78, 184, 0.08)` |
| `#top-100`  | `box-shadow: 0px -4px 20px 0px rgba(32, 78, 184, 0.12)` |

---

## Grid

Mobile 版型規格：

| 屬性 | 值 |
|------|-----|
| Type   | Stretch |
| Gutter | 12px |
| Margin | 16px |

---

## Components

### Button

按鈕高度：**48px**（標準 CTA 按鈕）

**Variants（外觀）**：

| Variant | 背景色 | 文字色 | 邊框 |
|---------|--------|--------|------|
| Primary  | Primary/300 `#436CCC` | Neutral/0 `#FFFFFF` | 無 |
| Secondary / Outline | Neutral/0 `#FFFFFF` | Neutral/900 `#212529` | Neutral/200 `#E9ECEF` 1px |

**Padding**：`px-16px py-12px`
**Radius**：`12px`（radius-sm）
**Font**：Label/md（Medium, 16px）

支援 Left Icon（左側圖示）佈局。

---

### Input

表單輸入元件，含 Label、Placeholder、及狀態管理。

**States**：Default、Focus、Error、Disabled

**Padding**：`px-16px py-12px`
**Radius**：`12px`（radius-sm）
**Border**：Neutral/200 `#E9ECEF` 1px
**Background**：Neutral/0 `#FFFFFF`

---

### Badge

標籤元件，用於顯示狀態、類別。

**Sizes**：

| Size  | Font Size | Padding (vertical) |
|-------|-----------|-------------------|
| Small | 11px      | 2px               |
| Large | 12px      | 4px               |

**Padding 水平**：8px
**Radius**：1000px（rounded）

**Types（顏色方案）**：

| Type   | Background | Text Color |
|--------|------------|------------|
| Gray   | Neutral/200 `#E9ECEF`         | Neutral/600 `#6C757D` |
| Blue   | Info/100 `#EAF5FF`            | Info/300 `#3087DB` |
| Green  | Success/100 `#E9F4EF`         | Success/300 `#229464` |
| Red    | Danger/100 `#FEF0F0`          | Danger/300 `#D74F4F` |
| Orange | Warning/100 `#FFEFDB`         | Warning/300 `#D87500` |

---

### Accordion

可展開／收合的面板元件，用於 FAQ、說明清單。

**States**：

| State    | 標頭背景色 | 標頭文字色 |
|----------|-----------|-----------|
| Inactive | 無（白底） | Neutral/900 `#212529` |
| Active   | Primary/300 `#436CCC` | Neutral/0 `#FFFFFF` |

**容器樣式**：
- 邊框：Neutral/200 `#E9ECEF` 1px，底部分隔線
- Radius：12px（radius-sm）
- Shadow：`#down-200`（`0px 4px 32px 0px rgba(32,78,184,0.08)`）

**Padding**：`px-16px py-12px`
**展開圖示**：chevron-down / chevron-up

---

### Progress

進度條元件，顯示訂單處理進度。

**States**：20%、40%、60%、80%、100%

**Track**：
- 高度：2px
- 背景（未完成）：Neutral/400 `#CED4DA`
- 前景（進度）：Gradient/Primary/200（`#4090E8 → #306CF7`）

**指示器**：行李圖示（Luggage Icon），定位於進度前端
**Label**：顯示狀態文字（如「訂單確認中，請稍候」），使用 Gradient/Primary/200 漸層文字

---

### Alert

提示訊息元件，用於顯示操作結果或重要資訊。

**Padding**：`12px`（四邊）
**Radius**：`12px`（radius-sm）
**Font**：Label/sm（Medium, 14px）

**Types**：

| Type    | Background | 邊框色 | 文字色 | 圖示 |
|---------|------------|--------|--------|------|
| Danger  | `#FEF0F0` | `#EBA7A7` | `#D74F4F` | circle-x |
| Success | `#E9F4EF` | `#9AD1BA` | `#229464` | circle-check |
| Warning | `#FFEFDB` | `#F9C588` | `#D87500` | Circle Alert |
| Info    | `#EAF5FF` | `#97C3ED` | `#3087DB` | Circle Alert |

---

### Modal

對話框元件，含 Header、Body、Footer 三個 Slot。

**寬度**：343px（手機版）
**Padding**：20px（四邊）
**Radius**：`12px`（radius-sm）
**Shadow**：`#down-100`（`0px 4px 12px 0px rgba(32,78,184,0.04)`）
**Border**：Neutral/200 `#E9ECEF` 1px

**Header Slot**：
- 標題：H5（Bold, 20px）
- 可選：右上角關閉按鈕（Close icon 24px）

**Body Slot**：
- 文字：Paragraph/md（Regular, 16px）
- 警告文字：Danger/300 `#D74F4F`

**Footer Slot**：
- 按鈕排列：`gap-8px`，佔滿全寬（各 `flex: 1`）
- Primary 按鈕：Primary/300 + 白字
- Secondary 按鈕：白底 + Neutral/200 邊框 + Neutral/900 文字

---

### Floating Bar

浮動狀態條，顯示於訂單詳情頁底部，即時呈現行李狀態。

**寬度**：343px
**Padding**：`px-16px py-12px`
**Radius**：`12px`（radius-sm）
**Shadow**：`#down-200`
**Background**：Gradient/Neutral（白色漸層，帶 backdrop-blur-12px）

**訂單狀態 × 顯示內容**：

| Status | 狀態文字 | 指示點顏色 | 右側資訊 |
|--------|----------|-----------|---------|
| Unchecked（待確認）| 訂單確認中 | — | 請稍候 |
| Checked（待交付）| 待交付行李 | 藍色 | 寄件時間：今日 14:00 前 |
| Picked up（已收件）| 已收件 | 橘色 | 預計配送時間：今日 14:15 |
| Out for Delivery（運送中）| 行李運送中 | 黃色 | 預計送達時間：今日 14:30 |
| Arrived（已送達）| 行李已送達 | 綠色 | 「出示領取通知」連結 |

**狀態文字**：H7（Bold, 16px）

---

### Action Card

訂單卡片元件，呈現寄件訂單的完整資訊與狀態。

**Card Types**：
- **One Way**（單程）：機場 → 民宿 或 民宿 → 機場
- **Round Trip**（來回）：雙向行程

**Order States**：

| State | 說明 |
|-------|------|
| Unchecked | 訂單確認中 |
| Pending   | 待交付行李 |
| Picked up | 已收件 |
| Out for Delivery | 運送中 |
| Arrived   | 已送達 |
| Done      | 完成 |
| Canceled  | 已取消 |

**寬度**：343px
**Radius**：12px（radius-sm）

---

### Quick Link Card

快速連結卡片，用於首頁快捷入口。

#### Horizontal（水平型）

**寬度**：343px
**Padding**：`16px`（四邊）
**Radius**：`12px`（radius-sm）
**Shadow**：`#down-100`
**Background**：Gradient/Neutral（白色漸層）

左側指示點顏色對應狀態：

| Type   | 指示點色 |
|--------|---------|
| Green  | Success/300 `#229464` |
| Orange | Warning/300 `#D87500` |
| Red    | Danger/300 `#D74F4F` |
| Gray   | Neutral/400 `#CED4DA` |

States：Default（無邊框）、Pressed（`#8CBCF1` 邊框 1px）

**內容**：
- 標題：Label/md（Medium, 16px，Neutral/900）
- 描述：Paragraph/sm（Regular, 14px，Neutral/600）
- 右側圖示：Chevron Right（20px）

#### Vertical（垂直型）

**寬度**：150px
**Padding**：`16px`（四邊）
**Radius**：`12px`（radius-sm）
**Shadow**：`#down-100`（Pressed 時 `#down-200`）
**Background**：Gradient/Neutral（白色漸層）

**內容**：
- 頂部圖示：20px
- 文字：Label/md（Medium, 16px，Neutral/900）

---

### Stepper

步驟指示元件，顯示多步驟流程進度。

**兩種佈局**：

#### Horizontal Stepper（水平步驟條）

- 寬度：375px
- States：1、2、3（步驟編號）
- 用於簡單 2～3 步驟流程

#### Vertical Stepper（垂直步驟列表）

- 可呈現 6 個步驟（Step1 ～ Step6）
- 每步驟包含：步驟標題、說明文字、狀態圖示
- 用於詳細操作流程說明

---

### Icon

系統圖示集，尺寸固定 **20px × 20px**。

**Navigation 圖示**：

| Name | 說明 |
|------|------|
| Home icon | 首頁 |
| Booking icon | 預約 |
| Orders icon | 訂單 |
| Profile icon | 會員 |
| Back icon | 返回 |
| Close icon | 關閉 |
| Chevron Right | 向右箭頭 |
| chevron-down | 向下箭頭 |
| Arrow Icon | 箭頭 |
| move-left | 向左移動 |
| Move Right | 向右移動 |

**業務圖示**：

| Name | 說明 |
|------|------|
| Luggage Icon | 行李箱 |
| Box | 箱子 |
| Truck | 卡車 |
| Checkmark in Pin | 地點確認 |
| Cost Details Icon | 費用明細 |
| ticket | 票券 |
| tag | 標籤 |
| ship | 船隻 |
| route | 路線 |
| waypoints | 途經點 |
| map | 地圖 |
| map-pin | 定位點 |

**操作圖示**：

| Name | 說明 |
|------|------|
| plus | 新增 |
| minus | 減少 |
| check | 確認 |
| circle-check | 圓形確認 |
| circle-x | 圓形取消 |
| Circle Alert | 圓形警告 |
| scan-line | 掃描 |
| search | 搜尋 |
| eye | 顯示 |
| eye-off | 隱藏 |
| pencil | 編輯 |
| send | 傳送 |
| printer | 列印 |
| undo-2 | 復原 |

**通知 / 社交圖示**：

| Name | 說明 |
|------|------|
| bell | 通知鐘 |
| bell-ring | 響鈴 |
| message-circle-question | 詢問訊息 |
| headset | 客服耳機 |
| phone | 電話 |
| mail | 郵件 |

**數據 / 管理圖示**：

| Name | 說明 |
|------|------|
| chart-column | 柱狀圖 |
| square-chart-gantt | 甘特圖 |
| trending-up | 上升趨勢 |
| trending-down | 下降趨勢 |
| users-round | 用戶群 |
| wallet | 錢包 |
| store | 門市 |
| settings-2 | 設定 |
| sparkle | 閃光（AI） |

---

## Line 應用程式（LIFF）

小琉球行李寄送 LINE 小程式共三個主要頁面：

### 我要預約

訂單建立流程頁面，支援以下付款方式：
- LINE Pay
- Visa
- Mastercard
- Apple Pay

### 我的訂單

訂單追蹤列表頁。
- 無訂單時顯示空狀態（Empty State）畫面

### 會員中心

用戶個人資訊與設定頁面。
