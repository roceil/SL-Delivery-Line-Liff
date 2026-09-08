import type { Client, FollowEvent, MessageEvent, WebhookEvent } from '@line/bot-sdk'

export async function handleWebhookEvent(client: Client, event: WebhookEvent) {
  switch (event.type) {
    case 'message':
      return handleMessageEvent(client, event)
    case 'follow':
      return handleFollowEvent(client, event)
    case 'unfollow':
      // User unfollowed - no action needed
      break
    default:
      // Unhandled event type - no action needed
      break
  }
}

async function handleMessageEvent(client: Client, event: MessageEvent) {
  if (!event.replyToken)
    return

  if (event.message.type !== 'text')
    return

  const userMessage = event.message.text
  const config = useRuntimeConfig()
  const liffUrl = `https://liff.line.me/${config.public.liffId}`

  // 簡單的指令處理
  if (userMessage === '你好' || userMessage === 'hello') {
    await client.replyMessage(event.replyToken, {
      type: 'text',
      text: '您好！歡迎使用我們的服務！\n\n點擊下方按鈕開啟應用，或輸入「選單」查看更多功能。',
      quickReply: {
        items: [
          {
            type: 'action',
            action: {
              type: 'uri',
              label: '開啟應用',
              uri: liffUrl,
            },
          },
          {
            type: 'action',
            action: {
              type: 'message',
              label: '選單',
              text: '選單',
            },
          },
        ],
      },
    })
    return
  }

  if (userMessage === '選單' || userMessage === 'menu') {
    await client.replyMessage(event.replyToken, {
      type: 'text',
      text: '請選擇您需要的功能：',
      quickReply: {
        items: [
          {
            type: 'action',
            action: {
              type: 'uri',
              label: '🚀 開啟應用',
              uri: liffUrl,
            },
          },
          {
            type: 'action',
            action: {
              type: 'message',
              label: '📋 功能介紹',
              text: '功能介紹',
            },
          },
          {
            type: 'action',
            action: {
              type: 'message',
              label: '❓ 常見問題',
              text: '常見問題',
            },
          },
        ],
      },
    })
    return
  }

  if (userMessage === '功能介紹') {
    await client.replyMessage(event.replyToken, {
      type: 'text',
      text: '我們提供以下功能：\n\n✅ LINE 帳號快速登入\n✅ 個人化服務體驗\n✅ 即時互動功能\n\n點擊下方按鈕立即體驗！',
      quickReply: {
        items: [
          {
            type: 'action',
            action: {
              type: 'uri',
              label: '立即開啟',
              uri: liffUrl,
            },
          },
        ],
      },
    })
    return
  }

  if (userMessage === '常見問題') {
    await client.replyMessage(event.replyToken, {
      type: 'text',
      text: 'Q: 如何使用應用？\nA: 點擊「開啟應用」按鈕即可使用。\n\nQ: 需要註冊嗎？\nA: 不需要，使用 LINE 帳號即可登入。',
      quickReply: {
        items: [
          {
            type: 'action',
            action: {
              type: 'uri',
              label: '開啟應用',
              uri: liffUrl,
            },
          },
          {
            type: 'action',
            action: {
              type: 'message',
              label: '返回選單',
              text: '選單',
            },
          },
        ],
      },
    })
  }

  // 沒有命中任何指令時不回覆。
  //
  // 原本這裡會把客人的訊息原句唸回來（「您說：⋯⋯」），客人隨口打一句話就被
  // 鸚鵡學舌，讀起來像故障。官方帳號在看不懂客人要什麼的時候保持安靜，
  // 比硬回一句沒用的話得體；需要引導時客人仍可用圖文選單或輸入「選單」。
}

async function handleFollowEvent(client: Client, event: FollowEvent) {
  if (!event.replyToken)
    return

  const config = useRuntimeConfig()
  const liffUrl = `https://liff.line.me/${config.public.liffId}`

  await client.replyMessage(event.replyToken, {
    type: 'text',
    text: '感謝您加入我們！\n\n點擊下方按鈕開啟應用，或輸入「選單」查看更多功能。',
    quickReply: {
      items: [
        {
          type: 'action',
          action: {
            type: 'uri',
            label: '開啟應用',
            uri: liffUrl,
          },
        },
        {
          type: 'action',
          action: {
            type: 'message',
            label: '功能介紹',
            text: '功能介紹',
          },
        },
      ],
    },
  })
}
