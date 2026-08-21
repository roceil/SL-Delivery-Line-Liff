<script lang="ts" setup>
defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <div
    v-if="open"
    class="
      absolute inset-0 flex items-center justify-center bg-neutral-900/50 px-4
      backdrop-blur-sm
    "
    @click.self="emit('close')"
  >
    <div
      class="
        flex max-h-[80vh] w-full flex-col rounded-sm border border-neutral-200
        bg-white shadow-[0px_4px_12px_0px_rgba(32,78,184,0.04)]
      "
    >
      <!-- 標題列 -->
      <div class="flex shrink-0 items-center justify-between p-5 pb-4">
        <h3 class="text-xl font-bold text-neutral-900">
          預約須知
        </h3>
        <button
          class="flex items-center justify-center p-2"
          @click="emit('close')"
        >
          <Icon
            name="lucide:x"
            class="text-2xl text-neutral-900"
          />
        </button>
      </div>
      <div class="mx-5 shrink-0 border-t border-neutral-200"></div>
      <!-- 內容（可捲動） -->
      <div class="flex-1 overflow-y-auto px-5 py-4">
        <ol class="flex flex-col gap-6 text-base">
          <li class="flex flex-col gap-2">
            <span class="font-bold text-danger-300">1. 禁運物品</span>
            <p class="leading-relaxed text-neutral-600">
              嚴禁運送現金、貴重珠寶、易燃品、危險物品或活體動植物，詳細規定請詳閱禁運事項與運送規範。
            </p>
          </li>
          <li class="flex flex-col gap-2">
            <span class="font-bold text-neutral-900">2. 門市交付時限</span>
            <p class="leading-relaxed text-neutral-600">
              請於抵達小琉球後，最晚於 14:00 前將行李送至「你行李來」碼頭門市，以確保行李能於傍晚前送達民宿。
            </p>
          </li>
          <li class="flex flex-col gap-2">
            <span class="font-bold text-neutral-900">3. 行李標記</span>
            <p class="leading-relaxed text-neutral-600">
              交件時請主動出示預約或平台訂單編號，工作人員將現場為您的行李掛上專屬識別牌，並請確認上方資訊無誤。
            </p>
          </li>
          <li class="flex flex-col gap-2">
            <span class="font-bold text-neutral-900">4. 機車載運限制</span>
            <p class="leading-relaxed text-neutral-600">
              本服務旨在解決旅客騎機車載行李的危險與不便，若行李箱規格超過 29 吋或屬特殊大型物品（如潛水裝備箱），請務必於預約時標註。
            </p>
          </li>
          <li class="flex flex-col gap-2">
            <span class="font-bold text-neutral-900">5. 離島限定服務</span>
            <p class="leading-relaxed text-neutral-600">
              本服務運送範圍僅限小琉球島內民宿，恕不提供跨海（寄回台灣本島）之運送。
            </p>
          </li>
          <li class="flex flex-col gap-2">
            <span class="font-bold text-neutral-900">6. 取件憑證</span>
            <p class="leading-relaxed text-neutral-600">
              交付行李後請保留收執聯（或數位憑證），若需於民宿外之點位領回行李，請憑證取件。
            </p>
          </li>
          <li class="flex flex-col gap-2">
            <span class="font-bold text-neutral-900">7. 行李外觀檢查</span>
            <p class="leading-relaxed text-neutral-600">
              交付行李時，工作人員將與您共同確認行李箱外觀現況，如有明顯破損將現場記錄，以保障雙方權益。
            </p>
          </li>
        </ol>
      </div>
      <!-- 按鈕 -->
      <div class="shrink-0 p-5 pt-4">
        <button
          class="
            w-full rounded-sm bg-primary-300 py-3 text-base font-medium
            text-white
          "
          @click="emit('close')"
        >
          我瞭解了
        </button>
      </div>
    </div>
  </div>
</template>
