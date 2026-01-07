<script lang="ts" setup>
definePageMeta({
  layout: 'life',
  title: '訂單詳情',
})

const route = useRoute()
const bookingStore = useBookingStore()
const { getOrderById } = storeToRefs(bookingStore)

const orderId = route.params.id as string
const order = computed(() => getOrderById.value(orderId))

const showCancelConfirm = ref(false)
const isCancelling = ref(false)
const cancelError = ref('')

async function cancelOrder() {
  if (!order.value)
    return

  try {
    isCancelling.value = true
    cancelError.value = ''
    await bookingStore.cancelOrder(order.value.id)
    showCancelConfirm.value = false
  }
  catch (err) {
    cancelError.value = err instanceof Error ? err.message : '取消訂單失敗'
  }
  finally {
    isCancelling.value = false
  }
}

function formatDateTime(dateString: string, timeString: string) {
  const date = new Date(dateString)
  const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()]
  return `${dateString} (${dayOfWeek}) ${timeString}`
}
</script>

<template>
  <!-- 訂單不存在 -->
  <div
    v-if="!order"
    class="rounded-lg bg-white p-8 text-center shadow"
  >
    <div class="text-gray-400">
      <div class="mb-2 text-5xl">
        ❌
      </div>
      <p class="mb-4 text-gray-600">
        找不到此訂單
      </p>
      <NuxtLink
        to="/life/my-bookings"
        class="
          inline-block rounded-lg bg-purple-500 px-6 py-2 text-white
          hover:bg-purple-600
        "
      >
        返回訂單列表
      </NuxtLink>
    </div>
  </div>

  <!-- 訂單詳情 -->
  <div
    v-else
    class="space-y-4"
  >
    <!-- 狀態卡片 -->
    <div class="rounded-lg bg-white p-6 shadow">
      <div class="mb-2 flex items-center justify-between">
        <span class="font-mono text-sm text-gray-500">
          #{{ order.id.substring(0, 8) }}
        </span>
        <LifeStatusBadge :status="order.status" />
      </div>
      <p class="text-sm text-gray-600">
        建立時間: {{ new Date(order.createdAt).toLocaleString('zh-TW') }}
      </p>
    </div>

    <!-- 預約資訊 -->
    <div class="rounded-lg bg-white p-6 shadow">
      <h2 class="mb-4 font-semibold text-gray-800">
        預約資訊
      </h2>
      <div class="space-y-3 text-sm">
        <div>
          <div class="mb-1 text-gray-500">
            預約時間
          </div>
          <div class="font-medium text-gray-800">
            {{ formatDateTime(order.bookingDate, order.pickupTime) }}
          </div>
        </div>

        <div>
          <div class="mb-1 text-gray-500">
            行李件數
          </div>
          <div class="font-medium text-gray-800">
            {{ order.luggageCount }} 件
          </div>
        </div>

        <div>
          <div class="mb-1 text-gray-500">
            起始點
          </div>
          <div class="font-medium text-gray-800">
            {{ order.pickupLocation.name }}
          </div>
          <div class="text-gray-600">
            {{ order.pickupLocation.address }}
          </div>
        </div>

        <div>
          <div class="mb-1 text-gray-500">
            送達點
          </div>
          <div class="font-medium text-gray-800">
            {{ order.deliveryLocation.name }}
          </div>
          <div class="text-gray-600">
            {{ order.deliveryLocation.address }}
          </div>
        </div>

        <div v-if="order.specialNote">
          <div class="mb-1 text-gray-500">
            特殊備註
          </div>
          <div class="text-gray-800">
            {{ order.specialNote }}
          </div>
        </div>
      </div>
    </div>

    <!-- QR Code -->
    <LifeQRCodeDisplay
      v-if="order.qrCode"
      :qr-code="order.qrCode"
      :order-id="order.id"
    />

    <!-- 操作按鈕 -->
    <div class="space-y-3">
      <button
        v-if="order.status === 'pending'"
        type="button"
        class="
          w-full rounded-lg bg-red-500 px-4 py-3 font-semibold text-white shadow
          transition-colors
          hover:bg-red-600
        "
        @click="showCancelConfirm = true"
      >
        取消訂單
      </button>

      <NuxtLink
        to="/life/my-bookings"
        class="
          block w-full rounded-lg bg-gray-500 px-4 py-3 text-center
          font-semibold text-white shadow transition-colors
          hover:bg-gray-600
        "
      >
        返回列表
      </NuxtLink>
    </div>

    <!-- 取消確認對話框 -->
    <div
      v-if="showCancelConfirm"
      class="
        fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4
      "
      @click.self="showCancelConfirm = false"
    >
      <div class="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h3 class="mb-4 text-lg font-semibold text-gray-800">
          確認取消訂單
        </h3>
        <p class="mb-4 text-gray-600">
          確定要取消此訂單嗎？此操作無法復原。
        </p>

        <!-- 錯誤訊息 -->
        <div
          v-if="cancelError"
          class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600"
        >
          {{ cancelError }}
        </div>

        <div class="flex gap-3">
          <button
            type="button"
            class="
              flex-1 rounded-lg bg-gray-200 px-4 py-2 font-semibold
              text-gray-800
              hover:bg-gray-300
            "
            :disabled="isCancelling"
            @click="showCancelConfirm = false"
          >
            不，返回
          </button>
          <button
            type="button"
            class="
              flex-1 rounded-lg bg-red-500 px-4 py-2 font-semibold text-white
              hover:bg-red-600
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
  </div>
</template>
