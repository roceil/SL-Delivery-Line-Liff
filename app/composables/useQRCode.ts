import type { QRCodeData } from '~/types/booking'
import QRCode from 'qrcode'

export function useQRCode() {
  async function generateOrderQRCode(orderId: string): Promise<string> {
    const qrData: QRCodeData = {
      orderId,
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

  function parseQRCodeData(rawData: string): QRCodeData {
    try {
      const parsed = JSON.parse(rawData)

      if (!parsed.orderId || !parsed.type)
        throw new Error('QR Code 資料格式不正確')

      return parsed as QRCodeData
    }
    catch {
      throw new Error('無法解析 QR Code 資料')
    }
  }

  async function scanQRCode(): Promise<QRCodeData> {
    const lineStore = useLineStore()
    const liff = lineStore.liffInstance

    if (!lineStore.isInitialized) {
      throw new Error('LIFF 尚未初始化，請稍候再試')
    }

    if (!liff) {
      throw new Error('LIFF 實例不存在')
    }

    if (!liff.scanCodeV2) {
      throw new Error('此裝置不支援掃描 QR Code')
    }

    try {
      const result = await liff.scanCodeV2()

      if (!result || !result.value) {
        throw new Error('掃描取消或失敗')
      }

      return parseQRCodeData(result.value)
    }
    catch (err) {
      throw new Error(err instanceof Error ? err.message : '掃描失敗')
    }
  }

  return {
    generateOrderQRCode,
    parseQRCodeData,
    scanQRCode,
  }
}
