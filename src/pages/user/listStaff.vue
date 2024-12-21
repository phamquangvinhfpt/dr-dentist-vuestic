<template>
  <VaCard class="min-h-screen bg-gradient-to-br from-gray-50 to-white py-10 px-4 sm:px-10">
    <!-- Header Section -->
    <div class="mb-6 flex justify-between items-center">
      <div class="flex-1 max-w-md">
        <VaInput v-model="searchQuery" placeholder="Search by name or email..." rounded outlined clearable />
      </div>
      <VaButton color="primary" class="rounded-md" @click="router.push('/staff/create')">
        <template #prepend>
          <i class="mdi mdi-plus mr-2"></i>
        </template>
        Add Staff
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
      <div class="flex justify-center mt-6">
        <VaPagination v-model="currentPage" :total-pages="totalPages" :visible-pages="5" color="primary" />
      </div>
    </VaCard>
  </VaCard>
</template>

<script lang="ts" setup>
import { useUserProfileStore } from '@stores/modules/user.module'
import { useRouter } from 'vue-router'
import { ref, computed, onMounted, watch } from 'vue'
import { VaButton, VaAvatar, VaInput, VaPagination } from 'vuestic-ui'
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
          user.role.roleName === 'Staff' &&
          (user.email?.toLowerCase().includes(query) || user.userName?.toLowerCase().includes(query))
        )
      })
    : userList.value.filter((user) => {
        console.log('User role:', user.role)
        return user.role.roleName === 'Staff'
      })
})

const currentPage = ref(1)
const itemsPerPage = ref(6)
const totalPages = computed(() => Math.ceil(filteredUsers.value.length / itemsPerPage.value))

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredUsers.value.slice(start, start + itemsPerPage.value)
})

const getAllUsers = async () => {
  try {
    const res = await userStore.getAllStaff({ isActive: true, pageNumber: 1, pageSize: 10 })
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

watch(currentPage, getAllUsers)
</script>

<style scoped>
.bg-gray-50 {
}
</style>
