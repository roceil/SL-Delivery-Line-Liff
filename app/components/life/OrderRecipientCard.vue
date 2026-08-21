<script lang="ts" setup>
import type { BookingOrder } from '~/types/booking'

const props = defineProps<{
  order: BookingOrder
}>()

const {
  onAccordionEnter,
  onAccordionAfterEnter,
  onAccordionLeave,
  onAccordionAfterLeave,
} = useAccordionTransition()

const isOpen = ref(false)

const recipientNameDisplay = computed(() =>
  props.order.recipientName?.trim() || props.order.userName || '—',
)

const recipientPhoneDisplay = computed(() =>
  props.order.recipientPhone?.trim() || props.order.phone || '—',
)
</script>

<template>
  <div class="flex flex-col bg-white pb-[106px]">
    <button
      type="button"
      class="flex items-center gap-1 px-5 py-5"
      @click="isOpen = !isOpen"
    >
      <Icon
        name="lucide:user"
        class="text-sm text-neutral-900"
      />
      <h2 class="flex-1 text-left text-lg font-bold text-neutral-900">
        領件人
      </h2>
      <Icon
        :name="isOpen ? 'lucide:chevron-up' : 'lucide:chevron-down'"
        class="text-2xl text-neutral-600"
      />
    </button>
    <Transition
      @enter="onAccordionEnter"
      @after-enter="onAccordionAfterEnter"
      @leave="onAccordionLeave"
      @after-leave="onAccordionAfterLeave"
    >
      <div
        v-show="isOpen"
        class="flex flex-col gap-2 px-5 pb-5"
      >
        <div class="flex items-center gap-2 text-base">
          <span class="min-w-[76px] shrink-0 text-neutral-600">姓名</span>
          <span class="flex-1 text-right text-neutral-900">{{ recipientNameDisplay }}</span>
        </div>
        <div class="flex items-center gap-2 text-base">
          <span class="min-w-[76px] shrink-0 text-neutral-600">聯絡電話</span>
          <span class="flex-1 text-right text-neutral-900">{{ recipientPhoneDisplay }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>
