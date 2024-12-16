<template>
  <div class="min-h-screen bg-gray-100 py-8 px-4">
    <div class="container mx-auto">
      <!-- Thanh tìm kiếm và bộ lọc sắp xếp nằm ở đầu -->
      <div class="mb-4 flex items-center">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Tìm kiếm bác sĩ theo tên hoặc chuyên môn..."
          class="w-full px-4 py-2 border rounded-md mr-4"
        />
        <select v-model="sortField" class="px-4 py-2 border rounded-md">
          <option value="rating">Sắp xếp theo Đánh giá</option>
          <option value="experience">Sắp xếp theo Kinh nghiệm</option>
        </select>
        <select v-model="sortOrder" class="px-4 py-2 border rounded-md ml-2">
          <option value="asc">Tăng dần</option>
          <option value="desc">Giảm dần</option>
        </select>
      </div>
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-600">{{ error }}</p>
        <button class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700" @click="fetchDoctors">
          Thử lại
        </button>
      </div>
      <DoctorsGrid v-else :doctors="paginatedDoctors" />
      <div class="flex justify-between items-center mt-4">
        <button
          :disabled="currentPage === 1"
          class="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          @click="prevPage"
        >
          <span class="material-icons">arrow_back</span>
          Trước
        </button>
        <button
          :disabled="currentPage === totalPages"
          class="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          @click="nextPage"
        >
          Sau
          <span class="material-icons">arrow_forward</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import DoctorsGrid from './DoctorsGrid.vue'
import { useDoctorProfileStore } from '@stores/modules/doctor.module'

const doctorStore = useDoctorProfileStore()
const doctors = ref([])
const loading = ref(true)
const error = ref(null)
const currentPage = ref(1)
const itemsPerPage = 6
const searchQuery = ref('')
const sortField = ref('rating') // Trường sắp xếp mặc định
const sortOrder = ref('asc') // Thứ tự sắp xếp mặc định

const totalPages = computed(() => Math.ceil(filteredDoctors.value.length / itemsPerPage))

const filteredDoctors = computed(() => {
  const lowerCaseQuery = searchQuery.value.toLowerCase()
  return doctors.value.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(lowerCaseQuery) || doctor.specialty.toLowerCase().includes(lowerCaseQuery),
  )
})

const sortedDoctors = computed(() => {
  return [...filteredDoctors.value].sort((a, b) => {
    const aValue = sortField.value === 'experience' ? parseInt(a.experience) : a.rating
    const bValue = sortField.value === 'experience' ? parseInt(b.experience) : b.rating
    return sortOrder.value === 'asc' ? aValue - bValue : bValue - aValue
  })
})

const paginatedDoctors = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return sortedDoctors.value.slice(start, start + itemsPerPage)
})

async function fetchDoctors() {
  loading.value = true
  error.value = null
  try {
    const response = await doctorStore.getDoctors({ isActive: true })
    console.log('API Response:', response)

    if (!response) {
      throw new Error('No response received from server')
    }

    const doctorData = response.data || response

    if (!doctorData || !Array.isArray(doctorData)) {
      throw new Error(`Invalid response format: ${JSON.stringify(response)}`)
    }

    doctors.value = doctorData.map((doc) => ({
      id: doc.id,
      name: `${doc.firstName} ${doc.lastName}`,
      specialty: doc.doctorProfile?.specialty || doc.specialty || 'General Practice',
      experience: `${doc.doctorProfile?.yearOfExp || doc.yearOfExp || 0} years`,
      image: doc.imageUrl,
      rating: doc.rating?.value || doc.rating || 0,
    }))

    console.log('Processed doctors:', doctors.value)
  } catch (e) {
    console.error('Fetch error details:', e)
    error.value = `Failed to load doctors: ${e.message}`
  } finally {
    loading.value = false
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

onMounted(() => {
  fetchDoctors()
})
</script>

<style scoped>
.container {
  max-width: 1200px; /* Giới hạn chiều rộng tối đa */
}

input,
select {
  width: auto; /* Đặt chiều rộng tự động cho các trường nhập */
}

button {
  font-size: 0.875rem; /* Kích thước chữ nhỏ hơn */
}
</style>
