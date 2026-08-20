<script lang="ts" setup>
import type { BookingOrder } from '~/types/booking'

definePageMeta({
  layout: 'life',
  title: '訂單詳情',
})

const route = useRoute()
const bookingStore = useBookingStore()
const { isLoading } = storeToRefs(bookingStore)

const orderId = route.params.id as string
const order = ref<BookingOrder | null>(null)

const showCancelConfirm = ref(false)
const isCancelling = ref(false)
const cancelError = ref('')

onMounted(async () => {
  order.value = await bookingStore.fetchOrderById(orderId)
})

async function cancelOrder() {
  if (!order.value)
    return

  try {
    isCancelling.value = true
    cancelError.value = ''
    await bookingStore.cancelOrder(order.value.id)
    showCancelConfirm.value = false
    order.value = await bookingStore.fetchOrderById(orderId)
  }
  catch (err) {
    cancelError.value = err instanceof Error ? err.message : '取消訂單失敗'
  }
  finally {
    isCancelling.value = false
  }
}

const statusLabel = computed(() => {
  const config: Record<string, string> = {
    pending: '訂單確認中',
    confirmed: '待交付行李',
    assigned: '待交付行李',
    received: '已收件',
    in_delivery: '運送中',
    in_transit: '運送中',
    delivered: '已完成',
    completed: '已完成',
    cancelled: '已取消',
    overdue: '逾期',
  }
  return config[order.value?.status ?? ''] ?? '未知'
})

const statusSubLabel = computed(() => {
  const config: Record<string, string> = {
    pending: '請稍候',
    confirmed: '請依時將行李送至門市',
    assigned: '請依時將行李送至門市',
    received: '配送中',
    in_delivery: '配送中',
    in_transit: '配送中',
    delivered: '感謝您的使用',
    completed: '感謝您的使用',
    cancelled: '此訂單已取消',
    overdue: '請聯繫客服',
  }
  return config[order.value?.status ?? ''] ?? ''
})

const isCancelled = computed(() =>
  order.value?.status === 'cancelled',
)

const canCancel = computed(() =>
  order.value != null && ['pending', 'confirmed'].includes(order.value.status as string),
)

// ── Bottom Sheet 拖曳邏輯 ────────────────────────────────
const isExpanded = ref(false)
const isDragging = ref(false)
const dragOffset = ref(0)
const { height: windowHeight } = useWindowSize()
let touchStartY = 0
let wasDragging = false

function onHandleTouchStart(e: TouchEvent) {
  const touch = e.touches[0]
  if (!touch)
    return
  touchStartY = touch.clientY
  isDragging.value = true
  wasDragging = false
  dragOffset.value = 0
}

function onHandleTouchMove(e: TouchEvent) {
  if (!isDragging.value)
    return
  const touch = e.touches[0]
  if (!touch)
    return
  const delta = touch.clientY - touchStartY
  dragOffset.value = delta
  if (Math.abs(delta) > 10)
    wasDragging = true
}

function onHandleTouchEnd() {
  if (!isDragging.value)
    return
  isDragging.value = false
  if (wasDragging) {
    const offset = dragOffset.value
    if (!isExpanded.value && offset < -50)
      isExpanded.value = true
    else if (isExpanded.value && offset > 80)
      isExpanded.value = false
  }
  dragOffset.value = 0
}

function onHandleClick() {
  if (!wasDragging)
    isExpanded.value = !isExpanded.value
}

const sheetStyle = computed(() => {
  if (isDragging.value) {
    const baseTop = isExpanded.value ? 0 : windowHeight.value * 0.6
    const clampedOffset = isExpanded.value
      ? Math.max(0, dragOffset.value)
      : Math.min(0, dragOffset.value)
    return {
      top: `${Math.max(0, baseTop + clampedOffset)}px`,
      transition: 'none',
    }
  }
  return {
    top: isExpanded.value ? '0' : '60dvh',
    transition: 'top 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)',
  }
})
</script>

<template>
  <!-- 載入中 -->
  <div
    v-if="isLoading"
    class="flex items-center justify-center py-12 text-neutral-600"
  >
    載入中...
  </div>

  <!-- 找不到訂單 -->
  <div
    v-else-if="!order"
    class="flex flex-col items-center justify-center gap-3 p-8 text-center"
  >
    <p class="text-base text-neutral-600">
      找不到此訂單
    </p>
    <NuxtLink
      to="/life/my-bookings"
      class="
        rounded-sm bg-primary-300 px-4 py-2 text-base font-medium text-white
      "
    >
      返回訂單列表
    </NuxtLink>
  </div>

  <!-- 兩層式佈局 -->
  <template v-else>
    <!-- 全螢幕容器（蓋過底部導覽列） -->
    <div class="fixed inset-0 z-20 overflow-hidden">
      <!-- 第一層：地圖 -->
      <LifeOrderDetailMap
        :status-label="statusLabel"
        :status-sub-label="statusSubLabel"
        :is-cancelled="isCancelled"
      />

      <!-- 第二層：訂單底部面板 -->
      <div
        class="absolute inset-x-0 bottom-0 flex flex-col"
        :style="sheetStyle"
      >
        <!-- 拖曳把手區（點擊或上滑展開） -->
        <div
          class="
            shrink-0 cursor-grab touch-none bg-white px-5 pt-2 pb-4
            shadow-top-100 select-none
          "
          :class="isExpanded && !isDragging ? '' : 'rounded-tl-lg rounded-tr-lg'"
          @touchstart="onHandleTouchStart"
          @touchmove.prevent="onHandleTouchMove"
          @touchend="onHandleTouchEnd"
          @click="onHandleClick"
        >
          <div class="mb-3 flex justify-center">
            <div class="h-1 w-12 rounded-rounded bg-neutral-200"></div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xl font-bold text-neutral-900">
              {{ order.pickupLocation.name }}
            </span>
            <Icon
              name="lucide:move-horizontal"
              class="shrink-0 text-base text-neutral-600"
            />
            <span class="flex-1 truncate text-xl font-bold text-neutral-900">
              {{ order.deliveryLocation.name }}
            </span>
          </div>
        </div>

        <!-- 間隔線 (與各區塊間的 gap-1 bg-neutral-100 視覺效果一致) -->
        <div class="h-1 shrink-0 bg-neutral-100"></div>

        <!-- 可捲動的訂單內容 -->
        <div class="flex-1 overflow-y-auto">
          <div class="flex flex-col gap-1 bg-neutral-100">
            <LifeOrderProgressSteps
              :order="order"
              :is-cancelled="isCancelled"
            />

            <LifeOrderInfoCard :order="order" />

            <LifeOrderCheckoutSummary :order="order" />

            <LifeOrderRecipientCard :order="order" />
          </div>
        </div>
      </div>

      <!-- 第三層：底部按鈕列（永遠固定在畫面最底部） -->
      <div
        class="
          absolute inset-x-0 bottom-0 z-30 flex gap-2 rounded-t-lg border-t
          border-white/50 px-5 py-3 pb-[43px]
        "
        style="background: linear-gradient(9deg, #fff 0%, rgba(255,255,255,0.5) 100%); backdrop-filter: blur(12px); box-shadow: 0 -4px 12px rgba(0,0,0,0.06);"
      >
        <button
          v-if="canCancel"
          type="button"
          class="
            flex-1 rounded-sm border border-neutral-200 py-3 text-base
            font-medium text-neutral-900
          "
          @click="showCancelConfirm = true"
        >
          取消訂單
        </button>
        <button
          type="button"
          class="
            flex-1 rounded-sm border border-neutral-200 py-3 text-base
            font-medium text-neutral-900
          "
        >
          聯繫客服
        </button>
      </div>
    </div>

    <LifeCancelOrderDialog
      :open="showCancelConfirm"
      :is-cancelling="isCancelling"
      :error-message="cancelError"
      @close="showCancelConfirm = false"
      @confirm="cancelOrder"
    />
  </template>
</template>
