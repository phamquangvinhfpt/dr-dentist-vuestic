<script lang="ts" setup>
import { useDoctorProfileStore } from '@stores/modules/doctor.module'
import { useRouter } from 'vue-router'
import { onMounted, Ref, ref, computed, watch } from 'vue'
import { User } from './types'
import { VaButton, VaAvatar, VaInput, VaPagination } from 'vuestic-ui'
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

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value)) // Recalculate total pages based on filtered list

const currentPage = ref(1)
const itemsPerPage = ref(6)

const paginatedDoctors = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredDoctors.value.slice(start, end)
})

const toggleActionBar = (doctorId: string) => {
  selectedDoctorId.value = selectedDoctorId.value === doctorId ? null : doctorId
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

const deleteDoctor = async (id: string, doctorName: string, event?: Event) => {
  if (event) {
    event.stopPropagation()
  }

  const confirmDelete = confirm(`Bạn có thực sự muốn xóa bác sĩ ${doctorName}?`)
  if (confirmDelete) {
    try {
      await userStore.deleteDoctor(id) // Call the delete function from the store
      await getAllDoctors() // Refresh the doctor list
    } catch (error) {
      console.error('Error deleting doctor:', error)
    }
  }
}

const updateDoctor = (id: string, event?: Event) => {
  if (event) {
    event.stopPropagation()
  }
  router.push({
    name: 'doctor-update',
    params: { id },
  })
}

onMounted(() => {
  getAllDoctors()
})

watch(currentPage, () => {
  // Logic for fetching data on page change can be added here
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-white py-10 px-4 sm:px-10">
    <!-- Header Section -->
    <div class="mb-6 flex justify-between items-center">
      <div class="flex-1 max-w-md">
        <VaInput
          v-model="searchQuery"
          placeholder="Tìm kiếm bác sĩ theo tên hoặc email..."
          rounded
          outlined
          clearable
        />
      </div>
      <VaButton color="primary" class="rounded-md" @click="router.push('/doctors/create')">
        <template #prepend>
          <i class="mdi mdi-plus mr-2"></i>
        </template>
        Thêm Bác Sĩ
      </VaButton>
    </div>

    <!-- Doctor List Section -->
    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <div class="grid grid-cols-5 gap-4 px-6 py-3 bg-indigo-100 text-sm font-semibold text-indigo-800">
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
          class="border-b border-gray-200 last:border-b-0 hover:bg-indigo-50 transition-all cursor-pointer"
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
            <div class="text-gray-900 font-medium">{{ doctor.userName }}</div>
            <div>{{ doctor.gender ? 'Nam' : 'Nữ' }}</div>
            <div class="truncate">{{ doctor.email.replace(/(\w{3})[\w.-]+(@[\w.]+)/, '$1***$2') }}</div>
            <div>{{ doctor.phoneNumber?.replace(/(\d{3})(\d{3})(\d{4})/, '$1-***-$3') }}</div>
          </div>

          <Transition name="fade">
            <div
              v-if="selectedDoctorId === doctor.id"
              class="bg-indigo-100/80 px-6 py-3 flex gap-4 justify-end items-center text-sm"
            >
              <VaButton color="danger" @click="deleteDoctor(doctor.id, doctor.userName, $event)">
                <i class="mdi mdi-delete h-4 w-4 text-red"> </i>
              </VaButton>
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
      <div class="flex justify-center mt-6">
        <VaPagination v-model="currentPage" :total-pages="totalPages" :visible-pages="5" color="primary" />
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
</style>
