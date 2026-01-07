<script setup lang="ts">
import type { BookingOrder } from '~/types/booking'

interface Props {
  order: BookingOrder
}

const props = defineProps<Props>()

const shortOrderId = computed(() => props.order.id.substring(0, 8))
</script>

<template>
  <NuxtLink
    :to="`/life/my-bookings/${order.id}`"
    class="
      block cursor-pointer rounded-lg bg-white p-4 shadow transition-shadow
      hover:shadow-md
    "
  >
    <div class="mb-2 flex items-center justify-between">
      <span class="font-mono text-sm text-gray-500">
        #{{ shortOrderId }}
      </span>
      <LifeStatusBadge :status="order.status" />
    </div>

    <div class="mb-2">
      <div class="text-sm text-gray-600">
        {{ order.bookingDate }} {{ order.pickupTime }}
      </div>
      <div class="text-sm text-gray-500">
        行李 {{ order.luggageCount }} 件
      </div>
    </div>

    <div class="flex items-center text-gray-800">
      <span class="font-medium">{{ order.pickupLocation.name }}</span>
      <span class="mx-2 text-gray-400">→</span>
      <span class="font-medium">{{ order.deliveryLocation.name }}</span>
    </div>

    <div
      v-if="order.specialNote"
      class="mt-2 text-sm text-gray-500"
    >
      備註:{{ order.specialNote }}
    </div>
  </NuxtLink>
</template>
