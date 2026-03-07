<script setup lang="ts">
const router = useRouter()
const lineStore = useLineStore()

function goBack() {
  router.back()
}

function closeApp() {
  lineStore.closeLiff()
}
</script>

<template>
  <div
    class="flex flex-col bg-neutral-100"
    style="height: 100dvh;"
  >
    <!-- Content -->
    <main class="flex-1 overflow-y-auto">
      <slot></slot>
    </main>

    <!-- Footer (optional, for action bars) -->
    <slot name="footer"></slot>
  </div>
</template>
