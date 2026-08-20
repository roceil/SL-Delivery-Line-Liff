<script lang="ts" setup>
defineProps<{
  statusLabel: string
  statusSubLabel: string
  isCancelled: boolean
}>()
</script>

<template>
  <div class="absolute inset-0 bg-[#e8edf2]">
    <!-- 格線佔位 -->
    <svg
      class="absolute inset-0 size-full opacity-20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="map-grid"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="#64748b"
            stroke-width="0.5"
          />
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill="url(#map-grid)"
      />
    </svg>

    <!-- 定位針 -->
    <div
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full"
    >
      <Icon
        name="lucide:map-pin"
        class="text-3xl text-primary-300"
      />
    </div>

    <!-- 浮動狀態欄 -->
    <div
      class="
        absolute top-4 right-4 left-4 flex items-center gap-2 rounded-sm border
        border-white px-4 py-3 shadow-down-200
      "
      style="background: linear-gradient(6deg, #fff 0%, rgba(255,255,255,0.5) 100%); backdrop-filter: blur(12px);"
    >
      <div class="flex flex-1 items-center gap-2">
        <div
          class="size-1.5 rounded-rounded"
          :class="isCancelled ? 'bg-neutral-400' : 'bg-primary-300'"
        ></div>
        <span class="text-base font-bold text-neutral-900">{{ statusLabel }}</span>
      </div>
      <span class="text-sm text-neutral-600">{{ statusSubLabel }}</span>
    </div>
  </div>
</template>
