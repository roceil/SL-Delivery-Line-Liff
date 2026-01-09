<script lang="ts" setup>
definePageMeta({
  layout: false,
})

const config = useRuntimeConfig()

const lineStore = useLineStore()
const bookingStore = useBookingStore()
const profileStore = useProfileStore()
const locationsStore = useLocationsStore()

const { initLiff, login } = lineStore
const { isInitialized, isLoggedIn, user, error } = storeToRefs(lineStore)
const { activeOrders } = storeToRefs(bookingStore)

const isLoading = ref(true)

onMounted(async () => {
  await initLiff(config.public.liffId as string)
  isLoading.value = false

  if (!isInitialized.value || !isLoggedIn.value) {
    login()
    return
  }

  // 載入資料
  await Promise.all([
    bookingStore.loadOrders(),
    profileStore.initProfile(),
    locationsStore.fetchLocations(),
  ])
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <!-- Loading 狀態 -->
    <div
      v-if="isLoading"
      class="flex items-center justify-center pt-20"
    >
      <div class="text-gray-600">
        載入中...
      </div>
    </div>

    <!-- 錯誤狀態 -->
    <div
      v-else-if="error"
      class="rounded-lg bg-red-50 p-4 text-red-600"
    >
      <p class="font-semibold">
        發生錯誤
      </p>
      <p class="text-sm">
        {{ error }}
      </p>
    </div>

    <!-- 已登入狀態 -->
    <div
      v-else-if="isLoggedIn && user"
      class="mx-auto max-w-md"
    >
      <!-- 用戶資訊卡片 -->
      <div class="mb-6 rounded-lg bg-white p-6 shadow">
        <div class="flex items-center gap-4">
          <img
            v-if="user.pictureUrl"
            :src="user.pictureUrl"
            :alt="user.displayName"
            class="size-16 rounded-full"
          >
          <div class="flex-1">
            <h2 class="text-xl font-bold text-gray-800">
              {{ user.displayName }}
            </h2>
            <p class="text-sm text-gray-600">
              歡迎使用行李寄送服務
            </p>
          </div>
        </div>
      </div>

      <!-- 功能按鈕網格 -->
      <div class="space-y-3">
        <NuxtLink
          to="/life/booking"
          class="
            block w-full rounded-lg bg-green-500 px-4 py-4 text-left
            font-semibold text-white shadow transition-colors
            hover:bg-green-600
          "
        >
          <div class="flex items-center justify-between">
            <span>立即預約</span>
            <span class="text-2xl">→</span>
          </div>
          <div class="mt-1 text-sm font-normal opacity-90">
            預約行李寄送服務
          </div>
        </NuxtLink>

        <NuxtLink
          to="/life/query"
          class="
            block w-full rounded-lg bg-blue-500 px-4 py-4 text-left
            font-semibold text-white shadow transition-colors
            hover:bg-blue-600
          "
        >
          <div class="flex items-center justify-between">
            <span>查詢訂單</span>
            <span class="text-2xl">→</span>
          </div>
          <div class="mt-1 text-sm font-normal opacity-90">
            掃描 QR Code 查詢訂單
          </div>
        </NuxtLink>

        <NuxtLink
          to="/life/my-bookings"
          class="
            block w-full rounded-lg bg-purple-500 px-4 py-4 text-left
            font-semibold text-white shadow transition-colors
            hover:bg-purple-600
          "
        >
          <div class="flex items-center justify-between">
            <div>
              <span>我的預約</span>
              <span
                v-if="activeOrders.length > 0"
                class="
                  ml-2 inline-block rounded-full bg-white px-2 py-0.5 text-xs
                  text-purple-500
                "
              >
                {{ activeOrders.length }}
              </span>
            </div>
            <span class="text-2xl">→</span>
          </div>
          <div class="mt-1 text-sm font-normal opacity-90">
            查看所有預約記錄
          </div>
        </NuxtLink>

        <NuxtLink
          to="/life/profile"
          class="
            block w-full rounded-lg bg-gray-500 px-4 py-4 text-left
            font-semibold text-white shadow transition-colors
            hover:bg-gray-600
          "
        >
          <div class="flex items-center justify-between">
            <span>個人資訊</span>
            <span class="text-2xl">→</span>
          </div>
          <div class="mt-1 text-sm font-normal opacity-90">
            管理個人聯絡資訊
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- 未登入狀態 -->
    <div
      v-else
      class="flex items-center justify-center pt-20"
    >
      <button
        type="button"
        class="
          rounded-lg bg-green-500 px-6 py-3 font-semibold text-white
          hover:bg-green-600
        "
        @click="login"
      >
        使用 LINE 登入
      </button>
    </div>
  </div>
</template>
