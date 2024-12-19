<template>
  <VaCard style="padding: 0.5%" class="doctor-listing-page">
    <VaCardContent style="padding-top: 0%">
      <div style="padding-top: 0%" class="container mx-auto p-4">
        <!-- Header -->

        <div style="margin-bottom: 0%" class="text-center mb-6">
          <h1 class="text-2xl font-semibold text-gray-800 mb-2">Danh Sách Bác Sĩ</h1>
          <p class="text-gray-600 text-sm">Tìm kiếm bác sĩ phù hợp với bạn</p>
        </div>

        <!-- Search and Filters -->
        <div class="bg-white rounded-2xl p-4 shadow-md space-y-4">
          <div class="relative mb-4">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Tìm bác sĩ..."
              class="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
            />
            <svg
              class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              width="16"
              height="16"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-4.35-4.35m1.6-5.4A7.5 7.5 0 1110 2.5a7.5 7.5 0 018.25 8.25z"
              ></path>
            </svg>
          </div>

          <!-- Filters -->
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label class="font-medium text-sm">Loại Dịch Vụ</label>
              <select
                v-model="selectedTypeService"
                class="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-indigo-300"
              >
                <option value="">Tất cả Dịch Vụ</option>
                <option v-for="service in typeServiceOptions" :key="service.value" :value="service.value">
                  {{ service.text }}
                </option>
              </select>
            </div>

            <div>
              <label class="font-medium text-sm">Sắp Xếp Theo</label>
              <select
                v-model="sortField"
                class="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-indigo-300"
              >
                <option value="rating">Đánh Giá</option>
                <option value="experience">Kinh Nghiệm</option>
              </select>
            </div>

            <div>
              <label class="font-medium text-sm">Thứ Tự</label>
              <select
                v-model="sortOrder"
                class="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-indigo-300"
              >
                <option value="asc">Từ Thấp Đến Cao</option>
                <option value="desc">Từ Cao Đến Thấp</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Loading / Error States -->
        <div v-if="loading" class="flex justify-center items-center py-8">
          <VaProgressCircle indeterminate size="large" />
        </div>
        <VaAlert v-else-if="error" color="danger" class="mb-6" closeable>
          {{ error }}
          <template #actions>
            <VaButton size="small" @click="fetchDoctors"> Thử lại </VaButton>
          </template>
        </VaAlert>

        <!-- Doctors Grid -->
        <DoctorsGrid v-else :doctors="paginatedDoctors" />

        <!-- Pagination -->
        <div class="flex justify-center gap-4 mt-6">
          <VaPagination
            v-model="currentPage"
            :pages="totalPages"
            :visible-pages="isMobile ? 3 : 5"
            class="va-pagination--small"
          />
          <div class="flex justify-center gap-4 w-full">
            <VaButton
              :disabled="currentPage === 1"
              icon="arrow_back"
              size="small"
              class="pagination-button"
              @click="prevPage"
            >
              Trước
            </VaButton>
            <VaButton
              :disabled="currentPage === totalPages"
              icon-right="arrow_forward"
              size="small"
              class="pagination-button"
              @click="nextPage"
            >
              Sau
            </VaButton>
          </div>
        </div>
      </div>
    </VaCardContent>
  </VaCard>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import DoctorsGrid from './DoctorsGrid.vue'
import { useDoctorProfileStore } from '@/stores/modules/doctor.module'
import { useServiceStore } from '@/stores/modules/service.module'
import { VaCard, VaCardContent } from 'vuestic-ui'

const doctorStore = useDoctorProfileStore()
const serviceStore = useServiceStore()
const doctors = ref([])
const loading = ref(true)
const error = ref(null)
const currentPage = ref(1)
const searchQuery = ref('')
const sortField = ref('')
const sortOrder = ref('')
const selectedTypeService = ref(null) // State for selected type service

// Fetch type services for the filter
const typeServiceOptions = computed(() => {
  return serviceStore.typeServices.map((service) => ({
    value: service.id,
    text: service.typeName,
  }))
})

// Mobile detection
const isMobile = computed(() => {
  return window.innerWidth < 640
})

const itemsPerPage = ref(isMobile.value ? 6 : 6)

// Update items per page when screen size changes
window.addEventListener('resize', () => {
  itemsPerPage.value = isMobile.value ? 6 : 6
})

const totalPages = computed(() => Math.ceil(filteredDoctors.value.length / itemsPerPage.value))
const filteredDoctors = computed(() => {
  const lowerCaseQuery = searchQuery.value.toLowerCase()
  return doctors.value.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(lowerCaseQuery) || doctor.specialty.toLowerCase().includes(lowerCaseQuery)
    const matchesTypeService = selectedTypeService.value ? doctor.typeServiceID === selectedTypeService.value : true
    return matchesSearch && matchesTypeService
  })
})

const sortedDoctors = computed(() => {
  return [...filteredDoctors.value].sort((a, b) => {
    const aValue = sortField.value === 'experience' ? parseInt(a.experience) : a.rating
    const bValue = sortField.value === 'experience' ? parseInt(b.experience) : b.rating
    return sortOrder.value === 'asc' ? aValue - bValue : bValue - aValue
  })
})

const paginatedDoctors = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return sortedDoctors.value.slice(start, start + itemsPerPage.value)
})

async function fetchDoctors() {
  loading.value = true
  error.value = null
  try {
    const response = await doctorStore.getDoctors({ isActive: true })
    if (!response || !Array.isArray(response.data)) {
      throw new Error('Invalid response format')
    }

    // Fetch service types
    await serviceStore.getServiceTypes()

    const serviceTypes = serviceStore.typeServices

    doctors.value = response.data.map((doc) => {
      const typeService = serviceTypes.find((type) => type.id === doc.doctorProfile?.typeServiceID)
      return {
        id: doc.id,
        name: `${doc.firstName} ${doc.lastName}`,
        specialty: typeService ? typeService.typeName : 'General Practice',
        typeServiceID: typeService ? typeService.id : null, // Store typeServiceID for filtering
        experience: `${doc.doctorProfile?.yearOfExp || 0} years`,
        image: doc.imageUrl,
        rating: doc.rating || 0,
      }
    })
  } catch (e) {
    console.error('Fetch error:', e)
    error.value = `Failed to load doctors: ${e.message}`
  } finally {
    loading.value = false
  }
}

// Function to handle type service change

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
.doctor-listing-page {
  background-color: #f9fafb;
  min-height: 100vh;
  padding: 2rem;
}

:deep(.va-input__content),
:deep(.va-select__value) {
  background-color: #f1f5f9;
}

:deep(.va-pagination) {
  justify-content: center;
  align-items: center;
}

@media (max-width: 640px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .va-pagination {
    flex-wrap: wrap;
    justify-content: center;
  }
}

select {
  background-color: #f3f4f6;
  padding-right: 2.5rem;
  background-position: right 0.75rem center;
  background-size: 1rem;
  padding-right: 2rem;
  border-radius: 8px;
}

.pagination {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
}

.pagination-button {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
  color: #333;
  cursor: pointer;
  transition:
    background-color 0.3s,
    color 0.3s;
}

.pagination-button:hover {
  background-color: #007bff;
  color: white;
}

.pagination-button:disabled {
  background-color: #f0f0f0;
  color: #aaa;
  cursor: not-allowed;
}

.pagination-button.active {
  background-color: #007bff;
  color: white;
  font-weight: bold;
  cursor: default;
}
</style>
