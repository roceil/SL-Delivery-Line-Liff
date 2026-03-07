<script setup lang="ts">
const route = useRoute()

const navItems = [
  { name: '首頁', path: '/life', icon: 'lucide:home' },
  { name: '我要預約', path: '/life/booking', icon: 'lucide:calendar' },
  { name: '我的訂單', path: '/life/my-bookings', icon: 'lucide:file' },
  { name: '我的', path: '/life/profile', icon: 'lucide:user' },
]

function isNavActive(path: string) {
  if (path === '/life')
    return route.path === '/life'
  return route.path.startsWith(path)
}
</script>

<template>
  <div
    class="flex flex-col"
    style="height: 100dvh;"
  >
    <!-- Content -->
    <main class="flex-1 overflow-y-auto">
      <slot></slot>
    </main>

    <!-- Bottom Navigation -->
    <nav
      class="
        shrink-0 overflow-hidden rounded-tl-lg rounded-tr-lg border
        border-neutral-0 pb-5 shadow-top-100
      "
      style="background: linear-gradient(8deg, #fff 0%, rgba(255,255,255,0.5) 100%); backdrop-filter: blur(12px); padding-bottom: calc(-18px + env(safe-area-inset-bottom));"
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
            :class="isNavActive(item.path) ? 'text-[#4090E8]' : `
              text-neutral-500
            `"
          />
          <span
            class="text-xs font-medium tracking-wide"
            :class="isNavActive(item.path)
              ? `
                bg-[linear-gradient(131deg,#4090E8_16.25%,#306CF7_61.77%)]
                bg-clip-text text-transparent
              `
              : 'text-neutral-500'"
          >
            {{ item.name }}
          </span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>
