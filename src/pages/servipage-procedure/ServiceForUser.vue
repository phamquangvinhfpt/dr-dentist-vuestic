<template>
  <div class="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-4xl font-extrabold text-blue-900 text-center mb-4">Dịch Vụ Nha Khoa</h1>
      <p class="text-lg text-gray-700 text-center mb-10">Chăm sóc nụ cười của bạn là ưu tiên hàng đầu của chúng tôi</p>
      <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div v-if="isLoading" class="col-span-1 text-center">Đang tải...</div>
        <div v-if="services.length === 0" class="col-span-1 text-center">Không có dịch vụ nào để hiển thị.</div>
        <div v-for="service in services" :key="service.serviceID" class="service-card">
          <div class="p-6 flex flex-col justify-between h-full">
            <div>
              <h2 class="text-2xl font-semibold text-blue-900">{{ service.name }}</h2>
              <p class="text-gray-600 mt-2">{{ service.description }}</p>
            </div>
            <div class="flex justify-between items-center mt-4">
              <p class="text-lg font-bold text-blue-600">Giá: {{ formatCurrency(service.totalPrice) }}</p>
              <button class="btn" @click="viewServiceDetail(service.serviceID)">Xem Chi Tiết</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useServiceStore } from '@/stores/modules/service.module'
import { useRouter } from 'vue-router'

const services = ref([])
const isLoading = ref(false)
const router = useRouter()

const fetchServices = async () => {
  isLoading.value = true
  try {
    const response = await useServiceStore().getAllServices({ pageNumber: 1, pageSize: 10, isActive: true })
    services.value = response.data // Ensure response.data contains the list of services
  } catch (error) {
    console.error('Error fetching services:', error)
  } finally {
    isLoading.value = false
  }
}

const viewServiceDetail = (id) => {
  router.push({ name: 'service-detail', params: { id } })
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
  background-color: white;
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

.btn {
  background-color: #358deb; /* Bootstrap primary color */
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn:hover {
  background-color: #1a0dad; /* Darker shade on hover */
}

@media (max-width: 640px) {
  .service-card {
    margin: 0 10px; /* Add margin for smaller screens */
  }
}
</style>
