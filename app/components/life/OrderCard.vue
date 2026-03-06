<script setup lang="ts">
import type { BookingOrder } from '~/types/booking'

interface Props {
  order: BookingOrder
}

const props = defineProps<Props>()

const formattedDate = computed(() => {
  if (!props.order.bookingDate)
    return '—'
  const [year, month, day] = props.order.bookingDate.split('-')
  return `${year}/${Number(month)}/${Number(day)}`
})

const showVoucherButton = computed(() =>
  ['pending', 'confirmed'].includes(props.order.status),
)
</script>

<template>
  <NuxtLink
    :to="`/life/my-bookings/${order.id}`"
    class="
      block cursor-pointer overflow-hidden rounded-sm border border-white p-4
      shadow-down-100
    "
    style="background: linear-gradient(20deg, #ffffff 0%, rgba(255,255,255,0.5) 100%)"
  >
    <!-- 出發地與目的地 -->
    <div class="mb-3 flex items-center gap-2">
      <div class="flex min-w-0 flex-1 items-center gap-2">
        <span class="truncate text-base font-bold text-neutral-900">{{ order.pickupLocation.name }}</span>
        <Icon
          name="carbon:arrows-horizontal"
          class="shrink-0 text-base text-neutral-600"
        />
        <span class="truncate text-base font-bold text-neutral-900">{{ order.deliveryLocation.name }}</span>
      </div>
      <Icon
        name="carbon:chevron-right"
        class="shrink-0 text-[20px] text-neutral-600"
      />
    </div>

    <!-- 分隔線 -->
    <div class="mb-3 h-px bg-neutral-200"></div>

    <!-- 訂單資訊 -->
    <div class="flex flex-col gap-1 py-1">
      <div class="flex items-center gap-4">
        <span class="w-[60px] shrink-0 text-sm text-neutral-600">訂單狀態</span>
        <LifeStatusBadge :status="order.status" />
      </div>
      <div class="flex items-center gap-4">
        <span class="w-[60px] shrink-0 text-sm text-neutral-600">訂單編號</span>
        <span class="text-sm text-neutral-900">{{ order.voucherId || order.id.substring(0, 8) }}</span>
      </div>
      <div class="flex items-center gap-4">
        <span class="w-[60px] shrink-0 text-sm text-neutral-600">使用日期</span>
        <span class="text-sm text-neutral-900">{{ formattedDate }}</span>
      </div>
    </div>

    <!-- 出示憑證按鈕（待交付/待出發才顯示） -->
    <div
      v-if="showVoucherButton"
      class="mt-3 flex justify-end"
    >
      <button
        type="button"
        class="
          w-full rounded-sm bg-primary-300 px-4 py-2 text-sm font-medium
          text-white
        "
        @click.prevent="navigateTo(`/life/my-bookings/${order.id}`)"
      >
        出示憑證
      </button>
    </div>
  </NuxtLink>
</template>
