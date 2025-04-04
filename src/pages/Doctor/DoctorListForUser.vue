<template>
  <VaCard class="doctor-listing-page bg-gray-50 min-h-screen py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header Section with Hero Banner -->
      <div class="bg-gradient-to-r from-primary to-secondary rounded-xl p-8 mb-8 text-white shadow-lg">
        <h1 class="text-3xl font-bold mb-3 text-center">{{ t('doctor.doctor_list') }}</h1>
        <p class="text-lg text-center opacity-90">{{ t('doctor.find_doctor') }}</p>
      </div>

      <!-- Search and Filters Card -->
      <VaCard class="mb-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div class="p-6">
          <!-- Search Bar -->
          <div class="mb-6">
            <VaInput
              v-model="searchQuery"
              type="text"
              :placeholder="t('doctor.find')"
              :label="t('doctor.search_doctor')"
              class="search-input"
            >
              <template #prependInner>
                <VaIcon name="search" color="primary" />
              </template>
            </VaInput>
          </div>

          <!-- Filters Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <VaSelect
              v-model="selectedTypeService"
              :options="typeServiceOptions"
              :label="t('doctor.type_service')"
              class="filter-select"
            />
            <VaSelect v-model="sortField" :options="arrange" :label="t('doctor.Sort_By')" class="filter-select" />
            <VaSelect v-model="sortOrder" :options="step" :label="t('doctor.Order')" class="filter-select" />
          </div>
        </div>
      </VaCard>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <VaProgressCircle indeterminate color="primary" size="large" />
      </div>

      <!-- Error State -->
      <VaAlert v-else-if="error" color="danger" class="mb-6 shadow-md" closeable>
        <div class="flex items-center justify-between">
          <span>{{ error }}</span>
          <VaButton size="small" color="danger" class="ml-4" @click="fetchDoctors">
            {{ t('common.retry') }}
          </VaButton>
        </div>
      </VaAlert>

      <!-- Doctors Grid -->
      <div v-else>
        <DoctorsGrid :doctors="paginatedDoctors" class="mb-8" />
      </div>

      <!-- Pagination Section -->
      <VaCard class="bg-white rounded-lg shadow-md p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <VaPagination
          v-model="currentPage"
          :pages="totalPages"
          :boundary-links="true"
          :direction-links="true"
          :visible-pages="isMobile ? 3 : 5"
          class="pagination-modern"
        />

        <div v-if="!isMobile" class="flex gap-4">
          <VaButton
            :disabled="currentPage === 1"
            icon="arrow_back"
            preset="secondary"
            class="pagination-button hover:shadow-md transition-shadow"
            @click="prevPage"
          >
            {{ t('doctor.previous_page') }}
          </VaButton>
          <VaButton
            :disabled="currentPage === totalPages"
            icon-right="arrow_forward"
            preset="primary"
            class="pagination-button hover:shadow-md transition-shadow"
            @click="nextPage"
          >
            {{ t('doctor.NEXT_PAGE') }}
          </VaButton>
        </div>
      </VaCard>
    </div>
  </VaCard>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import DoctorsGrid from './DoctorsGrid.vue'
import { useDoctorProfileStore } from '@/stores/modules/doctor.module'
import { useServiceStore } from '@/stores/modules/service.module'
import { VaCard } from 'vuestic-ui'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
// Define interfaces for our data structures
interface Doctor {
  id: string | number
  name: string
  specialty: string
  typeServiceID: string | number | null
  experience: string
  image: string
  rating: number
}

interface ServiceType {
  id: string | number
  typeName: string
}

interface SelectOption {
  text: string
  value: string
}

// Store instantiation
const doctorStore = useDoctorProfileStore()
const serviceStore = useServiceStore()

// Reactive references with type annotations
const doctors = ref<Doctor[]>([])
const loading = ref<boolean>(true)
const error = ref<string | null>(null)
const currentPage = ref<number>(1)
const searchQuery = ref<string>('')
const sortField = ref<SelectOption>()
const sortOrder = ref<SelectOption>()
const selectedTypeService = ref<SelectOption>()
const arrange = ref<SelectOption[]>([
  { text: t('doctor.Rating'), value: 'rating' },
  { text: t('doctor.experience'), value: 'experience' },
])
const step = ref<SelectOption[]>([
  { text: t('doctor.asc'), value: 'asc' },
  { text: t('doctor.desc'), value: 'desc' },
])

// Computed properties with type annotations
const typeServiceOptions = computed(() => {
  return serviceStore.typeServices.map((service: ServiceType) => ({
    value: service.id,
    text: service.typeName,
  }))
})

const isMobile = computed((): boolean => {
  return window.innerWidth < 640
})

const itemsPerPage = ref<number>(isMobile.value ? 6 : 6)

// Update items per page when screen size changes
window.addEventListener('resize', () => {
  itemsPerPage.value = isMobile.value ? 6 : 6
})

const totalPages = computed((): number => Math.ceil(filteredDoctors.value.length / itemsPerPage.value))

const filteredDoctors = computed((): Doctor[] => {
  const lowerCaseQuery = searchQuery.value.toLowerCase()
  return doctors.value.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(lowerCaseQuery) || doctor.specialty.toLowerCase().includes(lowerCaseQuery)
    const matchesTypeService = selectedTypeService.value
      ? doctor.typeServiceID === selectedTypeService.value.value
      : true
    return matchesSearch && matchesTypeService
  })
})

const sortedDoctors = computed((): Doctor[] => {
  if (!sortField.value || !sortField.value.value) return filteredDoctors.value

  const key = sortField.value.value // 'experience' hoặc 'rating'
  return [...filteredDoctors.value].sort((a, b) => {
    const aValue = key === 'experience' ? parseInt(a.experience) : a.rating
    const bValue = key === 'experience' ? parseInt(b.experience) : b.rating
    return sortOrder.value?.value === 'asc' ? aValue - bValue : bValue - aValue
  })
})

const paginatedDoctors = computed((): Doctor[] => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return sortedDoctors.value.slice(start, start + itemsPerPage.value)
})

// Functions with type annotations
async function fetchDoctors(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    const response = await doctorStore.getDoctors({ isActive: true })
    if (!response || !Array.isArray(response.data)) {
      throw new Error('Invalid response format')
    }

    await serviceStore.getServiceTypes()
    const serviceTypes = serviceStore.typeServices

    doctors.value = response.data.map((doc: any): Doctor => {
      const typeService = serviceTypes.find((type: ServiceType) => type.id === doc.doctorProfile?.typeServiceID)
      return {
        id: doc.id,
        name: `${doc.firstName} ${doc.lastName}`,
        specialty: typeService ? typeService.typeName : 'General Practice',
        typeServiceID: typeService ? typeService.id : null,
        experience: `${doc.doctorProfile?.yearOfExp || 0} ` + t('doctor.years'),
        image: doc.imageUrl,
        rating: doc.rating || 0,
      }
    })
  } catch (e: any) {
    console.error('Fetch error:', e)
    error.value = `Failed to load doctors: ${e.message}`
  } finally {
    loading.value = false
  }
}

function nextPage(): void {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

function prevPage(): void {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

// Watch with type annotations
watch(currentPage, (newPage: number) => {
  currentPage.value = newPage
  console.log(currentPage.value)
})
watch([sortField, sortOrder], ([newField, newOrder]) => {
  console.log('Sort Field:', newField?.value)
  console.log('Sort Order:', newOrder)
})

onMounted(() => {
  fetchDoctors()
})
</script>

<style scoped>
.doctor-listing-page {
  background-color: #f8fafc;
}

.search-input :deep(.va-input-wrapper__field) {
  border-radius: 0.75rem;
  transition: all 0.3s ease;
}

.search-input :deep(.va-input-wrapper__field:focus-within) {
  box-shadow: 0 0 0 3px rgba(var(--va-primary-rgb), 0.2);
}

.filter-select :deep(.va-select__field) {
  border-radius: 0.75rem;
}

.pagination-modern {
  --va-pagination-button-border-radius: 0.5rem;
  --va-pagination-button-padding: 0.5rem 1rem;
  --va-pagination-button-margin: 0 0.25rem;
}

.pagination-modern :deep(.va-pagination__button) {
  transition: all 0.2s ease;
}

.pagination-modern :deep(.va-pagination__button:hover) {
  transform: translateY(-1px);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.pagination-button {
  min-width: 120px;
  border-radius: 0.5rem;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .pagination-button {
    min-width: auto;
    padding: 0.5rem;
  }
}

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
.user-detail {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.section {
  margin-bottom: 20px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card {
  display: flex;
  gap: 20px;
}

.profile-picture img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #3498db;
}

.details ul {
  list-style: none;
  padding: 0;
  font-size: 0.95em;
  color: #4a4a4a;
}

.edit-button {
  padding: 10px 20px;
  background-color: #3498db;
  text-decoration: none;
  border-radius: 6px;
  color: white;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.edit-button:hover {
  background-color: #217dbb;
}

.status {
  margin-left: 10px;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.85em;
  font-weight: bold;
}

.status.confirmed {
  background-color: #eaffea;
  color: #28a745;
}

.status.active {
  background-color: #e7f3ff;
  color: #007bff;
}

.status.not-confirmed {
  background-color: #ffe6e6;
  color: #e74c3c;
}

.btn-back {
  display: inline-block;
  padding: 12px 24px;
  background-color: #3498db;
  color: white;
  font-weight: bold;
  border-radius: 6px;
  text-align: center;
  transition: background-color 0.3s ease;
}

.btn-back:hover {
  background-color: #217dbb;
}

.additional-info {
  background-color: #f4f9ff;
  border-radius: 12px;
  border: 1px solid #d6eaff;
}
</style>
