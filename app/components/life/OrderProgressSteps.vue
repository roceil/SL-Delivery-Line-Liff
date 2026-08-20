<script lang="ts" setup>
import type { BookingOrder } from '~/types/booking'

const props = defineProps<{
  order: BookingOrder
  isCancelled: boolean
}>()

const steps = [
  { label: '訂單確認中', icon: 'lucide:receipt' },
  { label: '訂單成立，待交付行李', icon: 'lucide:package' },
  { label: '已收件', icon: 'lucide:store' },
  { label: '運送中', icon: 'lucide:truck' },
  { label: '已送達', icon: 'lucide:map-pin' },
  { label: '已完成', icon: 'lucide:check' },
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

const activeStepTime = computed(() => {
  const d = new Date(props.order.updatedAt)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${month}/${day} ${hours}:${minutes}`
})
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

    <div class="rounded-sm bg-neutral-100 p-3">
      <!-- 行程方向 -->
      <div
        class="flex items-center gap-3 border-b border-neutral-200 pb-3"
      >
        <span
          class="rounded-rounded px-2 py-0.5 text-[11px] font-medium"
          :style="{ backgroundColor: '#e9f4ef', color: '#229464' }"
        >
          去程
        </span>
        <div
          class="flex min-w-0 items-center gap-1 text-sm text-neutral-600"
        >
          <span class="shrink-0">{{ order.pickupLocation.name }}</span>
          <Icon
            name="lucide:arrow-right"
            class="shrink-0 text-xs"
          />
          <span class="truncate">{{ order.deliveryLocation.name }}</span>
        </div>
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
          v-for="(step, index) in steps"
          :key="index"
          class="flex h-12 items-start gap-2"
        >
          <!-- 圖示 + 連接線 -->
          <div class="flex w-8 flex-col items-center">
            <div
              class="
                flex size-8 shrink-0 items-center justify-center rounded-full
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
</template>
