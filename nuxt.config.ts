import tailwindcss from '@tailwindcss/vite'
import { appDescription } from './app/constants/index'

export default defineNuxtConfig({
  devtools: { enabled: true },

  devServer: {
    port: 3003,
    host: ' ',
  },

  vite: {
    plugins: [
      tailwindcss(),
    ],
    server: {
      allowedHosts: [
        'lq-porter-dev.starlines.com.tw',
      ],
      hmr: {
        host: 'lq-porter-dev.starlines.com.tw',
        protocol: 'wss',
        clientPort: 443,
      },
    },
  },

  modules: [
    '@nuxt/fonts',
    '@nuxtjs/color-mode',
    '@nuxt/icon',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/eslint',
    '@nuxt/image',
  ],

  css: ['~/assets/css/main.css'],

  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
    },
  },

  app: {
    head: {
      meta: [
        { name: 'description', content: appDescription },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, viewport-fit=cover',
        },
      ],
    },
  },

  icon: {
    mode: 'svg',
    clientBundle: {
      scan: true,
    },
  },

  colorMode: {
    classSuffix: '',
  },

  pinia: {
    storesDirs: ['./app/stores/**'],
  },

  fonts: {
    families: [
      {
        name: 'Noto Sans TC',
        provider: 'google',
        weights: [400, 500, 700],
      },
    ],
  },

  eslint: {
    config: {
      standalone: false,
    },
  },

  runtimeConfig: {
    // Server-only (不會暴露到客戶端)
    lineChannelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    lineChannelSecret: process.env.LINE_CHANNEL_SECRET,
    newebpayMerchantId: process.env.NEWEBPAY_MERCHANT_ID,
    newebpayHashKey: process.env.NEWEBPAY_HASH_KEY,
    newebpayHashIV: process.env.NEWEBPAY_HASH_IV,
    newebpayApiUrl: process.env.NEWEBPAY_API_URL,

    // Public (會暴露到客戶端)
    public: {
      liffId: process.env.NUXT_PUBLIC_LIFF_ID,
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000',
      backstationApiUrl: process.env.NUXT_PUBLIC_BACKSTATION_API_URL || 'http://localhost:3001',
    },
  },

  routeRules: {
    // LIFF 頁面不使用 SSR
    '/liff/**': { ssr: false },
    // Life 行李寄送頁面不使用 SSR
    '/life/**': { ssr: false },
  },

  compatibilityDate: '2025-08-01',
})
