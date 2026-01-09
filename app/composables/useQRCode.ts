import type { KlookOrder, PlatformQRCodeData, QRCodeData, TripOrder } from '~/types/booking'
import QRCode from 'qrcode'

export function useQRCode() {
  async function generateOrderQRCode(voucherId: string): Promise<string> {
    const qrData: QRCodeData = {
      voucherId,
      type: 'booking_order',
      version: 'v1',
    }

    const dataString = JSON.stringify(qrData)

    return await QRCode.toDataURL(dataString, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 300,
    })
  }

  function parseQRCodeData(rawData: string): QRCodeData | PlatformQRCodeData | string {
    try {
      const parsed = JSON.parse(rawData)

      if (!parsed.type)
        throw new Error('此 QR Code 不是有效的配送訂單')

      // 平台訂單 QR Code
      if (parsed.type === 'platform_order') {
        if (!parsed.platform || !parsed.orderIdentifier)
          throw new Error('平台訂單 QR Code 資料不完整')

        return parsed as PlatformQRCodeData
      }

      // 一般訂單 QR Code
      if (parsed.type === 'booking_order') {
        if (!parsed.voucherId)
          throw new Error('訂單 QR Code 資料不完整')

        return parsed as QRCodeData
      }

      throw new Error('不支援的 QR Code 類型')
    }
    catch (err) {
      // JSON 解析錯誤 - 可能是平台訂單的純文字憑證號碼
      if (err instanceof SyntaxError) {
        // 回傳原始文字，讓調用方嘗試查詢平台訂單
        return rawData.trim()
      }

      // 其他錯誤
      if (err instanceof Error)
        throw err

      throw new Error('無法解析 QR Code 資料')
    }
  }

  async function scanQRCode(): Promise<QRCodeData | PlatformQRCodeData | string> {
    const lineStore = useLineStore()
    const liff = lineStore.liffInstance

    if (!lineStore.isInitialized)
      throw new Error('LIFF 尚未初始化,請稍候再試')

    if (!liff)
      throw new Error('LIFF 實例不存在')

    if (!liff.scanCodeV2)
      throw new Error('此裝置不支援掃描 QR Code')

    try {
      const result = await liff.scanCodeV2()

      if (!result || !result.value)
        throw new Error('掃描取消或失敗')

      return parseQRCodeData(result.value)
    }
    catch (err) {
      throw new Error(err instanceof Error ? err.message : '掃描失敗')
    }
  }

  async function queryPlatformOrder(platform: 'trip' | 'klook', orderIdentifier: string): Promise<TripOrder | KlookOrder> {
    const { queryTripOrder, queryKlookOrder } = useBackstationApi()

    try {
      if (platform === 'trip') {
        const response = await queryTripOrder(orderIdentifier)
        return response as TripOrder
      }

      const response = await queryKlookOrder(orderIdentifier)
      return response as KlookOrder
    }
    catch (err) {
      throw new Error(err instanceof Error ? err.message : '查詢平台訂單失敗')
    }
  }

  async function queryPlatformOrderAuto(orderIdentifier: string): Promise<{ platform: 'trip' | 'klook', order: TripOrder | KlookOrder }> {
    const { queryTripOrder, queryKlookOrder } = useBackstationApi()

    // 先嘗試查詢 Trip 訂單
    try {
      const response = await queryTripOrder(orderIdentifier)
      return { platform: 'trip', order: response as TripOrder }
    }
    catch {
      // Trip 查詢失敗,嘗試查詢 Klook 訂單
      try {
        const response = await queryKlookOrder(orderIdentifier)
        return { platform: 'klook', order: response as KlookOrder }
      }
      catch {
        // 兩個平台都查詢失敗
        throw new Error('找不到對應的平台訂單,請確認憑證號碼是否正確')
      }
    }
  }

  return {
    generateOrderQRCode,
    parseQRCodeData,
    scanQRCode,
    queryPlatformOrder,
    queryPlatformOrderAuto,
  }
}
