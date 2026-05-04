<script setup lang="ts">
import type { BookingStatus } from '~/types/booking'

interface Props {
  status: BookingStatus
}

const props = defineProps<Props>()

const statusConfig = computed(() => {
  const configs: Record<BookingStatus, { text: string, bg: string, color: string }> = {
    pending: { text: '待交付', bg: '#fef0f0', color: '#d74f4f' },
    confirmed: { text: '待出發', bg: '#fef0f0', color: '#d74f4f' },
    assigned: { text: '待出發', bg: '#fef0f0', color: '#d74f4f' },
    in_delivery: { text: '運送中', bg: '#eaf5ff', color: '#3087db' },
    received: { text: '運送中', bg: '#eaf5ff', color: '#3087db' },
    in_transit: { text: '運送中', bg: '#eaf5ff', color: '#3087db' },
    delivered: { text: '已完成', bg: '#e9f4ef', color: '#229464' },
    completed: { text: '已完成', bg: '#e9f4ef', color: '#229464' },
    cancelled: { text: '已取消', bg: '#f1f3f5', color: '#6c757d' },
    overdue: { text: '逾期', bg: '#fef0f0', color: '#d74f4f' },
  }

  return configs[props.status] || { text: '未知', bg: '#f1f3f5', color: '#6c757d' }
})
</script>

<template>
  <span
    class="
      inline-block rounded-full px-2 py-0.5 text-[11px] font-medium
      tracking-wide
    "
    :style="{ backgroundColor: statusConfig.bg, color: statusConfig.color }"
  >
    {{ statusConfig.text }}
  </span>
</template>
