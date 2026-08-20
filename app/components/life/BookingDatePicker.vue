<script lang="ts" setup>
const bookingFormStore = useBookingFormStore()

const today = computed(() => new Date().toISOString().split('T')[0])
</script>

<template>
  <div
    class="
      rounded-sm bg-white p-4 shadow-[0px_4px_32px_0px_rgba(32,78,184,0.08)]
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
</template>
