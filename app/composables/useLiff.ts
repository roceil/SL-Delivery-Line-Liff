import liff from '@line/liff'

export function useLiff() {
  const config = useRuntimeConfig()
  const liffId = config.public.liffId as string

  if (!liffId) {
    throw new Error('LIFF ID 未設定，請檢查環境變數 NUXT_PUBLIC_LIFF_ID')
  }

  return {
    liff,
    liffId,
  }
}
