import type { KlookOrder, Location, PlatformType, TripOrder } from '~/types/booking'

export type ServiceType = 'round_trip' | 'one_way'
export type PaymentMethod = 'line_pay' | 'credit_card' | 'apple_pay'

export const useBookingFormStore = defineStore('booking-form', () => {
  // 平台訂單（從 QR 掃描取得）
  const platformType = ref<PlatformType | null>(null)
  const platformOrderId = ref<string | null>(null)
  const platformOrderIdentifier = ref<string | null>(null)
  const platformOrder = ref<TripOrder | KlookOrder | null>(null)

  // 表單欄位
  const serviceType = ref<ServiceType>('round_trip')
  const luggageCount = ref(1)
  const pickupLocation = ref<Location | null>(null)
  const deliveryLocation = ref<Location | null>(null)
  const bookingDate = ref('')
  const returnDate = ref('')
  const recipientName = ref('')
  const recipientPhone = ref('')
  const notes = ref('')
  const agreeToTerms = ref(false)

  // 付款
  const paymentMethod = ref<PaymentMethod>('line_pay')

  // 建立完成的訂單
  const createdOrderId = ref<string | null>(null)
  const createdVoucherId = ref<string | null>(null)

  // 計算金額
  const unitPrice = computed(() => serviceType.value === 'round_trip' ? 250 : 130)
  const totalPrice = computed(() => unitPrice.value * luggageCount.value)

  function setPlatformOrder(
    type: PlatformType,
    id: string,
    identifier: string,
    order: TripOrder | KlookOrder,
  ) {
    platformType.value = type
    platformOrderId.value = id
    platformOrderIdentifier.value = identifier
    platformOrder.value = order
  }

  function setCreatedOrder(orderId: string, voucherId?: string) {
    createdOrderId.value = orderId
    createdVoucherId.value = voucherId ?? null
  }

  function reset() {
    platformType.value = null
    platformOrderId.value = null
    platformOrderIdentifier.value = null
    platformOrder.value = null
    serviceType.value = 'round_trip'
    luggageCount.value = 1
    pickupLocation.value = null
    deliveryLocation.value = null
    bookingDate.value = ''
    returnDate.value = ''
    recipientName.value = ''
    recipientPhone.value = ''
    notes.value = ''
    agreeToTerms.value = false
    paymentMethod.value = 'line_pay'
    createdOrderId.value = null
    createdVoucherId.value = null
  }

  return {
    platformType,
    platformOrderId,
    platformOrderIdentifier,
    platformOrder,
    serviceType,
    luggageCount,
    pickupLocation,
    deliveryLocation,
    bookingDate,
    returnDate,
    recipientName,
    recipientPhone,
    notes,
    agreeToTerms,
    paymentMethod,
    createdOrderId,
    createdVoucherId,
    unitPrice,
    totalPrice,
    setPlatformOrder,
    setCreatedOrder,
    reset,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useBookingFormStore, import.meta.hot))
