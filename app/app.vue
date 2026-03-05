<script lang="ts" setup>
import { appName } from '@/constants'

useHead({
  title: appName,
})
</script>

<template>
  <div class="relative min-h-screen">
    <NuxtImg
      src="/main_bg.png"
      class="fixed inset-0 z-[-1] size-full object-cover"
      aria-hidden="true"
      alt=""
    />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
