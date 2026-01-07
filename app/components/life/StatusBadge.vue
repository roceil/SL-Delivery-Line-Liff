<script setup lang="ts">
import type { BookingStatus } from '~/types/booking'

interface Props {
  status: BookingStatus
}

const props = defineProps<Props>()

const statusConfig = computed(() => {
  const configs: Record<BookingStatus, { text: string, color: string }> = {
    pending: { text: '待確認', color: 'bg-yellow-100 text-yellow-800' },
    confirmed: { text: '已確認', color: 'bg-blue-100 text-blue-800' },
    in_transit: { text: '運送中', color: 'bg-purple-100 text-purple-800' },
    delivered: { text: '已送達', color: 'bg-green-100 text-green-800' },
    cancelled: { text: '已取消', color: 'bg-gray-100 text-gray-800' },
  }

  return configs[props.status] || { text: '未知', color: 'bg-gray-100 text-gray-800' }
})
</script>

<template>
  <span
    class="inline-block rounded-full px-3 py-1 text-sm font-semibold"
    :class="statusConfig.color"
  >
    {{ statusConfig.text }}
  </span>
</template>
