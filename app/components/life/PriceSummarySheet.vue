<script lang="ts" setup>
defineProps<{
  open: boolean
  isFormValid: boolean
}>()

const emit = defineEmits<{
  close: []
  submit: []
}>()

const bookingFormStore = useBookingFormStore()
</script>

<template>
  <Transition name="slide-up">
    <div
      v-if="open"
      class="absolute inset-x-0 bottom-0 z-10 flex flex-col"
    >
      <!-- 背景遮罩 -->
      <div
        class="absolute inset-0 -top-[100vh] bg-neutral-900/30"
        @click="emit('close')"
      ></div>
      <!-- 白色明細卡片 -->
      <div class="relative rounded-tl-2xl rounded-tr-2xl bg-white p-4">
        <!-- 標題列 -->
        <div class="mb-3 flex items-center justify-between">
          <span class="text-xl font-bold text-neutral-900">結帳明細</span>
          <button
            class="flex items-center justify-center p-2"
            @click="emit('close')"
          >
            <Icon
              name="lucide:x"
              class="text-2xl text-neutral-900"
            />
          </button>
        </div>
        <div class="mb-3 h-px bg-neutral-200"></div>
        <!-- 明細列表 -->
        <div class="flex flex-col gap-2 text-base">
          <div class="flex items-center justify-between">
            <span class="text-neutral-600">服務方案</span>
            <span class="text-neutral-900">{{ bookingFormStore.serviceType === 'round_trip' ? '雙程套票' : '單程運送' }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-neutral-600">單價</span>
            <span class="text-neutral-900">NT$ {{ bookingFormStore.unitPrice }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-neutral-600">行李數量</span>
            <span class="text-neutral-900">{{ bookingFormStore.luggageCount }} 件</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-neutral-600">總計</span>
            <span class="text-neutral-900">NT$ {{ bookingFormStore.totalPrice }}</span>
          </div>
        </div>
      </div>
      <!-- 底部列（neutral-100） -->
      <div
        class="
          relative flex items-center justify-between bg-neutral-100 px-4 py-4
          pb-6
        "
      >
        <button
          class="flex items-center gap-1"
          @click="emit('close')"
        >
          <span class="text-base text-neutral-600">總計</span>
          <span class="text-lg font-bold text-neutral-900">NT$ {{ bookingFormStore.totalPrice }}</span>
          <Icon
            name="lucide:chevron-down"
            class="text-xl text-neutral-900"
          />
        </button>
        <button
          class="rounded-sm px-5 py-3 text-base font-medium transition-colors"
          :class="isFormValid
            ? 'bg-primary-300 text-white'
            : 'bg-neutral-200 text-neutral-500'"
          :disabled="!isFormValid"
          @click="emit('submit')"
        >
          選擇付款方式
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.25s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
