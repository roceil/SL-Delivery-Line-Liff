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
      <span class="text-base font-bold text-neutral-900">行李數量</span>
    </div>
    <div
      class="
        flex h-10 items-center gap-3 rounded-[6px] bg-neutral-100 px-3 py-2
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
</template>
