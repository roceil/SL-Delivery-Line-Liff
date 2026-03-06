<script setup lang="ts">
const route = useRoute()

const navItems = [
  { name: '首頁', path: '/life', icon: 'carbon:home' },
  { name: '我要預約', path: '/life/booking', icon: 'carbon:calendar' },
  { name: '我的訂單', path: '/life/my-bookings', icon: 'carbon:receipt' },
  { name: '我的', path: '/life/profile', icon: 'carbon:user' },
]

function isNavActive(path: string) {
  if (path === '/life')
    return route.path === '/life'
  return route.path.startsWith(path)
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-[#f0f4f8]">
    <!-- Content -->
    <main class="flex-1 overflow-y-auto pb-[90px]">
      <slot />
    </main>

    <!-- Bottom Navigation -->
    <nav
      class="
        fixed right-0 bottom-0 left-0 overflow-hidden rounded-tl-lg
        rounded-tr-lg border border-neutral-0 shadow-top-100
      "
      style="background: linear-gradient(8deg, #fff 0%, rgba(255,255,255,0.5) 100%); backdrop-filter: blur(12px);"
    >
      <div class="flex items-center gap-xl px-xl pt-xs">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex flex-1 flex-col items-center gap-[2px] py-xs"
        >
          <Icon
            :name="item.icon"
            class="size-5"
            :class="isNavActive(item.path) ? 'text-primary-300' : `
              text-neutral-500
            `"
          />
          <span
            class="text-xs font-medium tracking-wide"
            :class="isNavActive(item.path) ? 'text-primary-300' : `
              text-neutral-500
            `"
          >
            {{ item.name }}
          </span>
        </NuxtLink>
      </div>
      <!-- Home Indicator -->
      <div class="flex justify-center pb-2 pt-5">
        <div class="h-[5px] w-[134px] rounded-rounded bg-black/20" />
      </div>
    </nav>
  </div>
</template>
