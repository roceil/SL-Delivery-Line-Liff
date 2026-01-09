<script lang="ts" setup>
definePageMeta({
  layout: 'life',
  title: '我的預約',
})

const bookingStore = useBookingStore()
const { activeOrders, completedOrders, isLoading } = storeToRefs(bookingStore)

const currentTab = ref<'active' | 'completed'>('active')

const displayOrders = computed(() => {
  return currentTab.value === 'active' ? activeOrders.value : completedOrders.value
})

// 頁面載入時從 API 載入訂單
onMounted(async () => {
  await bookingStore.loadOrders()
})
</script>

<template>
  <div>
    <!-- 載入中 -->
    <div
      v-if="isLoading"
      class="rounded-lg bg-white p-8 text-center shadow"
    >
      <div class="text-gray-600">
        載入中...
      </div>
    </div>

    <!-- 訂單內容 -->
    <div v-else>
      <!-- Tab 切換 -->
      <div class="mb-6 flex gap-2 rounded-lg bg-white p-1 shadow">
        <button
          type="button"
          class="
            flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors
          "
          :class="[
            currentTab === 'active'
              ? 'bg-purple-500 text-white'
              : 'text-gray-600 hover:text-gray-800',
          ]"
          @click="currentTab = 'active'"
        >
          進行中
          <span
            v-if="activeOrders.length > 0"
            class="ml-1 text-xs"
          >
            ({{ activeOrders.length }})
          </span>
        </button>

        <button
          type="button"
          class="
            flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors
          "
          :class="[
            currentTab === 'completed'
              ? 'bg-purple-500 text-white'
              : 'text-gray-600 hover:text-gray-800',
          ]"
          @click="currentTab = 'completed'"
        >
          已完成
          <span
            v-if="completedOrders.length > 0"
            class="ml-1 text-xs"
          >
            ({{ completedOrders.length }})
          </span>
        </button>
      </div>

      <!-- 訂單列表 -->
      <div
        v-if="displayOrders.length > 0"
        class="space-y-3"
      >
        <LifeOrderCard
          v-for="order in displayOrders"
          :key="order.id"
          :order="order"
        />
      </div>

      <!-- 空狀態 -->
      <div
        v-else
        class="rounded-lg bg-white p-8 text-center shadow"
      >
        <div class="text-gray-400">
          <div class="mb-2 text-5xl">
            📦
          </div>
          <p class="text-gray-600">
            {{ currentTab === 'active' ? '目前沒有進行中的訂單' : '目前沒有已完成的訂單' }}
          </p>
          <NuxtLink
            v-if="currentTab === 'active'"
            to="/life/booking"
            class="
              mt-4 inline-block rounded-lg bg-green-500 px-6 py-2 text-white
              hover:bg-green-600
            "
          >
            立即預約
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
