<script lang="ts" setup>
definePageMeta({
  layout: 'life',
  title: '個人資訊',
})

const profileStore = useProfileStore()
const { profile } = storeToRefs(profileStore)

const isEditing = ref(false)
const isSaving = ref(false)
const phoneNumber = ref('')
const email = ref('')
const error = ref('')

// 載入個人資料
onMounted(async () => {
  await profileStore.initProfile()
})

// 初始化表單
watch(profile, (newProfile) => {
  if (newProfile) {
    phoneNumber.value = newProfile.phoneNumber || ''
    email.value = newProfile.email || ''
  }
}, { immediate: true })

function startEditing() {
  isEditing.value = true
  error.value = ''
}

function cancelEditing() {
  isEditing.value = false
  error.value = ''
  // 重置表單
  if (profile.value) {
    phoneNumber.value = profile.value.phoneNumber || ''
    email.value = profile.value.email || ''
  }
}

async function saveProfile() {
  try {
    error.value = ''
    isSaving.value = true

    await profileStore.updateProfile({
      phoneNumber: phoneNumber.value || undefined,
      email: email.value || undefined,
    })

    isEditing.value = false
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
  <div
    v-if="profile"
    class="space-y-4"
  >
    <!-- 錯誤提示 -->
    <div
      v-if="error"
      class="rounded-lg bg-red-50 p-4 text-sm text-red-600"
    >
      {{ error }}
    </div>

    <!-- 個人資訊卡片 -->
    <div class="rounded-lg bg-white p-6 shadow">
      <form
        class="space-y-4"
        @submit.prevent="saveProfile"
      >
        <!-- 顯示名稱（不可編輯） -->
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700">
            名稱（來自 LINE）
          </label>
          <input
            type="text"
            :value="profile.displayName"
            disabled
            class="
              w-full cursor-not-allowed rounded-lg border border-gray-300
              bg-gray-100 px-4 py-2 text-gray-600
            "
          >
        </div>

        <!-- 電話號碼 -->
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700">
            電話號碼
          </label>
          <input
            v-model="phoneNumber"
            type="tel"
            :disabled="!isEditing"
            placeholder="例如：0912345678"
            class="
              w-full rounded-lg border border-gray-300 bg-white px-4 py-2
              text-gray-800
              focus:border-blue-500 focus:ring-2 focus:ring-blue-500
              focus:outline-none
              disabled:cursor-not-allowed disabled:bg-gray-100
              disabled:text-gray-600
            "
          >
          <p class="mt-1 text-xs text-gray-500">
            格式：09xx-xxxxxx 或 09xxxxxxxx
          </p>
        </div>

        <!-- 信箱 -->
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700">
            信箱
          </label>
          <input
            v-model="email"
            type="email"
            :disabled="!isEditing"
            placeholder="例如：example@email.com"
            class="
              w-full rounded-lg border border-gray-300 bg-white px-4 py-2
              text-gray-800
              focus:border-blue-500 focus:ring-2 focus:ring-blue-500
              focus:outline-none
              disabled:cursor-not-allowed disabled:bg-gray-100
              disabled:text-gray-600
            "
          >
        </div>

        <!-- 操作按鈕 -->
        <div
          v-if="!isEditing"
          class="flex gap-3"
        >
          <button
            type="button"
            class="
              w-full rounded-lg bg-blue-500 px-4 py-3 font-semibold text-white
              shadow transition-colors
              hover:bg-blue-600
            "
            @click="startEditing"
          >
            編輯資料
          </button>
        </div>

        <div
          v-else
          class="flex gap-3"
        >
          <button
            type="button"
            :disabled="isSaving"
            class="
              flex-1 rounded-lg bg-gray-200 px-4 py-3 font-semibold
              text-gray-800 shadow transition-colors
              hover:bg-gray-300
              disabled:cursor-not-allowed disabled:opacity-50
            "
            @click="cancelEditing"
          >
            取消
          </button>
          <button
            type="submit"
            :disabled="isSaving"
            class="
              flex-1 rounded-lg bg-green-500 px-4 py-3 font-semibold text-white
              shadow transition-colors
              hover:bg-green-600
              disabled:cursor-not-allowed disabled:opacity-50
            "
          >
            {{ isSaving ? '儲存中...' : '儲存' }}
          </button>
        </div>
      </form>

      <!-- 更新時間 -->
      <div
        v-if="profile.updatedAt"
        class="
          mt-4 border-t border-gray-200 pt-4 text-center text-xs text-gray-500
        "
      >
        最後更新: {{ new Date(profile.updatedAt).toLocaleString('zh-TW') }}
      </div>
    </div>
  </div>

  <!-- 載入中 -->
  <div
    v-else
    class="rounded-lg bg-white p-8 text-center shadow"
  >
    <div class="text-gray-600">
      載入中...
    </div>
  </div>
</template>
