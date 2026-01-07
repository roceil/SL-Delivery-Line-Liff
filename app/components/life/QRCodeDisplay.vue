<script setup lang="ts">
interface Props {
  qrCode: string // Base64 encoded QR code
  orderId: string
}

const props = defineProps<Props>()

function downloadQRCode() {
  const link = document.createElement('a')
  link.href = props.qrCode
  link.download = `order-${props.orderId.substring(0, 8)}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<template>
  <div class="flex flex-col items-center rounded-lg bg-white p-6 shadow">
    <img
      :src="qrCode"
      :alt="`訂單 ${orderId} QR Code`"
      class="mb-4 size-64"
    >

    <button
      type="button"
      class="
        w-full rounded-lg bg-blue-500 px-4 py-2 text-white
        hover:bg-blue-600
      "
      @click="downloadQRCode"
    >
      下載 QR Code
    </button>
  </div>
</template>
