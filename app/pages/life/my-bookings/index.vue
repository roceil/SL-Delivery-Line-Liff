<script lang="ts" setup>
definePageMeta({
  layout: 'life',
})

const bookingStore = useBookingStore()
const { orders, activeOrders, isLoading } = storeToRefs(bookingStore)

const PAGE_SIZE = 10

const currentTab = ref<'active' | 'completed' | 'cancelled'>('active')
const currentPage = ref(1)

const completedOrders = computed(() =>
  orders.value.filter(o => ['delivered', 'completed'].includes(o.status)),
)

const cancelledOrders = computed(() =>
  orders.value.filter(o => o.status === 'cancelled'),
)

const displayOrders = computed(() => {
  if (currentTab.value === 'active')
    return activeOrders.value
  if (currentTab.value === 'completed')
    return completedOrders.value
  return cancelledOrders.value
})

const totalPages = computed(() =>
  Math.ceil(displayOrders.value.length / PAGE_SIZE),
)

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return displayOrders.value.slice(start, start + PAGE_SIZE)
})

watch(currentTab, () => {
  currentPage.value = 1
})

const emptyMessage = computed(() => {
  if (currentTab.value === 'active')
    return '目前沒有進行中的訂單'
  if (currentTab.value === 'completed')
    return '目前沒有已完成的訂單'
  return '目前沒有已取消的訂單'
})

onMounted(async () => {
  await bookingStore.loadOrders()
})
</script>

<template>
  <div class="flex flex-col gap-6 px-4 py-6">
    <!-- 頁面標題 -->
    <div class="flex items-center gap-2">
      <Icon
        name="lucide:receipt"
        class="shrink-0 text-[20px] text-neutral-900"
      />
      <h1 class="flex-1 text-xl font-bold tracking-wide text-neutral-900">
        我的訂單
      </h1>
      <button
        v-if="!isLoading && displayOrders.length > 0"
        type="button"
        class="text-base font-medium text-primary-300"
      >
        找回訂單
      </button>
    </div>

    <!-- Tab 切換 -->
    <div
      class="flex items-center rounded-xs bg-white/80 p-1 shadow-sm"
    >
      <button
        type="button"
        class="
          flex flex-1 items-center justify-center gap-1 rounded-xs px-2 py-1
          text-sm font-medium transition-colors
        "
        :class="currentTab === 'active' ? 'bg-neutral-200 text-neutral-900' : `
          text-neutral-600
        `"
        @click="currentTab = 'active'"
      >
        <Icon
          name="lucide:truck"
          class="text-base"
        />
        進行中
      </button>
      <button
        type="button"
        class="
          flex flex-1 items-center justify-center gap-1 rounded-xs px-2 py-1
          text-sm font-medium transition-colors
        "
        :class="currentTab === 'completed' ? 'bg-neutral-200 text-neutral-900' : `
          text-neutral-600
        `"
        @click="currentTab = 'completed'"
      >
        <Icon
          name="lucide:circle-check"
          class="text-base"
        />
        已完成
      </button>
      <button
        type="button"
        class="
          flex flex-1 items-center justify-center gap-1 rounded-xs px-2 py-1
          text-sm font-medium transition-colors
        "
        :class="currentTab === 'cancelled' ? 'bg-neutral-200 text-neutral-900' : `
          text-neutral-600
        `"
        @click="currentTab = 'cancelled'"
      >
        <Icon
          name="lucide:circle-x"
          class="text-base"
        />
        已取消
      </button>
    </div>

    <!-- 載入中 -->
    <div
      v-if="isLoading"
      class="flex items-center justify-center py-12 text-neutral-600"
    >
      載入中...
    </div>

    <!-- 訂單列表 -->
    <div
      v-else-if="displayOrders.length > 0"
      class="flex flex-col gap-4"
    >
      <LifeOrderCard
        v-for="order in paginatedOrders"
        :key="order.id"
        :order="order"
      />

      <!-- 分頁 -->
      <div
        v-if="totalPages > 1"
        class="flex items-center justify-center"
      >
        <button
          type="button"
          class="flex items-center p-3 disabled:opacity-30"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          <Icon
            name="lucide:chevron-left"
            class="text-base text-neutral-900"
          />
        </button>

        <button
          v-for="page in totalPages"
          :key="page"
          type="button"
          class="flex size-10 items-center justify-center rounded-xs text-base font-bold"
          :class="page === currentPage ? 'text-primary-300' : 'text-neutral-500'"
          @click="currentPage = page"
        >
          {{ page }}
        </button>

        <button
          type="button"
          class="flex items-center p-3 disabled:opacity-30"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          <Icon
            name="lucide:chevron-right"
            class="text-base text-neutral-900"
          />
        </button>
      </div>
    </div>

    <!-- 空狀態 -->
    <div
      v-else
      class="
        flex flex-col items-center justify-center gap-3 rounded-sm border
        border-white p-6 shadow-down-100
      "
      style="background: linear-gradient(20deg, #ffffff 0%, rgba(255,255,255,0.5) 100%)"
    >
      <NuxtImg
        src="/empty_status.png"
        alt="空狀態"
        class="h-24 w-24"
      />
      <p class="text-base font-bold text-neutral-900">
        {{ emptyMessage }}
      </p>
      <NuxtLink
        v-if="currentTab === 'active'"
        to="/life/booking"
        class="
          rounded-sm bg-primary-300 px-4 py-2 text-base font-medium
          text-white
        "
      >
        馬上預約
      </NuxtLink>
    </div>

    <!-- 找回訂單提示（進行中空狀態才顯示） -->
    <div
      v-if="!isLoading && currentTab === 'active' && displayOrders.length === 0"
      class="flex items-center justify-between"
    >
      <span class="text-sm text-neutral-600">已送出預約但找不到訂單嗎？</span>
      <button
        type="button"
        class="text-sm font-medium text-primary-300"
      >
        找回訂單
      </button>
    </div>
  </div>
</template>
