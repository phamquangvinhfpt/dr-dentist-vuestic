<template>
  <VaCard class="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <h1 class="va-h1 text-4xl font-extrabold dark:text-blue-500 text-blue-900 text-center mb-4">Dịch Vụ Nha Khoa</h1>
      <p class="text-lg text-center mb-10">Chăm sóc nụ cười của bạn là ưu tiên hàng đầu của chúng tôi</p>
      <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div v-if="isLoading" class="col-span-full text-center">
          <VaProgressCircle indeterminate />
        </div>
        <div v-if="services.length === 0" class="col-span-full text-center">Không có dịch vụ nào để hiển thị.</div>
        <div v-for="service in services" :key="service.serviceID" class="service-card">
          <VaCard class="p-6 flex flex-col justify-between h-full">
            <div>
              <h2 class="text-2xl font-semibold dark:text-blue-500 text-blue-900">{{ service.name }}</h2>
              <p class="mt-2">{{ service.description }}</p>
            </div>
            <div class="flex justify-between items-center mt-4">
              <p class="text-sm md:text-lg font-bold text-blue-600">Giá: {{ formatCurrency(service.totalPrice) }}</p>
              <VaButton color="info" class="mb-2" size="medium" @click="getServicesDetailById(service.serviceID)">
                Chi Tiết
              </VaButton>
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
import { VaCard, VaButton, VaProgressCircle } from 'vuestic-ui'
import ServiceDetailsModal from './widgets/ServiceDetailsModal.vue'

const services = ref([])
const isLoading = ref(false)
const serviceDetails = ref([])
const isDetailsLoading = ref(false)
const isModalOpen = ref(false)

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

onMounted(fetchServices)
</script>

<style scoped>
.service-card {
  background-color: var(--va-background-primary);
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s,
    box-shadow 0.3s;
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

@media (max-width: 640px) {
  .service-card {
    margin: 0 10px;
  }
}
</style>
