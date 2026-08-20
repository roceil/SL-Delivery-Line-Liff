<script lang="ts" setup>
import type { BookingOrder, OrderLeg } from '~/types/booking'

const props = defineProps<{
  order: BookingOrder
  isCancelled: boolean
}>()

// statuses：對應到此步驟的訂單狀態，用來從 statusTimeline 取出發生時間
const steps = [
  { label: '訂單確認中', icon: 'lucide:receipt', statuses: ['pending'] },
  { label: '訂單成立，待交付行李', icon: 'lucide:package', statuses: ['confirmed', 'assigned'] },
  { label: '已收件', icon: 'lucide:store', statuses: ['received'] },
  { label: '運送中', icon: 'lucide:truck', statuses: ['in_delivery', 'in_transit'] },
  { label: '已送達', icon: 'lucide:map-pin', statuses: ['delivered'] },
  { label: '已完成', icon: 'lucide:check', statuses: ['completed'] },
]

const activeStepIndex = computed(() => {
  switch (props.order.status) {
    case 'pending': return 0
    case 'confirmed':
    case 'assigned': return 1
    case 'received': return 2
    case 'in_delivery':
    case 'in_transit': return 3
    case 'delivered':
    case 'completed': return 5
    default: return -1
  }
})

function formatTime(iso: string) {
  const d = new Date(iso)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${month}/${day} ${hours}:${minutes}`
}

/**
 * 各步驟的發生時間。
 *
 * 以後端記錄的 statusTimeline 為準；訂單建立時間可直接對應到第一步。
 * 舊訂單沒有變更歷史，目前所在的那一步退回 updatedAt，其餘步驟留白 ——
 * 寧可不顯示，也不要顯示一個猜出來的時間。
 */
const stepTimes = computed(() => {
  const timeline = props.order.statusTimeline ?? {}

  return steps.map((step, index) => {
    if (index === 0 && props.order.createdAt)
      return formatTime(props.order.createdAt)

    const matched = step.statuses.find(s => timeline[s])
    if (matched)
      return formatTime(timeline[matched]!)

    if (index === activeStepIndex.value && props.order.updatedAt)
      return formatTime(props.order.updatedAt)

    return ''
  })
})

/** 取消訊息沿用目前狀態的時間 */
const activeStepTime = computed(() =>
  stepTimes.value[activeStepIndex.value] || formatTime(props.order.updatedAt),
)

// ── 雙程訂單：去程／回程分頁 ──────────────────────────
// 去程與回程各自有獨立進度（例如去程已送達、回程尚未排入行程），
// 用單一條進度條會讓客人誤以為整趟都結束了。

/**
 * 各程的步驟只列出任務實際會用到的狀態。
 *
 * order_tasks 目前只寫入 pending / received / delivered 三種狀態，
 * 加上「是否已排入行程」(schedule_id) 共四階段。
 * 訂單層級才有的 confirmed / in_delivery / completed 不放進來 ——
 * 永遠不會亮的步驟只會讓客人誤判進度。
 */
const LEG_STEPS = [
  { label: '待安排', icon: 'lucide:receipt' },
  { label: '已排入行程', icon: 'lucide:calendar-check' },
  { label: '已收件', icon: 'lucide:store' },
  { label: '已送達', icon: 'lucide:map-pin' },
]

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

function legStepIndex(leg: OrderLeg) {
  const status = leg.status ?? 'pending'
  if (leg.isCompleted || status === 'delivered' || status === 'completed')
    return 3
  if (status === 'received')
    return 2
  if (leg.scheduleId != null)
    return 1
  return 0
}

/**
 * 各程步驟的時間。
 *
 * 任務只留下 completed_at，中間兩步沒有對應的時間欄位，因此留白。
 */
function legStepTimes(leg: OrderLeg) {
  return [
    props.order.createdAt ? formatTime(props.order.createdAt) : '',
    '',
    '',
    leg.completedAt ? formatTime(leg.completedAt) : '',
  ]
}

interface LegView {
  key: 'outbound' | 'inbound'
  badge: string
  from: string
  to: string
  date: string
  statusLabel: string
  isCompleted: boolean
  isActive: boolean
  stepIndex: number
  stepTimes: string[]
}

const legViews = computed<LegView[]>(() => {
  const legs = props.order.legs
  if (!legs)
    return []

  const build = (key: 'outbound' | 'inbound', badge: string, from: string, to: string): LegView | null => {
    const leg = legs[key]
    if (!leg)
      return null

    const status = leg.status ?? 'pending'

    return {
      key,
      badge,
      from,
      to,
      date: leg.taskDate ? leg.taskDate.replace(/-/g, '/') : '—',
      statusLabel: LEG_STATUS_LABEL[status] ?? status,
      isCompleted: leg.isCompleted,
      // 已排入行程且尚未完成 → 進行中
      isActive: !leg.isCompleted && leg.scheduleId != null,
      stepIndex: legStepIndex(leg),
      stepTimes: legStepTimes(leg),
    }
  }

  const pickup = props.order.pickupLocation.name
  const delivery = props.order.deliveryLocation.name

  return [
    build('outbound', '去程', pickup, delivery),
    build('inbound', '回程', delivery, pickup),
  ].filter((v): v is LegView => v !== null)
})

const isRoundTrip = computed(() =>
  props.order.servicePlan === 'round_trip' && legViews.value.length > 0,
)

/** 分頁預設停在去程 */
const activeLegKey = ref<'outbound' | 'inbound'>('outbound')

const activeLeg = computed(() =>
  legViews.value.find(leg => leg.key === activeLegKey.value) ?? legViews.value[0] ?? null,
)

// 雙程看所選的那一程，單程沿用訂單層級的步驟
const viewSteps = computed(() =>
  isRoundTrip.value && activeLeg.value ? LEG_STEPS : steps,
)

const viewActiveIndex = computed(() =>
  isRoundTrip.value && activeLeg.value ? activeLeg.value.stepIndex : activeStepIndex.value,
)

const viewStepTimes = computed(() =>
  isRoundTrip.value && activeLeg.value ? activeLeg.value.stepTimes : stepTimes.value,
)
</script>

<template>
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
        name="lucide:chevron-right"
        class="text-xl text-neutral-600"
      />
    </div>

    <!-- 雙程：去程／回程切換，預設顯示去程 -->
    <div
      v-if="isRoundTrip && !isCancelled"
      class="flex gap-1 rounded-sm bg-neutral-100 p-1"
    >
      <button
        v-for="leg in legViews"
        :key="leg.key"
        type="button"
        class="flex flex-1 items-center justify-center gap-1.5 rounded-sm py-2"
        :class="leg.key === activeLegKey
          ? 'bg-white shadow-down-200'
          : 'bg-transparent'"
        @click="activeLegKey = leg.key"
      >
        <span
          class="text-sm font-medium"
          :class="leg.key === activeLegKey ? 'text-neutral-900' : `
            text-neutral-600
          `"
        >
          {{ leg.badge }}
        </span>
        <Icon
          :name="leg.isCompleted ? 'lucide:circle-check' : leg.isActive ? 'lucide:truck' : 'lucide:clock'"
          class="text-sm"
          :class="leg.isCompleted
            ? 'text-success-300'
            : leg.isActive ? 'text-primary-300' : 'text-neutral-500'"
        />
      </button>
    </div>

    <div class="rounded-sm bg-neutral-100 p-3">
      <!-- 行程方向（雙程顯示所選的那一程） -->
      <div class="flex items-center gap-3 border-b border-neutral-200 pb-3">
        <span
          class="shrink-0 rounded-rounded px-2 py-0.5 text-[11px] font-medium"
          :style="isRoundTrip && activeLegKey === 'inbound'
            ? { backgroundColor: '#e4effb', color: '#1c60cc' }
            : { backgroundColor: '#e9f4ef', color: '#229464' }"
        >
          {{ isRoundTrip && activeLeg ? activeLeg.badge : '去程' }}
        </span>
        <div
          class="
            flex min-w-0 flex-1 items-center gap-1 text-sm text-neutral-600
          "
        >
          <span class="shrink-0">
            {{ isRoundTrip && activeLeg ? activeLeg.from : order.pickupLocation.name }}
          </span>
          <Icon
            name="lucide:arrow-right"
            class="shrink-0 text-xs"
          />
          <span class="truncate">
            {{ isRoundTrip && activeLeg ? activeLeg.to : order.deliveryLocation.name }}
          </span>
        </div>
        <span
          v-if="isRoundTrip && activeLeg"
          class="shrink-0 text-xs text-neutral-500"
        >
          {{ activeLeg.date }}
        </span>
      </div>

      <!-- 已取消訊息（取代步驟條） -->
      <div
        v-if="isCancelled"
        class="mt-2 flex items-center gap-3 rounded-sm bg-neutral-100 p-3"
      >
        <div class="flex rounded-rounded bg-neutral-200 p-2">
          <Icon
            name="lucide:circle-x"
            class="text-xl text-neutral-500"
          />
        </div>
        <div class="flex flex-1 flex-col gap-0.5">
          <span class="text-base font-bold text-neutral-700">
            此訂單已取消
          </span>
          <span class="text-sm text-neutral-500">
            取消時間 {{ activeStepTime }}
          </span>
        </div>
      </div>

      <!-- 步驟條 -->
      <div
        v-else
        class="mt-2 flex flex-col"
      >
        <div
          v-for="(step, index) in viewSteps"
          :key="step.label"
          class="flex h-12 items-start gap-2"
        >
          <!-- 圖示 + 連接線（已走過與目前所在的步驟都視為已完成） -->
          <div class="flex w-8 flex-col items-center">
            <div
              class="
                flex size-8 shrink-0 items-center justify-center rounded-full
              "
              :class="
                index <= viewActiveIndex
                  ? 'bg-primary-300'
                  : 'bg-neutral-200'
              "
            >
              <Icon
                :name="step.icon"
                class="text-sm"
                :class="
                  index <= viewActiveIndex
                    ? 'text-white'
                    : 'text-neutral-500'
                "
              />
            </div>
            <div
              v-if="index < viewSteps.length - 1"
              class="mt-1 w-px flex-1"
              :class="
                index < viewActiveIndex
                  ? 'bg-primary-300'
                  : 'bg-neutral-200'
              "
            ></div>
          </div>

          <!-- 步驟名稱 + 時間 -->
          <div class="flex flex-1 items-start justify-between pt-1">
            <span
              class="text-base"
              :class="
                index === viewActiveIndex
                  ? 'font-bold text-neutral-900'
                  : index < viewActiveIndex
                    ? 'font-medium text-neutral-900'
                    : 'font-medium text-neutral-600'
              "
            >
              {{ step.label }}
            </span>
            <span
              v-if="viewStepTimes[index]"
              class="shrink-0 text-xs text-neutral-600"
            >
              {{ viewStepTimes[index] }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
