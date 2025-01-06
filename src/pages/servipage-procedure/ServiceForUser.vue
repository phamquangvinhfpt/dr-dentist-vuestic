<template>
  <VaCard style="padding-top: 0.5%" class="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between mb-3">
        <h1 class="va-h1 text-2xl font-extrabold dark:text-blue-500 text-blue-900 text-left mb-4">Dịch Vụ Nha Khoa</h1>
      </div>
      <div style="margin-bottom: 1%; margin-top: 5px" class="flex justify-between items-center mt-6">
        <p class="text-sm md:text-base text-left mb-0">Chăm sóc nụ cười của bạn là ưu tiên hàng đầu của chúng tôi</p>

        <button
          v-if="isMobile"
          class="bg-indigo-600 text-white font-semibold text-xs py-1 px-1 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          @click="bookAppointment"
        >
          Đặt Lịch Ngay
        </button>
        <button
          v-else
          style="height: 4cap"
          class="bg-indigo-600 text-white font-semibold text-xs py-1 px-1 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          @click="bookAppointment"
        >
          Đặt Lịch Ngay
        </button>
      </div>
      <!-- Search and Filters -->
      <div class="rounded-2xl p-4 shadow-md mb-6 space-y-4">
        <VaInput
          v-model="searchQuery"
          type="text"
          placeholder="Tìm dịch vụ..."
          label="Tìm kiếm"
          @input="onSearchChange"
        />
        <VaSelect
          v-model="selectedTypeService"
          :options="typeServiceOptions"
          label="Lọc theo loại dịch vụ"
          @change="onFilterChange"
        />
      </div>
      <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div v-if="isLoading" class="col-span-full text-center">
          <VaProgressCircle indeterminate />
        </div>
        <div v-if="filteredServices.length === 0 && !isLoading" class="col-span-full text-center">
          Không có dịch vụ nào để hiển thị.
        </div>
        <div v-for="service in paginatedServices" :key="service.serviceID" class="service-card">
          <VaCard class="p-6 flex flex-col justify-between h-full">
            <div class="service-icon">🦷</div>
            <h2 class="text-lg font-semibold dark:text-blue-500 text-blue-900">{{ service.name }}</h2>
            <p class="text-xs mt-2">{{ truncateDescription(service.description) }}</p>
            <div class="flex justify-between items-center mt-4">
              <p class="text-sm font-bold text-blue-600">Giá: {{ formatCurrency(service.totalPrice) }}</p>
              <button class="text-sm font-bold text-blue-600" @click.prevent="getServicesDetailById(service.serviceID)">
                Chi Tiết
              </button>
            </div>
          </VaCard>
        </div>
      </div>
      <!-- Pagination -->
      <div class="mt-6 flex justify-center">
        <VaPagination
          v-model="currentPage"
          :total="Math.ceil(filteredServices.length / pageSize)"
          @input="fetchPaginatedServices"
        />
      </div>
    </div>

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
import { useRoute } from 'vue-router' // Để lấy tham số từ route
import { VaCard, VaInput, VaSelect, VaPagination, VaProgressCircle } from 'vuestic-ui'
import ServiceDetailsModal from './widgets/ServiceDetailsModal.vue'
import { useServiceStore } from '@/stores/modules/service.module'
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
        { value: null, text: 'Tất cả dịch vụ' },
        ...serviceTypes.map((service) => ({
          value: service.id,
          text: service.typeName,
        })),
      ]
      console.log('Giá trị của defaultTypeServiceId:', defaultTypeServiceId)

      // Sử dụng `.find` để tìm option phù hợp
      selectedTypeService.value = typeServiceOptions.value.find((option) => option.value == defaultTypeServiceId) || {
        value: null,
        text: 'Tất cả dịch vụ',
      }
    } else {
      console.warn('Không có loại dịch vụ nào để hiển thị')
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
    const response = await useServiceStore().getServiceDetail(id)
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
// Watchers and lifecycle hooks
watch([searchQuery, selectedTypeService], applyFilters)
onMounted(fetchServices)
</script>

<style scoped>
.services-container {
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.services-title {
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.service-card {
  border-radius: 10px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.4);
  transition:
    transform 0.3s,
    box-shadow 0.3s;
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.service-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.service-name {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0.5rem 0;
}

.service-description {
  color: #666;
  margin-bottom: 1rem;
}

.learn-more {
  color: #007bff;
  text-decoration: none;
}

.learn-more:hover {
  text-decoration: underline;
}

.appointment-button {
  display: block;
  margin: 2rem auto 0;
  padding: 0.75rem 1.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.appointment-button:hover {
  background-color: #0056b3;
}

.learn-more-button {
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.3s;
}

.learn-more-button:hover {
  color: #0056b3;
}
</style>
