<script setup lang="ts">
import { defineEmits, ref, computed, watch } from 'vue'
import { Pagination, Search, Service, SearchResponse } from '../../types'
import { useToast, VaInput, VaPagination } from 'vuestic-ui'
import { watchDebounced } from '@vueuse/core'
import { useServiceStore } from '@/stores/modules/service.module'
import { getErrorMessage } from '@/services/utils'

const { init } = useToast()
const loadingService = ref(false)
const currentSelectedService = ref<Service | null>(null)
const storesService = useServiceStore()
const serviceSearchRes = ref<SearchResponse | null>(null)
const services = ref<Service[]>([])
const isOpen = ref(true)
const selectedServiceId = ref<string | null>(null)

const emit = defineEmits(['update:selectedService'])
const isMobile = computed(() => window.innerWidth < 768)

const formatPrice = (price: any) => {
  return new Intl.NumberFormat('vi-VN').format(price)
}

const pagination = ref<Pagination>({
  page: 1,
  perPage: isMobile.value ? 3 : 6,
  total: 0,
})

const searchValue = ref<Search>({
  pageNumber: 1,
  pageSize: pagination.value.perPage,
  keyword: '',
})

const filters = ref({
  keyword: '',
})

const totalPages = computed(() => Math.ceil(pagination.value.total / pagination.value.perPage))
const searchService = (search: Search) => {
  loadingService.value = true
  storesService
    .searchService(search)
    .then((response) => {
      services.value = response.data
      serviceSearchRes.value = response
    })
    .catch((error) => {
      const message = getErrorMessage(error)
      init({
        title: 'error',
        message: message,
        color: 'danger',
      })
    })
    .finally(() => {
      loadingService.value = false
    })
}

const handleServiceSelect = (service: Service) => {
  currentSelectedService.value = service
  selectedServiceId.value = service.id
  emit('update:selectedService', service)
  isOpen.value = false
}

const toggleSection = () => {
  isOpen.value = !isOpen.value
}

watchDebounced(
  filters.value,
  () => {
    pagination.value.page = 1
    searchValue.value.keyword = filters.value.keyword
    searchService(searchValue.value)
  },
  { debounce: 500, maxWait: 1000 },
)

watch(
  () => pagination.value.page,
  () => {
    searchValue.value.pageNumber = pagination.value.page
    searchValue.value.pageSize = pagination.value.perPage
    searchService(searchValue.value)
  },
  { immediate: true },
)

watch(
  () => pagination.value.perPage,
  () => {
    searchValue.value.pageNumber = 1
    searchValue.value.pageSize = pagination.value.perPage
    searchService(searchValue.value)
  },
  { immediate: true },
)

watch(
  () => serviceSearchRes.value,
  () => {
    if (serviceSearchRes.value) {
      pagination.value.total = serviceSearchRes.value.totalCount
    }
  },
  { immediate: true },
)

watch(
  () => services.value,
  (newServices) => {
    if (selectedServiceId.value && newServices.length) {
      const selectedService = newServices.find((s) => s.id === selectedServiceId.value)
      if (selectedService) {
        currentSelectedService.value = selectedService
      }
    }
  },
)
</script>

<template>
  <div class="flex flex-col">
    <!-- Accordion header -->
    <div class="border dark:border-none rounded-lg overflow-hidden">
      <button
        class="w-full flex justify-between items-center p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
        @click="toggleSection"
      >
        <p class="text-xl font-bold text-blue-900 dark:text-blue-100">
          Select a service
          <span v-if="currentSelectedService" class="text-sm font-normal text-gray-600 dark:text-gray-300">
            ({{ currentSelectedService.serviceName }})
          </span>
        </p>
        <svg
          class="w-5 h-5 transition-transform duration-200"
          :class="{ 'rotate-180': isOpen }"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Accordion content -->
      <div v-show="isOpen" class="transition-all duration-200">
        <div class="p-4 border-t border-gray-200 dark:border-gray-700">
          <VaInput
            v-model="filters.keyword"
            placeholder="Search service"
            icon="search"
            class="mb-4"
            clearable
            @clear="filters.keyword = ''"
          />
          <div class="h-[440px] md:h-[300px] lg:h-[325px] overflow-y-auto pr-4 scroll">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="service in services" :key="service.id" class="relative">
                <input
                  :id="`service_${service.id}`"
                  :value="service"
                  type="radio"
                  name="service"
                  class="peer sr-only"
                  :checked="currentSelectedService === service"
                  @change="handleServiceSelect(service)"
                />
                <label
                  :for="`service_${service.id}`"
                  class="relative flex h-full cursor-pointer flex-col rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-700 peer-checked:bg-emerald-600 peer-checked:text-white dark:peer-checked:bg-emerald-700"
                >
                  <div class="flex items-start gap-2 min-h-[50px] relative">
                    <span class="font-medium text-base break-words pr-8">{{ service.serviceName }}</span>
                    <div
                      class="absolute right-0 top-1 flex-shrink-0 box-content block h-3 w-3 rounded-full border-8"
                      :class="{
                        'border-emerald-400 bg-emerald-600': currentSelectedService === service,
                        'border-gray-300 bg-white dark:border-gray-600': currentSelectedService !== service,
                      }"
                    ></div>
                  </div>
                  <span class="text-sm mb-3">{{ service.serviceDescription }}</span>
                  <span class="absolute bottom-0 left-4 text-lg font-bold"
                    >{{ formatPrice(service.totalPrice) }} VND</span
                  >
                </label>
              </div>
            </div>
          </div>
          <VaPagination
            v-model="pagination.page"
            class="items-center justify-end mt-4"
            buttons-preset="secondary"
            :pages="totalPages"
            :visible-pages="5"
            :boundary-links="true"
            :direction-links="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>
