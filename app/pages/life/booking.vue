<script lang="ts" setup>
import type { KlookOrder, Location, PlatformType, TripOrder } from '~/types/booking'

definePageMeta({
  layout: 'life',
  title: '立即預約',
})

const router = useRouter()
const route = useRoute()
const lineStore = useLineStore()
const bookingStore = useBookingStore()
const locationsStore = useLocationsStore()
const { validateBookingDate, validateTime } = useValidation()
const { queryPlatformOrder } = useQRCode()

// 平台訂單資訊
const platformType = ref<PlatformType | null>(null)
const platformOrderId = ref<string | null>(null)
const platformOrderIdentifier = ref<string | null>(null)
const platformOrder = ref<TripOrder | KlookOrder | null>(null)
const isLoadingPlatformOrder = ref(false)

// Form data
const bookingDate = ref('')
const pickupTime = ref('')
const luggageCount = ref(1)
const pickupLocation = ref<Location | null>(null)
const deliveryLocation = ref<Location | null>(null)
const specialNote = ref('')

const isSubmitting = ref(false)
const formError = ref('')

// 載入配送地點與平台訂單
onMounted(async () => {
  await locationsStore.fetchLocations()

  // 檢查是否有平台訂單參數
  const queryPlatform = route.query.platform as string | undefined
  const queryOrderId = route.query.orderId as string | undefined
  const queryOrderIdentifier = route.query.orderIdentifier as string | undefined

  if (queryPlatform && queryOrderId && queryOrderIdentifier) {
    platformType.value = queryPlatform as PlatformType
    platformOrderId.value = queryOrderId
    platformOrderIdentifier.value = queryOrderIdentifier

    // 載入平台訂單詳情
    try {
      isLoadingPlatformOrder.value = true
      platformOrder.value = await queryPlatformOrder(
        queryPlatform as 'trip' | 'klook',
        queryOrderIdentifier,
      )

      // 自動填入出發日期
      if (platformOrder.value) {
        bookingDate.value = platformOrder.value.departureDate
      }
    }
    catch (err) {
      formError.value = err instanceof Error ? err.message : '載入平台訂單失敗'
    }
    finally {
      isLoadingPlatformOrder.value = false
    }
  }
})

// 設定最小日期為今天
const today = computed(() => {
  const date = new Date()
  return date.toISOString().split('T')[0]
})

// 行李件數控制
function increaseLuggage() {
  if (luggageCount.value < 10) {
    luggageCount.value++
  }
}

function decreaseLuggage() {
  if (luggageCount.value > 1) {
    luggageCount.value--
  }
}

async function submitBooking() {
  // 重置錯誤
  formError.value = ''

  // 驗證必填欄位
  if (!bookingDate.value) {
    formError.value = '請選擇寄送日期'
    return
  }

  if (!pickupTime.value) {
    formError.value = '請選擇寄送時間'
    return
  }

  if (!pickupLocation.value) {
    formError.value = '請選擇起始點'
    return
  }

  if (!deliveryLocation.value) {
    formError.value = '請選擇送達點'
    return
  }

  // 驗證日期
  if (!validateBookingDate(bookingDate.value)) {
    formError.value = '日期不可早於今天'
    return
  }

  // 驗證時間
  if (!validateTime(pickupTime.value)) {
    formError.value = '時間格式不正確'
    return
  }

  // 驗證起始點和送達點不同
  if (pickupLocation.value.id === deliveryLocation.value.id) {
    formError.value = '起始點和送達點不可相同'
    return
  }

  try {
    isSubmitting.value = true

    const newOrder = await bookingStore.createOrder({
      userId: lineStore.userId!,
      userName: lineStore.displayName,
      bookingDate: bookingDate.value,
      pickupTime: pickupTime.value,
      luggageCount: luggageCount.value,
      pickupLocation: pickupLocation.value,
      deliveryLocation: deliveryLocation.value,
      specialNote: specialNote.value || undefined,
      // 平台訂單資訊
      platformType: platformType.value || undefined,
      platformOrderId: platformOrderId.value || undefined,
      // 平台訂單的聯絡電話（優先使用平台訂單的電話）
      platformPhone: platformOrder.value?.contacts?.phone || undefined,
    })

    // 導向訂單詳細頁
    router.push(`/life/my-bookings/${newOrder.id}`)
  }
  catch (err) {
    formError.value = err instanceof Error ? err.message : '建立訂單失敗,請稍後再試'
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form
    class="space-y-4"
    @submit.prevent="submitBooking"
  >
    <!-- 載入平台訂單中 -->
    <div
      v-if="isLoadingPlatformOrder"
      class="rounded-lg bg-blue-50 p-4 text-sm text-blue-600"
    >
      載入平台訂單資訊中...
    </div>

    <!-- 平台訂單資訊卡片 -->
    <div
      v-if="platformOrder && platformType"
      class="rounded-lg bg-green-50 p-4"
    >
      <h3 class="mb-2 font-semibold text-green-800">
        {{ platformType === 'trip' ? 'Trip.com' : 'Klook' }} 訂單資訊
      </h3>
      <div class="space-y-1 text-sm text-green-700">
        <p v-if="platformType === 'trip' && 'orderNumber' in platformOrder">
          <span class="font-medium">訂單編號:</span> {{ platformOrder.orderNumber }}
        </p>
        <p v-if="platformType === 'klook' && 'resellerReference' in platformOrder">
          <span class="font-medium">訂單編號:</span> {{ platformOrder.resellerReference }}
        </p>
        <p>
          <span class="font-medium">出發日期:</span> {{ platformOrder.departureDate }}
        </p>
        <p>
          <span class="font-medium">數量:</span> {{ platformOrder.quantity }}
        </p>
        <p v-if="platformOrder.contacts">
          <span class="font-medium">聯絡人:</span> {{ platformOrder.contacts.name }} / {{ platformOrder.contacts.phone }}
        </p>
        <p v-if="platformType === 'trip' && 'vouchers' in platformOrder && platformOrder.vouchers">
          <span class="font-medium">憑證:</span> {{ platformOrder.vouchers }}
        </p>
      </div>
    </div>

    <!-- 錯誤提示 -->
    <div
      v-if="formError"
      class="rounded-lg bg-red-50 p-4 text-sm text-red-600"
    >
      {{ formError }}
    </div>

    <!-- 預約日期 -->
    <div>
      <label class="mb-2 block text-sm font-medium text-gray-700">
        預約日期
        <span class="text-red-500">*</span>
      </label>
      <input
        v-model="bookingDate"
        type="date"
        :min="today"
        required
        class="
          w-[90%] rounded-lg border border-gray-300 bg-white px-4 py-2
          text-gray-800
          focus:border-blue-500 focus:ring-2 focus:ring-blue-500
          focus:outline-none
        "
      >
    </div>

    <!-- 預計寄送時間 -->
    <div>
      <label class="mb-2 block text-sm font-medium text-gray-700">
        預計寄送時間
        <span class="text-red-500">*</span>
      </label>
      <input
        v-model="pickupTime"
        type="time"
        required
        class="
          w-[90%] rounded-lg border border-gray-300 bg-white px-4 py-2
          text-gray-800
          focus:border-blue-500 focus:ring-2 focus:ring-blue-500
          focus:outline-none
        "
      >
    </div>

    <!-- 行李件數 -->
    <div>
      <label class="mb-2 block text-sm font-medium text-gray-700">
        行李件數
        <span class="text-red-500">*</span>
      </label>
      <div class="flex items-center gap-4">
        <button
          type="button"
          :disabled="luggageCount <= 1"
          class="
            flex size-10 items-center justify-center rounded-lg bg-gray-200
            text-xl font-bold text-gray-700
            hover:bg-gray-300
            disabled:cursor-not-allowed disabled:opacity-50
          "
          @click="decreaseLuggage"
        >
          −
        </button>
        <span class="min-w-12 text-center text-2xl font-semibold text-gray-800">
          {{ luggageCount }}
        </span>
        <button
          type="button"
          :disabled="luggageCount >= 10"
          class="
            flex size-10 items-center justify-center rounded-lg bg-gray-200
            text-xl font-bold text-gray-700
            hover:bg-gray-300
            disabled:cursor-not-allowed disabled:opacity-50
          "
          @click="increaseLuggage"
        >
          +
        </button>
      </div>
    </div>

    <!-- 起始點 -->
    <LifeLocationSelector
      v-model="pickupLocation"
      label="起始點"
      :exclude-id="deliveryLocation?.id"
      :required="true"
    />

    <!-- 送達點 -->
    <LifeLocationSelector
      v-model="deliveryLocation"
      label="送達點"
      :exclude-id="pickupLocation?.id"
      :required="true"
    />

    <!-- 特殊備註 -->
    <div>
      <label class="mb-2 block text-sm font-medium text-gray-700">
        特殊備註
      </label>
      <textarea
        v-model="specialNote"
        rows="3"
        placeholder="例如：行李尺寸、易碎物品等..."
        class="
          w-full rounded-lg border border-gray-300 bg-white px-4 py-2
          text-gray-800
          focus:border-blue-500 focus:ring-2 focus:ring-blue-500
          focus:outline-none
        "
      ></textarea>
    </div>

    <!-- 提交按鈕 -->
    <button
      type="submit"
      :disabled="isSubmitting"
      class="
        w-full rounded-lg bg-green-500 px-4 py-3 font-semibold text-white shadow
        transition-colors
        hover:bg-green-600
        disabled:cursor-not-allowed disabled:opacity-50
      "
    >
      {{ isSubmitting ? '處理中...' : '確認預約' }}
    </button>
  </form>
</template>
