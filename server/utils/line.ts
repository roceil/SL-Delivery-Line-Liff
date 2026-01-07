import crypto from 'node:crypto'
import { Client } from '@line/bot-sdk'

export function getLineClient() {
  const config = useRuntimeConfig()

  return new Client({
    channelAccessToken: config.lineChannelAccessToken,
    channelSecret: config.lineChannelSecret,
  })
}

export function verifySignature(body: string, signature: string): boolean {
  const config = useRuntimeConfig()
  const channelSecret = config.lineChannelSecret

  const hash = crypto
    .createHmac('SHA256', channelSecret)
    .update(body)
    .digest('base64')

  return hash === signature
}
