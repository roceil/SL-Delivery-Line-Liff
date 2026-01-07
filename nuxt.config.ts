import tailwindcss from '@tailwindcss/vite'
import { appDescription } from './app/constants/index'

export default defineNuxtConfig({
  devtools: { enabled: true },

  vite: {
    plugins: [
      tailwindcss(),
    ],
    server: {
      allowedHosts: [
        '.ngrok-free.app', // 允許所有 ngrok-free.app 子網域
        '.ngrok.io', // 如果使用付費版 ngrok
      ],
    },
  },

  modules: [
    '@nuxt/fonts',
    '@nuxtjs/color-mode',
    '@nuxt/icon',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/eslint',
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
      ],
    },
  },

  icon: {
    mode: 'css',
    cssLayer: 'base', // for TailwindCSS v4
  },

  colorMode: {
    classSuffix: '',
  },

  pinia: {
    storesDirs: ['./app/stores/**'],
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

    // Public (會暴露到客戶端)
    public: {
      liffId: process.env.NUXT_PUBLIC_LIFF_ID,
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000',
    },
  },

  routeRules: {
    // LIFF 頁面不使用 SSR
    '/liff/**': { ssr: false },
  },

  compatibilityDate: '2025-08-01',
})
