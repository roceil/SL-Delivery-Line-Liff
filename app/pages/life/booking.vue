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

const servicePlans = [
  {
    id: 'round_trip' as const,
    label: '雙程套票',
    subtitle: '去程 + 回程',
    price: 250,
    badge: '推薦',
    icon: 'lucide:arrow-left-right',
  },
  {
    id: 'one_way' as const,
    label: '單程運送',
    subtitle: '碼頭 → 民宿\n或民宿 → 碼頭',
    price: 130,
    badge: null,
    icon: 'lucide:arrow-right',
  },
]

// 可選地點（排除已選的另一端）
const pickupOptions = computed(() =>
  locations.value.filter(loc => loc.id !== bookingFormStore.deliveryLocation?.id),
)
const deliveryOptions = computed(() =>
  locations.value.filter(loc => loc.id !== bookingFormStore.pickupLocation?.id),
)

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

function selectPickupLocation(event: Event) {
  const id = Number((event.target as HTMLSelectElement).value)
  bookingFormStore.pickupLocation = locations.value.find(l => l.id === id) ?? null
}

function selectDeliveryLocation(event: Event) {
  const id = Number((event.target as HTMLSelectElement).value)
  bookingFormStore.deliveryLocation = locations.value.find(l => l.id === id) ?? null
}

function swapLocations() {
  const tmp = bookingFormStore.pickupLocation
  bookingFormStore.pickupLocation = bookingFormStore.deliveryLocation
  bookingFormStore.deliveryLocation = tmp
}

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

const today = computed(() => new Date().toISOString().split('T')[0])
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

        <!-- 選擇服務方案 -->
        <div
          class="
            rounded-sm bg-white p-4
            shadow-[0px_4px_32px_0px_rgba(32,78,184,0.08)]
          "
        >
          <div class="mb-5 flex items-center gap-2">
            <div
              class="w-1 self-stretch rounded-xs"
              style="background: linear-gradient(101deg, #4090E8 16%, #306CF7 62%);"
            ></div>
            <span class="text-base font-bold text-neutral-900">選擇服務方案</span>
          </div>
          <div class="flex gap-3">
            <button
              v-for="plan in servicePlans"
              :key="plan.id"
              class="
                relative flex flex-1 flex-col gap-3 rounded-sm border p-4
                text-left transition-colors
              "
              :class="bookingFormStore.serviceType === plan.id
                ? 'border-[#4090e8]'
                : 'border-neutral-200'"
              @click="bookingFormStore.serviceType = plan.id"
            >
              <!-- 推薦 badge -->
              <div
                v-if="plan.badge"
                class="
                  absolute top-2 right-3 flex items-center justify-center
                  rounded-full bg-success-100 px-2 py-0.5
                "
              >
                <span
                  class="
                    text-[11px] font-medium whitespace-nowrap text-success-300
                  "
                >{{ plan.badge }}</span>
              </div>
              <!-- Icon -->
              <div
                class="flex size-8 items-center justify-center rounded-full p-2"
                :class="bookingFormStore.serviceType === plan.id ? `
                  bg-primary-200
                ` : `bg-neutral-200`"
              >
                <Icon
                  :name="plan.icon"
                  class="text-base"
                  :class="bookingFormStore.serviceType === plan.id ? `
                    text-primary-300
                  ` : `text-neutral-600`"
                />
              </div>
              <!-- Labels -->
              <div class="flex flex-col gap-0.5">
                <span class="text-base font-bold text-neutral-900">{{ plan.label }}</span>
                <span
                  class="
                    min-h-[45.5px] text-sm leading-relaxed whitespace-pre-line
                    text-neutral-600
                  "
                >{{ plan.subtitle }}</span>
              </div>
              <!-- Price -->
              <span
                class="text-sm font-bold"
                :class="bookingFormStore.serviceType === plan.id ? `
                  text-primary-300
                ` : `text-neutral-900`"
              >
                NT$ {{ plan.price }} / 件
              </span>
            </button>
          </div>
        </div>

        <!-- 行李數量 -->
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
            <span class="text-base font-bold text-neutral-900">行李數量</span>
          </div>
          <div
            class="
              flex h-10 items-center gap-3 rounded-[6px] bg-neutral-100 px-3
              py-2
            "
          >
            <button
              class="flex size-8 items-center justify-center rounded-[6px] p-2"
              :disabled="bookingFormStore.luggageCount <= 1"
              @click="bookingFormStore.luggageCount > 1 && bookingFormStore.luggageCount--"
            >
              <Icon
                name="lucide:minus"
                class="text-xl text-neutral-900"
              />
            </button>
            <span class="flex-1 text-center text-sm text-neutral-900">{{ bookingFormStore.luggageCount }}</span>
            <button
              class="flex size-8 items-center justify-center rounded-[6px] p-2"
              :disabled="bookingFormStore.luggageCount >= 10"
              @click="bookingFormStore.luggageCount < 10 && bookingFormStore.luggageCount++"
            >
              <Icon
                name="lucide:plus"
                class="text-xl text-neutral-900"
              />
            </button>
          </div>
        </div>

        <!-- 設定路線 -->
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
            <span class="text-base font-bold text-neutral-900">設定路線</span>
          </div>

          <!-- 寄件地點 -->
          <div class="mb-4 flex flex-col gap-1">
            <span class="text-sm font-medium text-neutral-600">寄件地點</span>
            <div class="relative">
              <select
                class="
                  w-full appearance-none rounded-[6px] border border-neutral-200
                  bg-white px-3 py-2 pr-8 text-base
                  focus:ring-1 focus:ring-primary-300 focus:outline-none
                "
                :class="bookingFormStore.pickupLocation ? 'text-neutral-900' : `
                  text-neutral-500
                `"
                :value="bookingFormStore.pickupLocation?.id ?? ''"
                @change="selectPickupLocation"
              >
                <option
                  value=""
                  disabled
                >
                  你行李來（小琉球碼頭門市）
                </option>
                <option
                  v-for="loc in pickupOptions"
                  :key="loc.id"
                  :value="loc.id"
                >
                  {{ loc.name }}
                </option>
              </select>
              <Icon
                name="lucide:chevron-down"
                class="
                  pointer-events-none absolute top-1/2 right-2 -translate-y-1/2
                  text-neutral-500
                "
              />
            </div>
          </div>

          <!-- 交換按鈕 -->
          <div class="mb-4 flex justify-center">
            <button
              class="flex size-6 items-center justify-center"
              @click="swapLocations"
            >
              <Icon
                :name="bookingFormStore.serviceType === 'round_trip' ? 'lucide:arrow-down-up' : 'lucide:arrow-down'"
                class="text-2xl text-neutral-600"
              />
            </button>
          </div>

          <!-- 送達地點 -->
          <div class="flex flex-col gap-1">
            <span class="text-sm font-medium text-neutral-600">送達地點</span>
            <div class="relative">
              <select
                class="
                  w-full appearance-none rounded-[6px] border border-neutral-200
                  bg-white px-3 py-2 pr-8 text-base
                  focus:ring-1 focus:ring-primary-300 focus:outline-none
                "
                :class="bookingFormStore.deliveryLocation ? 'text-neutral-900' : `
                  text-neutral-500
                `"
                :value="bookingFormStore.deliveryLocation?.id ?? ''"
                @change="selectDeliveryLocation"
              >
                <option
                  value=""
                  disabled
                >
                  僅限小琉球島內民宿
                </option>
                <option
                  v-for="loc in deliveryOptions"
                  :key="loc.id"
                  :value="loc.id"
                >
                  {{ loc.name }}
                </option>
              </select>
              <Icon
                name="lucide:chevron-down"
                class="
                  pointer-events-none absolute top-1/2 right-2 -translate-y-1/2
                  text-neutral-500
                "
              />
            </div>
            <p class="px-1 text-xs text-info-300">
              建議使用 Google Map 上的全銜
            </p>
          </div>
        </div>

        <!-- 寄件日期 -->
        <div
          class="
            rounded-sm bg-white p-4
            shadow-[0px_4px_32px_0px_rgba(32,78,184,0.08)]
          "
        >
          <div class="mb-5 flex items-center gap-2">
            <div
              class="w-1 self-stretch rounded-xs"
              style="background: linear-gradient(101deg, #4090E8 16%, #306CF7 62%);"
            ></div>
            <span class="text-base font-bold text-neutral-900">寄件日期</span>
          </div>
          <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-neutral-600">
                {{ bookingFormStore.serviceType === 'round_trip' ? '去程' : '' }}
              </label>
              <input
                v-model="bookingFormStore.bookingDate"
                type="date"
                :min="today"
                class="
                  w-full rounded-xs border border-neutral-200 bg-white px-3 py-2
                  text-base text-neutral-900
                  focus:ring-1 focus:ring-primary-300 focus:outline-none
                "
              >
            </div>
            <div
              v-if="bookingFormStore.serviceType === 'round_trip'"
              class="flex flex-col gap-1"
            >
              <label class="text-sm font-medium text-neutral-600">回程</label>
              <input
                v-model="bookingFormStore.returnDate"
                type="date"
                :min="bookingFormStore.bookingDate || today"
                class="
                  w-full rounded-xs border border-neutral-200 bg-white px-3 py-2
                  text-base text-neutral-900
                  focus:ring-1 focus:ring-primary-300 focus:outline-none
                "
              >
            </div>
          </div>
        </div>

        <!-- 領件人資訊 -->
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
            <span class="text-base font-bold text-neutral-900">領件人資訊</span>
          </div>
          <div class="mb-4 flex flex-col gap-1">
            <span class="text-sm font-medium text-neutral-600">姓名</span>
            <input
              v-model="bookingFormStore.recipientName"
              type="text"
              placeholder="池昌旭"
              class="
                w-full rounded-xs border border-neutral-200 bg-white px-3 py-2
                text-base text-neutral-900
                placeholder:text-neutral-500
                focus:ring-1 focus:ring-primary-300 focus:outline-none
              "
            >
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-sm font-medium text-neutral-600">聯絡電話</span>
            <input
              v-model="bookingFormStore.recipientPhone"
              type="tel"
              placeholder="0912345678"
              class="
                w-full rounded-xs border border-neutral-200 bg-white px-3 py-2
                text-base text-neutral-900
                placeholder:text-neutral-500
                focus:ring-1 focus:ring-primary-300 focus:outline-none
              "
            >
          </div>
        </div>

        <!-- 備註 -->
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
            <div class="flex items-center gap-1">
              <span class="text-base font-bold text-neutral-900">備註</span>
              <span class="text-sm text-neutral-600">(選填)</span>
            </div>
          </div>
          <textarea
            v-model="bookingFormStore.notes"
            rows="3"
            placeholder="例如行李尺寸、易碎物品等"
            class="
              w-full rounded-xs border border-neutral-200 bg-white px-3 py-2
              text-base text-neutral-900
              placeholder:text-neutral-500
              focus:ring-1 focus:ring-primary-300 focus:outline-none
            "
          ></textarea>
        </div>

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

    <!-- 結帳明細底部彈窗 -->
    <Transition name="slide-up">
      <div
        v-if="showPriceSummary"
        class="absolute inset-x-0 bottom-0 z-10 flex flex-col"
      >
        <!-- 背景遮罩 -->
        <div
          class="absolute inset-0 -top-[100vh] bg-neutral-900/30"
          @click="showPriceSummary = false"
        ></div>
        <!-- 白色明細卡片 -->
        <div class="relative rounded-tl-2xl rounded-tr-2xl bg-white p-4">
          <!-- 標題列 -->
          <div class="mb-3 flex items-center justify-between">
            <span class="text-xl font-bold text-neutral-900">結帳明細</span>
            <button
              class="flex items-center justify-center p-2"
              @click="showPriceSummary = false"
            >
              <Icon
                name="lucide:x"
                class="text-2xl text-neutral-900"
              />
            </button>
          </div>
          <div class="mb-3 h-px bg-neutral-200"></div>
          <!-- 明細列表 -->
          <div class="flex flex-col gap-2 text-base">
            <div class="flex items-center justify-between">
              <span class="text-neutral-600">服務方案</span>
              <span class="text-neutral-900">{{ bookingFormStore.serviceType === 'round_trip' ? '雙程套票' : '單程運送' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-neutral-600">單價</span>
              <span class="text-neutral-900">NT$ {{ bookingFormStore.unitPrice }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-neutral-600">行李數量</span>
              <span class="text-neutral-900">{{ bookingFormStore.luggageCount }} 件</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-neutral-600">總計</span>
              <span class="text-neutral-900">NT$ {{ bookingFormStore.totalPrice }}</span>
            </div>
          </div>
        </div>
        <!-- 底部列（neutral-100） -->
        <div
          class="
            relative flex items-center justify-between bg-neutral-100 px-4 py-4
            pb-6
          "
        >
          <button
            class="flex items-center gap-1"
            @click="showPriceSummary = false"
          >
            <span class="text-base text-neutral-600">總計</span>
            <span class="text-lg font-bold text-neutral-900">NT$ {{ bookingFormStore.totalPrice }}</span>
            <Icon
              name="lucide:chevron-down"
              class="text-xl text-neutral-900"
            />
          </button>
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
      </div>
    </Transition>

    <!-- 預約須知 Modal -->
    <div
      v-if="showTermsModal"
      class="
        absolute inset-0 flex items-center justify-center bg-neutral-900/50 px-4
        backdrop-blur-sm
      "
      @click.self="showTermsModal = false"
    >
      <div
        class="
          flex max-h-[80vh] w-full flex-col rounded-sm border border-neutral-200
          bg-white shadow-[0px_4px_12px_0px_rgba(32,78,184,0.04)]
        "
      >
        <!-- 標題列 -->
        <div class="flex shrink-0 items-center justify-between p-5 pb-4">
          <h3 class="text-xl font-bold text-neutral-900">
            預約須知
          </h3>
          <button
            class="flex items-center justify-center p-2"
            @click="showTermsModal = false"
          >
            <Icon
              name="lucide:x"
              class="text-2xl text-neutral-900"
            />
          </button>
        </div>
        <div class="mx-5 shrink-0 border-t border-neutral-200"></div>
        <!-- 內容（可捲動） -->
        <div class="flex-1 overflow-y-auto px-5 py-4">
          <ol class="flex flex-col gap-6 text-base">
            <li class="flex flex-col gap-2">
              <span class="font-bold text-danger-300">1. 禁運物品</span>
              <p class="leading-relaxed text-neutral-600">
                嚴禁運送現金、貴重珠寶、易燃品、危險物品或活體動植物，詳細規定請詳閱禁運事項與運送規範。
              </p>
            </li>
            <li class="flex flex-col gap-2">
              <span class="font-bold text-neutral-900">2. 門市交付時限</span>
              <p class="leading-relaxed text-neutral-600">
                請於抵達小琉球後，最晚於 14:00 前將行李送至「你行李來」碼頭門市，以確保行李能於傍晚前送達民宿。
              </p>
            </li>
            <li class="flex flex-col gap-2">
              <span class="font-bold text-neutral-900">3. 行李標記</span>
              <p class="leading-relaxed text-neutral-600">
                交件時請主動出示預約或平台訂單編號，工作人員將現場為您的行李掛上專屬識別牌，並請確認上方資訊無誤。
              </p>
            </li>
            <li class="flex flex-col gap-2">
              <span class="font-bold text-neutral-900">4. 機車載運限制</span>
              <p class="leading-relaxed text-neutral-600">
                本服務旨在解決旅客騎機車載行李的危險與不便，若行李箱規格超過 29 吋或屬特殊大型物品（如潛水裝備箱），請務必於預約時標註。
              </p>
            </li>
            <li class="flex flex-col gap-2">
              <span class="font-bold text-neutral-900">5. 離島限定服務</span>
              <p class="leading-relaxed text-neutral-600">
                本服務運送範圍僅限小琉球島內民宿，恕不提供跨海（寄回台灣本島）之運送。
              </p>
            </li>
            <li class="flex flex-col gap-2">
              <span class="font-bold text-neutral-900">6. 取件憑證</span>
              <p class="leading-relaxed text-neutral-600">
                交付行李後請保留收執聯（或數位憑證），若需於民宿外之點位領回行李，請憑證取件。
              </p>
            </li>
            <li class="flex flex-col gap-2">
              <span class="font-bold text-neutral-900">7. 行李外觀檢查</span>
              <p class="leading-relaxed text-neutral-600">
                交付行李時，工作人員將與您共同確認行李箱外觀現況，如有明顯破損將現場記錄，以保障雙方權益。
              </p>
            </li>
          </ol>
        </div>
        <!-- 按鈕 -->
        <div class="shrink-0 p-5 pt-4">
          <button
            class="
              w-full rounded-sm bg-primary-300 py-3 text-base font-medium
              text-white
            "
            @click="showTermsModal = false"
          >
            我瞭解了
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.25s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
