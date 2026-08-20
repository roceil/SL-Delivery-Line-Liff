<script lang="ts" setup>
const bookingFormStore = useBookingFormStore()
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
</template>
