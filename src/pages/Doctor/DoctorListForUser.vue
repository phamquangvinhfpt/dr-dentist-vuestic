<template>
  <VaCard style="padding: 0.5%" class="doctor-listing-page">
    <VaCardContent style="padding-top: 0%">
      <div style="padding-top: 0%" class="md:container mx-auto p-4">
        <!-- Header -->

        <VaCard style="margin-bottom: 0%" class="text-center mb-6">
          <h1 class="text-2xl font-semibold va-h1 mb-2">{{ t('doctor.doctor_list') }}</h1>
          <p class="text-sm">{{ t('doctor.find_doctor') }}</p>
        </VaCard>

        <!-- Search and Filters -->
        <div class="rounded-2xl p-4 shadow-md space-y-4">
          <div class="relative mb-4">
            <VaInput
              v-model="searchQuery"
              type="text"
              :placeholder="t('doctor.find')"
              :label="t('doctor.search_doctor')"
            >
              <template #prependInner>
                <VaIcon name="pageview" color="secondary" />
              </template>
            </VaInput>
          </div>

          <!-- Filters -->
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <VaSelect v-model="selectedTypeService" :options="typeServiceOptions" :label="t('doctor.type_service')" />
            </div>

            <div>
              <VaSelect v-model="sortField" :options="arrange" :label="t('doctor.Sort_By')" />
            </div>

            <div>
              <VaSelect v-model="sortOrder" :options="step" :label="t('doctor.Order')" />
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
            buttons-preset="secondary"
            :pages="totalPages"
            :boundary-links="true"
            :direction-links="true"
            :visible-pages="isMobile ? 3 : 5"
            class="va-pagination--small"
          />
          <div v-if="!isMobile" class="flex justify-center gap-4 w-full">
            <VaButton
              :disabled="currentPage === 1"
              icon="arrow_back"
              size="small"
              class="pagination-button"
              @click="prevPage"
            >
              {{ t('doctor.previous_page') }}
            </VaButton>
            <VaButton
              :disabled="currentPage === totalPages"
              icon-right="arrow_forward"
              size="small"
              class="pagination-button"
              @click="nextPage"
            >
              {{ t('doctor.NEXT_PAGE') }}
            </VaButton>
          </div>
        </div>
      </div>
    </VaCardContent>
  </VaCard>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import DoctorsGrid from './DoctorsGrid.vue'
import { useDoctorProfileStore } from '@/stores/modules/doctor.module'
import { useServiceStore } from '@/stores/modules/service.module'
import { VaCard, VaCardContent } from 'vuestic-ui'
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
</style>
