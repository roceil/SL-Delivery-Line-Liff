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

    // 先嘗試從 LocalStorage 載入
    await loadFromLocalStorage()

    // 如果沒有資料，建立新的
    if (!profile.value) {
      profile.value = {
        userId: lineStore.userId,
        displayName: lineStore.displayName,
        updatedAt: new Date().toISOString(),
      }
      await saveToLocalStorage()
    }
  }

  async function updateProfile(updates: { phoneNumber?: string, email?: string }) {
    try {
      isLoading.value = true
      error.value = null

      if (!profile.value)
        throw new Error('個人資料尚未初始化')

      const { validatePhoneNumber, validateEmail } = useValidation()

      // 驗證電話號碼格式
      if (updates.phoneNumber && !validatePhoneNumber(updates.phoneNumber))
        throw new Error('電話號碼格式不正確')

      // 驗證信箱格式
      if (updates.email && !validateEmail(updates.email))
        throw new Error('信箱格式不正確')

      profile.value = {
        ...profile.value,
        ...updates,
        updatedAt: new Date().toISOString(),
      }

      await saveToLocalStorage()
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '更新失敗'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  async function loadFromLocalStorage() {
    try {
      const lineStore = useLineStore()

      if (!lineStore.userId)
        return

      const key = `user_profile_${lineStore.userId}`
      const stored = localStorage.getItem(key)

      if (stored)
        profile.value = JSON.parse(stored)
    }
    catch (err) {
      console.error('載入個人資料失敗:', err)
    }
  }

  async function saveToLocalStorage() {
    try {
      const lineStore = useLineStore()

      if (!lineStore.userId || !profile.value)
        return

      const key = `user_profile_${lineStore.userId}`
      localStorage.setItem(key, JSON.stringify(profile.value))
    }
    catch (err) {
      console.error('儲存個人資料失敗:', err)
    }
  }

  function clearProfile() {
    profile.value = null
    const lineStore = useLineStore()
    if (lineStore.userId)
      localStorage.removeItem(`user_profile_${lineStore.userId}`)
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
