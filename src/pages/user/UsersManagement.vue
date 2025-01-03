<template>
  <VaCard class="min-h-screen bg-gradient-to-br from-gray-50 to-white py-10 px-4 sm:px-10">
    <!-- Header Section -->
    <div class="mb-6 flex justify-between items-center">
      <div class="flex-1 max-w-md">
        <VaInput v-model="searchQuery" placeholder="Search by name or email..." rounded outlined clearable />
      </div>
      <VaButton color="primary" class="rounded-md" @click="router.push('/user/create')">
        <template #prepend>
          <i class="mdi mdi-plus mr-2"></i>
        </template>
        Add User
      </VaButton>
    </div>

    <!-- User List Section -->
    <VaCard class="bg-white shadow-md rounded-lg overflow-hidden">
      <div class="grid grid-cols-6 gap-4 px-6 py-3 bg-indigo-100 text-sm font-semibold text-indigo-800">
        <div></div>
        <div>Name</div>
        <div>Gender</div>
        <div>Email</div>
        <div>Phone</div>
        <div>Actions</div>
      </div>
      <div v-if="filteredUsers.length === 0" class="py-10 text-center text-gray-500">No matching users found.</div>

      <ul v-else>
        <li
          v-for="user in paginatedUsers"
          :key="user.id"
          class="border-b border-gray-200 last:border-b-0 hover:bg-indigo-50 transition-all cursor-pointer"
        >
          <div class="grid grid-cols-6 gap-4 px-6 py-4 items-center">
            <div>
              <VaAvatar :src="getSrcAvatar({ rowData: user })" size="large" class="shadow-lg" />
            </div>
            <div class="font-medium">{{ user.userName }}</div>
            <div>{{ user.Gender ? 'Male' : 'Female' }}</div>
            <div class="truncate">{{ maskEmail(user.email) }}</div>
            <div>{{ maskPhone(user.phoneNumber) }}</div>
            <div class="flex gap-2 justify-end items-center text-sm">
              <VaButton color="danger">
                <i class="mdi mdi-delete h-4 w-4 text-red"></i>
              </VaButton>
              <VaButton color="warning" @click.stop="updateUser(user.id)">
                <i class="mdi mdi-pencil h-4 w-4 text-yellow"></i>
              </VaButton>
              <VaButton color="info" @click.stop="viewDetails(user.id)">
                <i class="mdi mdi-open-in-new h-4 w-4 text-blue"></i>
              </VaButton>
            </div>
          </div>
        </li>
      </ul>

      <!-- Pagination -->
      <div class="flex flex-col sm:flex-row items-center justify-between mt-6 mx-3 space-y-4 sm:space-y-0">
        <div class="flex items-center space-x-2">
          <label for="pageSize" class="text-sm font-medium">Số mục mỗi trang:</label>
          <select
            id="pageSize"
            v-model="itemsPerPage"
            class="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}</option>
          </select>
        </div>

        <!-- Phân trang -->
        <ul class="pagination flex items-center space-x-2">
          <!-- Nút quay lại -->
          <li>
            <Button :disabled="currentPage === 1" class="pagination-button" @click="currentPage--">←</Button>
          </li>

          <!-- Số trang -->
          <li v-for="page in totalPages" :key="page">
            <Button :class="['pagination-button', { active: currentPage === page }]" @click="currentPage = page">
              {{ page }}
            </Button>
          </li>

          <!-- Nút tiếp tục -->
          <li>
            <button :disabled="currentPage === totalPages" class="pagination-button" @click="currentPage++">→</button>
          </li>
        </ul>
      </div>
    </VaCard>
  </VaCard>
</template>

<script lang="ts" setup>
import { useUserProfileStore } from '@stores/modules/user.module'
import { useRouter } from 'vue-router'
import { ref, computed, onMounted, watch } from 'vue'
import { VaButton, VaAvatar, VaInput } from 'vuestic-ui'
import '@mdi/font/css/materialdesignicons.css'

const userStore = useUserProfileStore()
const router = useRouter()

const userList = ref<
  {
    id: string
    userName: string
    Gender: boolean
    email: string
    phoneNumber: string
    imageUrl?: string
    name: string
    role: {
      roleId: string
      roleName: string
      description: string
      enabled: boolean
    }
  }[]
>([])
const searchQuery = ref('')

const filteredUsers = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  return query
    ? userList.value.filter((user) => {
        console.log('User role:', user.role)
        return (
          user.role.roleName === 'Patient' &&
          (user.email?.toLowerCase().includes(query) || user.userName?.toLowerCase().includes(query))
        )
      })
    : userList.value.filter((user) => {
        console.log('User role:', user.role)
        return user.role.roleName === 'Patient'
      })
})

const currentPage = ref(1)
const itemsPerPage = ref(5)
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))
const pageSizeOptions = ref([5, 10, 20, 50])

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return userList.value.slice(start, end)
})

// Tổng số mục sau khi áp dụng tìm kiếm
const totalItems = computed(() => userList.value.length)

const getAllUsers = async () => {
  try {
    const res = await userStore.getAllPatients({ isActive: true, pageNumber: 1, pageSize: 10 })
    userList.value = res.data.map((user) => ({
      id: user.id,
      userName: user.userName,
      Gender: user.gender ?? false,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      imageUrl: user.imageUrl || '',
      name: user.userName || '',
      role: {
        roleId: user.role.roleId,
        roleName: user.role.roleName,
        description: user.role.description,
        enabled: user.role.enabled,
      },
    }))
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}

const viewDetails = (id: string) => {
  userStore.id = id
  router.push({ name: 'user-detail', params: { id } })
}

const updateUser = (id: string) => {
  router.push({ name: 'user-update', params: { id } })
}

const maskEmail = (email: string) => email.replace(/(\w{3})[\w.-]+(@[\w.]+)/, '$1***$2')
const maskPhone = (phone: string | null) => phone?.replace(/(\d{3})(\d{3})(\d{4})/, '$1-***-$3') || 'N/A'

const getSrcAvatar = (row: any) => {
  const img = row.rowData?.imageUrl
  const baseUrl = import.meta.env.VITE_APP_BASE_URL as string
  return img ? `${baseUrl.slice(0, -3)}${img}` : ''
}

onMounted(() => {
  getAllUsers()
})

watch([userList, itemsPerPage], () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = 1
  }
})
watch(itemsPerPage, () => {
  currentPage.value = 1
})
</script>

<style scoped>
.bg-gray-50 {
  background-color: #f9fafb;
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
