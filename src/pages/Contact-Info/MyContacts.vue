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
          <VaButton small color="success" @click="handleSendEmail(row.rowData as ContactInfo)">
            <i class="va-icon material-icons">email</i>
          </VaButton>
          <VaButton small color="warning" @click="handleUpdateCallImage(row.rowData as ContactInfo)">
            <i class="va-icon material-icons">photo_camera</i>
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

    <!-- Send Email Modal -->
    <VaModal v-model="showEmailModal" title="Send Email" hide-default-actions>
      <div class="p-4">
        <VaInput v-model="emailContext" type="textarea" placeholder="Enter email content..." rows="5" />
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <VaButton color="gray" @click="showEmailModal = false">Cancel</VaButton>
          <VaButton color="primary" :loading="isSubmitting" @click="submitEmail"> Send Email </VaButton>
        </div>
      </template>
    </VaModal>

    <!-- Update Call Image Modal -->
    <VaModal v-model="showImageModal" title="Upload Images" hide-default-actions>
      <div class="p-4">
        <div class="mb-4">
          <VaFileUpload
            v-model="selectedImages"
            multiple
            accept="image/*"
            placeholder="Drop images here or click to upload"
            hide-file-list
          />
        </div>

        <!-- Thêm phần preview hình ảnh -->
        <div v-if="imagePreviewUrls.length" class="image-preview-grid">
          <div v-for="(url, index) in imagePreviewUrls" :key="index" class="preview-item">
            <img :src="url" :alt="`Preview ${index + 1}`" class="preview-thumbnail" />
            <button class="remove-btn" @click="removeImage(index)">
              <i class="va-icon material-icons">close</i>
            </button>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <VaButton color="gray" @click="closeImageModal">Cancel</VaButton>
          <VaButton color="primary" :loading="isSubmitting" @click="submitImages"> Upload Images </VaButton>
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
import { useRouter } from 'vue-router'
import { useContactStaffStore } from '@/stores/modules/contact-staff.module'
import { useAuthStore } from '@/stores/modules/auth.module'
import type { ContactInfo, AdvancedSearch } from './types'

const { init } = useToast()
const contactStaffStore = useContactStaffStore()
const authStore = useAuthStore()
const router = useRouter()
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

// New refs for modals and data
const showEmailModal = ref(false)
const showImageModal = ref(false)
const emailContext = ref('')
const selectedImages = ref<File[]>([])
const isSubmitting = ref(false)
const selectedContactId = ref('')

// Handle send email
const handleSendEmail = (contact: ContactInfo) => {
  selectedContactId.value = contact.contactId
  showEmailModal.value = true
}

const submitEmail = async () => {
  if (!emailContext.value.trim()) {
    init({
      message: 'Please enter email content',
      color: 'warning',
      duration: 3000,
    })
    return
  }

  try {
    isSubmitting.value = true
    await contactStaffStore.sendEmail(selectedContactId.value, emailContext.value)
    showEmailModal.value = false
    emailContext.value = ''
    init({
      message: 'Email sent successfully',
      color: 'success',
      duration: 3000,
    })
  } catch (error) {
    init({
      message: 'Failed to send email',
      color: 'danger',
      duration: 3000,
    })
  } finally {
    isSubmitting.value = false
  }
}

// Handle update call image
const handleUpdateCallImage = (contact: ContactInfo) => {
  selectedContactId.value = contact.contactId
  showImageModal.value = true
}

const submitImages = async () => {
  if (!selectedImages.value.length) {
    init({
      message: 'Please select at least one image',
      color: 'warning',
      duration: 3000,
    })
    return
  }

  try {
    isSubmitting.value = true

    // Gửi trực tiếp File objects thay vì chỉ gửi tên
    console.log('Sending images:', {
      contactId: selectedContactId.value,
      fileCount: selectedImages.value.length,
      fileNames: selectedImages.value.map((f) => f.name),
    })

    await contactStaffStore.updateCallImage(selectedContactId.value, selectedImages.value)

    showImageModal.value = false
    selectedImages.value = []
    init({
      message: 'Images updated successfully',
      color: 'success',
      duration: 3000,
    })

    await fetchContacts()
  } catch (error) {
    console.error('Error uploading images:', error)
    init({
      message: error instanceof Error ? error.message : 'Failed to update images',
      color: 'danger',
      duration: 3000,
    })
  } finally {
    isSubmitting.value = false
  }
}

// Fetch data on component mount
onMounted(async () => {
  // Check if user has Staff role
  if (!authStore.musHaveRole('Staff')) {
    // Redirect or show error if user is not Staff
    router.push({ name: 'dashboard' })
    init({
      message: 'Access denied. Staff role required.',
      color: 'danger',
      duration: 3000,
    })
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

// Thêm các biến mới
const imagePreviewUrls = ref<string[]>([])

// Watch selectedImages để tạo preview URLs
watch(selectedImages, (files) => {
  imagePreviewUrls.value = []
  if (files && files.length) {
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          imagePreviewUrls.value.push(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    })
  }
})

// Hàm xóa ảnh
const removeImage = (index: number) => {
  selectedImages.value = selectedImages.value.filter((_, i) => i !== index)
  imagePreviewUrls.value = imagePreviewUrls.value.filter((_, i) => i !== index)
}

// Hàm đóng modal và reset dữ liệu
const closeImageModal = () => {
  showImageModal.value = false
  selectedImages.value = []
  imagePreviewUrls.value = []
}
</script>

<style scoped>
.my-contacts {
  padding: 24px;
}

.va-table-responsive {
  overflow: auto;
}

.contact-details-modal {
  max-width: 900px !important;
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
}

.image-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
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
  max-width: 90vw !important;
  max-height: 90vh !important;
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

/* Thêm styles cho preview hình ảnh */
.image-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.preview-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid var(--va-primary);
}

.preview-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  padding: 0;
}

.remove-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}
</style>
