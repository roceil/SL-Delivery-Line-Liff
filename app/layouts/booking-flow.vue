<script setup lang="ts">
const config = useRuntimeConfig()
const lineStore = useLineStore()

const isLoading = ref(true)
const initError = ref('')

onMounted(async () => {
  try {
    if (!lineStore.isInitialized)
      await lineStore.initLiff(config.public.liffId as string)

    if (!lineStore.isInitialized)
      initError.value = lineStore.error || 'LIFF 初始化失敗'
  }
  catch (err) {
    initError.value = err instanceof Error ? err.message : 'LIFF 初始化發生錯誤'
  }
  finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="h-screen overflow-hidden bg-neutral-100">
    <div
      v-if="isLoading"
      class="flex h-full items-center justify-center"
    >
      <span class="text-neutral-600">載入中...</span>
    </div>
    <div
      v-else-if="initError"
      class="
        flex h-full items-center justify-center p-4 text-center text-danger-300
      "
    >
      {{ initError }}
    </div>
    <slot v-else></slot>
  </div>
</template>
