<script lang="ts" setup>
definePageMeta({
  layout: 'booking-flow',
})

const router = useRouter()
const lineStore = useLineStore()
const bookingFormStore = useBookingFormStore()
const locationsStore = useLocationsStore()
const profileStore = useProfileStore()

const { locations } = storeToRefs(locationsStore)

const formError = ref('')
const showTermsModal = ref(false)
const showPriceSummary = ref(false)
const hasScrolledToBottom = ref(false)
const mainRef = ref<HTMLElement | null>(null)

function onMainScroll() {
  if (!mainRef.value)
    return
  const { scrollTop, scrollHeight, clientHeight } = mainRef.value
  if (scrollTop + clientHeight >= scrollHeight - 10)
    hasScrolledToBottom.value = true
}

// 表單是否填寫完整
const isFormValid = computed(() => {
  return (
    hasScrolledToBottom.value
    && bookingFormStore.agreeToTerms
    && bookingFormStore.pickupLocation !== null
    && bookingFormStore.deliveryLocation !== null
    && bookingFormStore.bookingDate !== ''
    && (bookingFormStore.serviceType !== 'round_trip' || bookingFormStore.returnDate !== '')
    && bookingFormStore.recipientName !== ''
    && bookingFormStore.recipientPhone !== ''
  )
})

onMounted(async () => {
  await Promise.all([
    locationsStore.fetchLocations(),
    profileStore.initProfile(),
  ])

  // 自動選取寄件地點為門市（你行李來）
  if (!bookingFormStore.pickupLocation) {
    const storeLocation = locations.value.find(l => l.name.includes('你行李來'))
      ?? locations.value[0]
      ?? null
    bookingFormStore.pickupLocation = storeLocation
  }

  // 自動填入聯絡人資訊
  if (!bookingFormStore.recipientName) {
    const platformContact = bookingFormStore.platformOrder?.contacts?.name
    bookingFormStore.recipientName = platformContact || lineStore.displayName || ''
  }
  if (!bookingFormStore.recipientPhone) {
    const platformPhone = bookingFormStore.platformOrder?.contacts?.phone
    bookingFormStore.recipientPhone = platformPhone || profileStore.phoneNumber || ''
  }

  // 自動填入出發日期
  if (!bookingFormStore.bookingDate && bookingFormStore.platformOrder?.departureDate) {
    bookingFormStore.bookingDate = bookingFormStore.platformOrder.departureDate
  }
})

function goToPayment() {
  formError.value = ''

  if (!bookingFormStore.pickupLocation) {
    formError.value = '請選擇寄件地點'
    return
  }
  if (!bookingFormStore.deliveryLocation) {
    formError.value = '請選擇送達地點'
    return
  }
  if (bookingFormStore.pickupLocation.id === bookingFormStore.deliveryLocation.id) {
    formError.value = '寄件地點和送達地點不可相同'
    return
  }
  if (!bookingFormStore.bookingDate) {
    formError.value = '請選擇寄件日期'
    return
  }
  if (!bookingFormStore.recipientName) {
    formError.value = '請填寫領件人姓名'
    return
  }
  if (!bookingFormStore.recipientPhone) {
    formError.value = '請填寫聯絡電話'
    return
  }
  if (!bookingFormStore.agreeToTerms) {
    formError.value = '請閱讀並同意預約須知'
    return
  }

  router.push('/life/booking-payment')
}
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Main Content -->
    <main
      ref="mainRef"
      class="flex-1 overflow-y-auto px-4 py-6"
      @scroll="onMainScroll"
    >
      <div class="flex flex-col gap-4">
        <!-- 錯誤訊息 -->
        <div
          v-if="formError"
          class="rounded-sm bg-danger-100 p-3 text-sm text-danger-300"
        >
          {{ formError }}
        </div>

        <LifeServicePlanSelector />

        <LifeLuggageCountPicker />

        <LifeRouteSelector />

        <LifeBookingDatePicker />

        <LifeRecipientForm />

        <LifeBookingNotesField />

        <!-- 同意條款 -->
        <div class="flex items-start gap-2 px-1">
          <input
            id="agree-terms"
            v-model="bookingFormStore.agreeToTerms"
            type="checkbox"
            class="
              mt-0.5 size-[18px] rounded-[4px] border border-neutral-300
              accent-primary-300
            "
          >
          <label
            for="agree-terms"
            class="text-base text-neutral-900"
          >
            我已閱讀並同意
            <button
              class="text-[#1c60cc] underline"
              @click.prevent="showTermsModal = true"
            >
              預約須知
            </button>
          </label>
        </div>
      </div>
    </main>

    <!-- Bottom Navigation -->
    <footer
      class="
        relative shrink-0 rounded-t-lg border border-white backdrop-blur-md
      "
      style="background: linear-gradient(10deg, rgb(255,255,255) 0%, rgba(255,255,255,0.5) 100%); box-shadow: 0px -4px 20px 0px rgba(32,78,184,0.12); padding-bottom: calc(-10px + env(safe-area-inset-bottom));"
    >
      <!-- 未展開時的全區點擊攔截層 -->
      <div
        v-if="!showPriceSummary"
        class="absolute inset-0 z-10"
        @click="showPriceSummary = true"
      ></div>
      <div class="flex items-center justify-between px-5 py-3">
        <!-- 總計 -->
        <button
          class="flex items-center gap-1"
          @click="showPriceSummary = !showPriceSummary"
        >
          <span class="text-base text-neutral-600">總計</span>
          <span class="text-lg font-bold text-neutral-900">NT$ {{ bookingFormStore.totalPrice }}</span>
          <Icon
            :name="showPriceSummary ? 'lucide:chevron-down' : 'lucide:chevron-up'"
            class="text-xl text-neutral-900"
          />
        </button>
        <!-- 選擇付款方式 -->
        <button
          class="rounded-sm px-5 py-3 text-base font-medium transition-colors"
          :class="isFormValid
            ? 'bg-primary-300 text-white'
            : 'bg-neutral-200 text-neutral-500'"
          :disabled="!isFormValid"
          @click="goToPayment"
        >
          選擇付款方式
        </button>
      </div>
    </footer>

    <LifePriceSummarySheet
      :open="showPriceSummary"
      :is-form-valid="isFormValid"
      @close="showPriceSummary = false"
      @submit="goToPayment"
    />

    <LifeBookingTermsModal
      :open="showTermsModal"
      @close="showTermsModal = false"
    />
  </div>
</template>
