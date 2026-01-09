import type { Location } from '~/types/booking'

export const useLocationsStore = defineStore('locations', () => {
  // State
  const locations = ref<Location[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const hasLocations = computed(() => locations.value.length > 0)

  const getLocationById = computed(() => (id: number) => {
    return locations.value.find(location => location.id === id)
  })

  const getLocationsByType = computed(() => (type: string) => {
    return locations.value.filter(location => location.type === type)
  })

  const getLocationsByArea = computed(() => (area: string) => {
    return locations.value.filter(location => location.area === area)
  })

  // Actions
  async function fetchLocations() {
    if (isLoading.value)
      return

    try {
      isLoading.value = true
      error.value = null

      const { fetchDeliveryPoints } = useBackstationApi()
      const data = await fetchDeliveryPoints()

      locations.value = data.map(point => ({
        id: point.id,
        name: point.name,
        address: point.address,
        type: point.type,
        typeId: point.typeId,
        area: point.area,
        latitude: point.latitude,
        longitude: point.longitude,
      }))
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '載入配送地點失敗'
      console.error('Failed to fetch locations:', err)
    }
    finally {
      isLoading.value = false
    }
  }

  function clearLocations() {
    locations.value = []
    error.value = null
  }

  return {
    // State
    locations,
    isLoading,
    error,

    // Getters
    hasLocations,
    getLocationById,
    getLocationsByType,
    getLocationsByArea,

    // Actions
    fetchLocations,
    clearLocations,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useLocationsStore, import.meta.hot))
