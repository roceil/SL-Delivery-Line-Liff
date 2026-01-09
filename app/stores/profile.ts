import type { UserProfile } from '~/types/booking'

export const useProfileStore = defineStore('profile', () => {
  // State
  const profile = ref<UserProfile | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const hasProfile = computed(() => profile.value !== null)
  const phoneNumber = computed(() => profile.value?.phoneNumber ?? '')
  const email = computed(() => profile.value?.email ?? '')

  // Actions
  async function initProfile() {
    const lineStore = useLineStore()

    if (!lineStore.userId)
      return

    try {
      isLoading.value = true
      error.value = null

      // 從 API 載入使用者資料
      const response = await $fetch<{
        userId: number
        lineUserId: string
        displayName: string
        phone: string | null
        email: string | null
        memberLevel: number
        createdAt: string
        updatedAt: string
      }>(`/api/users/${lineStore.userId}`)

      profile.value = {
        userId: response.lineUserId,
        displayName: response.displayName,
        phoneNumber: response.phone || undefined,
        email: response.email || undefined,
        updatedAt: response.updatedAt,
      }
    }
    catch (err: any) {
      // 如果使用者不存在（404），不顯示錯誤
      if (err?.statusCode === 404) {
        console.log('使用者尚未建立，等待第一次建立訂單')
        // 設定基本資料（來自 LINE）
        profile.value = {
          userId: lineStore.userId,
          displayName: lineStore.displayName,
          updatedAt: new Date().toISOString(),
        }
      }
      else {
        console.error('載入個人資料失敗:', err)
        error.value = '載入個人資料失敗'
      }
    }
    finally {
      isLoading.value = false
    }
  }

  async function updateProfile(updates: { phoneNumber?: string, email?: string }) {
    try {
      isLoading.value = true
      error.value = null

      if (!profile.value)
        throw new Error('個人資料尚未初始化')

      const lineStore = useLineStore()
      if (!lineStore.userId)
        throw new Error('LINE 使用者 ID 不存在')

      const { validatePhoneNumber, validateEmail } = useValidation()

      // 驗證電話號碼格式
      if (updates.phoneNumber && !validatePhoneNumber(updates.phoneNumber))
        throw new Error('電話號碼格式不正確')

      // 驗證信箱格式
      if (updates.email && !validateEmail(updates.email))
        throw new Error('信箱格式不正確')

      // 呼叫 API 更新使用者資料
      const response = await $fetch<{
        userId: number
        lineUserId: string
        displayName: string
        phone: string | null
        email: string | null
        memberLevel: number
        createdAt: string
        updatedAt: string
      }>(`/api/users/${lineStore.userId}`, {
        method: 'PUT',
        body: {
          phone: updates.phoneNumber || null,
          email: updates.email || null,
        },
      })

      // 更新本地 profile
      profile.value = {
        userId: response.lineUserId,
        displayName: response.displayName,
        phoneNumber: response.phone || undefined,
        email: response.email || undefined,
        updatedAt: response.updatedAt,
      }
    }
    catch (err: any) {
      if (err?.statusCode === 404) {
        error.value = '使用者不存在，請先建立訂單'
      }
      else {
        error.value = err instanceof Error ? err.message : '更新失敗'
      }
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  // 已棄用：不再使用 localStorage
  async function loadFromLocalStorage() {
    // 保留空函數以維持向後相容
  }

  async function saveToLocalStorage() {
    // 保留空函數以維持向後相容
  }

  function clearProfile() {
    profile.value = null
  }

  return {
    // State
    profile,
    isLoading,
    error,

    // Getters
    hasProfile,
    phoneNumber,
    email,

    // Actions
    initProfile,
    updateProfile,
    loadFromLocalStorage,
    saveToLocalStorage,
    clearProfile,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useProfileStore, import.meta.hot))
