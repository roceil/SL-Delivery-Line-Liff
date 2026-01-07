import type { Liff } from '@line/liff'

export interface LiffUser {
  userId: string
  displayName: string
  pictureUrl?: string
  statusMessage?: string
}

export interface LineProfile {
  userId: string
  displayName: string
  pictureUrl?: string
  statusMessage?: string
}

export interface LiffState {
  isInitialized: boolean
  isLoggedIn: boolean
  user: LiffUser | null
  liffInstance: Liff | null
}

// Webhook 事件型別
export interface LineWebhookEvent {
  type: 'message' | 'follow' | 'unfollow' | 'postback' | 'beacon' | 'join' | 'leave'
  source: {
    type: 'user' | 'group' | 'room'
    userId?: string
    groupId?: string
    roomId?: string
  }
  timestamp: number
  replyToken?: string
}

export interface LineMessageEvent extends LineWebhookEvent {
  type: 'message'
  message: {
    type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'sticker'
    id: string
    text?: string
  }
}

// Rich Menu 型別
export interface RichMenuArea {
  bounds: {
    x: number
    y: number
    width: number
    height: number
  }
  action: {
    type: 'uri' | 'message' | 'postback'
    label?: string
    uri?: string
    text?: string
    data?: string
  }
}

export interface RichMenuConfig {
  size: {
    width: 2500
    height: 1686 | 843
  }
  selected: boolean
  name: string
  chatBarText: string
  areas: RichMenuArea[]
}
