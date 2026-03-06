<script lang="ts" setup>
definePageMeta({
  layout: 'booking-flow',
})

const router = useRouter()
const lineStore = useLineStore()
const bookingFormStore = useBookingFormStore()
const bookingStore = useBookingStore()

const isSubmitting = ref(false)
const submitError = ref('')
const showConfirmModal = ref(false)

const paymentOptions = [
  { id: 'line_pay' as const, label: 'LINE Pay', icon: 'simple-icons:line' },
  { id: 'credit_card' as const, label: '信用卡', icon: 'carbon:wallet' },
  { id: 'apple_pay' as const, label: 'Apple Pay', icon: 'ic:baseline-apple' },
]

// 格式化日期
function formatDate(date: string) {
  if (!date)
    return ''
  const [, m, d] = date.split('-')
  return `${Number(m)}/${Number(d)}`
}

// 確認送出訂單
async function confirmSubmit() {
  if (!bookingFormStore.pickupLocation || !bookingFormStore.deliveryLocation) {
    submitError.value = '請先填寫預約資料'
    showConfirmModal.value = false
    return
  }

  try {
    isSubmitting.value = true
    submitError.value = ''

    const newOrder = await bookingStore.createOrder({
      userId: lineStore.userId!,
      userName: bookingFormStore.recipientName || lineStore.displayName,
      bookingDate: bookingFormStore.bookingDate,
      pickupTime: '12:00',
      luggageCount: bookingFormStore.luggageCount,
      pickupLocation: bookingFormStore.pickupLocation,
      deliveryLocation: bookingFormStore.deliveryLocation,
      specialNote: bookingFormStore.notes || undefined,
      platformType: bookingFormStore.platformType || undefined,
      platformOrderId: bookingFormStore.platformOrderId || undefined,
      platformPhone: bookingFormStore.recipientPhone || undefined,
    })

    bookingFormStore.setCreatedOrder(newOrder.id, newOrder.voucherId)
    showConfirmModal.value = false
    router.push('/life/booking-complete')
  }
  catch (err) {
    submitError.value = err instanceof Error ? err.message : '建立訂單失敗，請稍後再試'
    showConfirmModal.value = false
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Header -->
    <header
      class="shrink-0 rounded-b-sm"
      style="background: linear-gradient(16deg, rgb(255,255,255) 0%, rgba(255,255,255,0.5) 100%);"
    >
      <!-- Nav bar -->
      <div class="flex items-center justify-center p-1">
        <button
          class="flex items-center justify-center p-2"
          @click="router.back()"
        >
          <Icon
            name="carbon:chevron-left"
            class="text-2xl text-neutral-900"
          />
        </button>
        <div class="flex flex-1 items-center justify-center">
          <span class="text-lg font-bold tracking-wide text-neutral-900">你行李來</span>
        </div>
        <button
          class="flex items-center justify-center p-2"
          @click="router.push('/life')"
        >
          <Icon
            name="carbon:close"
            class="text-2xl text-neutral-900"
          />
        </button>
      </div>

      <!-- Stepper（step 2 active） -->
      <div class="flex items-center border-b border-white py-4">
        <!-- Step 1: 填寫資料（completed） -->
        <div class="flex flex-1 flex-col items-center gap-1">
          <div class="flex w-full items-center">
            <div class="h-0.5 flex-1"></div>
            <div
              class="
                flex size-8 items-center justify-center rounded-full
                bg-primary-300
              "
            >
              <span class="text-xs font-medium text-white">1</span>
            </div>
            <div class="h-0.5 flex-1 bg-primary-300"></div>
          </div>
          <span class="text-sm font-bold text-primary-300">填寫資料</span>
        </div>
        <!-- Step 2: 選擇付款方式（active） -->
        <div class="flex flex-1 flex-col items-center gap-1">
          <div class="flex w-full items-center">
            <div class="h-0.5 flex-1 bg-primary-300"></div>
            <div
              class="
                flex size-8 items-center justify-center rounded-full
                bg-primary-300
              "
            >
              <span class="text-xs font-medium text-white">2</span>
            </div>
            <div class="h-0.5 flex-1 bg-neutral-200"></div>
          </div>
          <span class="text-sm font-bold text-primary-300">選擇付款方式</span>
        </div>
        <!-- Step 3: 完成預約 -->
        <div class="flex flex-1 flex-col items-center gap-1">
          <div class="flex w-full items-center">
            <div class="h-0.5 flex-1 bg-neutral-200"></div>
            <div
              class="
                flex size-8 items-center justify-center rounded-full
                bg-neutral-200
              "
            >
              <span class="text-xs font-medium text-neutral-600">3</span>
            </div>
            <div class="h-0.5 flex-1"></div>
          </div>
          <span class="text-sm font-bold text-neutral-600">完成預約</span>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto px-4 py-6">
      <div class="flex flex-col gap-4">
        <!-- 錯誤訊息 -->
        <div
          v-if="submitError"
          class="rounded-sm bg-danger-100 p-3 text-sm text-danger-300"
        >
          {{ submitError }}
        </div>

        <!-- 訂單摘要 -->
        <div
          class="
            rounded-sm bg-white p-4
            shadow-[0px_4px_32px_0px_rgba(32,78,184,0.08)]
          "
        >
          <div class="mb-4 flex items-center gap-2">
            <div
              class="w-1 self-stretch rounded-xs"
              style="background: linear-gradient(101deg, #4090E8 16%, #306CF7 62%);"
            ></div>
            <span class="text-base font-bold text-neutral-900">訂單摘要</span>
          </div>

          <!-- 路線 -->
          <div class="mb-4 flex flex-col gap-2">
            <div class="flex items-center gap-2 rounded-sm bg-primary-100 p-3">
              <div
                class="
                  flex size-9 items-center justify-center rounded-full
                  bg-[#e4effb] p-2
                "
              >
                <Icon
                  name="carbon:send"
                  class="text-xl text-primary-300"
                />
              </div>
              <span class="text-base font-medium text-neutral-900">{{ bookingFormStore.pickupLocation?.name || '—' }}</span>
            </div>
            <div class="flex justify-center">
              <Icon
                name="carbon:arrows-vertical"
                class="text-2xl text-neutral-600"
              />
            </div>
            <div class="flex items-center gap-2 rounded-sm bg-primary-100 p-3">
              <div
                class="
                  flex size-9 items-center justify-center rounded-full
                  bg-[#e4effb] p-2
                "
              >
                <Icon
                  name="carbon:location"
                  class="text-xl text-primary-300"
                />
              </div>
              <span class="flex-1 text-base font-medium text-neutral-900">{{ bookingFormStore.deliveryLocation?.name || '—' }}</span>
            </div>
          </div>

          <!-- 明細列表 -->
          <div class="mb-4 flex flex-col gap-1">
            <div class="flex items-center justify-between text-base">
              <span class="text-neutral-600">服務方案</span>
              <span class="text-neutral-900">{{ bookingFormStore.serviceType === 'round_trip' ? '雙程套票' : '單程運送' }}</span>
            </div>
            <div class="flex items-center justify-between text-base">
              <span class="text-neutral-600">單價</span>
              <span class="text-neutral-900">NT$ {{ bookingFormStore.unitPrice }}</span>
            </div>
            <div class="flex items-center justify-between text-base">
              <span class="text-neutral-600">行李數量</span>
              <span class="text-neutral-900">{{ bookingFormStore.luggageCount }} 件</span>
            </div>
            <div class="flex items-center justify-between text-base">
              <span class="text-neutral-600">寄件日期</span>
              <span class="text-neutral-900">{{ formatDate(bookingFormStore.bookingDate) }}</span>
            </div>
          </div>

          <!-- 分隔線 -->
          <div class="mb-3 h-px bg-neutral-200"></div>

          <!-- 總計 -->
          <div class="flex items-center justify-between text-base">
            <span class="text-neutral-600">總計</span>
            <span class="text-base font-bold text-primary-300">NT$ {{ bookingFormStore.totalPrice }}</span>
          </div>
        </div>

        <!-- 選擇付款方式 -->
        <div
          class="
            rounded-sm bg-white p-4
            shadow-[0px_4px_32px_0px_rgba(32,78,184,0.08)]
          "
        >
          <div class="mb-4 flex items-center gap-2">
            <div
              class="w-1 self-stretch rounded-xs"
              style="background: linear-gradient(101deg, #4090E8 16%, #306CF7 62%);"
            ></div>
            <span class="text-base font-bold text-neutral-900">選擇付款方式</span>
          </div>

          <div class="flex flex-col gap-3">
            <label
              v-for="option in paymentOptions"
              :key="option.id"
              class="
                flex cursor-pointer items-center gap-3 rounded-sm border p-4
                transition-colors
              "
              :class="bookingFormStore.paymentMethod === option.id
                ? 'border-[#4090e8]'
                : 'border-neutral-200'"
            >
              <!-- Radio -->
              <div
                class="
                  flex size-5 items-center justify-center rounded-full border-2
                  transition-colors
                "
                :class="bookingFormStore.paymentMethod === option.id
                  ? 'border-primary-300'
                  : 'border-neutral-300'"
              >
                <div
                  v-if="bookingFormStore.paymentMethod === option.id"
                  class="size-2.5 rounded-full bg-primary-300"
                ></div>
              </div>
              <input
                v-model="bookingFormStore.paymentMethod"
                type="radio"
                :value="option.id"
                class="sr-only"
              >
              <span class="flex-1 text-base font-medium text-neutral-900">{{ option.label }}</span>
              <Icon
                :name="option.icon"
                class="text-2xl text-neutral-600"
              />
            </label>
          </div>
        </div>
      </div>
    </main>

    <!-- Bottom Navigation -->
    <footer
      class="shrink-0 rounded-t-lg border border-white backdrop-blur-md"
      style="background: linear-gradient(10deg, rgb(255,255,255) 0%, rgba(255,255,255,0.5) 100%); box-shadow: 0px -6px 12px 0px rgba(33,37,41,0.08);"
    >
      <div class="flex gap-2 px-5 py-3">
        <button
          class="
            flex flex-1 items-center justify-center rounded-sm border
            border-neutral-200 bg-white px-5 py-3
          "
          @click="router.back()"
        >
          <span class="text-base font-medium text-neutral-900">修改預約資訊</span>
        </button>
        <button
          class="
            flex flex-1 items-center justify-center rounded-sm bg-primary-300
            px-5 py-3
            disabled:opacity-50
          "
          :disabled="isSubmitting"
          @click="showConfirmModal = true"
        >
          <span class="text-base font-medium text-white">
            {{ isSubmitting ? '處理中...' : '立即付款' }}
          </span>
        </button>
      </div>
      <!-- Home Indicator -->
      <div class="flex items-center justify-center px-2 pt-5 pb-2">
        <div class="h-[5px] w-[134px] rounded-full bg-black"></div>
      </div>
    </footer>

    <!-- 送出訂單確認 Modal -->
    <div
      v-if="showConfirmModal"
      class="
        absolute inset-0 flex items-center justify-center bg-neutral-900/50 px-4
        backdrop-blur-sm
      "
    >
      <div
        class="
          w-full rounded-sm border border-neutral-200 bg-white p-5
          shadow-[0px_4px_12px_0px_rgba(32,78,184,0.04)]
        "
      >
        <h3 class="mb-3 text-xl font-bold text-neutral-900">
          送出訂單
        </h3>
        <div class="mb-4 h-px bg-neutral-200"></div>
        <div class="mb-4 flex flex-col gap-1 text-base">
          <p class="text-danger-300">
            訂單送出後無法自行修改！
          </p>
          <p class="text-neutral-900">
            如需改期/更換民宿，請於「使用日前一天 18:00 前」聯繫客服協助。
          </p>
        </div>
        <div class="flex gap-2">
          <button
            class="
              flex flex-1 items-center justify-center rounded-sm border
              border-neutral-200 bg-white px-5 py-3
            "
            :disabled="isSubmitting"
            @click="showConfirmModal = false"
          >
            <span class="text-base font-medium text-neutral-900">修改預約資訊</span>
          </button>
          <button
            class="
              flex flex-1 items-center justify-center rounded-sm bg-primary-300
              px-5 py-3
              disabled:opacity-50
            "
            :disabled="isSubmitting"
            @click="confirmSubmit"
          >
            <span class="text-base font-medium text-white">
              {{ isSubmitting ? '處理中...' : '確認送出' }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
