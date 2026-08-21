<script lang="ts" setup>
defineProps<{
  open: boolean
  isCancelling: boolean
  errorMessage: string
}>()

const emit = defineEmits<{
  close: []
  confirm: []
}>()
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    @click.self="emit('close')"
  >
    <div class="w-full max-w-sm rounded-sm bg-white p-6 shadow-down-200">
      <h3 class="mb-4 text-lg font-bold text-neutral-900">
        確認取消訂單
      </h3>
      <p class="mb-4 text-base text-neutral-600">
        確定要取消此訂單嗎？此操作無法復原。
      </p>
      <div
        v-if="errorMessage"
        class="mb-4 rounded-sm bg-danger-100 p-3 text-sm text-danger-300"
      >
        {{ errorMessage }}
      </div>
      <div class="flex gap-3">
        <button
          type="button"
          class="
            flex-1 rounded-sm border border-neutral-200 py-2.5 text-base
            font-medium text-neutral-900
          "
          :disabled="isCancelling"
          @click="emit('close')"
        >
          不，返回
        </button>
        <button
          type="button"
          class="
            flex-1 rounded-sm bg-danger-300 py-2.5 text-base font-medium
            text-white
            disabled:opacity-50
          "
          :disabled="isCancelling"
          @click="emit('confirm')"
        >
          {{ isCancelling ? '處理中...' : '確定取消' }}
        </button>
      </div>
    </div>
  </div>
</template>
