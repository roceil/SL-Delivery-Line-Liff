<script lang="ts" setup>
import type { BookingOrder } from '~/types/booking'
import { SERVICE_PLAN_PRICE } from '~/types/booking'

definePageMeta({
  layout: 'booking-flow',
})

const router = useRouter()
const route = useRoute()
const bookingFormStore = useBookingFormStore()
const bookingStore = useBookingStore()

// 從 Backstation 取得的訂單資料（付款後 store 已清空，需從後端撈完整資料）
const fetchedOrder = ref<BookingOrder | null>(null)

/**
 * 網址帶回的藍新結果 —— 只是「參考」，不是事實。
 *
 * 網址可以被改，也可能與後台不同步（藍新收到錢但寫入後台失敗）。
 * 因此付款狀態與大標題一律以訂單的 paymentStatus 為準，
 * 網址的 Status / reason 只用來補一句失敗原因 —— 那是資料庫查不到的資訊。
 */
const callbackStatus = computed(() => (route.query.Status as string | undefined) ?? null)
const callbackReason = computed(() => (route.query.reason as string | undefined) ?? null)

/** 訂單資料是否還在撈 —— 撈完之前不顯示任何金額與件數 */
const isOrderLoading = ref(true)
/** 撈不到訂單（沒有訂單編號、或 API 失敗） */
const hasOrderError = computed(() => !isOrderLoading.value && fetchedOrder.value === null)

/**
 * 我方自行判定的失敗原因，對應 server/api/payment/notify.post.ts 送出的 reason。
 *
 * 前五項都是回呼驗簽失敗 —— 差別只在壞在哪一層，對客人而言結果相同：
 * 我們無法確認這筆付款，只能請他聯繫客服。
 * newebpay-status 不列在這裡，那要用藍新回傳的說明原文。
 */
const REASON_MESSAGE: Record<string, string> = {
  'missing-fields': '無法驗證金流回應，請聯繫客服確認付款結果',
  'sha-mismatch': '無法驗證金流回應，請聯繫客服確認付款結果',
  'decrypt-error': '無法驗證金流回應，請聯繫客服確認付款結果',
  'missing-order-no': '無法驗證金流回應，請聯繫客服確認付款結果',
  'checkcode-mismatch': '無法驗證金流回應，請聯繫客服確認付款結果',
  'amount-mismatch': '付款金額與訂單金額不符，款項未入帳',
}

/**
 * 付款失敗時的說明。
 *
 * 藍新回報的原文優先 —— 失敗代碼的中文對照只存在於藍新規格書，
 * 我方自行翻譯會猜錯也會過時。網址沒帶原因就不多說。
 */
const failureMessage = computed(() => {
  const raw = route.query.message as string | undefined
  const fromNewebpay = raw?.trim().slice(0, 100)
  if (fromNewebpay)
    return fromNewebpay

  const reason = callbackReason.value
  if (!reason)
    return ''
  return REASON_MESSAGE[reason] ?? '付款未完成，請聯繫客服協助確認'
})

/**
 * 付款結果，一律以資料庫為準。
 *
 * paid            → 已付款
 * unpaid + 藍新說成功 → 錢收到了但後台還沒同步，只能說「確認中」，
 *                      不能報喜也不能報憂，否則客人會重複付款
 * unpaid + 其他    → 尚未付款
 */
const paymentResult = computed<'paid' | 'confirming' | 'unpaid' | null>(() => {
  if (isOrderLoading.value || !fetchedOrder.value)
    return null

  const status = fetchedOrder.value.paymentStatus
  if (status === 'paid')
    return 'paid'
  if (callbackStatus.value === 'SUCCESS')
    return 'confirming'
  return 'unpaid'
})

const paymentStatusLabel = computed(() => {
  const map: Record<string, string> = {
    paid: '已付款',
    confirming: '確認中',
    unpaid: '尚未付款',
    refunded: '已退款',
    refunding: '退款處理中',
    pending_refund: '待退款',
    no_refund_required: '無須退款',
  }
  // 退款類狀態直接照實顯示，不套用付款成功/失敗那套判斷
  const raw = fetchedOrder.value?.paymentStatus
  if (raw && raw !== 'paid' && raw !== 'unpaid')
    return map[raw] ?? raw
  return map[paymentResult.value ?? ''] ?? '—'
})

const headline = computed(() => {
  switch (paymentResult.value) {
    case 'paid': return '付款成功！'
    case 'confirming': return '付款確認中'
    case 'unpaid': return '尚未完成付款'
    default: return ''
  }
})

// 顯示用 computed：一律取自後端訂單。
// 不再回退到 bookingFormStore —— 付款導回後表單已清空，
// 退回去只會拿到預設值（1 件），把假資料當成客人的訂單顯示。
const displayOrderNumber = computed(() => fetchedOrder.value?.orderNumber || bookingFormStore.createdOrderId || '')
const displayVoucherId = computed(() => fetchedOrder.value?.voucherId || '')
const displayPickupLocation = computed(() => fetchedOrder.value?.pickupLocation ?? null)
const displayDeliveryLocation = computed(() => fetchedOrder.value?.deliveryLocation ?? null)
const displayLuggageCount = computed(() => fetchedOrder.value?.luggageCount ?? null)
const displayBookingDate = computed(() => fetchedOrder.value?.bookingDate || '')
const displayServicePlan = computed(() => fetchedOrder.value?.servicePlan ?? null)
const displayServicePlanLabel = computed(() => {
  if (!displayServicePlan.value)
    return '—'
  return displayServicePlan.value === 'round_trip' ? '雙程套票' : '單程運送'
})
const displayUnitPrice = computed(() => {
  const plan = displayServicePlan.value
  if (!plan)
    return null
  return SERVICE_PLAN_PRICE[plan as string] ?? null
})
/** 總計以後台費用明細為準，即實際收款金額 */
const displayTotalPrice = computed(() => fetchedOrder.value?.totalAmount ?? null)
const displayRecipientName = computed(() => fetchedOrder.value?.recipientName || fetchedOrder.value?.userName || '')
const displayRecipientPhone = computed(() => fetchedOrder.value?.recipientPhone || fetchedOrder.value?.phone || '')

// 若 store 中無訂單資料（付款後返回時 store 已清空），從 sessionStorage 還原並撈訂單
onMounted(async () => {
  // 訂單編號優先取自網址（金流導回時帶上），sessionStorage 僅作為備援。
  // sessionStorage 是分頁級的，客人關掉分頁、在新分頁開啟或重新整理都會取不到，
  // 那時訂單其實已付款成功，卻只會看到一片空白。
  const orderNoFromQuery = route.query.orderNo as string | undefined

  if (orderNoFromQuery) {
    bookingFormStore.setCreatedOrder(orderNoFromQuery, bookingFormStore.createdVoucherId || undefined)
  }
  else if (!bookingFormStore.createdOrderId) {
    const orderId = sessionStorage.getItem('payment_order_id')
    const voucherId = sessionStorage.getItem('payment_voucher_id')
    if (orderId) {
      bookingFormStore.setCreatedOrder(orderId, voucherId || undefined)
    }
  }

  sessionStorage.removeItem('payment_order_id')
  sessionStorage.removeItem('payment_voucher_id')

  // 從 Backstation 撈完整訂單資料
  const orderId = bookingFormStore.createdOrderId
  if (orderId) {
    fetchedOrder.value = await bookingStore.fetchOrderById(orderId)
  }
  isOrderLoading.value = false
})

function formatDate(date: string) {
  if (!date)
    return ''
  return date.replace(/-/g, '/')
}

// 付款方式以藍新實際回傳的為準；沒有交易資料代表還沒付款成功
const paymentMethodLabel = computed(() => {
  const map: Record<string, string> = {
    CREDIT: '信用卡',
    WEBATM: '網路 ATM',
    VACC: 'ATM 轉帳',
    CVS: '超商代碼繳費',
    BARCODE: '超商條碼繳費',
    ANDROIDPAY: 'Google Pay',
    SAMSUNGPAY: 'Samsung Pay',
    APPLEPAY: 'Apple Pay',
  }
  const method = fetchedOrder.value?.paymentMethod
  if (!method)
    return '—'
  return map[method] ?? method
})

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
}

function viewOrder() {
  const orderId = bookingFormStore.createdOrderId
  bookingFormStore.reset()
  if (orderId) {
    router.push(`/life/my-bookings/${orderId}`)
  }
  else {
    router.push('/life/my-bookings')
  }
}
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto px-4 py-6">
      <div class="flex flex-col gap-4">
        <!-- 撈取訂單中：資料到齊前不顯示任何金額與件數 -->
        <div
          v-if="isOrderLoading"
          class="flex flex-col items-center gap-2 py-10"
        >
          <Icon
            name="lucide:loader-circle"
            class="size-10 animate-spin text-primary-300"
          />
          <p class="text-sm text-neutral-600">
            正在確認訂單資料…
          </p>
        </div>

        <!-- 撈不到訂單：明說取不到，不用預設值頂替 -->
        <div
          v-else-if="hasOrderError"
          class="flex flex-col items-center gap-2"
        >
          <div class="flex size-[100px] items-center justify-center">
            <Icon
              name="lucide:circle-alert"
              class="size-full text-warning-300"
            />
          </div>
          <div class="flex flex-col gap-1 text-center">
            <h2 class="text-2xl font-bold tracking-wide text-neutral-900">
              無法取得訂單資料
            </h2>
            <p
              v-if="displayOrderNumber"
              class="text-sm text-neutral-900"
            >
              訂單編號 {{ displayOrderNumber }}
            </p>
            <p class="text-sm text-neutral-600">
              您的訂單可能已建立，請聯繫客服並提供訂單編號協助查詢。
            </p>
          </div>
        </div>

        <!-- 尚未付款 -->
        <div
          v-else-if="paymentResult === 'unpaid'"
          class="flex flex-col items-center gap-2"
        >
          <div class="flex size-[100px] items-center justify-center">
            <Icon
              name="lucide:circle-x"
              class="size-full text-danger-300"
            />
          </div>
          <div class="flex flex-col gap-1 text-center">
            <h2 class="text-2xl font-bold tracking-wide text-neutral-900">
              {{ headline }}
            </h2>
            <p
              v-if="failureMessage"
              class="text-sm text-danger-300"
            >
              {{ failureMessage }}
            </p>
            <p class="text-sm text-neutral-600">
              訂單已建立，請重新付款或聯繫客服協助處理。
            </p>
          </div>
        </div>

        <!-- 付款確認中：藍新已收款，但後台尚未同步 -->
        <div
          v-else-if="paymentResult === 'confirming'"
          class="flex flex-col items-center gap-2"
        >
          <div class="flex size-[100px] items-center justify-center">
            <Icon
              name="lucide:clock"
              class="size-full text-warning-300"
            />
          </div>
          <div class="flex flex-col gap-1 text-center">
            <h2 class="text-2xl font-bold tracking-wide text-neutral-900">
              {{ headline }}
            </h2>
            <div class="text-sm text-neutral-600">
              <p>您的付款已完成，訂單資料同步中</p>
              <p>請稍候至「我的訂單」查看最新狀態</p>
            </div>
          </div>
        </div>

        <!-- 付款成功 -->
        <div
          v-else
          class="flex flex-col items-center gap-2"
        >
          <div class="size-[100px]">
            <img
              src="/bookings/complete.svg"
              alt="Success"
              class="size-full object-contain"
            >
          </div>
          <div class="flex flex-col gap-1 text-center">
            <h2 class="text-2xl font-bold tracking-wide text-neutral-900">
              {{ headline }}
            </h2>
            <div class="text-sm text-neutral-600">
              <p>請稍候工作人員確認預約申請</p>
              <p>您可以隨時在「我的訂單」查看進度</p>
            </div>
          </div>
        </div>

        <!-- 訂單資訊 -->
        <div
          v-if="!isOrderLoading && !hasOrderError"
          class="
            rounded-sm bg-white p-4
            shadow-[0px_4px_32px_0px_rgba(32,78,184,0.08)]
          "
        >
          <div class="mb-3 flex items-center gap-2">
            <div
              class="w-1 self-stretch rounded-xs"
              style="background: linear-gradient(101deg, #4090E8 16%, #306CF7 62%);"
            ></div>
            <span class="text-base font-bold text-neutral-900">訂單資訊</span>
          </div>
          <div class="mb-4 h-px bg-neutral-200"></div>

          <!-- 路線 -->
          <div class="mb-4 flex flex-col gap-2">
            <div class="flex items-center gap-2 rounded-sm bg-primary-100 p-3">
              <div
                class="
                  flex size-9 items-center justify-center rounded-full
                  bg-[#e4effb] p-2
                "
              >
                <Icon
                  name="lucide:send"
                  class="text-xl text-primary-300"
                />
              </div>
              <span class="text-base font-medium text-neutral-900">{{ displayPickupLocation?.name || '—' }}</span>
            </div>
            <div class="flex justify-center">
              <Icon
                name="lucide:arrow-down"
                class="text-2xl text-neutral-600"
              />
            </div>
            <div class="flex items-center gap-2 rounded-sm bg-primary-100 p-3">
              <div
                class="
                  flex size-9 items-center justify-center rounded-full
                  bg-[#e4effb] p-2
                "
              >
                <Icon
                  name="lucide:map-pin"
                  class="text-xl text-primary-300"
                />
              </div>
              <span class="flex-1 text-base font-medium text-neutral-900">{{ displayDeliveryLocation?.name || '—' }}</span>
            </div>
          </div>

          <!-- 明細 -->
          <div class="flex flex-col gap-1 text-base">
            <div class="flex items-center justify-between">
              <span class="text-neutral-600">訂單編號</span>
              <div class="flex items-center gap-1">
                <span class="text-neutral-900">{{ displayOrderNumber || '—' }}</span>
                <button
                  v-if="displayOrderNumber"
                  @click="copyToClipboard(displayOrderNumber)"
                >
                  <Icon
                    name="lucide:copy"
                    class="text-base text-neutral-500"
                  />
                </button>
              </div>
            </div>
            <div
              v-if="displayVoucherId"
              class="flex items-center justify-between"
            >
              <span class="text-neutral-600">取件憑證碼</span>
              <div class="flex items-center gap-1">
                <span class="text-neutral-900">{{ displayVoucherId }}</span>
                <button @click="copyToClipboard(displayVoucherId)">
                  <Icon
                    name="lucide:copy"
                    class="text-base text-neutral-500"
                  />
                </button>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-neutral-600">行李數量</span>
              <span class="text-neutral-900">{{ displayLuggageCount != null ? `${displayLuggageCount} 件` : '—' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-neutral-600">寄件日期</span>
              <span class="text-neutral-900">{{ formatDate(displayBookingDate) || '—' }}</span>
            </div>
          </div>
        </div>

        <!-- 結帳明細 -->
        <div
          v-if="!isOrderLoading && !hasOrderError"
          class="
            rounded-sm bg-white p-4
            shadow-[0px_4px_32px_0px_rgba(32,78,184,0.08)]
          "
        >
          <div class="mb-3 flex items-center gap-2">
            <div
              class="w-1 self-stretch rounded-xs"
              style="background: linear-gradient(101deg, #4090E8 16%, #306CF7 62%);"
            ></div>
            <span class="text-base font-bold text-neutral-900">結帳明細</span>
          </div>
          <div class="mb-4 h-px bg-neutral-200"></div>
          <div class="mb-3 flex flex-col gap-1 text-base">
            <div class="flex items-center justify-between">
              <span class="text-neutral-600">服務方案</span>
              <span class="text-neutral-900">{{ displayServicePlanLabel }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-neutral-600">單價</span>
              <span class="text-neutral-900">{{ displayUnitPrice != null ? `NT$ ${displayUnitPrice} / 件` : '—' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-neutral-600">數量</span>
              <span class="text-neutral-900">{{ displayLuggageCount != null ? `${displayLuggageCount} 件` : '—' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-neutral-600">總計</span>
              <span class="text-neutral-900">{{ displayTotalPrice != null ? `NT$ ${displayTotalPrice.toLocaleString()}` : '—' }}</span>
            </div>
          </div>
          <div class="mb-3 h-px bg-neutral-200"></div>
          <div class="flex flex-col gap-1 text-base">
            <div class="flex items-center justify-between">
              <span class="text-neutral-600">付款方式</span>
              <span class="text-neutral-900">{{ paymentMethodLabel }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-neutral-600">付款狀態</span>
              <span
                :class="paymentResult === 'paid'
                  ? 'text-success-300'
                  : paymentResult === 'confirming'
                    ? 'text-warning-300'
                    : 'text-danger-300'"
              >
                {{ paymentStatusLabel }}
              </span>
            </div>
          </div>
        </div>

        <!-- 領件人 -->
        <div
          v-if="!isOrderLoading && !hasOrderError"
          class="
            rounded-sm bg-white p-4
            shadow-[0px_4px_32px_0px_rgba(32,78,184,0.08)]
          "
        >
          <div class="mb-3 flex items-center gap-2">
            <div
              class="w-1 self-stretch rounded-xs"
              style="background: linear-gradient(101deg, #4090E8 16%, #306CF7 62%);"
            ></div>
            <span class="text-base font-bold text-neutral-900">領件人</span>
          </div>
          <div class="mb-4 h-px bg-neutral-200"></div>
          <div class="flex flex-col gap-1 text-base">
            <div class="flex items-center justify-between">
              <span class="text-neutral-600">姓名</span>
              <span class="text-neutral-900">{{ displayRecipientName || '—' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-neutral-600">聯絡電話</span>
              <span class="text-neutral-900">{{ displayRecipientPhone || '—' }}</span>
            </div>
          </div>
        </div>

        <!-- 取件須知 -->
        <div
          class="
            rounded-sm bg-white p-4
            shadow-[0px_4px_32px_0px_rgba(32,78,184,0.08)]
          "
        >
          <div class="mb-3 flex items-center gap-2">
            <div
              class="w-1 self-stretch rounded-xs"
              style="background: linear-gradient(101deg, #4090E8 16%, #306CF7 62%);"
            ></div>
            <span class="text-base font-bold text-neutral-900">取件須知</span>
          </div>
          <div class="mb-4 h-px bg-neutral-200"></div>
          <ol class="flex flex-col gap-4 text-base text-neutral-600">
            <li>
              <span class="font-bold text-neutral-900">1. 去程（碼頭門市 ➔ 民宿）</span><br>
              <span class="text-danger-300">下船後請於 14:00 前將行李交至碼頭門市</span>，行李將於 15:00 - 17:00 送達民宿。
            </li>
            <li>
              <span class="font-bold text-neutral-900">2. 回程（民宿 ➔ 碼頭門市）</span><br>
              <span class="text-danger-300">退房當日 11:00 前將行李交給民宿櫃檯</span>，我們將運回門市。您登船前再回門市憑證取件。
            </li>
            <li>
              <span class="font-bold text-neutral-900">3. 取件憑證</span><br>
              請妥善保存寄件時發送的 LINE 憑證，這將是您領取行李的唯一憑證。
            </li>
          </ol>
        </div>
      </div>
    </main>

    <!-- Bottom Navigation -->
    <footer
      class="shrink-0 rounded-t-lg border border-white pb-6 backdrop-blur-md"
      style="background: linear-gradient(10deg, rgb(255,255,255) 0%, rgba(255,255,255,0.5) 100%); box-shadow: 0px -4px 20px 0px rgba(32,78,184,0.12);"
    >
      <div class="flex gap-2 px-5 py-3">
        <NuxtLink
          to="/life/booking"
          class="
            flex flex-1 items-center justify-center rounded-sm border
            border-neutral-200 bg-white px-5 py-3
          "
        >
          <span class="text-base font-medium text-neutral-900">再次預約</span>
        </NuxtLink>
        <button
          class="
            flex flex-1 items-center justify-center rounded-sm bg-primary-300
            px-5 py-3
          "
          @click="viewOrder"
        >
          <span class="text-base font-medium text-white">查看訂單進度</span>
        </button>
      </div>
    </footer>
  </div>
</template>
