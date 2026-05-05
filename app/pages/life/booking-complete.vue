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

// 藍新金流回調結果（從 URL query params 取得）
const paymentStatus = computed(() => {
  const status = route.query.Status as string | undefined
  if (!status)
    return null
  return status === 'SUCCESS' ? 'success' : 'failed'
})

const paymentMessage = computed(() => {
  const status = route.query.Status as string | undefined
  if (!status)
    return ''
  if (status === 'SUCCESS')
    return '付款成功！'
  return `付款失敗（${status}）`
})

// 顯示用 computed：fetched order 優先，fallback 到 form store
const displayVoucherId = computed(() => fetchedOrder.value?.voucherId || bookingFormStore.createdVoucherId || '')
const displayPickupLocation = computed(() => fetchedOrder.value?.pickupLocation || bookingFormStore.pickupLocation)
const displayDeliveryLocation = computed(() => fetchedOrder.value?.deliveryLocation || bookingFormStore.deliveryLocation)
const displayLuggageCount = computed(() => fetchedOrder.value?.luggageCount ?? bookingFormStore.luggageCount)
const displayBookingDate = computed(() => fetchedOrder.value?.bookingDate || bookingFormStore.bookingDate)
const displayServicePlan = computed(() => fetchedOrder.value?.servicePlan || bookingFormStore.serviceType)
const displayServicePlanLabel = computed(() => displayServicePlan.value === 'round_trip' ? '雙程套票' : '單程運送')
const displayUnitPrice = computed(() => SERVICE_PLAN_PRICE[displayServicePlan.value as string] ?? bookingFormStore.unitPrice)
const displayTotalPrice = computed(() => displayUnitPrice.value * displayLuggageCount.value)
const displayRecipientName = computed(() => fetchedOrder.value?.recipientName || fetchedOrder.value?.userName || bookingFormStore.recipientName)
const displayRecipientPhone = computed(() => fetchedOrder.value?.recipientPhone || fetchedOrder.value?.phone || bookingFormStore.recipientPhone)

// 若 store 中無訂單資料（付款後返回時 store 已清空），從 sessionStorage 還原並撈訂單
onMounted(async () => {
  if (!bookingFormStore.createdOrderId) {
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
})

function formatDate(date: string) {
  if (!date)
    return ''
  return date.replace(/-/g, '/')
}

const paymentMethodLabel = computed(() => {
  const map = {
    line_pay: 'LINE Pay',
    credit_card: '信用卡',
    apple_pay: 'Apple Pay',
  }
  return map[bookingFormStore.paymentMethod] || '信用卡'
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
        <!-- 付款失敗狀態 -->
        <div
          v-if="paymentStatus === 'failed'"
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
              付款未完成
            </h2>
            <p class="text-sm text-danger-300">
              {{ paymentMessage }}
            </p>
            <p class="text-sm text-neutral-600">
              訂單已建立，請重新付款或聯繫客服協助處理。
            </p>
          </div>
        </div>

        <!-- 付款成功或訂單已送出狀態 -->
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
              {{ paymentStatus === 'success' ? '付款成功！' : '訂單已送出！' }}
            </h2>
            <div class="text-sm text-neutral-600">
              <p>請稍候工作人員確認預約申請</p>
              <p>您可以隨時在「我的訂單」查看進度</p>
            </div>
          </div>
        </div>

        <!-- 訂單資訊 -->
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
                <span class="text-neutral-900">{{ displayVoucherId || '—' }}</span>
                <button
                  v-if="displayVoucherId"
                  @click="copyToClipboard(displayVoucherId)"
                >
                  <Icon
                    name="lucide:copy"
                    class="text-base text-neutral-500"
                  />
                </button>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-neutral-600">行李數量</span>
              <span class="text-neutral-900">{{ displayLuggageCount }} 件</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-neutral-600">寄件日期</span>
              <span class="text-neutral-900">{{ formatDate(displayBookingDate) || '—' }}</span>
            </div>
          </div>
        </div>

        <!-- 結帳明細 -->
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
              <span class="text-neutral-900">NT$ {{ displayUnitPrice }} / 件</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-neutral-600">數量</span>
              <span class="text-neutral-900">{{ displayLuggageCount }} 件</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-neutral-600">總計</span>
              <span class="text-neutral-900">NT$ {{ displayTotalPrice }}</span>
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
                :class="paymentStatus === 'failed'
                  ? 'text-danger-300'
                  : 'text-neutral-900'"
              >
                {{ paymentStatus === 'success' ? '已付款' : paymentStatus === 'failed' ? '未付款' : '待確認' }}
              </span>
            </div>
          </div>
        </div>

        <!-- 領件人 -->
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
