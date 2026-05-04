<script setup lang="ts">
import type { BookingOrder } from '~/types/booking'
import { SERVICE_PLAN_PRICE } from '~/types/booking'

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

// 總計（NT$）：依 servicePlan 單價 × 行李件數
const totalAmount = computed<number | null>(() => {
  const plan = props.order.servicePlan
  if (!plan)
    return null
  const unitPrice = SERVICE_PLAN_PRICE[plan]
  if (unitPrice == null)
    return null
  return unitPrice * (props.order.luggageCount ?? 0)
})

// 憑證彈窗
const showVoucherModal = ref(false)

function openVoucher() {
  showVoucherModal.value = true
}

function closeVoucher() {
  showVoucherModal.value = false
}
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
          name="lucide:move-horizontal"
          class="shrink-0 text-base text-neutral-600"
        />
        <span class="truncate text-base font-bold text-neutral-900">{{ order.deliveryLocation.name }}</span>
      </div>
      <Icon
        name="lucide:chevron-right"
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
      <div
        v-if="totalAmount != null"
        class="flex items-center gap-4"
      >
        <span class="w-[60px] shrink-0 text-sm text-neutral-600">總計</span>
        <span class="text-sm text-neutral-900">
          NT$ {{ totalAmount.toLocaleString() }}
        </span>
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
          text-white transition-colors
          hover:bg-primary-400
        "
        @click.stop.prevent="openVoucher"
      >
        出示憑證
      </button>
    </div>
  </NuxtLink>

  <!-- 憑證彈窗 -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-200"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showVoucherModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6"
        role="dialog"
        aria-modal="true"
        @click.self="closeVoucher"
      >
        <div class="flex w-full max-w-[320px] flex-col items-center gap-6">
          <!-- 上方提示 -->
          <p class="text-center text-base leading-relaxed font-medium text-white">
            使用 Klook/KKday/Trip 購買的旅客<br>請改用該 App 內的電子憑證
          </p>

          <!-- 憑證卡片 -->
          <div class="w-full rounded-2xl bg-white p-6 shadow-down-200">
            <!-- QR Code -->
            <div class="flex items-center justify-center pb-2">
              <img
                v-if="order.qrCode"
                :src="order.qrCode"
                alt="訂單憑證 QR Code"
                class="size-[240px] object-contain"
              >
              <div
                v-else
                class="
                  flex size-[240px] items-center justify-center rounded-sm
                  bg-neutral-100 text-sm text-neutral-500
                "
              >
                憑證生成中...
              </div>
            </div>

            <!-- 缺口分隔線（左右兩側半圓） -->
            <div class="relative -mx-6 my-4">
              <div
                class="
                  absolute top-1/2 -left-3 size-6 -translate-y-1/2 rounded-full
                  bg-black/60
                "
              ></div>
              <div
                class="
                  absolute top-1/2 -right-3 size-6 -translate-y-1/2 rounded-full
                  bg-black/60
                "
              ></div>
              <div class="border-t border-dashed border-neutral-200"></div>
            </div>

            <!-- 訂單資訊 -->
            <div class="flex flex-col gap-2">
              <div
                class="flex items-center gap-2 text-base font-bold text-neutral-900"
              >
                <span class="truncate">{{ order.pickupLocation.name }}</span>
                <Icon
                  name="lucide:move-horizontal"
                  class="shrink-0 text-sm text-neutral-600"
                />
                <span class="truncate">{{ order.deliveryLocation.name }}</span>
              </div>
              <div class="flex items-center gap-2 text-sm">
                <span class="shrink-0 text-neutral-600">訂單編號</span>
                <span class="text-neutral-900">
                  {{ order.voucherId || order.id }}
                </span>
              </div>
              <div
                v-if="totalAmount != null"
                class="
                  flex items-center justify-between border-t border-neutral-100
                  pt-3
                "
              >
                <span class="text-sm text-neutral-600">訂單金額</span>
                <span class="text-base font-bold text-primary-300">
                  NT$ {{ totalAmount.toLocaleString() }}
                </span>
              </div>
            </div>
          </div>

          <!-- 關閉按鈕 -->
          <button
            type="button"
            class="
              flex size-10 items-center justify-center rounded-full bg-white
              shadow-down-100
            "
            aria-label="關閉憑證"
            @click="closeVoucher"
          >
            <Icon
              name="lucide:x"
              class="text-base text-neutral-900"
            />
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
