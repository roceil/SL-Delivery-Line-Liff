<script lang="ts" setup>
import type { KlookOrder, TripOrder } from '~/types/booking'
import jsQR from 'jsqr'

definePageMeta({
  layout: 'life',
  title: '登錄訂單',
})

const router = useRouter()
const lineStore = useLineStore()
const { scanQRCode, parseQRCodeData, queryPlatformOrder, queryPlatformOrderAuto } = useQRCode()

const isScanning = ref(false)
const isUploading = ref(false)
const error = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

// 處理平台訂單 QR Code (已知平台類型)
async function handlePlatformOrder(platform: 'trip' | 'klook', orderIdentifier: string) {
  try {
    // 查詢平台訂單
    const platformOrder = await queryPlatformOrder(platform, orderIdentifier)

    // 導向預約頁面並傳遞平台訂單資訊
    const query = {
      platform,
      orderId: String((platformOrder as TripOrder | KlookOrder).id),
      orderIdentifier,
    }

    router.push({
      path: '/life/booking',
      query,
    })
  }
  catch (err) {
    throw new Error(err instanceof Error ? err.message : '查詢平台訂單失敗')
  }
}

// 處理平台訂單 QR Code (自動偵測平台)
async function handlePlatformOrderAuto(orderIdentifier: string) {
  try {
    // 自動查詢平台訂單
    const { platform, order } = await queryPlatformOrderAuto(orderIdentifier)

    // 導向預約頁面並傳遞平台訂單資訊
    const query = {
      platform,
      orderId: String(order.id),
      orderIdentifier,
    }

    router.push({
      path: '/life/booking',
      query,
    })
  }
  catch (err) {
    throw new Error(err instanceof Error ? err.message : '查詢平台訂單失敗')
  }
}

// 掃描功能
async function startScan() {
  if (!lineStore.isInitialized) {
    error.value = 'LIFF 尚未初始化,請重新整理頁面'
    return
  }

  if (!lineStore.liffInstance) {
    error.value = 'LIFF 實例不存在,請重新整理頁面'
    return
  }

  try {
    isScanning.value = true
    error.value = ''

    // 執行掃描
    const qrData = await scanQRCode()

    // 純文字 - 平台訂單的憑證號碼
    if (typeof qrData === 'string') {
      await handlePlatformOrderAuto(qrData)
      return
    }

    // JSON 格式的 QR Code
    if (qrData.type === 'platform_order') {
      // 平台訂單 QR Code - 導向預約頁面
      await handlePlatformOrder(qrData.platform, qrData.orderIdentifier)
    }
    else if (qrData.type === 'booking_order') {
      // 一般訂單 QR Code - 使用 voucherId 查詢訂單
      const response = await $fetch<{ id: string }>(`/api/orders/by-voucher/${qrData.voucherId}`)
      router.push(`/life/my-bookings/${response.id}`)
    }
    else {
      error.value = '不支援的 QR Code 類型'
    }
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : '掃描失敗,請稍後再試'
  }
  finally {
    isScanning.value = false
  }
}

// 上傳圖片功能
function triggerFileInput() {
  fileInput.value?.click()
}

async function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file)
    return

  if (!file.type.startsWith('image/')) {
    error.value = '請選擇圖片檔案'
    return
  }

  try {
    isUploading.value = true
    error.value = ''

    // 讀取圖片
    const imageData = await readImageFile(file)

    // 解析 QR Code
    const qrCode = jsQR(imageData.data, imageData.width, imageData.height)

    if (!qrCode) {
      error.value = '圖片中未找到 QR Code,請重新選擇'
      return
    }

    // 解析 QR Code 資料
    const qrData = parseQRCodeData(qrCode.data)

    // 純文字 - 平台訂單的憑證號碼
    if (typeof qrData === 'string') {
      await handlePlatformOrderAuto(qrData)
      return
    }

    // JSON 格式的 QR Code
    if (qrData.type === 'platform_order') {
      // 平台訂單 QR Code - 導向預約頁面
      await handlePlatformOrder(qrData.platform, qrData.orderIdentifier)
    }
    else if (qrData.type === 'booking_order') {
      // 一般訂單 QR Code - 使用 voucherId 查詢訂單
      const response = await $fetch<{ id: string }>(`/api/orders/by-voucher/${qrData.voucherId}`)
      router.push(`/life/my-bookings/${response.id}`)
    }
    else {
      error.value = '不支援的 QR Code 類型'
    }
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : '處理圖片失敗,請稍後再試'
  }
  finally {
    isUploading.value = false
    // 清空 input,讓同一個檔案可以重複上傳
    if (target)
      target.value = ''
  }
}

// 讀取圖片檔案並轉換為 ImageData
function readImageFile(file: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('無法建立 canvas context'))
          return
        }

        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        resolve(imageData)
      }

      img.onerror = () => reject(new Error('圖片載入失敗'))
      img.src = e.target?.result as string
    }

    reader.onerror = () => reject(new Error('檔案讀取失敗'))
    reader.readAsDataURL(file)
  })
}
</script>

<template>
  <div class="space-y-4">
    <!-- 錯誤提示 -->
    <div
      v-if="error"
      class="rounded-lg bg-red-50 p-4 text-sm text-red-600"
    >
      {{ error }}
    </div>

    <!-- 說明卡片 -->
    <div class="rounded-lg bg-white p-6 shadow">
      <div class="mb-4 text-center text-5xl">
        📱
      </div>
      <h2 class="mb-2 text-center text-lg font-semibold text-gray-800">
        掃描平台訂單 QR Code
      </h2>
      <p class="text-center text-sm text-gray-600">
        使用相機掃描或上傳 Trip / Klook 訂單的 QR Code,確認訂單後即可進行配送預約
      </p>
    </div>

    <!-- 掃描按鈕 -->
    <button
      type="button"
      class="
        w-full rounded-lg bg-blue-500 px-4 py-4 font-semibold text-white shadow
        transition-colors
        hover:bg-blue-600
        disabled:cursor-not-allowed disabled:opacity-50
      "
      :disabled="isScanning || isUploading"
      @click="startScan"
    >
      {{ isScanning ? '掃描中...' : '📷 開始掃描' }}
    </button>

    <!-- 分隔線 -->
    <div class="relative">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-gray-300"></div>
      </div>
      <div class="relative flex justify-center text-sm">
        <span class="bg-gray-50 px-2 text-gray-500">或</span>
      </div>
    </div>

    <!-- 上傳圖片按鈕 -->
    <button
      type="button"
      class="
        w-full rounded-lg bg-green-500 px-4 py-4 font-semibold text-white shadow
        transition-colors
        hover:bg-green-600
        disabled:cursor-not-allowed disabled:opacity-50
      "
      :disabled="isScanning || isUploading"
      @click="triggerFileInput"
    >
      {{ isUploading ? '處理中...' : '🖼️ 上傳圖片' }}
    </button>

    <!-- 隱藏的檔案 input -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleFileUpload"
    >

    <!-- 使用說明 -->
    <div class="rounded-lg bg-gray-50 p-4">
      <h3 class="mb-2 font-semibold text-gray-800">
        使用說明
      </h3>
      <div class="space-y-3 text-sm text-gray-600">
        <div>
          <p class="mb-1 font-semibold text-gray-700">
            方式一：相機掃描
          </p>
          <ol class="space-y-1 pl-4">
            <li>1. 點擊「開始掃描」按鈕</li>
            <li>2. 將相機對準平台訂單 QR Code</li>
            <li>3. 系統確認訂單後,導向預約頁面</li>
          </ol>
        </div>
        <div>
          <p class="mb-1 font-semibold text-gray-700">
            方式二：上傳圖片
          </p>
          <ol class="space-y-1 pl-4">
            <li>1. 點擊「上傳圖片」按鈕</li>
            <li>2. 選擇包含平台訂單 QR Code 的圖片</li>
            <li>3. 系統自動辨識並導向預約頁面</li>
          </ol>
        </div>
      </div>
    </div>
  </div>
</template>
