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

export type BookingStatus = 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled'

export interface BookingOrder {
  id: string // UUID
  voucherId?: string // 訂單憑證號碼 (nano-id)
  userId: string // LINE userId
  userName: string // 用戶名稱
  status: BookingStatus
  bookingDate: string // YYYY-MM-DD
  pickupTime: string // HH:mm
  luggageCount: number // 行李件數
  pickupLocation: Location
  deliveryLocation: Location
  specialNote?: string // 特殊備註
  createdAt: string
  updatedAt: string
  qrCode?: string // Base64
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
