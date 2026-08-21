<script lang="ts" setup>
const bookingFormStore = useBookingFormStore()

const servicePlans = [
  {
    id: 'round_trip' as const,
    label: '雙程套票',
    subtitle: '去程 + 回程',
    price: 300,
    badge: '推薦',
    icon: 'lucide:arrow-left-right',
  },
  {
    id: 'one_way' as const,
    label: '單程運送',
    subtitle: '碼頭 → 民宿\n或民宿 → 碼頭',
    price: 150,
    badge: null,
    icon: 'lucide:arrow-right',
  },
]
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
      <span class="text-base font-bold text-neutral-900">選擇服務方案</span>
    </div>
    <div class="flex gap-3">
      <button
        v-for="plan in servicePlans"
        :key="plan.id"
        class="
          relative flex flex-1 flex-col gap-3 rounded-sm border p-4 text-left
          transition-colors
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
            absolute top-2 right-3 flex items-center justify-center rounded-full
            bg-success-100 px-2 py-0.5
          "
        >
          <span
            class="text-[11px] font-medium whitespace-nowrap text-success-300"
          >{{ plan.badge }}</span>
        </div>
        <!-- Icon -->
        <div
          class="flex size-8 items-center justify-center rounded-full p-2"
          :class="bookingFormStore.serviceType === plan.id ? `bg-primary-200` : `
            bg-neutral-200
          `"
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
          :class="bookingFormStore.serviceType === plan.id ? `text-primary-300` : `
            text-neutral-900
          `"
        >
          NT$ {{ plan.price }} / 件
        </span>
      </button>
    </div>
  </div>
</template>
