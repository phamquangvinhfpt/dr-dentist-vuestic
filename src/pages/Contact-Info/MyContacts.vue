<template>
  <div class="my-contacts">
    <div class="flex justify-between mb-4">
      <div class="flex gap-2 w-full">
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
      :columns="columns"
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

      <template #cell(actions)="{ row }">
        <div class="flex gap-2">
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
        </VaList>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <VaButton color="gray" @click="showDetailsModal = false">Close</VaButton>
        </div>
      </template>
    </VaModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useToast } from 'vuestic-ui'
import { useContactStaffStore } from '@/stores/modules/contact-staff.module'
import type { ContactInfo, AdvancedSearch } from './types'

const { init } = useToast()
const contactStaffStore = useContactStaffStore()
const showDetailsModal = ref(false)
const selectedContact = ref<ContactInfo | null>(null)

const contacts = ref<ContactInfo[]>([])
const currentPage = ref(1)
const totalPages = ref(0)
const totalContacts = ref(0)

const columns = [
  { key: 'title', title: 'Title' },
  { key: 'email', title: 'Email' },
  { key: 'phone', title: 'Phone' },
  { key: 'actions', title: 'Actions' },
]

const showAdvancedSearch = ref(false)
const searchFields = ['title', 'email', 'phone', 'content']
const sortFields = ['title', 'email', 'phone', 'createdAt']

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

// Fetch contacts method
const fetchContacts = async () => {
  try {
    const response = await contactStaffStore.getMyContacts({
      pageNumber: filterData.pageNumber - 1,
      pageSize: filterData.pageSize,
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

// Handle view details
const handleViewDetails = (contact: ContactInfo) => {
  selectedContact.value = contact
  showDetailsModal.value = true
}

// Handle refresh
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

// Watch effects
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

let searchTimeout: NodeJS.Timeout

// Fetch data on component mount
onMounted(() => {
  fetchContacts()
})
</script>

<style scoped>
.my-contacts {
  padding: 24px;
}

.va-table-responsive {
  overflow: auto;
}
</style>
