<script lang="ts" setup>
definePageMeta({
  layout: false,
  title: '付款方式',
})

const selectedMethod = ref<'credit-card' | 'line-pay' | 'apple-pay'>('credit-card')
const cardNumber = ref('')
const cardHolder = ref('')
const expiry = ref('')
const cvv = ref('')
</script>

<template>
  <NuxtLayout name="life-detail">
    <div class="flex flex-col gap-6 px-4 py-6">
      <!-- 頁面標題 -->
      <div class="flex items-center gap-2">
        <Icon
          name="lucide:wallet"
          class="size-5 text-neutral-900"
        />
        <h1 class="text-xl font-bold tracking-[1px] text-neutral-900">
          付款方式
        </h1>
      </div>

      <!-- 說明 -->
      <p class="px-2 text-sm leading-relaxed text-neutral-600">
        資料填寫完成後，將成為您的預設付款方式，並在填寫預約資料時自動填入。
      </p>

      <!-- 付款方式選擇 -->
      <div
        class="
          flex flex-col gap-4 rounded-xl bg-white p-4
          shadow-[0px_4px_32px_0px_rgba(32,78,184,0.08)]
        "
      >
        <!-- 區塊標題 -->
        <div class="flex items-center gap-2">
          <div
            class="h-5 w-1 shrink-0 rounded"
            style="background: linear-gradient(100deg, #4090E8 16%, #306CF7 62%);"
          ></div>
          <span class="text-base font-bold tracking-wide text-neutral-900">付款方式</span>
        </div>

        <!-- 選項 -->
        <div class="flex flex-col gap-3">
          <!-- 信用卡/金融卡 -->
          <button
            class="
              flex items-center gap-2 rounded-xl border p-4 text-left
              transition-colors
            "
            :class="selectedMethod === 'credit-card' ? 'border-[#4090e8]' : `
              border-neutral-200
            `"
            @click="selectedMethod = 'credit-card'"
          >
            <div
              class="
                flex size-5 shrink-0 items-center justify-center rounded-full
              "
              :class="selectedMethod === 'credit-card' ? `
                bg-gradient-to-br from-[#4090E8] to-[#306CF7]
              ` : `border border-neutral-300 bg-white`"
            >
              <div
                v-if="selectedMethod === 'credit-card'"
                class="size-2 rounded-full bg-white"
              ></div>
            </div>
            <span class="flex-1 text-base font-medium text-neutral-900">信用卡/金融卡</span>
            <div class="flex items-center gap-1">
              <NuxtImg
                src="/payments/Visa.png"
                alt="Visa"
                class="h-6"
              />
              <NuxtImg
                src="/payments/Mastercard.png"
                alt="Mastercard"
                class="h-6"
              />
            </div>
          </button>

          <!-- Line Pay -->
          <button
            class="
              flex items-center gap-2 rounded-xl border p-4 text-left
              transition-colors
            "
            :class="selectedMethod === 'line-pay' ? 'border-[#4090e8]' : `
              border-neutral-200
            `"
            @click="selectedMethod = 'line-pay'"
          >
            <div
              class="
                flex size-5 shrink-0 items-center justify-center rounded-full
              "
              :class="selectedMethod === 'line-pay' ? `
                bg-gradient-to-br from-[#4090E8] to-[#306CF7]
              ` : `border border-neutral-300 bg-white`"
            >
              <div
                v-if="selectedMethod === 'line-pay'"
                class="size-2 rounded-full bg-white"
              ></div>
            </div>
            <span class="flex-1 text-base font-medium text-neutral-900">Line Pay</span>
            <NuxtImg
              src="/payments/LinePay.png"
              alt="Line Pay"
              class="h-4"
            />
          </button>

          <!-- Apple Pay -->
          <button
            class="
              flex items-center gap-2 rounded-xl border p-4 text-left
              transition-colors
            "
            :class="selectedMethod === 'apple-pay' ? 'border-[#4090e8]' : `
              border-neutral-200
            `"
            @click="selectedMethod = 'apple-pay'"
          >
            <div
              class="
                flex size-5 shrink-0 items-center justify-center rounded-full
              "
              :class="selectedMethod === 'apple-pay' ? `
                bg-gradient-to-br from-[#4090E8] to-[#306CF7]
              ` : `border border-neutral-300 bg-white`"
            >
              <div
                v-if="selectedMethod === 'apple-pay'"
                class="size-2 rounded-full bg-white"
              ></div>
            </div>
            <span class="flex-1 text-base font-medium text-neutral-900">Apple Pay</span>
            <NuxtImg
              src="/payments/ApplePay.png"
              alt="Apple Pay"
              class="h-6"
            />
          </button>
        </div>
      </div>

      <!-- 付款資訊（信用卡時顯示） -->
      <div
        v-if="selectedMethod === 'credit-card'"
        class="
          flex flex-col gap-4 rounded-xl bg-white p-4
          shadow-[0px_4px_32px_0px_rgba(32,78,184,0.08)]
        "
      >
        <!-- 區塊標題 -->
        <div class="flex items-center gap-2">
          <div
            class="h-5 w-1 shrink-0 rounded"
            style="background: linear-gradient(100deg, #4090E8 16%, #306CF7 62%);"
          ></div>
          <span class="text-base font-bold tracking-wide text-neutral-900">付款資訊</span>
        </div>

        <!-- 信用卡號碼 -->
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium tracking-wide text-neutral-600">信用卡號碼</label>
          <input
            v-model="cardNumber"
            type="text"
            placeholder="1234 - 5678 - 1234 - 5678"
            inputmode="numeric"
            class="
              w-full rounded-lg border border-neutral-200 bg-white px-3 py-2
              text-base text-neutral-900 opacity-75 outline-none
              focus:border-primary-300 focus:opacity-100
            "
          >
        </div>

        <!-- 持卡人姓名 -->
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium tracking-wide text-neutral-600">持卡人姓名</label>
          <input
            v-model="cardHolder"
            type="text"
            placeholder="持卡人姓名"
            class="
              w-full rounded-lg border border-neutral-200 bg-white px-3 py-2
              text-base text-neutral-900 opacity-75 outline-none
              focus:border-primary-300 focus:opacity-100
            "
          >
        </div>

        <!-- 到期日 & CVV -->
        <div class="flex gap-3">
          <div class="flex flex-1 flex-col gap-1">
            <label class="text-sm font-medium tracking-wide text-neutral-600">到期日</label>
            <input
              v-model="expiry"
              type="text"
              placeholder="MM/YY"
              class="
                w-full rounded-lg border border-neutral-200 bg-white px-3 py-2
                text-base text-neutral-900 opacity-75 outline-none
                focus:border-primary-300 focus:opacity-100
              "
            >
          </div>
          <div class="flex flex-1 flex-col gap-1">
            <label class="text-sm font-medium tracking-wide text-neutral-600">安全碼(CVV)</label>
            <input
              v-model="cvv"
              type="text"
              placeholder="123"
              inputmode="numeric"
              class="
                w-full rounded-lg border border-neutral-200 bg-white px-3 py-2
                text-base text-neutral-900 opacity-75 outline-none
                focus:border-primary-300 focus:opacity-100
              "
            >
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div
        class="
          shrink-0 overflow-hidden rounded-tl-3xl rounded-tr-3xl border
          border-white shadow-[0px_-4px_12px_0px_rgba(33,37,41,0.04)]
        "
        style="background: linear-gradient(9.7deg, #fff 0%, rgba(255,255,255,0.4) 100%); padding-bottom: env(safe-area-inset-bottom);"
      >
        <div class="flex gap-2 px-5 py-3">
          <button
            type="button"
            class="
              flex-1 rounded-xl border border-neutral-200 bg-white py-3
              text-base font-medium text-neutral-900
            "
            @click="$router.back()"
          >
            取消
          </button>
          <button
            type="button"
            class="
              flex-1 rounded-xl bg-primary-300 py-3 text-base font-medium
              text-white
            "
          >
            儲存
          </button>
        </div>
      </div>
    </template>
  </NuxtLayout>
</template>
