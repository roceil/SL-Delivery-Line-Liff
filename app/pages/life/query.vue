<script lang="ts" setup>
import jsQR from 'jsqr'

definePageMeta({
  layout: 'life',
  title: '查詢訂單',
})

const router = useRouter()
const lineStore = useLineStore()
const bookingStore = useBookingStore()
const locationsStore = useLocationsStore()
const { scanQRCode } = useQRCode()

const isScanning = ref(false)
const isUploading = ref(false)
const error = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

// 建立測試訂單
async function createTestOrder() {
  // 確保配送地點已載入
  if (locationsStore.locations.length === 0) {
    await locationsStore.fetchLocations()
  }

  if (locationsStore.locations.length < 2) {
    throw new Error('配送地點資料不足，無法建立訂單')
  }

  const orderData = {
    userId: lineStore.userId || 'test-user',
    userName: lineStore.displayName || '測試用戶',
    bookingDate: new Date().toISOString().split('T')[0] as string,
    pickupTime: '10:00' as string,
    luggageCount: 1 as number,
    pickupLocation: locationsStore.locations[0]!, // 第一個地點
    deliveryLocation: locationsStore.locations[1]!, // 第二個地點
    specialNote: '透過掃描 QR Code 自動建立' as string | undefined,
  }

  return await bookingStore.createOrder(orderData)
}

// 掃描功能
async function startScan() {
  if (!lineStore.isInitialized) {
    error.value = 'LIFF 尚未初始化，請重新整理頁面'
    return
  }

  if (!lineStore.liffInstance) {
    error.value = 'LIFF 實例不存在，請重新整理頁面'
    return
  }

  try {
    isScanning.value = true
    error.value = ''

    // 執行掃描（目前不處理 QR Code 內容）
    await scanQRCode()

    // 自動建立測試訂單
    const newOrder = await createTestOrder()

    // 導向新建立的訂單詳細頁
    router.push(`/life/my-bookings/${newOrder.id}`)
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : '掃描失敗，請稍後再試'
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

  if (!file) {
    return
  }

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
      error.value = '圖片中未找到 QR Code，請重新選擇'
      return
    }

    // 自動建立測試訂單
    const newOrder = await createTestOrder()

    // 導向新建立的訂單詳細頁
    router.push(`/life/my-bookings/${newOrder.id}`)
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : '處理圖片失敗，請稍後再試'
  }
  finally {
    isUploading.value = false
    // 清空 input，讓同一個檔案可以重複上傳
    if (target) {
      target.value = ''
    }
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
        掃描或上傳 QR Code
      </h2>
      <p class="text-center text-sm text-gray-600">
        使用相機掃描或上傳圖片以建立測試訂單
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
            <li>2. 將相機對準 QR Code</li>
            <li>3. 自動建立測試訂單</li>
          </ol>
        </div>
        <div>
          <p class="mb-1 font-semibold text-gray-700">
            方式二：上傳圖片
          </p>
          <ol class="space-y-1 pl-4">
            <li>1. 點擊「上傳圖片」按鈕</li>
            <li>2. 選擇包含 QR Code 的圖片</li>
            <li>3. 自動辨識並建立測試訂單</li>
          </ol>
        </div>
      </div>
    </div>
  </div>
</template>
