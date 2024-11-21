<script setup lang="ts">
import { defineEmits, ref, computed, watch } from 'vue'
import { Doctor, Pagination, Search, SearchResponse } from '../../types'
import { useDoctorProfileStore } from '@/stores/modules/doctor.module'
import { getErrorMessage } from '@/services/utils'
import { useToast } from 'vuestic-ui/web-components'
import { watchDebounced } from '@vueuse/core'

const { init } = useToast()
const storeDoctor = useDoctorProfileStore()
const isMobile = computed(() => window.innerWidth < 768)
const loading = ref(false)
const doctors = ref<Doctor[]>([])
const doctorSearchRes = ref<SearchResponse | null>(null)
const selectedPractitioner = ref<Doctor | null>(null)
const selectedDoctorId = ref<string | null>(null)
const isOpen = ref(true)

const pagination = ref<Pagination>({
  page: 1,
  perPage: isMobile.value ? 3 : 6,
  total: 0,
})

const searchValue = ref<Search>({
  pageNumber: 1,
  pageSize: pagination.value.perPage,
  keyword: '',
  isActive: true,
})

const filters = ref({
  keyword: '',
})

const totalPages = computed(() => Math.ceil(pagination.value.total / pagination.value.perPage))
const searchDoctor = (search: Search) => {
  loading.value = true
  storeDoctor
    .getDoctors(search)
    .then((response) => {
      doctors.value = response.data
      doctorSearchRes.value = response
    })
    .catch((error) => {
      const message = getErrorMessage(error)
      init({
        title: 'error',
        message: message,
        color: 'danger',
      })
    })
    .finally(() => {
      loading.value = false
    })
}

const emit = defineEmits(['update:selectedPractitioner', 'practitionerSelected'])

const handleSelect = (practitioner: any) => {
  emit('practitionerSelected', practitioner)
  selectedPractitioner.value = practitioner
  selectedDoctorId.value = practitioner.id
  isOpen.value = false
}

const toggleSection = () => {
  isOpen.value = !isOpen.value
}

// watchers for search
watchDebounced(
  filters.value,
  () => {
    pagination.value.page = 1
    searchValue.value.keyword = filters.value.keyword
    searchDoctor(searchValue.value)
  },
  { debounce: 500, maxWait: 1000 },
)

// watchers for pagination
watch(
  () => pagination.value.page,
  () => {
    searchValue.value.pageNumber = pagination.value.page
    searchValue.value.pageSize = pagination.value.perPage
    searchDoctor(searchValue.value)
  },
  { immediate: true },
)

watch(
  () => pagination.value.perPage,
  () => {
    searchValue.value.pageNumber = 1
    searchValue.value.pageSize = pagination.value.perPage
    searchDoctor(searchValue.value)
  },
  { immediate: true },
)

watch(
  () => doctorSearchRes.value,
  () => {
    if (doctorSearchRes.value) {
      pagination.value.total = doctorSearchRes.value.totalCount
    }
  },
  { immediate: true },
)

//end watchers for pagination
watch(
  () => doctors.value,
  (newDoctors) => {
    if (selectedDoctorId.value && newDoctors.length) {
      const selectedDoctor = newDoctors.find((s) => s.id === selectedDoctorId.value)
      if (selectedDoctor) {
        selectedPractitioner.value = selectedDoctor
      }
    }
  },
)
</script>

<template>
  <div class="flex flex-col mb-3">
    <!-- Accordion header -->
    <div class="border dark:border-none rounded-lg overflow-hidden">
      <button
        class="w-full flex justify-between items-center p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
        @click="toggleSection"
      >
        <p class="text-xl font-bold text-blue-900 dark:text-blue-100">
          Select a doctor
          <span v-if="selectedPractitioner" class="text-sm font-normal text-gray-600 dark:text-gray-300">
            ({{ selectedPractitioner.firstName }} {{ selectedPractitioner.lastName }})
          </span>
        </p>
        <svg
          class="w-5 h-5 transition-transform duration-200"
          :class="{ 'rotate-180': isOpen }"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Accordion content -->
      <div v-show="isOpen" class="transition-all duration-200">
        <div class="p-4 border-t border-gray-200 dark:border-gray-700">
          <VaInput
            v-model="filters.keyword"
            placeholder="find doctors"
            icon="search"
            class="mb-4"
            clearable
            @clear="filters.keyword = ''"
          />
          <div class="h-[440px] md:h-[300px] lg:h-[325px] overflow-y-auto pr-4 scroll">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="practitioner in doctors" :key="practitioner.id" class="relative">
                <input
                  :id="`practitioner_${practitioner.id}`"
                  :value="practitioner"
                  type="radio"
                  name="practitioner"
                  class="peer sr-only"
                  :checked="selectedPractitioner === practitioner"
                  @change="handleSelect(practitioner)"
                />
                <label
                  :for="`practitioner_${practitioner.id}`"
                  class="flex h-full cursor-pointer flex-col rounded-lg p-4 peer-checked:bg-emerald-600 peer-checked:text-white dark:bg-gray-700 dark:peer-checked:bg-emerald-700"
                >
                  <img
                    :src="
                      practitioner.imageUrl ||
                      'https://plus.unsplash.com/premium_photo-1661718954553-f775043016d5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                    "
                    alt="Practitioner Image"
                    class="w-full h-32 object-cover rounded-lg mb-2"
                  />
                  <span class="font-medium">{{ practitioner.firstName }} {{ practitioner.lastName }}</span>
                  <span class="text-xs uppercase">{{ practitioner.doctorProfile.education }}</span>
                </label>
                <span
                  class="absolute right-4 top-4 box-content block h-3 w-3 rounded-full border-8 border-gray-300 bg-white peer-checked:border-emerald-400 dark:border-gray-600 dark:peer-checked:border-emerald-400"
                ></span>
              </div>
            </div>
          </div>
          <VaPagination
            v-model="pagination.page"
            class="items-center justify-end mt-4"
            buttons-preset="secondary"
            :pages="totalPages"
            :visible-pages="5"
            :boundary-links="true"
            :direction-links="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>
