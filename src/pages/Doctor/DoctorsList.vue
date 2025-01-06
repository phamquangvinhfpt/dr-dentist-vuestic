<script lang="ts" setup>
import { useDoctorProfileStore } from '@stores/modules/doctor.module'
import { useRouter } from 'vue-router'
import { onMounted, Ref, ref, computed, watch } from 'vue'
import { User } from './types'
import { VaButton, VaAvatar, VaInput } from 'vuestic-ui'
import '@mdi/font/css/materialdesignicons.css'

const userStore = useDoctorProfileStore()
const router = useRouter()

const userList: Ref<User[]> = ref([]) // List of all doctors
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
const totalItems = computed(() => filteredDoctors.value.length) // Total filtered items based on the search query

const currentPage = ref(1)
const itemsPerPage = ref(5)

// Define pageSize options
const pageSizeOptions = ref([5, 10, 20, 50]) // Array of page size options

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value)) // Recalculate total pages based on filtered list

const paginatedDoctors = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredDoctors.value.slice(start, end)
})

const toggleActionBar = (doctorId: string) => {
  selectedDoctorId.value = selectedDoctorId.value === doctorId ? null : doctorId
}

// Change items per page
const changeItemsPerPage = (event: Event) => {
  const target = event.target as HTMLSelectElement | null
  if (target) {
    itemsPerPage.value = parseInt(target.value, 10) // Convert value to integer
    currentPage.value = 1 // Reset to the first page
  }
}

const getAllDoctors = async () => {
  try {
    const res = await userStore.getDoctors({ isActive: true })
    userList.value = Array.isArray(res) ? res : res?.data ?? []
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
    name: 'doctor-detail-admin',
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

const updateDoctor = (id: string, event?: Event) => {
  if (event) {
    event.stopPropagation()
  }
  router.push(`/doctors/update/${id}`)
}

onMounted(() => {
  getAllDoctors()
})

watch(currentPage, () => {
  // Logic for fetching data on page change can be added here
})
</script>

<template>
  <VaCard style="padding-top: 0.1rem" class="min-h-screen bg-gradient-to-br from-gray-50 to-white py-10 px-4 sm:px-10">
    <!-- Header Section -->
    <VaCard class="mb-6 flex justify-between items-center">
      <div class="flex-1 max-w-md">
        <VaInput
          v-model="searchQuery"
          placeholder="Tìm kiếm bác sĩ theo tên hoặc email..."
          rounded
          outlined
          clearable
        /><svg
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
      <VaButton color="primary" class="rounded-md" @click="router.push('/doctors/create')">
        <template #prepend>
          <i class="mdi mdi-plus mr-2"></i>
        </template>
        Thêm Bác Sĩ
      </VaButton>
    </VaCard>

    <!-- Doctor List Section -->
    <VaCard class="shadow-md rounded-lg overflow-hidden">
      <div
        style="padding: 1%"
        class="grid grid-cols-5 gap-4 px-6 py-3 bg-indigo-100 text-sm font-semibold text-indigo-800"
      >
        <div></div>
        <div>Tên</div>
        <div>Giới Tính</div>
        <div>Email</div>
        <div>Điện Thoại</div>
      </div>

      <div v-if="filteredDoctors.length === 0" class="py-10 text-center text-gray-500">
        Không tìm thấy bác sĩ nào phù hợp.
      </div>

      <ul v-else>
        <li
          v-for="doctor in paginatedDoctors"
          :key="doctor.id"
          class="border-b border-gray-200 last:border-b-0 hover:bg-indigo-50 hover:dark:bg-[#1f263f] transition-all cursor-pointer"
          @click="toggleActionBar(doctor.id)"
        >
          <div class="grid grid-cols-5 gap-4 px-6 py-4 items-center">
            <div>
              <VaAvatar
                :src="getSrcAvatar({ rowData: doctor })"
                size="large"
                class="shadow-lg"
                fallback-icon="mdi-account"
              />
            </div>
            <div class="font-medium">{{ doctor.userName }}</div>
            <div>{{ doctor.gender ? 'Nam' : 'Nữ' }}</div>
            <div class="truncate">{{ doctor.email.replace(/(\w{3})[\w.-]+(@[\w.]+)/, '$1***$2') }}</div>
            <div>{{ doctor.phoneNumber?.replace(/(\d{3})(\d{3})(\d{4})/, '$1-***-$3') }}</div>
          </div>

          <Transition name="fade">
            <div
              v-if="selectedDoctorId === doctor.id"
              class="bg-indigo-100/80 px-6 py-3 flex gap-4 justify-end items-center text-sm"
            >
              <VaButton color="warning" @click="updateDoctor(doctor.id, $event)">
                <i class="mdi mdi-pencil h-4 w-4 text-yellow"></i>
              </VaButton>
              <VaButton color="info" @click="viewDetails(doctor.id, $event)">
                <i class="mdi mdi-open-in-new h-4 w-4 text-blue"></i>
              </VaButton>
            </div>
          </Transition>
        </li>
      </ul>

      <!-- Pagination -->
      <VaCard class="flex flex-col sm:flex-row items-center justify-between mt-6 mx-3 space-y-4 sm:space-y-0">
        <!-- Số mục mỗi trang -->
        <div class="flex items-center space-x-2">
          <label for="pageSize" class="text-sm font-medium">Số mục mỗi trang:</label>
          <select
            id="pageSize"
            v-model="itemsPerPage"
            class="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="changeItemsPerPage"
          >
            <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}</option>
          </select>
        </div>

        <!-- Phân trang -->
        <ul class="pagination flex items-center space-x-2">
          <li>
            <button :disabled="currentPage === 1" class="pagination-button" @click="currentPage--">←</button>
          </li>
          <li v-for="page in totalPages" :key="page">
            <button :class="['pagination-button', { active: currentPage === page }]" @click="currentPage = page">
              {{ page }}
            </button>
          </li>
          <li>
            <button :disabled="currentPage === totalPages" class="pagination-button" @click="currentPage++">→</button>
          </li>
        </ul>
      </VaCard>
    </VaCard>
  </VaCard>
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

.list-item {
  margin-bottom: 12px; /* Adjust spacing between items here */
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
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

label {
  margin-right: 8px;
}

select {
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
