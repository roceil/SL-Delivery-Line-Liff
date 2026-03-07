<script lang="ts" setup>
definePageMeta({
  layout: false,
  title: '個人資料',
})

const lineStore = useLineStore()
const profileStore = useProfileStore()
const { profile } = storeToRefs(profileStore)

const isSaving = ref(false)
const error = ref('')
const phoneNumber = ref('')
const email = ref('')

onMounted(async () => {
  await profileStore.initProfile()
})

watch(profile, (newProfile) => {
  if (!newProfile)
    return
  phoneNumber.value = newProfile.phoneNumber || ''
  email.value = newProfile.email || ''
}, { immediate: true })

const router = useRouter()

async function handleSave() {
  try {
    error.value = ''
    isSaving.value = true
    await profileStore.updateProfile({
      phoneNumber: phoneNumber.value || undefined,
      email: email.value || undefined,
    })
    router.back()
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : '儲存失敗，請稍後再試'
  }
  finally {
    isSaving.value = false
  }
}
</script>

<template>
  <NuxtLayout name="life-detail">
    <div class="flex flex-col gap-6 px-4 py-6">
      <!-- 頁面標題 -->
      <div class="flex items-center gap-2">
        <Icon
          name="lucide:user-round"
          class="size-5 text-neutral-900"
        />
        <h1 class="text-xl font-bold tracking-[1px] text-neutral-900">
          個人資料
        </h1>
      </div>

      <!-- 說明 -->
      <p class="px-2 text-sm leading-relaxed text-neutral-600">
        資料填寫完成後，將成為您的預設領件人資料，並在您預約時自動填入。
      </p>

      <!-- 表單卡片 -->
      <div
        class="
          flex flex-col gap-4 rounded-xl bg-white p-4
          shadow-[0px_4px_32px_0px_rgba(32,78,184,0.08)]
        "
      >
        <!-- 錯誤提示 -->
        <p
          v-if="error"
          class="rounded-lg bg-red-50 p-3 text-sm text-red-600"
        >
          {{ error }}
        </p>

        <!-- 真實姓名 -->
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium tracking-wide text-neutral-600">真實姓名</label>
          <input
            type="text"
            :value="lineStore.displayName"
            disabled
            class="
              w-full rounded-lg border border-neutral-200 bg-white px-3 py-2
              text-base leading-6 text-neutral-500 opacity-75 outline-none
            "
          >
        </div>

        <!-- 手機 -->
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium tracking-wide text-neutral-600">手機</label>
          <input
            v-model="phoneNumber"
            type="tel"
            placeholder="0912345678"
            class="
              w-full rounded-lg border border-neutral-200 bg-white px-3 py-2
              text-base leading-6 text-neutral-900 outline-none
              focus:border-primary-300
            "
          >
        </div>

        <!-- Email -->
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium tracking-wide text-neutral-600">Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="helloworld@gmail.com"
            class="
              w-full rounded-lg border border-neutral-200 bg-white px-3 py-2
              text-base leading-6 text-neutral-900 outline-none
              focus:border-primary-300
            "
          >
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
            :disabled="isSaving"
            class="
              flex-1 rounded-xl border border-neutral-200 bg-white py-3
              text-base font-medium tracking-wide text-neutral-900
              disabled:opacity-50
            "
            @click="router.back()"
          >
            取消
          </button>
          <button
            type="button"
            :disabled="isSaving"
            class="
              flex-1 rounded-xl bg-primary-300 py-3 text-base font-medium
              tracking-wide text-white
              disabled:opacity-50
            "
            @click="handleSave"
          >
            {{ isSaving ? '儲存中...' : '儲存' }}
          </button>
        </div>
      </div>
    </template>
  </NuxtLayout>
</template>
