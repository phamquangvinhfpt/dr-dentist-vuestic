<template>
  <VaCard style="padding-top: 0.5%" class="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <h1 class="va-h1 text-2xl font-extrabold dark:text-blue-500 text-blue-900 text-left mb-4">Dịch Vụ Nha Khoa</h1>
      <div style="margin-bottom: 3%; margin-top: 5px" class="flex justify-between items-center mt-6">
        <p class="text-base text-left mb-0">Chăm sóc nụ cười của bạn là ưu tiên hàng đầu của chúng tôi</p>
        <button
          class="bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          @click="bookAppointment"
        >
          Đặt Lịch Ngay
        </button>
      </div>

      <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div v-if="isLoading" class="col-span-full text-center">
          <VaProgressCircle indeterminate />
        </div>
        <div v-if="services.length === 0" class="col-span-full text-center">Không có dịch vụ nào để hiển thị.</div>
        <div v-for="service in services" :key="service.serviceID" class="service-card">
          <VaCard style="padding-bottom: 0px" class="p-6 flex flex-col justify-between h-full">
            <div style="padding-bottom: 30px" class="service-icon">🦷</div>
            <div>
              <h2 class="text-lg font-semibold dark:text-blue-500 text-blue-900">{{ service.name }}</h2>
              <p class="text-xs mt-2">{{ truncateDescription(service.description) }}</p>
            </div>
            <div class="flex justify-between items-center mt-4">
              <p class="text-xs md:text-sm font-bold text-blue-600">Giá: {{ formatCurrency(service.totalPrice) }}</p>

              <button
                class="text-xs md:text-xs font-bold text-blue-600 learn-more-button"
                @click.prevent="getServicesDetailById(service.serviceID)"
              >
                Chi Tiết
              </button>
            </div>
          </VaCard>
        </div>
      </div>
    </div>

    <ServiceDetailsModal
      :is-open="isModalOpen"
      :service-details="serviceDetails"
      :is-loading="isDetailsLoading"
      @close="closeModal"
    />
  </VaCard>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useServiceStore } from '@/stores/modules/service.module'
import { VaCard, VaProgressCircle } from 'vuestic-ui'
import ServiceDetailsModal from './widgets/ServiceDetailsModal.vue'
import { useRouter } from 'vue-router'

const services = ref([])
const isLoading = ref(false)
const serviceDetails = ref([])
const isDetailsLoading = ref(false)
const isModalOpen = ref(false)
const router = useRouter()

const fetchServices = async () => {
  isLoading.value = true
  try {
    const response = await useServiceStore().getAllServices({ pageNumber: 1, pageSize: 10, isActive: true })
    services.value = response.data
  } catch (error) {
    console.error('Error fetching services:', error)
  } finally {
    isLoading.value = false
  }
}

const getServicesDetailById = async (id) => {
  isDetailsLoading.value = true
  isModalOpen.value = true
  try {
    const response = await useServiceStore().getServiceDetail(id)
    serviceDetails.value = response.procedures
  } catch (error) {
    console.error('Error fetching services details:', error)
  } finally {
    isDetailsLoading.value = false
  }
}

const closeModal = () => {
  isModalOpen.value = false
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value)
}

const truncateDescription = (description) => {
  const words = description.split(' ')
  return words.length > 13 ? words.slice(0, 15).join(' ') + '...' : description
}

const bookAppointment = () => {
  router.push('/appointment/booking')
}

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
  background-color: #fff;
  border-radius: 10px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
