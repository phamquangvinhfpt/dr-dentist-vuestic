<template>
  <VaCard class="service-page bg-gradient-to-br from-blue-50 via-white to-blue-50 min-h-screen py-12">
    <VaCard class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <!-- Hero Section with enhanced visual appeal -->
      <div
        class="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-10 text-white shadow-xl transform hover:scale-[1.01] transition-all duration-300"
      >
        <div class="max-w-3xl mx-auto text-center space-y-6">
          <h1 class="text-4xl font-bold">{{ t('service.service_head') }}</h1>
          <p class="text-xl opacity-90 leading-relaxed">{{ t('service.service_title') }}</p>
          <button
            class="mt-8 bg-white text-blue-600 font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            @click="bookAppointment"
          >
            {{ t('service.Booking') }}
          </button>
        </div>
      </div>

      <!-- Search and Filters Card with improved spacing -->
      <VaCard class="rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
        <VaCard class="p-8 space-y-8 bg-white">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Search Input with enhanced styling -->
            <VaInput
              v-model="searchQuery"
              type="text"
              :placeholder="t('service.search_placeholder')"
              :label="t('service.search')"
              class="search-input hover:shadow-md transition-shadow duration-200"
              @input="onSearchChange"
            >
              <template #prependInner>
                <VaIcon name="search" color="primary" />
              </template>
            </VaInput>

            <!-- Filter Select with matching style -->
            <VaSelect
              v-model="selectedTypeService"
              :options="typeServiceOptions"
              :label="t('service.filter')"
              class="filter-select hover:shadow-md transition-shadow duration-200"
              @change="onFilterChange"
            />
          </div>
        </VaCard>
      </VaCard>

      <!-- Loading State with improved visual feedback -->
      <div v-if="isLoading" class="flex justify-center items-center py-16">
        <VaProgressCircle indeterminate color="primary" size="large" />
      </div>

      <!-- No Results State with better visual feedback -->
      <VaCard v-else-if="filteredServices.length === 0" class="text-center py-16 bg-white rounded-2xl shadow-lg">
        <VaIcon name="search_off" size="large" color="secondary" class="mb-4" />
        <p class="text-lg text-gray-600">{{ t('service.noService') }}</p>
      </VaCard>

      <!-- Services Grid with enhanced card design -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="service in paginatedServices"
          :key="service.serviceID"
          class="transform hover:-translate-y-2 transition-all duration-300"
        >
          <VaCard class="service-card h-full rounded-2xl shadow-lg hover:shadow-xl overflow-hidden">
            <div class="p-6 space-y-4">
              <div class="service-icon-wrapper mb-6 text-center">
                <span class="service-icon text-4xl bg-blue-50 p-4 rounded-full inline-block">🦷</span>
              </div>
              <h2 class="text-xl font-bold mb-3">{{ service.name }}</h2>
              <p class="text-sm leading-relaxed">{{ truncateDescription(service.description) }}</p>
              <div class="flex justify-between items-center pt-6 mt-4 border-t border-gray-100">
                <span class="text-xl font-bold">{{ formatCurrency(service.totalPrice) }}</span>
                <VaButton
                  preset="secondary"
                  size="small"
                  class="details-button px-6 py-2 rounded-xl hover:bg-blue-50 transition-colors duration-200"
                  @click="getServicesDetailById(service.serviceID)"
                >
                  {{ t('service.Detail') }}
                </VaButton>
              </div>
            </div>
          </VaCard>
        </div>
      </div>

      <!-- Pagination with improved styling -->
      <VaCard class="mt-10 bg-white rounded-2xl shadow-lg p-6">
        <VaPagination
          v-model="currentPage"
          :total="Math.ceil(filteredServices.length / pageSize)"
          class="pagination-modern"
          @input="fetchPaginatedServices"
        />
      </VaCard>
    </VaCard>

    <!-- Service Details Modal -->
    <ServiceDetailsModal
      :is-open="isModalOpen"
      :service-details="serviceDetails"
      :is-loading="isDetailsLoading"
      :reviews="reviews"
      @close="closeModal"
    />
  </VaCard>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router' // Để lấy tham số từ route
import { VaCard, VaInput, VaSelect, VaPagination, VaProgressCircle } from 'vuestic-ui'
import ServiceDetailsModal from './widgets/ServiceDetailsModal.vue'
import { useServiceStore } from '@/stores/modules/service.module'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/modules/auth.module'
const { t } = useI18n()
// Reactive variables
const searchQuery = ref('')
const selectedTypeService = ref({ value: null, text: 'Tất cả dịch vụ' })
const currentPage = ref(1)
const pageSize = 9
const services = ref([])
const filteredServices = ref([])
const paginatedServices = ref([])
const isLoading = ref(false)
const isModalOpen = ref(false)
const serviceDetails = ref(null)
const reviews = ref(null)
const isDetailsLoading = ref(false)
const serviceStore = useServiceStore()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const typeServiceOptions = ref([]) // Để lưu các loại dịch vụ
const defaultTypeServiceId = route.params.id

// Fetch services from store
const fetchServices = async () => {
  isLoading.value = true
  try {
    const response = await serviceStore.getAllServices({ isActive: true })
    services.value = response.data
    applyFilters()
  } catch (error) {
    console.error('Error fetching services:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  try {
    const response = await serviceStore.getServiceType({}) // Lấy dữ liệu từ API
    const serviceTypes = response.data // Giả sử dữ liệu trả về có dạng { data: [...] }

    if (Array.isArray(serviceTypes) && serviceTypes.length > 0) {
      typeServiceOptions.value = [
        { value: null, text: t('service.all_service') },
        ...serviceTypes.map((service) => ({
          value: service.id,
          text: service.typeName,
        })),
      ]
      console.log('Giá trị của defaultTypeServiceId:', defaultTypeServiceId)

      // Sử dụng `.find` để tìm option phù hợp
      selectedTypeService.value = typeServiceOptions.value.find((option) => option.value == defaultTypeServiceId) || {
        value: null,
        text: t('service.all_service'),
      }
    } else {
      console.warn(t('service.noServicesFound'))
    }
  } catch (error) {
    console.error('Error fetching service types:', error)
  }
})

// Apply search and filter
const applyFilters = () => {
  const query = searchQuery.value.toLowerCase()
  const type = selectedTypeService.value.value
  filteredServices.value = services.value.filter((service) => {
    const matchesSearch = query === '' || service.name.toLowerCase().includes(query)
    const matchesType = type === null || service.typeServiceID === type
    return matchesSearch && matchesType
  })
  currentPage.value = 1 // Reset to first page after filtering
  fetchPaginatedServices()
}
// Pagination logic
const fetchPaginatedServices = () => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  paginatedServices.value = filteredServices.value.slice(start, end)
}

// Modal and details logic
const getServicesDetailById = async (id) => {
  isModalOpen.value = true
  isDetailsLoading.value = true
  try {
    const response = await useServiceStore().getServiceByIdForCustomer(id)
    serviceDetails.value = response.serviceDTO
    reviews.value = response.feedbacks
    console.log('Giá trị của serviceDetails USER :', response.feedbacks)
  } catch (error) {
    console.error('Error fetching service details:', error)
  } finally {
    isDetailsLoading.value = false
  }
}
const closeModal = () => {
  isModalOpen.value = false
}
// Helper functions
const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}
const truncateDescription = (description) => {
  const words = description.split(' ')
  return words.length > 13 ? words.slice(0, 13).join(' ') + '...' : description
}
const bookAppointment = () => {
  if (auth.isAuthenticated) {
    router.push({ name: 'create-appointment' })
  } else {
    router.push({ name: 'login' })
  }
}
// Watchers and lifecycle hooks
watch([searchQuery, selectedTypeService], applyFilters)
onMounted(fetchServices)
</script>

<style scoped>
.service-page {
  min-height: 100vh;
}

.service-card {
  background: white;
  transition: all 0.3s ease;
}

.service-icon-wrapper {
  transition: transform 0.3s ease;
}

.service-card:hover .service-icon-wrapper {
  transform: scale(1.1);
}

.search-input :deep(input),
.filter-select :deep(.va-select__value) {
  border-radius: 0.75rem;
  transition: all 0.3s ease;
}

.search-input :deep(input:focus),
.filter-select :deep(.va-select__value:focus) {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.pagination-modern {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.pagination-modern :deep(.va-pagination__item) {
  border-radius: 0.75rem;
  transition: all 0.2s ease;
}

.pagination-modern :deep(.va-pagination__item--active) {
  transform: scale(1.1);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>
