export interface Location {
  id: string
  name: string
  address: string
}

export type BookingStatus = 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled'

export interface BookingOrder {
  id: string // UUID
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

export interface QRCodeData {
  orderId: string
  type: 'booking_order'
  version: string
}
