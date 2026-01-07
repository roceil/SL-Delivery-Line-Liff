<script lang="ts" setup>
definePageMeta({
  layout: false, // 不使用預設 layout
})

const lineStore = useLineStore()
const { initLiff, login } = lineStore
const { isInitialized, isLoggedIn, user, error } = storeToRefs(lineStore)

const config = useRuntimeConfig()
const isLoading = ref(true)

onMounted(async () => {
  await initLiff(config.public.liffId as string)
  isLoading.value = false

  // 如果未登入，自動觸發登入
  if (isInitialized.value && !isLoggedIn.value)
    login()
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
            <p
              v-if="user.statusMessage"
              class="text-sm text-gray-600"
            >
              {{ user.statusMessage }}
            </p>
          </div>
        </div>
      </div>

      <div class="space-y-3">
        <button
          class="w-full rounded-lg bg-green-500 px-4 py-3 font-semibold text-white hover:bg-green-600"
          @click="() => {}"
        >
          功能按鈕 1
        </button>
        <button
          class="w-full rounded-lg bg-blue-500 px-4 py-3 font-semibold text-white hover:bg-blue-600"
          @click="() => {}"
        >
          功能按鈕 2
        </button>
      </div>
    </div>

    <!-- 未登入狀態（通常不會顯示，因為會自動觸發登入） -->
    <div
      v-else
      class="flex items-center justify-center pt-20"
    >
      <button
        class="rounded-lg bg-green-500 px-6 py-3 font-semibold text-white hover:bg-green-600"
        @click="login"
      >
        使用 LINE 登入
      </button>
    </div>
  </div>
</template>

<style scoped></style>
