<script lang="ts" setup>
import { useUserProfileStore } from '@stores/modules/user.module'
import { useRouter } from 'vue-router'
import { onMounted, Ref, ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ListUserPagination, User } from './types'
import { VaButton } from 'vuestic-ui'

const { t } = useI18n()
const userStore = useUserProfileStore()
const router = useRouter()

const formData = reactive({
  pageNumber: 1,
  pageSize: 7,
  isActive: true,
  orderBy: [],
})
const userListResponse: Ref<ListUserPagination | null> = ref(null)
const userList: Ref<User[]> = ref([])

const getAllUserPagination = async () => {
  try {
    const res = await userStore.getUsers(formData)
    userListResponse.value = res
    userList.value = userListResponse.value.data
  } catch (error) {
    console.error('Error fetching dental records:', error)
    userListResponse.value = null
  }
}

const viewDetails = (id: string) => {
  userStore.id = id
  router.push({ name: 'permission-management' })
}

const getSrcAvatar = (row: any) => {
  const img = row.rowData?.imageUrl
  const url = import.meta.env.VITE_APP_BASE_URL as string
  const url_without_api = url.slice(0, -3)
  if (img) return `${url_without_api}${img}`
  return ''
}
const columns = computed(() => [
  { key: 'user', label: 'User' },
  { key: 'userName', label: 'User Name' },
  { key: 'gender', label: 'Gender' },
  { key: 'email', label: 'Email' },
  { key: 'phoneNumber', label: 'Phone' },
  { key: 'address', label: 'Address' },
  { key: 'role', label: 'Role' },
  { key: 'action', label: 'Permission' },
])
onMounted(() => {
  getAllUserPagination()
})

const updateUser = () => {
  // Logic to update the user
}

const deleteUser = () => {
  // Logic to delete the user
}

const handlePageChange = (newPage: number) => {
  formData.pageNumber = newPage // Update the current page number
  getAllUserPagination() // Fetch users for the new page
}
</script>
<template>
  <!-- <div class="grid sm:grid-cols-2 md:grid-cols-5 gap-6 mb-6">
    <VaInput v-model="formData.searchTerm" class="sm:col-span-2 md:col-span-3" placeholder="Search: " />
    <VaSelect
      v-model="formData.sortBy"
      class="sm:col-span-1 md:col-span-1"
      :options="sortOptions.map((option) => option.text)"
      placeholder="Order By"
    />
    <div class="sm:col-span-1 md:col-span-1 flex items-center">
      <label class="mr-2">Descreasing</label>
      <input v-model="formData.sortDesc" type="checkbox" />
    </div>
  </div> -->
  <VaDataTable
    class="my-table va-table--hoverable"
    :items="userList"
    :columns="columns"
    hoverable
    select-mode="multiple"
    :disable-client-side-sorting="false"
    :style="{
      '--va-data-table-thead-background': 'var(--va-background-element)',
      '--va-data-table-grid-tr-border': '1px solid var(--va-background-border)',
    }"
    sticky-header
    no-data-html="<div class='text-center'>No data found</div>"
  >
    <template #cell(user)="{ row }">
      <div class="ellipsis max-w-[230px] lg:max-w-[450px]">
        <span class="flex gap-2">
          <VaAvatar
            :src="getSrcAvatar(row)"
            class="w-14 h-14 bg-warning font-bold"
            :fallback-text="row.rowData?.userName?.charAt(0)?.toUpperCase()"
          />
        </span>
      </div>
    </template>
    <template #cell(userName)="{ row }">
      <div class="flex items-center gap-2 ellipsis max-w-[230px]">
        <span class="w-24">{{ row.rowData.userName }}</span>
      </div>
    </template>
    <template #cell(gender)="{ row }">
      <div class="flex items-center gap-2 ellipsis max-w-[230px]">
        <span class="w-24">{{
          row.rowData?.gender === null ? 'N/A' : row.rowData?.gender === true ? t('auth.male') : t('auth.female')
        }}</span>
      </div>
    </template>
    <template #cell(email)="{ row }">
      <div class="flex items-center gap-2 ellipsis max-w-[230px]">
        <span class="w-24">{{ row.rowData.email }}</span>
      </div>
    </template>
    <template #cell(phoneNumber)="{ row }">
      <div class="flex items-center gap-2 ellipsis max-w-[230px]">
        <span class="w-24">{{ row.rowData.phoneNumber || 'N/A' }}</span>
      </div>
    </template>
    <template #cell(address)="{ row }">
      <div class="flex items-center gap-2 ellipsis max-w-[230px]">
        <span class="w-24">{{ row.rowData.address || 'N/A' }}</span>
      </div>
    </template>
    <template #cell(role)="{ row }">
      <div class="flex items-center gap-2 ellipsis max-w-[230px]">
        <span class="w-24">{{ row.rowData.role.roleName }}</span>
      </div>
    </template>
    <template #cell(action)="{ row }">
      <div class="flex space-x-2">
        <VaButton
          color="info"
          class="mr-2 transition ease-in-out delay-150 bg-blue-500 hover:-translate-y-1 hover:scale-110 hover:bg-indigo-500 duration-300"
          @click="viewDetails(row.rowData.id)"
        >
          Detail
        </VaButton>
        <VaButton
          color="warning"
          class="mr-2 transition ease-in-out delay-150 bg-yellow-500 hover:-translate-y-1 hover:scale-110 hover:bg-yellow-600 duration-300"
          @click="updateUser()"
        >
          Update
        </VaButton>
        <VaButton
          color="danger"
          class="transition ease-in-out delay-150 bg-red-500 hover:-translate-y-1 hover:scale-110 hover:bg-red-600 duration-300"
          @click="deleteUser()"
        >
          Delete
        </VaButton>
      </div>
    </template>
  </VaDataTable>
  <VaCardContent>
    <div v-if="userListResponse" class="flex flex-col-reverse md:flex-row gap-2 justify-between items-center p-2">
      <div>
        <b>{{ userListResponse.totalCount }} {{ 'Result' }}.</b>
        {{ 'Result per page' }}
        <VaSelect v-model="formData.pageSize" class="!w-20" :options="[7, 10, 50, 100]" />
      </div>
      <div v-if="userListResponse.totalPages > 1" class="flex">
        <VaPagination
          v-model="formData.pageNumber"
          buttons-preset="secondary"
          :pages="userListResponse.totalPages"
          :visible-pages="5"
          :boundary-links="true"
          :direction-links="true"
          @update:modelValue="handlePageChange"
        />
      </div>
    </div>
  </VaCardContent>
</template>

<style>
.btn {
  padding: 6px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
  cursor: pointer;
}

.btn-detail {
  color: #007bff;
}

.va-table-responsive {
  overflow: auto;
}
</style>
