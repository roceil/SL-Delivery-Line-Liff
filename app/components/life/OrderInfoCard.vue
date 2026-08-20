<script lang="ts" setup>
import type { BookingOrder } from '~/types/booking'

defineProps<{
  order: BookingOrder
}>()

function formatDate(dateString: string) {
  if (!dateString)
    return '—'
  const [year = '', month = '0', day = '0'] = dateString.split('-')
  return `${year}/${Number(month)}/${Number(day)}`
}

async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text)
}
</script>

<template>
  <div class="flex flex-col gap-3 bg-white p-5">
    <div class="flex items-center gap-1">
      <Icon
        name="lucide:receipt"
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
            name="lucide:store"
            class="text-xl text-primary-300"
          />
        </div>
        <span class="font-medium text-neutral-900">
          {{ order.pickupLocation.name }}
        </span>
      </div>
      <div class="flex justify-center">
        <Icon
          name="lucide:move-vertical"
          class="text-2xl text-neutral-600"
        />
      </div>
      <div
        class="flex items-center gap-2 rounded-sm bg-primary-100 p-3"
      >
        <div class="flex rounded-rounded bg-[#e4effb] p-2">
          <Icon
            name="lucide:map-pin"
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
            name="lucide:copy"
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
</template>
