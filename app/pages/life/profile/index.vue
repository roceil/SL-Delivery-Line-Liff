<script lang="ts" setup>
definePageMeta({
  layout: 'life',
  title: '我的',
})

const lineStore = useLineStore()
const profileStore = useProfileStore()
const { profile } = storeToRefs(profileStore)

const notificationEnabled = ref(true)

onMounted(async () => {
  await profileStore.initProfile()
})
</script>

<template>
  <div class="flex flex-col gap-6 px-4 py-6">
    <!-- 個人資料卡 -->
    <div
      class="
        flex items-center gap-3 overflow-hidden rounded-xl border border-white
        px-4 py-4
      "
      style="background: rgba(255,255,255,0.4);"
    >
      <div class="size-12 shrink-0 overflow-hidden rounded-full">
        <img
          v-if="lineStore.pictureUrl"
          :src="lineStore.pictureUrl"
          :alt="lineStore.displayName"
          class="size-full object-cover"
        >
        <div
          v-else
          class="flex size-full items-center justify-center bg-neutral-200"
        >
          <Icon
            name="lucide:user"
            class="size-6 text-neutral-500"
          />
        </div>
      </div>

      <div class="flex min-w-0 flex-1 flex-col gap-1">
        <div
          class="
            flex items-center gap-1 text-base font-bold tracking-wide
            text-neutral-900
          "
        >
          <span>Hi,</span>
          <span>{{ lineStore.displayName || '使用者' }}</span>
        </div>
        <p
          v-if="profile"
          class="text-sm tracking-wide text-neutral-600"
        >
          歡迎使用你行李來！
        </p>
      </div>

      <button
        class="
          flex size-8 shrink-0 items-center justify-center rounded-full
          shadow-[0px_4px_32px_0px_rgba(32,78,184,0.08)]
        "
        style="background: linear-gradient(31deg, #fff 0%, rgba(255,255,255,0.5) 100%);"
      >
        <Icon
          name="lucide:bell"
          class="size-4 text-neutral-700"
        />
      </button>
    </div>

    <!-- 設定 -->
    <div class="flex flex-col gap-1">
      <div class="px-2 text-sm font-medium tracking-wide text-neutral-600">
        設定
      </div>
      <div
        class="overflow-hidden rounded-xl"
        style="background: linear-gradient(16deg, #fff 0%, rgba(255,255,255,0.5) 100%);"
      >
        <NuxtLink
          to="/life/profile/personal-info"
          class="flex items-center gap-2 border-b border-neutral-100 p-4"
        >
          <Icon
            name="lucide:user-round"
            class="size-5 text-neutral-900"
          />
          <span
            class="flex-1 text-sm font-medium tracking-wide text-neutral-900"
          >個人資料</span>
          <Icon
            name="lucide:chevron-right"
            class="size-5 text-neutral-400"
          />
        </NuxtLink>

        <NuxtLink
          to="/life/profile/payment"
          class="flex items-center gap-2 border-b border-neutral-100 p-4"
        >
          <Icon
            name="lucide:wallet"
            class="size-5 text-neutral-900"
          />
          <span
            class="flex-1 text-sm font-medium tracking-wide text-neutral-900"
          >付款方式</span>
          <Icon
            name="lucide:chevron-right"
            class="size-5 text-neutral-400"
          />
        </NuxtLink>

        <!-- <div class="flex items-center gap-2 p-4">
          <Icon
            name="lucide:bell-ring"
            class="size-5 text-neutral-900"
          />
          <span
            class="flex-1 text-sm font-medium tracking-wide text-neutral-900"
          >推播通知</span>
          <button
            class="relative h-6 w-11 rounded-full transition-colors"
            :class="notificationEnabled ? 'bg-primary-300' : 'bg-neutral-300'"
            @click="notificationEnabled = !notificationEnabled"
          >
            <span
              class="
                absolute top-0.5 size-5 rounded-full bg-white shadow
                transition-transform
              "
              :class="notificationEnabled ? 'translate-x-5' : 'translate-x-0.5'"
            ></span>
          </button>
        </div> -->
      </div>
    </div>

    <!-- 幫助中心 -->
    <div class="flex flex-col gap-1">
      <div class="px-2 text-sm font-medium tracking-wide text-neutral-600">
        幫助中心
      </div>
      <div
        class="overflow-hidden rounded-xl"
        style="background: linear-gradient(11deg, #fff 0%, rgba(255,255,255,0.5) 100%);"
      >
        <NuxtLink
          to="/life/profile/faq"
          class="flex items-center gap-2 border-b border-neutral-100 p-4"
        >
          <Icon
            name="lucide:circle-help"
            class="size-5 text-neutral-900"
          />
          <span
            class="flex-1 text-sm font-medium tracking-wide text-neutral-900"
          >常見問題</span>
          <Icon
            name="lucide:chevron-right"
            class="size-5 text-neutral-400"
          />
        </NuxtLink>

        <NuxtLink
          to="/life/profile/contact"
          class="flex items-center gap-2 p-4"
        >
          <Icon
            name="lucide:headset"
            class="size-5 text-neutral-900"
          />
          <span
            class="flex-1 text-sm font-medium tracking-wide text-neutral-900"
          >聯絡客服</span>
          <Icon
            name="lucide:chevron-right"
            class="size-5 text-neutral-400"
          />
        </NuxtLink>
      </div>
    </div>

    <!-- 其他 -->
    <!-- <div class="flex flex-col gap-1">
      <div class="px-2 text-sm font-medium tracking-wide text-neutral-600">
        其他
      </div>
      <div
        class="overflow-hidden rounded-xl"
        style="background: linear-gradient(5deg, #fff 0%, rgba(255,255,255,0.5) 100%);"
      >
        <NuxtLink
          to="/life/profile/about"
          class="flex items-center gap-2 p-4"
        >
          <Icon
            name="lucide:info"
            class="size-5 text-neutral-900"
          />
          <span
            class="flex-1 text-sm font-medium tracking-wide text-neutral-900"
          >關於我們</span>
          <Icon
            name="lucide:chevron-right"
            class="size-5 text-neutral-400"
          />
        </NuxtLink>
      </div>
    </div> -->
  </div>
</template>
