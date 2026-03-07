<script lang="ts" setup>
definePageMeta({
  layout: 'life-detail',
  title: '常見問題',
})

const faqItems = [
  {
    id: 'booking',
    question: '預約方式',
    answer: [
      { title: '線上預約', content: '建議最晚於使用日前一天 22:00 前完成線上預約，以確保物流車位並享有官網早鳥價。' },
      { title: '合作平台購買', content: '您也可以在 KKday、Klook、Trip.com 購買。抵達門市時，出示該 App 內的電子憑證 (QR Code) 即可快速核對。' },
      { title: '現場寄件', content: '現場依原價計費（無套票優惠），且需視當日貨量狀況而定，建議優先線上預約。' },
    ],
  },
  {
    id: 'delivery',
    question: '交件與取件',
    answer: null,
  },
  {
    id: 'pricing',
    question: '計價方式',
    answer: null,
  },
  {
    id: 'ferry',
    question: '船班/延誤/停航',
    answer: null,
  },
  {
    id: 'luggage',
    question: '行李規格與禁運規則',
    answer: null,
  },
  {
    id: 'cancel',
    question: '取消/改期/退款',
    answer: null,
  },
  {
    id: 'order',
    question: '如何查詢訂單',
    answer: null,
  },
  {
    id: 'contact',
    question: '客服與聯絡方式',
    answer: null,
  },
]

const openItemId = ref<string>('booking')

function toggleItem(id: string) {
  if (openItemId.value === id) {
    openItemId.value = ''
    return
  }
  openItemId.value = id
}
</script>

<template>
  <div class="flex flex-col gap-6 px-4 py-6">
    <!-- 頁面標題 -->
    <div class="flex items-center gap-2">
      <Icon
        name="lucide:circle-help"
        class="size-5 text-neutral-900"
      />
      <h1 class="text-xl font-bold tracking-[1px] text-neutral-900">
        常見問題
      </h1>
    </div>

    <!-- FAQ 手風琴 -->
    <div
      class="
        overflow-hidden rounded-xl bg-white
        shadow-[0px_4px_32px_0px_rgba(32,78,184,0.08)]
      "
    >
      <div
        v-for="(item, index) in faqItems"
        :key="item.id"
        class="border-b border-neutral-200 last:border-b-0"
      >
        <!-- 問題行 -->
        <button
          class="
            flex w-full items-center justify-between px-4 py-3 text-left
            transition-colors
          "
          :class="openItemId === item.id ? 'bg-primary-300' : 'bg-white'"
          @click="toggleItem(item.id)"
        >
          <span
            class="text-base font-medium tracking-wide"
            :class="openItemId === item.id ? 'text-white' : 'text-neutral-900'"
          >
            {{ item.question }}
          </span>
          <Icon
            :name="openItemId === item.id ? 'lucide:chevron-up' : 'lucide:chevron-down'"
            class="size-5 shrink-0"
            :class="openItemId === item.id ? 'text-white' : 'text-neutral-500'"
          />
        </button>

        <!-- 答案內容 -->
        <div
          v-if="openItemId === item.id && item.answer"
          class="border-t border-neutral-200 px-4 py-3"
        >
          <ul class="list-disc space-y-2 pl-5">
            <li
              v-for="point in item.answer"
              :key="point.title"
              class="text-base"
            >
              <p class="leading-[1.2] font-bold text-neutral-900">
                {{ point.title }}
              </p>
              <p class="mt-1 leading-[1.5] text-neutral-600">
                {{ point.content }}
              </p>
            </li>
          </ul>
        </div>

        <!-- 尚無資料 -->
        <div
          v-else-if="openItemId === item.id && !item.answer"
          class="border-t border-neutral-200 px-4 py-3 text-sm text-neutral-500"
        >
          內容整理中，敬請期待。
        </div>
      </div>
    </div>

    <!-- 底部說明 -->
    <p class="px-2 text-sm leading-[1.5] text-neutral-600">
      若您需要更進一步的協助，請洽詢服務專線 08-1234567
    </p>
  </div>
</template>
