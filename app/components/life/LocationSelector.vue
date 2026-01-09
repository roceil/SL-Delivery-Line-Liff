<script setup lang="ts">
import type { Location } from '~/types/booking'

interface Props {
  modelValue: Location | null
  excludeId?: number
  label?: string
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  excludeId: undefined,
  label: '選擇地點',
  required: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: Location | null]
}>()

const locationsStore = useLocationsStore()
const { locations } = storeToRefs(locationsStore)

const availableLocations = computed(() => {
  if (!props.excludeId)
    return locations.value

  return locations.value.filter(loc => loc.id !== props.excludeId)
})

const selectedLocationId = computed({
  get: () => props.modelValue?.id?.toString() ?? '',
  set: (value) => {
    const locationId = Number.parseInt(value, 10)
    const location = locations.value.find(loc => loc.id === locationId)
    emit('update:modelValue', location || null)
  },
})
</script>

<template>
  <div class="mb-4">
    <label class="mb-2 block text-sm font-medium text-gray-700">
      {{ label }}
      <span
        v-if="required"
        class="text-red-500"
      >*</span>
    </label>
    <select
      v-model="selectedLocationId"
      :required="required"
      class="
        w-full rounded-lg border border-gray-300 bg-white px-4 py-2
        text-gray-800
        focus:border-blue-500 focus:ring-2 focus:ring-blue-500
        focus:outline-none
      "
    >
      <option value="">
        請選擇地點
      </option>
      <option
        v-for="location in availableLocations"
        :key="location.id"
        :value="location.id"
      >
        {{ location.name }}
      </option>
    </select>
    <p
      v-if="modelValue"
      class="mt-1 text-sm text-gray-500"
    >
      {{ modelValue.address }}
    </p>
  </div>
</template>
