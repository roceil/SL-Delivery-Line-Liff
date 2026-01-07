import type { WebhookEvent } from '@line/bot-sdk'

export default defineEventHandler(async (event) => {
  const signature = getHeader(event, 'x-line-signature')

  if (!signature) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing signature',
    })
  }

  const body = await readRawBody(event)

  if (!body) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing body',
    })
  }

  // 驗證簽章
  if (!verifySignature(body, signature)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Invalid signature',
    })
  }

  const payload = JSON.parse(body)
  const events: WebhookEvent[] = payload.events

  // 處理每個事件
  const client = getLineClient()

  for (const webhookEvent of events) {
    await handleWebhookEvent(client, webhookEvent)
  }

  return { status: 'ok' }
})
