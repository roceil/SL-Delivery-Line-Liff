<script lang="ts" setup>
definePageMeta({
  layout: 'life',
})

const config = useRuntimeConfig()

const lineStore = useLineStore()
const bookingStore = useBookingStore()
const profileStore = useProfileStore()
const locationsStore = useLocationsStore()

const { initLiff, login } = lineStore
const { isInitialized, isLoggedIn, user, error } = storeToRefs(lineStore)
const { activeOrders } = storeToRefs(bookingStore)

const isLoading = ref(true)

const firstActiveOrder = computed(() => activeOrders.value[0] ?? null)

// 以下三張對應表需涵蓋 orders_status 的所有狀態。
// 缺項會落到 fallback 而顯示成「待確認」—— 行李其實已在運送中，客人卻看不出來。
// in_delivery 為資料庫實際使用的狀態，in_transit 為相容舊值。
function getStatusBadge(status: string) {
  const map: Record<string, { text: string, cls: string }> = {
    pending: { text: '待確認', cls: 'bg-neutral-200 text-neutral-600' },
    confirmed: { text: '待交付', cls: 'bg-info-100 text-info-300' },
    assigned: { text: '待交付', cls: 'bg-info-100 text-info-300' },
    received: { text: '已收件', cls: 'bg-info-100 text-info-300' },
    in_delivery: { text: '運送中', cls: 'bg-info-100 text-info-300' },
    in_transit: { text: '運送中', cls: 'bg-info-100 text-info-300' },
    delivered: { text: '已送達', cls: 'bg-success-100 text-success-300' },
    completed: { text: '已完成', cls: 'bg-success-100 text-success-300' },
    cancelled: { text: '已取消', cls: 'bg-danger-100 text-danger-300' },
    overdue: { text: '逾期', cls: 'bg-danger-100 text-danger-300' },
  }
  return map[status] ?? { text: '待確認', cls: 'bg-neutral-200 text-neutral-600' }
}

function getProgressPercent(status: string) {
  const map: Record<string, number> = {
    pending: 20,
    confirmed: 40,
    assigned: 40,
    received: 60,
    in_delivery: 80,
    in_transit: 80,
    delivered: 100,
    completed: 100,
    cancelled: 0,
    overdue: 0,
  }
  return map[status] ?? 0
}

function getProgressLabel(status: string) {
  const map: Record<string, string> = {
    pending: '訂單確認中，請稍候',
    confirmed: '行李待交付',
    assigned: '行李待交付',
    received: '門市已收件',
    in_delivery: '行李運送中',
    in_transit: '行李運送中',
    delivered: '行李已送達',
    completed: '行李已送達',
    cancelled: '訂單已取消',
    overdue: '逾期未交付，請聯繫客服',
  }
  return map[status] ?? ''
}

// ── 雙程訂單的分段顯示 ────────────────────────────────
// 雙程的去程與回程進度可能不同（去程已送達、回程還沒開始），
// 只用訂單層級的單一進度會讓客人以為整趟都結束了。
const LEG_STATUS_LABEL: Record<string, string> = {
  pending: '待安排',
  confirmed: '待交付行李',
  assigned: '已排入行程',
  received: '已收件',
  in_delivery: '運送中',
  in_transit: '運送中',
  delivered: '已送達',
  completed: '已完成',
  cancelled: '已取消',
  overdue: '逾期',
}

const isFirstOrderRoundTrip = computed(() =>
  firstActiveOrder.value?.servicePlan === 'round_trip' && !!firstActiveOrder.value?.legs,
)

const firstOrderLegs = computed(() => {
  const order = firstActiveOrder.value
  if (!order?.legs)
    return []

  const build = (key: 'outbound' | 'inbound', badge: string, from: string, to: string) => {
    const leg = order.legs?.[key]
    if (!leg)
      return null

    const status = leg.status ?? 'pending'
    return {
      key,
      badge,
      from,
      to,
      rawStatus: status,
      percent: Math.round(legFraction(status) * 100),
      statusLabel: LEG_STATUS_LABEL[status] ?? status,
      isCompleted: leg.isCompleted,
      isActive: !leg.isCompleted && leg.scheduleId != null,
      date: leg.taskDate ? leg.taskDate.replace(/-/g, '/') : '—',
    }
  }

  const pickup = order.pickupLocation.name
  const delivery = order.deliveryLocation.name

  return [
    build('outbound', '去程', pickup, delivery),
    build('inbound', '回程', delivery, pickup),
  ].filter(v => v !== null)
})

/** 單一程在自身流程中的完成比例 */
function legFraction(status: string) {
  const map: Record<string, number> = {
    pending: 0,
    confirmed: 0.25,
    assigned: 0.4,
    received: 0.6,
    in_delivery: 0.8,
    in_transit: 0.8,
    delivered: 1,
    completed: 1,
    cancelled: 0,
    overdue: 0,
  }
  return map[status] ?? 0
}

onMounted(async () => {
  await initLiff(config.public.liffId as string)
  isLoading.value = false

  console.log('[LIFF Debug]', {
    isInitialized: isInitialized.value,
    isLoggedIn: isLoggedIn.value,
    error: error.value,
    liffId: config.public.liffId,
  })

  if (!isInitialized.value || !isLoggedIn.value) {
    login()
    return
  }

  await Promise.all([
    bookingStore.loadOrders(),
    profileStore.initProfile(),
    locationsStore.fetchLocations(),
  ])
})
</script>

<template>
  <div class="flex flex-1 flex-col">
    <!-- Loading -->
    <div
      v-if="isLoading"
      class="flex flex-1 items-center justify-center"
    >
      <p class="text-neutral-500">
        載入中...
      </p>
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="m-4 rounded-sm bg-danger-100 p-4 text-danger-300"
    >
      <p class="font-medium">
        發生錯誤
      </p>
      <p class="text-sm">
        {{ error }}
      </p>
    </div>

    <!-- 未登入 -->
    <div
      v-else-if="!isLoggedIn"
      class="flex flex-1 items-center justify-center"
    >
      <button
        type="button"
        class="rounded-sm bg-primary-300 px-m py-s font-medium text-neutral-0"
        @click="login"
      >
        使用 LINE 登入
      </button>
    </div>

    <!-- 已登入 -->
    <div
      v-else-if="user"
      class="flex flex-col gap-2xl px-m py-xl"
    >
      <!-- Profile Card -->
      <div
        class="
          flex items-center gap-s overflow-hidden rounded-sm border
          border-neutral-0 px-m py-m
        "
        style="background: linear-gradient(16.83deg, #fff 0%, rgba(255,255,255,0.5) 100%)"
      >
        <img
          :src="user.pictureUrl || ''"
          :alt="user.displayName"
          class="size-12 shrink-0 rounded-rounded object-cover"
        >
        <div class="flex min-w-0 flex-1 flex-col gap-2xs">
          <div
            class="
              flex items-center gap-2xs text-md font-bold tracking-wide
              text-neutral-900
            "
          >
            <span>Hi,</span>
            <span>{{ user.displayName }}</span>
          </div>
          <p class="text-sm tracking-wide text-neutral-600">
            <template v-if="activeOrders.length > 0">
              您有 {{ activeOrders.length }} 筆訂單正在進行中！
            </template>
            <template v-else>
              歡迎使用行李寄送服務
            </template>
          </p>
        </div>
        <button
          type="button"
          class="
            flex shrink-0 items-center justify-center rounded-rounded p-xs
            shadow-down-200
          "
          style="background: linear-gradient(31deg, #fff 0%, rgba(255,255,255,0.5) 100%)"
        >
          <Icon
            name="lucide:bell"
            class="size-4 text-neutral-700"
          />
        </button>
      </div>

      <!-- Order Status -->
      <section
        v-if="firstActiveOrder"
        class="flex flex-col gap-s"
      >
        <div class="flex items-center gap-xs">
          <span
            class="size-[6px] shrink-0 rounded-rounded"
            style="background: linear-gradient(131deg, #4090E8 16%, #306CF7 62%)"
          ></span>
          <h2 class="flex-1 text-lg font-bold tracking-wide text-neutral-900">
            訂單狀態
          </h2>
        </div>

        <div
          class="
            flex flex-col gap-m overflow-hidden rounded-sm border
            border-[#4ca4f1] p-m shadow-down-200
          "
          style="background: linear-gradient(18deg, #fff 0%, rgba(255,255,255,0.5) 100%)"
        >
          <!-- Route + Badge -->
          <div class="flex items-center justify-between gap-xs">
            <div class="flex min-w-0 flex-1 items-center gap-2xs">
              <span
                class="
                  shrink-0 text-sm font-medium tracking-wide text-neutral-900
                "
              >
                {{ firstActiveOrder.pickupLocation.name }}
              </span>
              <Icon
                name="lucide:arrow-right"
                class="size-4 shrink-0 text-neutral-500"
              />
              <span
                class="
                  truncate text-sm font-medium tracking-wide text-neutral-900
                "
              >
                {{ firstActiveOrder.deliveryLocation.name }}
              </span>
            </div>
            <span
              class="
                shrink-0 rounded-rounded px-xs py-3xs text-2xs font-medium
                tracking-wide
              "
              :class="getStatusBadge(firstActiveOrder?.status ?? 'pending').cls"
            >
              {{ getStatusBadge(firstActiveOrder?.status ?? 'pending').text }}
            </span>
          </div>

          <!-- Divider -->
          <div class="h-px bg-neutral-200"></div>

          <!-- 雙程：去程／回程各自一條進度條 -->
          <div
            v-if="isFirstOrderRoundTrip && firstOrderLegs.length > 0"
            class="flex flex-col gap-m"
          >
            <div
              v-for="leg in firstOrderLegs"
              :key="leg!.key"
              class="flex flex-col gap-xs"
            >
              <!-- 該程的狀態與日期 -->
              <div class="flex items-center gap-xs text-2xs">
                <span
                  class="shrink-0 rounded-rounded px-xs py-3xs font-medium"
                  :style="leg!.key === 'outbound'
                    ? { backgroundColor: '#e9f4ef', color: '#229464' }
                    : { backgroundColor: '#e4effb', color: '#1c60cc' }"
                >
                  {{ leg!.badge }}
                </span>
                <Icon
                  :name="leg!.isCompleted ? 'lucide:circle-check' : leg!.isActive ? 'lucide:truck' : 'lucide:clock'"
                  class="size-3.5 shrink-0"
                  :class="leg!.isCompleted
                    ? 'text-success-300'
                    : leg!.isActive ? 'text-primary-300' : 'text-neutral-500'"
                />
                <span
                  class="text-sm font-bold tracking-wide"
                  :class="leg!.isCompleted
                    ? 'text-success-300'
                    : leg!.isActive ? 'text-primary-300' : 'text-neutral-600'"
                >
                  {{ leg!.statusLabel }}
                </span>
                <span class="flex-1 truncate text-right text-neutral-500">
                  {{ leg!.date }}
                </span>
              </div>

              <!-- Indicator -->
              <div
                class="flex justify-end"
                :style="{ paddingRight: `calc(${100 - leg!.percent}% - 8px)` }"
              >
                <Icon
                  name="lucide:luggage"
                  class="size-4"
                  :class="leg!.isCompleted ? 'text-success-300' : `
                    text-primary-300
                  `"
                />
              </div>
              <!-- Track -->
              <div
                class="
                  relative h-[2px] overflow-hidden rounded-rounded
                  bg-neutral-400
                "
              >
                <div
                  class="absolute inset-y-0 left-0 rounded-rounded"
                  :style="{
                    width: `${leg!.percent}%`,
                    background: leg!.isCompleted
                      ? '#229464'
                      : 'linear-gradient(179deg, #4090E8 16%, #306CF7 62%)',
                  }"
                ></div>
              </div>
            </div>
          </div>

          <!-- 單程：單一進度條 -->
          <div
            v-else
            class="flex flex-col gap-xs"
          >
            <!-- Indicator -->
            <div
              class="flex justify-end"
              :style="{ paddingRight: `calc(${100 - getProgressPercent(firstActiveOrder.status)}% - 8px)` }"
            >
              <Icon
                name="lucide:luggage"
                class="size-4 text-primary-300"
              />
            </div>
            <!-- Track -->
            <div
              class="
                relative h-[2px] overflow-hidden rounded-rounded bg-neutral-400
              "
            >
              <div
                class="absolute inset-y-0 left-0 rounded-rounded"
                :style="{
                  width: `${getProgressPercent(firstActiveOrder.status)}%`,
                  background: 'linear-gradient(179deg, #4090E8 16%, #306CF7 62%)',
                }"
              ></div>
            </div>
            <!-- Label -->
            <p
              class="text-lg font-bold tracking-wide"
              style="background: linear-gradient(173deg, #4090E8 16%, #306CF7 62%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;"
            >
              {{ getProgressLabel(firstActiveOrder.status) }}
            </p>
          </div>

          <!-- Detail Button -->
          <NuxtLink
            :to="`/life/my-bookings/${firstActiveOrder.id}`"
            class="
              flex w-full items-center justify-center rounded-sm border
              border-neutral-200 bg-neutral-0 px-m py-xs
            "
          >
            <span class="text-sm font-medium tracking-wide text-neutral-900">查看詳情</span>
          </NuxtLink>
        </div>
      </section>

      <!-- 立即預約 -->
      <section class="flex flex-col gap-s">
        <h2 class="text-lg font-bold tracking-wide text-neutral-900">
          立即預約
        </h2>
        <div class="flex flex-col gap-xs">
          <!-- 已透過其他管道購買 -->
          <NuxtLink
            to="/life/query"
            class="flex items-center gap-xs rounded-sm p-m shadow-down-100"
            style="background: linear-gradient(8deg, #fff 0%, rgba(255,255,255,0.5) 100%)"
          >
            <div class="flex items-start self-stretch py-xs">
              <span class="size-[6px] shrink-0 rounded-rounded bg-success-300"></span>
            </div>

            <div class="flex min-w-0 flex-1 flex-col gap-3xs">
              <p class="text-md font-medium tracking-wide text-neutral-900">
                我已透過其他管道購買
              </p>
              <p class="text-sm tracking-wide text-neutral-600">
                KKday/Klook/Trip 旅客請點此預約
              </p>
            </div>

            <Icon
              name="lucide:chevron-right"
              class="size-5 shrink-0 text-neutral-500"
            />
          </NuxtLink>

          <!-- 還沒購買 -->
          <NuxtLink
            to="/life/booking"
            class="flex items-center gap-xs rounded-sm p-m shadow-down-100"
            style="background: linear-gradient(6deg, #fff 0%, rgba(255,255,255,0.5) 100%)"
          >
            <div class="flex items-center">
              <span class="size-[6px] shrink-0 rounded-rounded bg-warning-300"></span>
            </div>
            <div class="flex min-w-0 flex-1 flex-col gap-3xs">
              <p class="text-md font-medium tracking-wide text-neutral-900">
                我還沒購買，想直接預約
              </p>
            </div>
            <Icon
              name="lucide:chevron-right"
              class="size-5 shrink-0 text-neutral-500"
            />
          </NuxtLink>
        </div>
      </section>

      <!-- 幫助中心 -->
      <section class="flex flex-col gap-s">
        <h2 class="text-lg font-bold tracking-wide text-neutral-900">
          幫助中心
        </h2>
        <div class="flex gap-xs">
          <button
            type="button"
            class="
              flex flex-1 flex-col items-start gap-xs overflow-hidden rounded-sm
              p-m shadow-down-100
            "
            style="background: linear-gradient(17deg, #fff 0%, rgba(255,255,255,0.5) 100%)"
          >
            <Icon
              name="lucide:circle-help"
              class="size-5 text-neutral-700"
            />
            <span class="text-md font-medium tracking-wide text-neutral-900">常見問題</span>
          </button>

          <button
            type="button"
            class="
              flex flex-1 flex-col items-start gap-xs rounded-sm p-m
              shadow-down-100
            "
            style="background: linear-gradient(17deg, #fff 0%, rgba(255,255,255,0.5) 100%)"
          >
            <Icon
              name="lucide:headset"
              class="size-5 text-neutral-700"
            />
            <span class="text-md font-medium tracking-wide text-neutral-900">聯絡客服</span>
          </button>
        </div>
      </section>

      <!-- 提醒事項 -->
      <div class="flex flex-col gap-3xs px-xs">
        <p class="text-sm font-medium tracking-wide text-primary-300">
          提醒事項
        </p>
        <p class="text-sm tracking-wide text-neutral-600">
          為確保物流排程，最晚請於使用日前一天 22:00 前完成線上預約
        </p>
      </div>
    </div>
  </div>
</template>
