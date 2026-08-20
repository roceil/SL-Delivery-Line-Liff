<script lang="ts" setup>
const bookingFormStore = useBookingFormStore()
const locationsStore = useLocationsStore()

const { locations } = storeToRefs(locationsStore)

// 可選地點（排除已選的另一端）
const pickupOptions = computed(() =>
  locations.value.filter(loc => loc.id !== bookingFormStore.deliveryLocation?.id),
)
const deliveryOptions = computed(() =>
  locations.value.filter(loc => loc.id !== bookingFormStore.pickupLocation?.id),
)

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
</script>

<template>
  <div
    class="
      rounded-sm bg-white p-4 shadow-[0px_4px_32px_0px_rgba(32,78,184,0.08)]
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
</template>
