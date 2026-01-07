import type { Liff } from '@line/liff'
import type { LiffUser } from '~/types/line'

export const useLineStore = defineStore('line', () => {
  // State
  const isInitialized = ref(false)
  const isLoggedIn = ref(false)
  const user = ref<LiffUser | null>(null)
  const liffInstance = ref<Liff | null>(null)
  const error = ref<string | null>(null)

  // Getters
  const userId = computed(() => user.value?.userId ?? null)
  const displayName = computed(() => user.value?.displayName ?? '訪客')
  const pictureUrl = computed(() => user.value?.pictureUrl ?? null)

  // Actions
  async function initLiff(liffId: string) {
    if (isInitialized.value)
      return

    try {
      const { liff } = useLiff()

      await liff.init({ liffId })
      liffInstance.value = liff
      isInitialized.value = true

      if (liff.isLoggedIn()) {
        isLoggedIn.value = true
        await fetchUserProfile()
      }
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : 'LIFF 初始化失敗'
      console.error('LIFF init error:', err)
    }
  }

  async function fetchUserProfile() {
    if (!liffInstance.value || !isLoggedIn.value)
      return

    try {
      const profile = await liffInstance.value.getProfile()
      user.value = {
        userId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
        statusMessage: profile.statusMessage,
      }
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '取得使用者資料失敗'
      console.error('Failed to get profile:', err)
    }
  }

  async function login() {
    if (!liffInstance.value)
      return

    try {
      liffInstance.value.login()
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '登入失敗'
      console.error('Login error:', err)
    }
  }

  function logout() {
    if (!liffInstance.value)
      return

    try {
      liffInstance.value.logout()
      isLoggedIn.value = false
      user.value = null
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '登出失敗'
      console.error('Logout error:', err)
    }
  }

  function closeLiff() {
    if (!liffInstance.value)
      return

    liffInstance.value.closeWindow()
  }

  return {
    // State
    isInitialized,
    isLoggedIn,
    user,
    error,

    // Getters
    userId,
    displayName,
    pictureUrl,

    // Actions
    initLiff,
    login,
    logout,
    closeLiff,
    fetchUserProfile,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useLineStore, import.meta.hot))
