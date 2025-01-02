<template>
  <div class="service-management-container">
    <VaCard class="service-card">
      <VaCardTitle class="card-title">
        <i class="fas fa-address-book title-icon"></i>
        Contact Information
      </VaCardTitle>

      <VaCardContent>
        <div class="header-actions">
          <div class="button-group">
            <div class="toggle-container">
              <button class="toggle-btn" :class="{ active: !showNonStaff }" @click="toggleNonStaff">Staff List</button>
              <button class="toggle-btn" :class="{ active: showNonStaff }" @click="toggleNonStaff">
                Non-Staff List
              </button>
            </div>

            <VaInput v-model="filterData.keyword" placeholder="Search..." class="flex-grow search-input" clearable>
              <template #appendInner>
                <i class="va-icon material-icons">search</i>
              </template>
            </VaInput>

            <VaButton
              :color="showAdvancedSearch ? 'primary' : 'gray'"
              class="action-button"
              @click="showAdvancedSearch = !showAdvancedSearch"
            >
              <i class="va-icon material-icons">tune</i>
            </VaButton>

            <VaButton color="primary" class="action-button" @click="handleRefresh">
              <i class="va-icon material-icons">refresh</i>
            </VaButton>
          </div>
        </div>

        <VaDataTable
          class="custom-table"
          :items="contacts"
          :columns="columnsWithActions"
          hoverable
          sticky-header
          striped
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

          <template #cell(createDate)="{ row }">
            <div class="flex items-center gap-2 ellipsis max-w-[230px]">
              <span class="w-24">{{ new Date(row.rowData.createDate).toLocaleDateString() }}</span>
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
                class="action-button"
                @click="handleAssignStaff(row.rowData as ContactInfo)"
              >
                <i class="va-icon material-icons">person_add</i>
              </VaButton>
              <VaButton small color="info" class="action-button" @click="handleViewDetails(row.rowData as ContactInfo)">
                <i class="va-icon material-icons">visibility</i>
              </VaButton>
            </div>
          </template>
        </VaDataTable>

        <div class="table-footer">
          <div class="records-info">
            <b>{{ totalContacts }} results.</b>
            Results per page
            <VaSelect v-model="filterData.pageSize" class="!w-20" :options="[10, 50, 100]" />
          </div>
          <VaPagination
            v-if="totalPages > 1"
            v-model="currentPage"
            :pages="totalPages"
            :visible-pages="5"
            buttons-preset="primary"
            :boundary-links="true"
            :direction-links="true"
          />
        </div>
      </VaCardContent>
    </VaCard>

    <!-- View Details Modal -->
    <VaModal v-model="showDetailsModal" title="CONTACT DETAILS" hide-default-actions class="contact-details-modal">
      <div v-if="selectedContact" class="p-6">
        <div class="grid grid-cols-2 gap-6">
          <!-- Thông tin cá nhân -->
          <div class="contact-section">
            <h3 class="section-title">Personal Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Title</span>
                <span class="info-value">{{ selectedContact.title }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Email</span>
                <span class="info-value">{{ selectedContact.email }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Phone</span>
                <span class="info-value">{{ selectedContact.phone }}</span>
              </div>
            </div>
          </div>

          <!-- Thông tin trạng thái -->
          <div class="contact-section">
            <h3 class="section-title">Status Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Created Date</span>
                <span class="info-value">{{ new Date(selectedContact.createDate).toLocaleString() }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Status</span>
                <VaTag :color="selectedContact.staffId ? 'success' : 'warning'" class="status-tag">
                  {{ selectedContact.staffId ? 'Assigned' : 'Pending' }}
                </VaTag>
              </div>
              <div class="info-item">
                <span class="info-label">Staff Name</span>
                <span class="info-value">{{ selectedContact.staffName || 'Not assigned' }}</span>
              </div>
            </div>
          </div>

          <!-- Nội dung liên hệ -->
          <div class="contact-section col-span-2">
            <h3 class="section-title">Contact Content</h3>
            <div class="content-box">
              <div class="mb-4">
                <span class="info-label">Message</span>
                <p class="content-text">{{ selectedContact.content }}</p>
              </div>
              <div>
                <span class="info-label">Email Context</span>
                <p class="content-text">{{ selectedContact.emailContext }}</p>
              </div>
            </div>
          </div>

          <!-- Hình ảnh -->
          <div v-if="selectedContact.imageUrl?.length" class="contact-section col-span-2">
            <h3 class="section-title">Attached Images</h3>
            <div class="image-gallery">
              <div v-for="(url, index) in selectedContact.imageUrl" :key="index" class="image-container">
                <img
                  :src="getImageSrc(url)"
                  :alt="`Contact image ${index + 1}`"
                  class="gallery-image"
                  @click="openImagePreview(url)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2 p-4">
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

    <!-- Thêm modal xem trước hình ảnh -->
    <VaModal v-model="showImagePreview" class="image-preview-modal" hide-default-actions>
      <div class="image-preview-container">
        <img :src="getImageSrc(selectedImage)" alt="Preview" class="preview-image" />
      </div>
      <template #footer>
        <div class="flex justify-end gap-2 p-4">
          <VaButton color="gray" @click="showImagePreview = false">Close</VaButton>
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
  { key: 'createDate', title: 'Created Date' },
  { key: 'status', title: 'Status' },
  { key: 'staffName', title: 'Staff Name' },
  { key: 'actions', title: 'Actions' },
]

const showAdvancedSearch = ref(false)
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

const showImagePreview = ref(false)
const selectedImage = ref('')

const openImagePreview = (url: string) => {
  selectedImage.value = url
  showImagePreview.value = true
}

const getImageSrc = (imageUrl: string) => {
  if (!imageUrl) return ''
  const baseUrl = import.meta.env.VITE_APP_BASE_URL as string
  const url_without_api = baseUrl.slice(0, -3)
  return `${url_without_api}${imageUrl}`
}
</script>

<style scoped>
.service-management-container {
  padding: 24px;
  background: var(--va-background-primary);
  min-height: 100vh;
}

.service-card {
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  background: var(--va-background-secondary);
}

.card-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--va-text-primary);
  padding: 1.5rem;
  border-bottom: 2px solid var(--va-border-color);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.title-icon {
  color: var(--va-primary);
}

.header-actions {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.button-group {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
}

.search-input {
  flex: 1;
  min-width: 200px;
  max-width: 100%;
  border-radius: 8px;
  padding: 0.5rem;
  background: var(--va-background-secondary) !important;
  color: var(--va-text-primary);
}

.search-input:focus-within {
  border-color: var(--va-primary);
}

.action-button {
  border-radius: 50%;
  padding: 0.25rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.action-button:hover {
  background-color: #0056b3;
  color: white;
}

.toggle-button {
  border-radius: 8px;
  padding: 0.5rem 1rem;
  transition: background-color 0.3s ease;
  white-space: nowrap;
}

.toggle-button:hover {
  background-color: #007bff;
  color: white;
}

.custom-table {
  margin-top: 1rem;
  border-radius: 8px;
  overflow-x: auto;
}

.custom-table :deep(th) {
  background-color: var(--va-background-secondary) !important;
  color: var(--va-text-primary) !important;
  font-weight: 600;
}

.custom-table :deep(td) {
  color: var(--va-text-primary);
}

.custom-table :deep(tr:hover) {
  background-color: var(--va-background-element) !important;
}

.table-footer {
  margin-top: 1.5rem;
  padding: 1rem 0;
  border-top: 1px solid var(--va-border-color);
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: space-between;
  align-items: center;
}

.records-info {
  color: var(--va-text-secondary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* Modal styles */
:deep(.va-modal) {
  background: var(--va-background-secondary);
}

:deep(.va-modal__title) {
  color: var(--va-text-primary);
  border-bottom: 2px solid var(--va-border-color);
}

:deep(.va-modal__content) {
  color: var(--va-text-primary);
}

:deep(.va-list-item) {
  color: var(--va-text-primary);
  border-bottom: 1px solid var(--va-border-color);
}

/* Form elements */
:deep(.va-input__content),
:deep(.va-select__content) {
  background: var(--va-background-element) !important;
  color: var(--va-text-primary) !important;
}

/* Add transition for smooth theme switching */
* {
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.contact-details-modal {
  max-width: min(900px, 95vw) !important;
  margin: 1rem;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--va-primary);
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--va-primary);
}

.contact-section {
  background: var(--va-background-element);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.info-grid {
  display: grid;
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-label {
  font-weight: 600;
  color: var(--va-text-secondary);
  font-size: 0.9rem;
}

.info-value {
  color: var(--va-text-primary);
  word-break: break-word;
}

.content-box {
  background: var(--va-background-primary);
  padding: 1rem;
  border-radius: 6px;
}

.content-text {
  color: var(--va-text-primary);
  line-height: 1.6;
  margin-top: 0.5rem;
  word-break: break-word;
}

.image-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.image-container {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.image-container:hover {
  transform: scale(1.05);
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-preview-modal {
  max-width: 95vw !important;
  max-height: 95vh !important;
  margin: 1rem;
}

.image-preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.preview-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
}

.status-tag {
  width: fit-content;
}

/* Responsive styles */
@media screen and (max-width: 1024px) {
  .service-management-container {
    padding: 16px;
  }

  .card-title {
    font-size: 1.5rem;
    padding: 1rem;
  }

  .button-group {
    gap: 0.5rem;
  }

  .toggle-button {
    width: 100%;
    justify-content: center;
  }

  .search-input {
    width: 100%;
  }
}

@media screen and (max-width: 768px) {
  .grid.grid-cols-2 {
    grid-template-columns: 1fr;
  }

  .contact-section {
    padding: 1rem;
  }

  .table-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .records-info {
    width: 100%;
    justify-content: space-between;
  }
}

@media screen and (max-width: 480px) {
  .service-management-container {
    padding: 8px;
  }

  .card-title {
    font-size: 1.2rem;
  }

  .image-gallery {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }

  .action-button {
    width: 36px;
    height: 36px;
  }
}

.toggle-container {
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--va-primary);
}

.toggle-btn {
  padding: 8px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--va-primary);
  font-weight: 500;
}

.toggle-btn.active {
  background: var(--va-primary);
  color: white;
}

.toggle-btn:hover:not(.active) {
  background: rgba(var(--va-primary-rgb), 0.1);
}
</style>
