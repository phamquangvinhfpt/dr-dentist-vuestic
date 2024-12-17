<template>
  <VaCard class="doctor-listing-page">
    <VaCardContent>
      <div class="md:container md:mx-auto px-4 py-8">
        <!-- Mobile optimized header -->
        <div class="text-center mb-6">
          <h1 class="va-h2 mb-2">Danh Sách Bác Sĩ</h1>
          <p class="text-gray-600 dark:text-gray-400 text-sm">Tìm kiếm bác sĩ phù hợp với bạn</p>
        </div>

        <!-- Search and Filters - Responsive Layout -->
        <div class="space-y-4 mb-6 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
          <!-- Full-width on mobile, inline on desktop -->
          <VaInput v-model="searchQuery" placeholder="Tìm kiếm bác sĩ..." label="Tìm kiếm" class="w-full sm:flex-grow">
            <template #prepend>
              <VaIcon name="search" />
            </template>
          </VaInput>

          <!-- Flex layout on desktop to put selects side by side -->
          <div class="sm:flex sm:space-x-4 mt-4 sm:mt-0">
            <VaSelect
              v-model="sortField"
              :options="[
                { value: 'rating', text: 'Đánh giá' },
                { value: 'experience', text: 'Kinh nghiệm' },
              ]"
              class="w-full sm:w-auto mb-4 sm:mb-0"
              label="Sắp xếp theo"
            />
            <VaSelect
              v-model="sortOrder"
              :options="[
                { value: 'desc', text: 'Cao đến thấp' },
                { value: 'asc', text: 'Thấp đến cao' },
              ]"
              class="w-full sm:w-auto"
              label="Thứ tự"
            />
          </div>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="flex justify-center items-center py-8">
          <VaProgressCircle indeterminate size="large" />
        </div>

        <!-- Error state -->
        <VaAlert v-else-if="error" color="danger" class="mb-6" closeable>
          {{ error }}
          <template #actions>
            <VaButton size="small" @click="fetchDoctors"> Thử lại </VaButton>
          </template>
        </VaAlert>

        <!-- Doctors grid -->
        <DoctorsGrid v-else :doctors="paginatedDoctors" />

        <!-- Mobile optimized pagination -->
        <div class="flex flex-col items-center gap-4 mt-6">
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
              class="flex-1 sm:flex-none"
              @click="prevPage"
            >
              Trước
            </VaButton>
            <VaButton
              :disabled="currentPage === totalPages"
              icon-right="arrow_forward"
              size="small"
              class="flex-1 sm:flex-none"
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
import {
  VaCard,
  VaCardContent,
  VaInput,
  VaSelect,
  VaProgressCircle,
  VaAlert,
  VaButton,
  VaPagination,
  VaIcon,
} from 'vuestic-ui'

const doctorStore = useDoctorProfileStore()
const doctors = ref([])
const loading = ref(true)
const error = ref(null)
const currentPage = ref(1)
const searchQuery = ref('')
const sortField = ref('rating')
const sortOrder = ref('desc')

// Mobile detection
const isMobile = computed(() => {
  return window.innerWidth < 640
})

const itemsPerPage = ref(isMobile.value ? 6 : 8)

// Update items per page when screen size changes
window.addEventListener('resize', () => {
  itemsPerPage.value = isMobile.value ? 6 : 8
})

const totalPages = computed(() => Math.ceil(filteredDoctors.value.length / itemsPerPage.value))

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
    doctors.value = response.data.map((doc) => ({
      id: doc.id,
      name: `${doc.firstName} ${doc.lastName}`,
      specialty: doc.doctorProfile?.specialty || 'General Practice',
      experience: `${doc.doctorProfile?.yearOfExp || 0} years`,
      image: doc.imageUrl,
      rating: doc.rating?.value || 0,
    }))
  } catch (e) {
    console.error('Fetch error:', e)
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
.doctor-listing-page {
  min-height: 100vh;
  background-color: var(--va-background-primary);
}

:deep(.va-input__content) {
  background-color: var(--va-background-element);
}

:deep(.va-select__value) {
  background-color: var(--va-background-element);
}

@media (max-width: 640px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  :deep(.va-pagination) {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
