<template>
  <div class="contact-info-staff">
    <div class="flex justify-between mb-4">
      <div class="flex gap-2 w-full">
        <VaButton :color="showNonStaff ? 'warning' : 'secondary'" @click="toggleNonStaff">
          <i class="va-icon material-icons mr-2">{{ showNonStaff ? 'list' : 'person_off' }}</i>
          {{ showNonStaff ? 'Staff List' : 'Non-Staff List' }}
        </VaButton>

        <VaInput v-model="filterData.keyword" placeholder="Search..." class="flex-grow" clearable>
          <template #appendInner>
            <i class="va-icon material-icons">search</i>
          </template>
        </VaInput>

        <VaButton :color="showAdvancedSearch ? 'primary' : 'gray'" @click="showAdvancedSearch = !showAdvancedSearch">
          <i class="va-icon material-icons">tune</i>
        </VaButton>

        <VaButton color="primary" @click="handleRefresh">
          <i class="va-icon material-icons">refresh</i>
        </VaButton>
      </div>
    </div>

    <div v-if="showAdvancedSearch" class="mb-4 p-4 border rounded-lg">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label class="block mb-2">Search Fields</label>
          <VaSelect
            v-model="filterData.advancedSearch.fields"
            multiple
            :options="searchFields"
            placeholder="Select fields"
          />
        </div>
        <div>
          <label class="block mb-2">Advanced Keyword</label>
          <VaInput v-model="filterData.advancedSearch.keyword" placeholder="Enter keyword..." />
        </div>
        <div>
          <label class="block mb-2">Sort By</label>
          <VaSelect v-model="filterData.orderBy" multiple :options="sortFields" placeholder="Select sort fields" />
        </div>
      </div>
    </div>

    <VaDataTable
      class="my-table va-table--hoverable"
      :items="contacts"
      :columns="columnsWithActions"
      hoverable
      :style="{
        '--va-data-table-thead-background': 'var(--va-background-element)',
        '--va-data-table-grid-tr-border': '1px solid var(--va-background-border)',
      }"
      sticky-header
      no-data-html="<div class='text-center'>No contacts found</div>"
    >
      <template #cell(title)="{ row }">
        <div class="flex items-center gap-2 ellipsis max-w-[230px]">
          <span class="w-24">{{ row.rowData.title }}</span>
        </div>
      </template>

      <template #cell(email)="{ row }">
        <div class="flex items-center gap-2 ellipsis max-w-[230px]">
          <span class="w-24">{{ row.rowData.email }}</span>
        </div>
      </template>

      <template #cell(phone)="{ row }">
        <div class="flex items-center gap-2 ellipsis max-w-[230px]">
          <span class="w-24">{{ row.rowData.phone }}</span>
        </div>
      </template>

      <template #cell(status)="{ row }">
        <VaTag :color="row.rowData.staffId ? 'success' : 'warning'">
          {{ row.rowData.staffId ? 'Assigned' : 'Pending' }}
        </VaTag>
      </template>

      <template #cell(staffName)="{ row }">
        <div class="flex items-center gap-2 ellipsis max-w-[230px]">
          <span class="w-24">{{ row.rowData.staffName || 'Not assigned' }}</span>
        </div>
      </template>

      <template #cell(actions)="{ row }">
        <div class="flex gap-2">
          <VaButton
            small
            color="primary"
            :disabled="!!(row.rowData as ContactInfo).staffId"
            @click="handleAssignStaff(row.rowData as ContactInfo)"
          >
            <i class="va-icon material-icons">person_add</i>
          </VaButton>
          <VaButton small color="info" @click="handleViewDetails(row.rowData as ContactInfo)">
            <i class="va-icon material-icons">visibility</i>
          </VaButton>
        </div>
      </template>
    </VaDataTable>

    <VaCardContent>
      <div class="flex flex-col-reverse md:flex-row gap-2 justify-between items-center p-2">
        <div>
          <b>{{ totalContacts }} results.</b>
          Results per page
          <VaSelect v-model="filterData.pageSize" class="!w-20" :options="[10, 50, 100]" />
        </div>
        <VaPagination
          v-if="totalPages > 1"
          v-model="currentPage"
          :pages="totalPages"
          :visible-pages="5"
          buttons-preset="secondary"
          :boundary-links="true"
          :direction-links="true"
        />
      </div>
    </VaCardContent>

    <!-- View Details Modal -->
    <VaModal v-model="showDetailsModal" title="Contact Details" hide-default-actions>
      <div v-if="selectedContact" class="p-4">
        <VaList>
          <VaListItem>
            <VaListItemLabel> <b>Title:</b> {{ selectedContact.title }} </VaListItemLabel>
          </VaListItem>
          <VaListItem>
            <VaListItemLabel> <b>Email:</b> {{ selectedContact.email }} </VaListItemLabel>
          </VaListItem>
          <VaListItem>
            <VaListItemLabel> <b>Phone:</b> {{ selectedContact.phone }} </VaListItemLabel>
          </VaListItem>
          <VaListItem>
            <VaListItemLabel> <b>Content:</b> {{ selectedContact.content }} </VaListItemLabel>
          </VaListItem>
          <VaListItem>
            <VaListItemLabel>
              <b>Status:</b>
              <VaTag :color="selectedContact.staffId ? 'success' : 'warning'">
                {{ selectedContact.staffId ? 'Assigned' : 'Pending' }}
              </VaTag>
            </VaListItemLabel>
          </VaListItem>
          <VaListItem>
            <VaListItemLabel> <b>Staff Name:</b> {{ selectedContact.staffName || 'Not assigned' }} </VaListItemLabel>
          </VaListItem>
        </VaList>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <VaButton color="gray" @click="showDetailsModal = false">Close</VaButton>
        </div>
      </template>
    </VaModal>

    <VaModal v-model="showAssignStaffModal" title="Assign Staff" hide-default-actions>
      <div class="p-4">
        <div class="mb-4">
          <label class="block mb-2">Select Staff</label>
          <VaSelect
            v-model="selectedStaffId"
            :options="contactStaffStore.staffList"
            value-by="id"
            text-by="name"
            placeholder="Choose a staff member"
          />
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <VaButton color="gray" @click="showAssignStaffModal = false">Cancel</VaButton>
          <VaButton
            color="primary"
            :loading="contactStaffStore.isLoading"
            :disabled="!selectedStaffId"
            @click="confirmAssignStaff"
          >
            Assign
          </VaButton>
        </div>
      </template>
    </VaModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useToast } from 'vuestic-ui'
import { useI18n } from 'vue-i18n'
import { useContactStaffStore } from '@/stores/modules/contact-staff.module'
import type { ContactInfo, AdvancedSearch } from './types'
import { useAuthStore } from '@/stores/modules/auth.module'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const { init } = useToast()
const contactStaffStore = useContactStaffStore()
const showDetailsModal = ref(false)
const selectedContact = ref<ContactInfo | null>(null)

const showAssignStaffModal = ref(false)
const selectedStaffId = ref('')
const contactToAssign = ref<ContactInfo | null>(null)

const contacts = ref<ContactInfo[]>([])
const currentPage = ref(1)
const totalPages = ref(0)
const totalContacts = ref(0)

const columnsWithActions = [
  { key: 'title', title: 'Title' },
  { key: 'email', title: 'Email' },
  { key: 'phone', title: 'Phone' },
  { key: 'status', title: 'Status' },
  { key: 'staffName', title: 'Staff Name' },
  { key: 'actions', title: 'Actions' },
]

const showAdvancedSearch = ref(false)

const searchFields = ['title', 'email', 'phone', 'content', 'staffName']

const sortFields = ['title', 'email', 'phone', 'createdAt']

const showNonStaff = ref(false)

const filterData = reactive({
  pageNumber: 1,
  pageSize: 10,
  orderBy: [] as string[],
  keyword: '',
  advancedSearch: {
    fields: [] as string[],
    keyword: '',
  } as AdvancedSearch,
})

let searchTimeout: NodeJS.Timeout

watch(
  () => [filterData.keyword, filterData.advancedSearch],
  () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      currentPage.value = 1
      filterData.pageNumber = 1
      fetchContacts()
    }, 300)
  },
  { deep: true },
)

const handleViewDetails = (contact: ContactInfo) => {
  selectedContact.value = contact
  showDetailsModal.value = true
}

const handleAssignStaff = async (contact: ContactInfo) => {
  contactToAssign.value = contact
  selectedStaffId.value = ''
  showAssignStaffModal.value = true
  try {
    await contactStaffStore.getAllStaff()
    console.log('Staff List:', contactStaffStore.staffList)
  } catch (error) {
    init({
      message: 'Failed to fetch staff list',
      color: 'danger',
      duration: 3000,
    })
  }
}

const confirmAssignStaff = async () => {
  if (!selectedStaffId.value || !contactToAssign.value) {
    console.log('Missing data:', {
      selectedStaffId: selectedStaffId.value,
      contactToAssign: contactToAssign.value,
    })
    return
  }

  try {
    console.log('Assigning staff with data:', {
      staffId: selectedStaffId.value,
      contactId: contactToAssign.value.contactId,
    })

    const result = await contactStaffStore.addStaffContact(selectedStaffId.value, contactToAssign.value.contactId)

    console.log('Assignment result:', result)

    init({
      message: 'Staff assigned successfully',
      color: 'success',
      duration: 3000,
    })

    showAssignStaffModal.value = false
    fetchContacts()
  } catch (error) {
    console.error('Assignment error:', error)
    init({
      message: 'Failed to assign staff',
      color: 'danger',
      duration: 3000,
    })
  }
}

watch(
  () => currentPage.value,
  (newPage) => {
    if (newPage !== filterData.pageNumber) {
      filterData.pageNumber = newPage
      fetchContacts()
    }
  },
)

watch(
  () => filterData.pageSize,
  () => {
    currentPage.value = 1
    filterData.pageNumber = 1
    fetchContacts()
  },
)

const fetchContacts = async () => {
  try {
    const response = await contactStaffStore.getAllContacts({
      pageNumber: filterData.pageNumber - 1,
      pageSize: filterData.pageSize,
      hasStaff: !showNonStaff.value,
      orderBy: filterData.orderBy,
      keyword: filterData.keyword,
      advancedSearch: filterData.advancedSearch,
    })

    contacts.value = response.data
    currentPage.value = response.currentPage + 1
    totalPages.value = response.totalPages
    totalContacts.value = response.totalCount
  } catch (error) {
    init({
      message: 'Failed to fetch contacts',
      color: 'danger',
      duration: 3000,
    })
  }
}

const handleRefresh = () => {
  currentPage.value = 1
  filterData.pageNumber = 1
  filterData.pageSize = 10
  filterData.keyword = ''
  filterData.advancedSearch = {
    fields: [],
    keyword: '',
  }
  filterData.orderBy = []
  fetchContacts()
}

const toggleNonStaff = () => {
  showNonStaff.value = !showNonStaff.value
  currentPage.value = 1
  filterData.pageNumber = 1
  fetchContacts()
}

const authStore = useAuthStore()
const router = useRouter()

onMounted(async () => {
  // Check if user is Admin
  if (!authStore.musHaveRole('Admin')) {
    init({
      message: t('common.unauthorized'),
      color: 'danger',
      duration: 3000,
    })
    router.push({ name: 'dashboard' })
    return
  }

  await fetchContacts()
})
</script>

<style scoped>
.contact-info-staff {
  padding: 24px;
}

.va-table-responsive {
  overflow: auto;
}
</style>
