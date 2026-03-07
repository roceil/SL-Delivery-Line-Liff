<script lang="ts" setup>
import type { KlookOrder, TripOrder } from '~/types/booking'

definePageMeta({
  layout: 'booking-flow',
})

const router = useRouter()
const lineStore = useLineStore()
const bookingFormStore = useBookingFormStore()
const { scanQRCode, parseQRCodeData, queryPlatformOrder, queryPlatformOrderAuto } = useQRCode()

const isScanning = ref(false)
const isUploading = ref(false)
const isQuerying = ref(false)
const error = ref('')
const showFallback = ref(false)
const manualInput = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

async function handlePlatformOrder(platform: 'trip' | 'klook', orderIdentifier: string) {
  const platformOrder = await queryPlatformOrder(platform, orderIdentifier)
  bookingFormStore.setPlatformOrder(
    platform,
    String((platformOrder as TripOrder | KlookOrder).id),
    orderIdentifier,
    platformOrder as TripOrder | KlookOrder,
  )
  router.push('/life/booking')
}

async function handlePlatformOrderAuto(orderIdentifier: string) {
  const { platform, order } = await queryPlatformOrderAuto(orderIdentifier)
  bookingFormStore.setPlatformOrder(platform, String(order.id), orderIdentifier, order)
  router.push('/life/booking')
}

async function startScan() {
  if (!lineStore.isInitialized || !lineStore.liffInstance) {
    error.value = 'LIFF 尚未初始化，請重新整理頁面'
    return
  }

  try {
    isScanning.value = true
    error.value = ''

    const qrData = await scanQRCode()

    if (typeof qrData === 'string') {
      await handlePlatformOrderAuto(qrData)
      return
    }

    if (qrData.type === 'platform_order') {
      await handlePlatformOrder(qrData.platform, qrData.orderIdentifier)
    }
    else if (qrData.type === 'booking_order') {
      const response = await $fetch<{ id: string }>(`/api/orders/by-voucher/${qrData.voucherId}`)
      router.push(`/life/my-bookings/${response.id}`)
    }
    else {
      error.value = '不支援的 QR Code 類型'
    }
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : '掃描失敗，請稍後再試'
  }
  finally {
    isScanning.value = false
  }
}

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

    const imageData = await readImageFile(file)
    const { default: jsQR } = await import('jsqr')
    const qrCode = jsQR(imageData.data, imageData.width, imageData.height)

    if (!qrCode) {
      error.value = '圖片中未找到 QR Code，請重新選擇'
      return
    }

    const qrData = parseQRCodeData(qrCode.data)

    if (typeof qrData === 'string') {
      await handlePlatformOrderAuto(qrData)
      return
    }

    if (qrData.type === 'platform_order') {
      await handlePlatformOrder(qrData.platform, qrData.orderIdentifier)
    }
    else {
      error.value = '不支援的 QR Code 類型'
    }
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : '處理圖片失敗，請稍後再試'
  }
  finally {
    isUploading.value = false
    if (target)
      target.value = ''
  }
}

async function handleManualLogin() {
  if (!manualInput.value.trim()) {
    error.value = '請輸入訂單編號'
    return
  }

  try {
    isQuerying.value = true
    error.value = ''
    await handlePlatformOrderAuto(manualInput.value.trim())
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : '查詢失敗，請稍後再試'
  }
  finally {
    isQuerying.value = false
  }
}

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
        resolve(ctx.getImageData(0, 0, canvas.width, canvas.height))
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
  <div class="flex h-full flex-col">
    <!-- Header -->
    <header
      class="shrink-0 rounded-b-sm"
      style="background: linear-gradient(16deg, rgb(255,255,255) 0%, rgba(255,255,255,0.5) 100%);"
    >
      <!-- Nav bar -->
      <div class="flex items-center justify-center p-1">
        <button
          class="flex items-center justify-center p-2"
          @click="showFallback ? (showFallback = false) : router.push('/life')"
        >
          <Icon
            name="lucide:chevron-left"
            class="text-2xl text-neutral-900"
          />
        </button>
        <div class="flex flex-1 items-center justify-center">
          <span class="text-lg font-bold tracking-wide text-neutral-900">你行李來</span>
        </div>
        <button
          class="flex items-center justify-center p-2"
          @click="router.push('/life')"
        >
          <Icon
            name="lucide:x"
            class="text-2xl text-neutral-900"
          />
        </button>
      </div>

      <!-- Stepper（掃描模式才顯示） -->
      <div
        v-if="!showFallback"
        class="flex items-center border-b border-white py-4"
      >
        <!-- Step 1: 登錄訂單（active） -->
        <div class="flex flex-1 flex-col items-center gap-1">
          <div class="flex w-full items-center">
            <div class="h-0.5 flex-1"></div>
            <div
              class="
                flex size-8 items-center justify-center rounded-full
                bg-primary-300
              "
            >
              <span class="text-xs font-medium text-white">1</span>
            </div>
            <div class="h-0.5 flex-1 bg-neutral-200"></div>
          </div>
          <span class="text-sm font-bold text-primary-300">登錄訂單</span>
        </div>
        <!-- Step 2: 填寫資料 -->
        <div class="flex flex-1 flex-col items-center gap-1">
          <div class="flex w-full items-center">
            <div class="h-0.5 flex-1 bg-neutral-200"></div>
            <div
              class="
                flex size-8 items-center justify-center rounded-full
                bg-neutral-200
              "
            >
              <span class="text-xs font-medium text-neutral-600">2</span>
            </div>
            <div class="h-0.5 flex-1 bg-neutral-200"></div>
          </div>
          <span class="text-sm font-bold text-neutral-600">填寫資料</span>
        </div>
        <!-- Step 3: 完成預約 -->
        <div class="flex flex-1 flex-col items-center gap-1">
          <div class="flex w-full items-center">
            <div class="h-0.5 flex-1 bg-neutral-200"></div>
            <div
              class="
                flex size-8 items-center justify-center rounded-full
                bg-neutral-200
              "
            >
              <span class="text-xs font-medium text-neutral-600">3</span>
            </div>
            <div class="h-0.5 flex-1"></div>
          </div>
          <span class="text-sm font-bold text-neutral-600">完成預約</span>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto px-4 py-6">
      <!-- 錯誤訊息 -->
      <div
        v-if="error"
        class="mb-4 rounded-sm bg-danger-100 p-3 text-sm text-danger-300"
      >
        {{ error }}
      </div>

      <!-- 掃描模式 -->
      <div
        v-if="!showFallback"
        class="flex h-full flex-col items-center justify-center gap-3"
      >
        <span class="text-base font-bold text-primary-300">請將相機對準訂單 QR Code</span>
        <div
          class="
            w-full rounded-sm bg-white p-6
            shadow-[0px_4px_32px_0px_rgba(32,78,184,0.08)]
          "
        >
          <button
            class="
              relative flex w-full items-center justify-center rounded-2xl
              border-[6px] border-dashed border-[#4090e8]
            "
            style="height: 272px;"
            :disabled="isScanning"
            @click="startScan"
          >
            <div
              class="
                flex size-14 items-center justify-center rounded-full
                bg-primary-200 p-3
              "
            >
              <Icon
                name="lucide:qr-code"
                class="text-3xl text-primary-300"
              />
            </div>
            <div
              v-if="isScanning"
              class="
                absolute inset-0 flex items-center justify-center rounded-2xl
                bg-white/80
              "
            >
              <span class="text-sm font-medium text-neutral-600">掃描中...</span>
            </div>
          </button>
        </div>
      </div>

      <!-- 備用模式 -->
      <div
        v-else
        class="flex flex-col gap-4"
      >
        <div class="flex flex-col gap-2 text-center">
          <h2 class="text-xl font-bold text-neutral-900">
            登錄訂單
          </h2>
          <div class="text-sm leading-relaxed text-neutral-600">
            <p>請利用以下方式登錄訂單</p>
            <p>若仍遇到困難，請聯繫客服為您處理</p>
          </div>
        </div>

        <!-- 上傳圖片 -->
        <div
          class="
            rounded-sm bg-white p-4
            shadow-[0px_4px_32px_0px_rgba(32,78,184,0.08)]
          "
        >
          <p class="mb-3 text-sm font-bold text-neutral-900">
            上傳圖片
          </p>
          <button
            class="
              flex w-full flex-col items-center justify-center gap-3 rounded-sm
              border border-dashed border-neutral-300 bg-neutral-100 p-4
            "
            :disabled="isUploading"
            @click="triggerFileInput"
          >
            <div class="rounded-sm bg-neutral-200 p-3">
              <Icon
                name="bx:image"
                class="text-3xl text-neutral-600"
              />
            </div>
            <span class="text-sm font-medium text-neutral-600">從手機相簿中上傳 QR Code 圖片</span>
          </button>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileUpload"
          >
          <button
            class="
              mt-3 flex w-full items-center justify-center rounded-sm border
              border-neutral-200 bg-white px-5 py-2
            "
            :disabled="isUploading"
            @click="triggerFileInput"
          >
            <span class="text-base font-medium text-neutral-900">
              {{ isUploading ? '處理中...' : '上傳圖片' }}
            </span>
          </button>
        </div>

        <!-- 分隔線 -->
        <div class="flex items-center gap-3">
          <div class="h-px flex-1 bg-neutral-300"></div>
          <span class="text-xs text-neutral-600">或</span>
          <div class="h-px flex-1 bg-neutral-300"></div>
        </div>

        <!-- 手動輸入 -->
        <div
          class="
            rounded-sm bg-white p-4
            shadow-[0px_4px_32px_0px_rgba(32,78,184,0.08)]
          "
        >
          <p class="mb-3 text-sm font-bold text-neutral-900">
            手動輸入訂單編號
          </p>
          <input
            v-model="manualInput"
            type="text"
            placeholder="LSE123456689"
            class="
              w-full rounded-xs border border-neutral-200 bg-white px-3 py-2
              text-base text-neutral-900
              placeholder:text-neutral-500
              focus:ring-1 focus:ring-primary-300 focus:outline-none
            "
          >
        </div>
      </div>
    </main>

    <!-- Bottom Navigation -->
    <footer
      class="shrink-0 rounded-t-lg border border-white backdrop-blur-md"
      style="background: linear-gradient(10deg, rgb(255,255,255) 0%, rgba(255,255,255,0.5) 100%); box-shadow: 0px -4px 20px 0px rgba(32,78,184,0.12);"
    >
      <!-- 掃描模式：無法掃描 -->
      <div
        v-if="!showFallback"
        class="px-5 py-3"
      >
        <button
          class="
            flex w-full items-center justify-center rounded-sm border
            border-neutral-200 bg-white px-5 py-3
          "
          @click="showFallback = true"
        >
          <span class="text-base font-medium text-neutral-900">無法掃描？</span>
        </button>
      </div>

      <!-- 備用模式：聯繫客服 + 登錄 -->
      <div
        v-else
        class="flex gap-2 px-5 py-3"
      >
        <button
          class="
            flex flex-1 items-center justify-center rounded-sm border
            border-neutral-200 bg-white px-5 py-3
          "
        >
          <span class="text-base font-medium text-neutral-700">聯繫客服</span>
        </button>
        <button
          class="
            flex flex-1 items-center justify-center rounded-sm bg-primary-300
            px-5 py-3
            disabled:opacity-50
          "
          :disabled="isQuerying || !manualInput.trim()"
          @click="handleManualLogin"
        >
          <span class="text-base font-medium text-white">
            {{ isQuerying ? '查詢中...' : '登錄' }}
          </span>
        </button>
      </div>

      <!-- Home Indicator -->
      <div class="flex items-center justify-center px-2 pt-5 pb-2">
        <div class="h-[5px] w-[134px] rounded-full bg-black"></div>
      </div>
    </footer>
  </div>
</template>
