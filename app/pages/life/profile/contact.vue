<script lang="ts" setup>
definePageMeta({
  layout: 'life-detail',
  title: '聯絡客服',
})
</script>

<template>
  <div class="flex min-h-full flex-col">
    <!-- 頂部 Banner -->
    <div
      class="
        flex h-[40dvh] flex-col items-center justify-center gap-2 bg-neutral-100
        px-4
      "
    >
      <div class="flex flex-col items-center gap-2">
        <img
          src="/payments/contact_us.svg"
          alt="Contact Support"
          class="h-[106px] w-[120px]"
        >
        <h1
          class="
            text-xl leading-[1.2] font-bold tracking-[1px] text-neutral-900
          "
        >
          聯絡客服
        </h1>
      </div>
      <div
        class="
          flex flex-col items-center gap-0.5 text-center text-sm leading-[1.5]
          text-neutral-600
        "
      >
        <p>若您需要任何協助，歡迎透過以下方式聯絡我們</p>
        <p>將由專人盡快為您服務</p>
      </div>
    </div>

    <!-- 聯絡資訊 -->
    <div
      class="
        flex h-[60dvh] flex-col gap-5 rounded-tl-3xl rounded-tr-3xl bg-white p-5
        shadow-[0px_4px_32px_0px_rgba(32,78,184,0.08)]
      "
    >
      <!-- 客服電話 -->
      <div class="flex flex-col gap-1">
        <p class="text-sm font-medium tracking-wide text-neutral-600">
          客服電話
        </p>
        <a
          href="tel:081234567"
          class="
            flex items-center gap-2 rounded-xl border border-neutral-300 px-5
            py-3
          "
        >
          <Icon
            name="lucide:phone-outgoing"
            class="size-4 text-primary-300"
          />
          <span
            class="
              text-base leading-[1.5] font-medium tracking-wide text-primary-300
            "
          >08-1234567</span>
        </a>
      </div>

      <!-- 客服信箱 -->
      <div class="flex flex-col gap-1">
        <p class="text-sm font-medium tracking-wide text-neutral-600">
          客服信箱
        </p>
        <a
          href="mailto:hello@gmail.com"
          class="
            flex items-center gap-2 rounded-xl border border-neutral-300 px-5
            py-3
          "
        >
          <Icon
            name="lucide:mail"
            class="size-4 text-primary-300"
          />
          <span
            class="
              text-base leading-[1.5] font-medium tracking-wide text-primary-300
            "
          >hello@gmail.com</span>
        </a>
      </div>

      <!-- 聯絡地址 -->
      <div class="flex flex-col gap-1">
        <p class="text-sm font-medium tracking-wide text-neutral-600">
          聯絡地址
        </p>
        <a
          href="https://maps.google.com/?q=屏東縣琉球鄉三民路161號"
          target="_blank"
          rel="noopener noreferrer"
          class="
            flex items-center gap-2 rounded-xl border border-neutral-300 px-5
            py-3
          "
        >
          <Icon
            name="lucide:map-pin"
            class="size-4 text-primary-300"
          />
          <span
            class="
              text-base leading-[1.5] font-medium tracking-wide text-primary-300
            "
          >屏東縣琉球鄉三民路 161 號</span>
        </a>
      </div>
    </div>
  </div>
</template>
