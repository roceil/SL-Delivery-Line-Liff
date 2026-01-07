import type { RichMenu } from '@line/bot-sdk'
import fs from 'node:fs'

export function createRichMenuTemplate(): RichMenu {
  const config = useRuntimeConfig()
  const liffUrl = `https://liff.line.me/${config.public.liffId}`

  return {
    size: {
      width: 2500,
      height: 1686,
    },
    selected: true,
    name: '主選單',
    chatBarText: '點擊開啟選單',
    areas: [
      {
        bounds: {
          x: 0,
          y: 0,
          width: 1250,
          height: 843,
        },
        action: {
          type: 'uri',
          label: '開啟應用',
          uri: liffUrl,
        },
      },
      {
        bounds: {
          x: 1250,
          y: 0,
          width: 1250,
          height: 843,
        },
        action: {
          type: 'message',
          label: '聯絡我們',
          text: '我想聯絡客服',
        },
      },
      {
        bounds: {
          x: 0,
          y: 843,
          width: 1250,
          height: 843,
        },
        action: {
          type: 'message',
          label: '常見問題',
          text: '常見問題',
        },
      },
      {
        bounds: {
          x: 1250,
          y: 843,
          width: 1250,
          height: 843,
        },
        action: {
          type: 'uri',
          label: '官方網站',
          uri: config.public.appUrl || 'https://example.com',
        },
      },
    ],
  }
}

export async function setupRichMenu(imagePath: string) {
  const client = getLineClient()

  // 1. 建立 Rich Menu
  const richMenu = createRichMenuTemplate()
  const richMenuId = await client.createRichMenu(richMenu)

  console.log('Rich Menu created:', richMenuId)

  // 2. 上傳圖片
  const imageBuffer = fs.readFileSync(imagePath)
  await client.setRichMenuImage(richMenuId, imageBuffer, 'image/png')

  console.log('Rich Menu image uploaded')

  // 3. 設為預設選單
  await client.setDefaultRichMenu(richMenuId)

  console.log('Rich Menu set as default')

  return richMenuId
}
