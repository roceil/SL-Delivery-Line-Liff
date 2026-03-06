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

const isCheckoutOpen = ref(false)
const isRecipientOpen = ref(false)

function onAccordionEnter(el: Element) {
  const htmlEl = el as HTMLElement
  htmlEl.style.height = '0'
  htmlEl.style.overflow = 'hidden'
  void htmlEl.offsetHeight
  htmlEl.style.transition = 'height 0.3s ease-in-out'
  htmlEl.style.height = `${htmlEl.scrollHeight}px`
}

function onAccordionAfterEnter(el: Element) {
  const htmlEl = el as HTMLElement
  htmlEl.style.height = ''
  htmlEl.style.overflow = ''
  htmlEl.style.transition = ''
}

function onAccordionLeave(el: Element) {
  const htmlEl = el as HTMLElement
  htmlEl.style.height = `${htmlEl.scrollHeight}px`
  htmlEl.style.overflow = 'hidden'
  void htmlEl.offsetHeight
  htmlEl.style.transition = 'height 0.3s ease-in-out'
  htmlEl.style.height = '0'
}

function onAccordionAfterLeave(el: Element) {
  const htmlEl = el as HTMLElement
  htmlEl.style.height = ''
  htmlEl.style.overflow = ''
  htmlEl.style.transition = ''
}

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

function formatDate(dateString: string) {
  if (!dateString)
    return '—'
  const [year = '', month = '0', day = '0'] = dateString.split('-')
  return `${year}/${Number(month)}/${Number(day)}`
}

async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text)
}

// ── 訂單步驟 ──────────────────────────────────────────────
const steps = [
  { label: '訂單確認中', icon: 'carbon:receipt' },
  { label: '訂單成立，待交付行李', icon: 'carbon:package' },
  { label: '已收件', icon: 'carbon:store' },
  { label: '運送中', icon: 'carbon:delivery' },
  { label: '已送達', icon: 'carbon:location' },
  { label: '已完成', icon: 'carbon:checkmark' },
]

const activeStepIndex = computed(() => {
  switch (order.value?.status) {
    case 'pending': return 0
    case 'confirmed': return 1
    case 'in_transit': return 3
    case 'delivered': return 5
    default: return -1
  }
})

const statusLabel = computed(() => {
  const config: Record<string, string> = {
    pending: '訂單確認中',
    confirmed: '待交付行李',
    in_transit: '運送中',
    delivered: '已完成',
    cancelled: '已取消',
  }
  return config[order.value?.status ?? ''] ?? '未知'
})

const activeStepTime = computed(() => {
  if (!order.value)
    return ''
  const d = new Date(order.value.updatedAt)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${month}/${day} ${hours}:${minutes}`
})

const canCancel = computed(() =>
  order.value != null && ['pending', 'confirmed'].includes(order.value.status),
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
      <div class="absolute inset-0 bg-[#e8edf2]">
        <!-- 格線佔位 -->
        <svg
          class="absolute inset-0 size-full opacity-20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="map-grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#64748b"
                stroke-width="0.5"
              />
            </pattern>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="url(#map-grid)"
          />
        </svg>

        <!-- 定位針 -->
        <div
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full"
        >
          <Icon
            name="carbon:location-filled"
            class="text-3xl text-primary-300"
          />
        </div>

        <!-- 浮動狀態欄 -->
        <div
          class="
            absolute top-4 right-4 left-4 flex items-center gap-2 rounded-sm
            border border-white px-4 py-3 shadow-down-200
          "
          style="background: linear-gradient(6deg, #fff 0%, rgba(255,255,255,0.5) 100%); backdrop-filter: blur(12px);"
        >
          <div class="flex flex-1 items-center gap-2">
            <div class="size-1.5 rounded-rounded bg-primary-300"></div>
            <span class="text-base font-bold text-neutral-900">{{ statusLabel }}</span>
          </div>
          <span class="text-sm text-neutral-600">請稍候</span>
        </div>
      </div>

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
              name="carbon:arrows-horizontal"
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
            <!-- 運送紀錄 -->
            <div class="flex flex-col gap-4 bg-white p-5">
              <div class="flex items-center gap-2">
                <div
                  class="size-1.5 rounded-rounded"
                  style="background: linear-gradient(131deg, #4090e8 16%, #306cf7 62%)"
                ></div>
                <h2 class="flex-1 text-lg font-bold text-neutral-900">
                  運送紀錄
                </h2>
                <Icon
                  name="carbon:chevron-right"
                  class="text-xl text-neutral-600"
                />
              </div>

              <div class="rounded-sm bg-neutral-100 p-3">
                <!-- 行程方向 -->
                <div
                  class="
                    flex items-center gap-3 border-b border-neutral-200 pb-3
                  "
                >
                  <span
                    class="rounded-rounded px-2 py-0.5 text-[11px] font-medium"
                    :style="{ backgroundColor: '#e9f4ef', color: '#229464' }"
                  >
                    去程
                  </span>
                  <div
                    class="
                      flex min-w-0 items-center gap-1 text-sm text-neutral-600
                    "
                  >
                    <span class="shrink-0">{{ order.pickupLocation.name }}</span>
                    <Icon
                      name="carbon:arrow-right"
                      class="shrink-0 text-xs"
                    />
                    <span class="truncate">{{ order.deliveryLocation.name }}</span>
                  </div>
                </div>

                <!-- 步驟條 -->
                <div class="mt-2 flex flex-col">
                  <div
                    v-for="(step, index) in steps"
                    :key="index"
                    class="flex h-12 items-start gap-2"
                  >
                    <!-- 圖示 + 連接線 -->
                    <div class="flex w-8 flex-col items-center">
                      <div
                        class="
                          flex size-8 shrink-0 items-center justify-center
                          rounded-full
                        "
                        :class="
                          index === activeStepIndex
                            ? 'bg-primary-300'
                            : 'bg-neutral-200'
                        "
                      >
                        <Icon
                          :name="step.icon"
                          class="text-sm"
                          :class="
                            index === activeStepIndex
                              ? 'text-white'
                              : 'text-neutral-500'
                          "
                        />
                      </div>
                      <div
                        v-if="index < steps.length - 1"
                        class="mt-1 w-px flex-1"
                        :class="
                          index < activeStepIndex
                            ? 'bg-primary-300'
                            : 'bg-neutral-200'
                        "
                      ></div>
                    </div>

                    <!-- 步驟名稱 + 時間 -->
                    <div class="flex flex-1 items-start justify-between pt-1">
                      <span
                        class="text-base font-medium"
                        :class="
                          index === activeStepIndex
                            ? 'text-neutral-900'
                            : 'text-neutral-600'
                        "
                      >
                        {{ step.label }}
                      </span>
                      <span
                        v-if="index === activeStepIndex"
                        class="shrink-0 text-xs text-neutral-600"
                      >
                        {{ activeStepTime }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 訂單資訊 -->
            <div class="flex flex-col gap-3 bg-white p-5">
              <div class="flex items-center gap-1">
                <Icon
                  name="carbon:receipt"
                  class="text-sm text-neutral-900"
                />
                <h2 class="flex-1 text-lg font-bold text-neutral-900">
                  訂單資訊
                </h2>
              </div>

              <!-- 地點卡片 -->
              <div class="flex flex-col gap-3">
                <div
                  class="flex items-center gap-2 rounded-sm bg-primary-100 p-3"
                >
                  <div class="flex rounded-rounded bg-[#e4effb] p-2">
                    <Icon
                      name="carbon:store"
                      class="text-xl text-primary-300"
                    />
                  </div>
                  <span class="font-medium text-neutral-900">
                    {{ order.pickupLocation.name }}
                  </span>
                </div>
                <div class="flex justify-center">
                  <Icon
                    name="carbon:up-down"
                    class="text-2xl text-neutral-600"
                  />
                </div>
                <div
                  class="flex items-center gap-2 rounded-sm bg-primary-100 p-3"
                >
                  <div class="flex rounded-rounded bg-[#e4effb] p-2">
                    <Icon
                      name="carbon:location"
                      class="text-xl text-primary-300"
                    />
                  </div>
                  <span class="flex-1 font-medium text-neutral-900">
                    {{ order.deliveryLocation.name }}
                  </span>
                </div>
              </div>

              <!-- 詳細欄位 -->
              <div class="flex flex-col gap-1 pt-1">
                <div class="flex items-center gap-2 text-base">
                  <span class="min-w-[76px] shrink-0 text-neutral-600">訂單編號</span>
                  <span class="flex-1 text-right text-neutral-900">
                    {{ order.voucherId || order.id.substring(0, 8) }}
                  </span>
                  <button
                    type="button"
                    @click="copyToClipboard(order.voucherId || order.id)"
                  >
                    <Icon
                      name="carbon:copy"
                      class="text-sm text-neutral-600"
                    />
                  </button>
                </div>
                <div class="flex items-center gap-2 text-base">
                  <span class="min-w-[76px] shrink-0 text-neutral-600">行李數量</span>
                  <span class="flex-1 text-right text-neutral-900">
                    {{ order.luggageCount }} 件
                  </span>
                </div>
                <div class="flex items-center gap-2 text-base">
                  <span class="min-w-[76px] shrink-0 text-neutral-600">去程日期</span>
                  <span class="flex-1 text-right text-neutral-900">
                    {{ formatDate(order.bookingDate) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 結帳明細 -->
            <div class="flex flex-col bg-white">
              <button
                type="button"
                class="flex items-center gap-1 px-5 py-5"
                @click="isCheckoutOpen = !isCheckoutOpen"
              >
                <Icon
                  name="carbon:wallet"
                  class="text-sm text-neutral-900"
                />
                <h2 class="flex-1 text-left text-lg font-bold text-neutral-900">
                  結帳明細
                </h2>
                <Icon
                  :name="isCheckoutOpen ? 'carbon:chevron-up' : 'carbon:chevron-down'"
                  class="text-2xl text-neutral-600"
                />
              </button>
              <Transition
                @enter="onAccordionEnter"
                @after-enter="onAccordionAfterEnter"
                @leave="onAccordionLeave"
                @after-leave="onAccordionAfterLeave"
              >
                <div
                  v-show="isCheckoutOpen"
                  class="flex flex-col gap-2 px-5 pb-5"
                >
                  <div class="flex items-center gap-2 text-base">
                    <span class="min-w-[76px] shrink-0 text-neutral-600">服務方案</span>
                    <span class="flex-1 text-right text-neutral-900">—</span>
                  </div>
                  <div class="flex items-center gap-2 text-base">
                    <span class="min-w-[76px] shrink-0 text-neutral-600">數量</span>
                    <span class="flex-1 text-right text-neutral-900">{{ order.luggageCount }} 件</span>
                  </div>
                  <div class="flex items-center gap-2 text-base">
                    <span class="min-w-[76px] shrink-0 text-neutral-600">小計</span>
                    <span class="flex-1 text-right text-neutral-900">—</span>
                  </div>
                  <div class="my-1 h-px bg-neutral-100"></div>
                  <div class="flex items-center gap-2 text-base">
                    <span class="min-w-[76px] shrink-0 text-neutral-600">付款方式</span>
                    <span class="flex-1 text-right text-neutral-900">—</span>
                  </div>
                  <div class="flex items-center gap-2 text-base">
                    <span class="min-w-[76px] shrink-0 text-neutral-600">付款狀態</span>
                    <span class="flex-1 text-right text-neutral-900">—</span>
                  </div>
                </div>
              </Transition>
            </div>

            <!-- 領件人 -->
            <div class="flex flex-col bg-white pb-[106px]">
              <button
                type="button"
                class="flex items-center gap-1 px-5 py-5"
                @click="isRecipientOpen = !isRecipientOpen"
              >
                <Icon
                  name="carbon:user"
                  class="text-sm text-neutral-900"
                />
                <h2 class="flex-1 text-left text-lg font-bold text-neutral-900">
                  領件人
                </h2>
                <Icon
                  :name="isRecipientOpen ? 'carbon:chevron-up' : 'carbon:chevron-down'"
                  class="text-2xl text-neutral-600"
                />
              </button>
              <Transition
                @enter="onAccordionEnter"
                @after-enter="onAccordionAfterEnter"
                @leave="onAccordionLeave"
                @after-leave="onAccordionAfterLeave"
              >
                <div
                  v-show="isRecipientOpen"
                  class="flex flex-col gap-2 px-5 pb-5"
                >
                  <div class="flex items-center gap-2 text-base">
                    <span class="min-w-[76px] shrink-0 text-neutral-600">姓名</span>
                    <span class="flex-1 text-right text-neutral-900">{{ order.userName }}</span>
                  </div>
                  <div class="flex items-center gap-2 text-base">
                    <span class="min-w-[76px] shrink-0 text-neutral-600">聯絡電話</span>
                    <span class="flex-1 text-right text-neutral-900">—</span>
                  </div>
                </div>
              </Transition>
            </div>
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

    <!-- 取消確認對話框 -->
    <div
      v-if="showCancelConfirm"
      class="
        fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4
      "
      @click.self="showCancelConfirm = false"
    >
      <div class="w-full max-w-sm rounded-sm bg-white p-6 shadow-down-200">
        <h3 class="mb-4 text-lg font-bold text-neutral-900">
          確認取消訂單
        </h3>
        <p class="mb-4 text-base text-neutral-600">
          確定要取消此訂單嗎？此操作無法復原。
        </p>
        <div
          v-if="cancelError"
          class="mb-4 rounded-sm bg-danger-100 p-3 text-sm text-danger-300"
        >
          {{ cancelError }}
        </div>
        <div class="flex gap-3">
          <button
            type="button"
            class="
              flex-1 rounded-sm border border-neutral-200 py-2.5 text-base
              font-medium text-neutral-900
            "
            :disabled="isCancelling"
            @click="showCancelConfirm = false"
          >
            不，返回
          </button>
          <button
            type="button"
            class="
              flex-1 rounded-sm bg-danger-300 py-2.5 text-base font-medium
              text-white
              disabled:opacity-50
            "
            :disabled="isCancelling"
            @click="cancelOrder"
          >
            {{ isCancelling ? '處理中...' : '確定取消' }}
          </button>
        </div>
      </div>
    </div>
  </template>
</template>
