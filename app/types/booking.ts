export interface Location {
  id: number // 從 Backstation API 取得的 ID（數字）
  name: string
  address: string
  type?: string // 地點類型名稱
  typeId?: number // 地點類型 ID
  area?: string // 區域
  latitude?: number | null
  longitude?: number | null
}

// 對齊 backstation orders_status 表（id 1..9），加上前端原本的 in_transit 別名相容
// pending=待確認 / confirmed=已確認 / assigned=已分派 / in_delivery=配送中 / received=已收件
// delivered=已送達 / cancelled=已取消 / completed=已完成 / overdue=逾期
export type BookingStatus
  = | 'pending'
    | 'confirmed'
    | 'assigned'
    | 'in_delivery'
    | 'received'
    | 'in_transit'
    | 'delivered'
    | 'completed'
    | 'cancelled'
    | 'overdue'

export type ServicePlan = 'one_way' | 'round_trip' | 'merchant' | string

/** 單一程（去程或回程）的運送進度 */
export interface OrderLeg {
  taskDate: string | null // 該程的預定運送日
  status: string | null // 對應 orders_status，例如 received / in_delivery / delivered
  isCompleted: boolean
  completedAt: string | null
  scheduleId: string | null // 尚未排入行程時為 null
}

export interface OrderLegs {
  outbound: OrderLeg | null
  inbound: OrderLeg | null
}

export interface BookingOrder {
  id: string // UUID
  orderNumber?: string // 訂單編號，例如 LQP260821001；客服與後台對帳用
  voucherId?: string // 取件憑證碼 (nano-id)，QR Code 核銷用，非訂單編號
  userId: string // LINE userId
  userName: string // 用戶名稱（旅客姓名）
  phone?: string // 旅客電話
  status: BookingStatus
  bookingDate: string // YYYY-MM-DD
  pickupTime: string // HH:mm
  luggageCount: number // 行李件數
  servicePlan?: ServicePlan | null // 服務方案：用於計算總計
  totalAmount?: number | null // 應付金額，由後台費用明細加總，是實際收費依據
  statusTimeline?: Record<string, string> | null // 各訂單狀態的首次發生時間，供進度條標示
  legs?: OrderLegs | null // 去程／回程各自的進度；單程訂單只有 outbound
  paymentStatus?: string | null // unpaid/paid/refunded ...
  recipientName?: string | null // 領件人姓名（未填回退到旅客）
  recipientPhone?: string | null // 領件人電話（未填回退到旅客）
  pickupLocation: Location
  deliveryLocation: Location
  specialNote?: string // 特殊備註
  createdAt: string
  updatedAt: string
  qrCode?: string // Base64
}

// 服務方案單價（NT$/件），與 booking.vue 上的方案表同步
export const SERVICE_PLAN_PRICE: Record<string, number> = {
  one_way: 150,
  round_trip: 300,
  merchant: 0, // 商家代售由商家票券抵扣，顧客不另外付費
}

export interface UserProfile {
  userId: string
  displayName: string // 從 LINE(不可編輯)
  phoneNumber?: string // 可編輯
  email?: string // 可編輯
  updatedAt: string
}

export type PlatformType = 'trip' | 'klook'

export interface QRCodeData {
  voucherId: string // 使用 voucher_id 而非 order id
  type: 'booking_order'
  version: string
}

export interface PlatformQRCodeData {
  platform: PlatformType // 平台類型: trip 或 klook
  orderIdentifier: string // Trip 的 order_number 或 Klook 的 reseller_reference
  type: 'platform_order'
  version: string
}

export interface TripOrder {
  id: number
  orderNumber: string
  productId: number
  status: number
  statusText: string // 狀態文字描述
  departureDate: string // YYYY-MM-DD
  quantity: number
  useQuantity: number
  cancelQuantity: number
  availableQuantity: number // 剩餘可用數量
  contacts: {
    name: string
    phone: string
  }
  vouchers?: string
  itemId?: string
  sequenceId?: string
  createdAt: string
  updatedAt: string
}

export interface KlookOrder {
  id: number
  resellerReference: string
  status: number
  statusText: string // 狀態文字描述
  statusCode?: string // 狀態代碼
  productId: number
  departureDate: string // YYYY-MM-DD
  quantity: number
  useQuantity: number
  cancelQuantity: number
  availableQuantity: number // 剩餘可用數量
  contacts: {
    name: string
    phone: string
  }
  unitItems?: any
  notes?: string
  optionId?: string
  uuid?: string
  createdAt: string
  updatedAt: string
}
