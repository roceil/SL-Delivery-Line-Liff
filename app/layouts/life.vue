<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()
const lineStore = useLineStore()

const title = computed(() => route.meta.title as string || '')
const isLoading = ref(true)
const initError = ref('')

// 導航項目
const navItems = [
  { name: '首頁', path: '/life', icon: 'carbon:home' },
  { name: '預約', path: '/life/booking', icon: 'carbon:calendar' },
  { name: '查詢', path: '/life/query', icon: 'carbon:search' },
  { name: '我的訂單', path: '/life/my-bookings', icon: 'carbon:receipt' },
  { name: '個人資料', path: '/life/profile', icon: 'carbon:user' },
]

// 初始化 LIFF
onMounted(async () => {
  try {
    if (!lineStore.isInitialized) {
      await lineStore.initLiff(config.public.liffId as string)
    }

    // 檢查初始化是否成功
    if (!lineStore.isInitialized) {
      initError.value = lineStore.error || 'LIFF 初始化失敗'
    }
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
  <div class="min-h-screen bg-gray-50 pb-20">
    <!-- Loading 狀態 -->
    <div
      v-if="isLoading"
      class="flex items-center justify-center pt-20"
    >
      <div class="text-gray-600">
        載入中...
      </div>
    </div>

    <!-- 已載入狀態 -->
    <template v-else>
      <div class="p-4 pt-0">
        <h1
          v-if="title"
          class="mb-4 text-2xl font-bold text-gray-800"
        >
          {{ title }}
        </h1>

        <!-- Content -->
        <slot></slot>
      </div>

      <!-- Fixed Footer Navigation -->
      <nav
        class="
          fixed right-0 bottom-1 left-0 border-t border-gray-200 bg-white
          shadow-lg
        "
      >
        <div class="flex items-center justify-around">
          <NuxtLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="
              flex flex-1 flex-col items-center justify-center gap-1 px-3 py-2
              ring-1 transition-colors duration-200
            "
            :class="[
              route.path === item.path || (item.path !== '/life' && route.path.startsWith(item.path))
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-800',
            ]"
          >
            <Icon
              :name="item.icon"
              class="text-2xl"
            />
            <span class="text-xs">{{ item.name }}</span>
          </NuxtLink>
        </div>
      </nav>
    </template>
  </div>
</template>
