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
        w-full rounded-xs border border-neutral-200 bg-white px-3 py-2 text-base
        text-neutral-900
        placeholder:text-neutral-500
        focus:ring-1 focus:ring-primary-300 focus:outline-none
      "
    ></textarea>
  </div>
</template>
