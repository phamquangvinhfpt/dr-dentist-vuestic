<script lang="ts" setup>
import { useDoctorProfileStore } from '@stores/modules/doctor.module'
import { useRouter } from 'vue-router'
import { onMounted, Ref, ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { User } from './types'
import { VaButton, VaAvatar, VaInput, VaPagination } from 'vuestic-ui'
import '@mdi/font/css/materialdesignicons.css'
const { t } = useI18n()
const userStore = useDoctorProfileStore()
const router = useRouter()

const userList: Ref<User[]> = ref([])

const selectedDoctorId = ref<string | null>(null)

const searchQuery = ref('')
const filteredDoctors = computed(() => {
  if (!userList.value || userList.value.length === 0) return []

  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return userList.value // Return all doctors if no search query

  return userList.value.filter(
    (doctor) => doctor.email?.toLowerCase().includes(query) || doctor.userName?.toLowerCase().includes(query),
  )
})

const toggleActionBar = (doctorId: string) => {
  selectedDoctorId.value = selectedDoctorId.value === doctorId ? null : doctorId
}

const getAllDoctors = async () => {
  try {
    console.log('Fetching doctors...')
    const res = await userStore.getDoctors()
    console.log('Response:', res)

    userList.value = Array.isArray(res) ? res : res?.data ?? []

    console.log('UserList:', userList.value)
  } catch (error) {
    console.error('Error fetching doctors:', error)
  }
}

const viewDetails = (id: string, event?: Event) => {
  if (event) {
    event.stopPropagation()
  }
  userStore.doctorId = id
  router.push({
    name: 'doctor-detail',
    params: { id },
  })
}

const getSrcAvatar = (row: any) => {
  const img = row.rowData?.imageUrl
  const url = import.meta.env.VITE_APP_BASE_URL as string
  const url_without_api = url.slice(0, -3)
  if (img) return `${url_without_api}${img}`
  return ''
}

const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalItems = ref(0)

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))

const paginatedDoctors = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredDoctors.value.slice(start, end)
})

onMounted(() => {
  getAllDoctors()
})

watch(currentPage, () => {
  // You can add logic here if you need to fetch data from API on page change
})
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
    <div class="mb-4 flex justify-between items-center">
      <VaInput v-model="searchQuery" placeholder="Search by name or email..." class="max-w-md" />
      <VaButton color="primary" @click="router.push('/doctors/create')">
        <template #prepend>
          <i class="mdi mdi-plus mr-2"></i>
        </template>
        Add Doctor
      </VaButton>
    </div>

    <div class="bg-white shadow overflow-hidden sm:rounded-md">
      <div class="grid grid-cols-5 gap-4 px-6 py-3 bg-gray-50 text-sm font-medium text-gray-500">
        <div></div>
        <div>Name</div>
        <div>Gender</div>
        <div>Email</div>
        <div>Phone</div>
      </div>

      <div v-if="filteredDoctors.length === 0" class="py-8 text-center text-gray-500">
        No doctors found matching your search criteria
      </div>

      <ul v-else>
        <li v-for="doctor in paginatedDoctors" :key="doctor.id" class="border-b border-gray-200 last:border-b-0">
          <div
            class="grid grid-cols-5 gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ease-in-out"
            @click="toggleActionBar(doctor.id)"
          >
            <div class="flex items-center">
              <VaAvatar
                :src="getSrcAvatar({ rowData: doctor })"
                class="w-10 h-10 bg-warning font-bold"
                :fallback-text="doctor.userName?.charAt(0)?.toUpperCase()"
              />
            </div>
            <div class="flex items-center text-sm font-medium text-gray-900">
              {{ doctor.userName }}
            </div>
            <div class="flex items-center text-sm text-gray-900">
              {{ doctor.gender ? 'Male' : 'Female' }}
            </div>
            <div class="flex items-center text-sm text-gray-900">
              {{ doctor.email.replace(/(\w{3})[\w.-]+(@[\w.]+)/, '$1***$2') }}
            </div>
            <div class="flex items-center text-sm text-gray-900">
              {{ doctor.phoneNumber?.replace(/(\d{3})(\d{3})(\d{4})/, '$1-***-$3') }}
            </div>
          </div>

          <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 transform -translate-y-2"
            enter-to-class="opacity-100 transform translate-y-0"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 transform translate-y-0"
            leave-to-class="opacity-0 transform -translate-y-2"
          >
            <div
              v-if="selectedDoctorId === doctor.id"
              class="bg-gray-50/80 px-6 py-4 border-t border-gray-200 backdrop-blur-sm shadow-inner relative"
            >
              <div class="absolute inset-0 bg-white/30 backdrop-blur-sm"></div>
              <div class="flex justify-end relative z-10">
                <VaButton color="primary" @click="viewDetails(doctor.id, $event)">
                  <template #prepend>
                    <i class="mdi mdi-open-in-new mr-2"></i>
                  </template>
                  {{ t('viewDetail') }}
                </VaButton>
              </div>
            </div>
          </Transition>
        </li>
      </ul>

      <div class="flex justify-center mt-6">
        <VaPagination v-model="currentPage" :total-pages="totalPages" :visible-pages="5" class="mb-4" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.bg-gray-50 {
  background-color: #f9fafb;
}

.border-t {
  border-top-width: 1px;
}

.shadow-inner {
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
}
</style>
