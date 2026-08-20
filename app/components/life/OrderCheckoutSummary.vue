<script lang="ts" setup>
import type { BookingOrder } from '~/types/booking'
import { SERVICE_PLAN_PRICE } from '~/types/booking'

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

// 服務方案中文 + 單價（與 OrderCard 同一份對應）
const SERVICE_PLAN_LABEL: Record<string, string> = {
  one_way: '單程運送',
  round_trip: '雙程套票',
  merchant: '商家代售',
}

const servicePlanLabel = computed(() => {
  const plan = props.order.servicePlan
  if (!plan)
    return '—'
  return SERVICE_PLAN_LABEL[plan] ?? plan
})

const subtotalAmount = computed<number | null>(() => {
  const plan = props.order.servicePlan
  if (!plan)
    return null
  const unit = SERVICE_PLAN_PRICE[plan]
  if (unit == null)
    return null
  return unit * (props.order.luggageCount ?? 0)
})

const paymentStatusLabel = computed(() => {
  const map: Record<string, string> = {
    unpaid: '未付款',
    paid: '已付款',
    no_refund_required: '無須退款',
    pending_refund: '待退款',
    refunding: '退款處理中',
    refunded: '已退款',
  }
  const ps = props.order.paymentStatus
  if (!ps)
    return '—'
  return map[ps] ?? ps
})
</script>

<template>
  <div class="flex flex-col bg-white">
    <button
      type="button"
      class="flex items-center gap-1 px-5 py-5"
      @click="isOpen = !isOpen"
    >
      <Icon
        name="lucide:wallet"
        class="text-sm text-neutral-900"
      />
      <h2 class="flex-1 text-left text-lg font-bold text-neutral-900">
        結帳明細
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
          <span class="min-w-[76px] shrink-0 text-neutral-600">服務方案</span>
          <span class="flex-1 text-right text-neutral-900">{{ servicePlanLabel }}</span>
        </div>
        <div class="flex items-center gap-2 text-base">
          <span class="min-w-[76px] shrink-0 text-neutral-600">數量</span>
          <span class="flex-1 text-right text-neutral-900">{{ order.luggageCount }} 件</span>
        </div>
        <div class="flex items-center gap-2 text-base">
          <span class="min-w-[76px] shrink-0 text-neutral-600">小計</span>
          <span class="flex-1 text-right text-neutral-900">
            <template v-if="subtotalAmount != null">
              NT$ {{ subtotalAmount.toLocaleString() }}
            </template>
            <template v-else>—</template>
          </span>
        </div>
        <div class="my-1 h-px bg-neutral-100"></div>
        <div class="flex items-center gap-2 text-base">
          <span class="min-w-[76px] shrink-0 text-neutral-600">付款狀態</span>
          <span class="flex-1 text-right text-neutral-900">{{ paymentStatusLabel }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>
