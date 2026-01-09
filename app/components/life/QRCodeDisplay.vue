<script setup lang="ts">
interface Props {
  qrCode: string // Base64 encoded QR code
  voucherId: string
}

defineProps<Props>()
</script>

<template>
  <div class="flex flex-col items-center rounded-lg bg-white p-6 shadow">
    <img
      :src="qrCode"
      :alt="`訂單 ${voucherId} QR Code`"
      class="mb-4 size-64"
    >

    <div class="w-full rounded-lg bg-gray-100 px-4 py-3 text-center">
      <div class="mb-1 text-xs text-gray-500">
        憑證號碼
      </div>
      <div class="font-mono text-lg font-semibold text-gray-800">
        {{ voucherId }}
      </div>
    </div>
  </div>
</template>
