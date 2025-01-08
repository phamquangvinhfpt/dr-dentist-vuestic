<template>
  <div class="my-contacts">
    <div class="flex justify-between mb-4">
      <div class="flex flex-col md:flex-row gap-2 w-full">
        <VaInput v-model="filterData.keyword" :placeholder="$t('common.search')" class="w-full md:w-[75%]" clearable>
          <template #appendInner>
            <i class="va-icon material-icons">search</i>
          </template>
        </VaInput>

        <div class="flex gap-2 w-full md:w-[25%]">
          <VaButton color="success" class="flex-1" @click="showAvailableContacts = true">
            <i class="va-icon material-icons">person_add</i>
            <span class="hidden md:inline">{{ $t('contact.getNew') }}</span>
            <span class="md:hidden">{{ $t('contact.getNew') }}</span>
          </VaButton>
        </div>
      </div>
    </div>

    <!-- <div v-if="showAdvancedSearch" class="mb-4 p-4 border rounded-lg">
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
    </div> -->

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
      :no-data-html="`<div class='text-center'>{$t('contact.management.no_contacts')}</div>`"
    >
      <template #cell(title)="{ row }">
        <div class="flex items-center gap-2">
          <span>{{ row.rowData.title }}</span>
        </div>
      </template>

      <template #cell(email)="{ row }">
        <div class="flex items-center gap-2">
          <span>{{ row.rowData.email }}</span>
        </div>
      </template>

      <template #cell(phone)="{ row }">
        <div class="flex items-center gap-2">
          <span>{{ row.rowData.phone }}</span>
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
          <b>{{ totalContacts }} {{ $t('contact.results') }}.</b>
          {{ $t('contact.resultsPerPage') }}
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
    <VaModal
      v-model="showDetailsModal"
      :title="$t('contact.management.title')"
      hide-default-actions
      class="contact-details-modal"
    >
      <div v-if="selectedContact" class="p-6">
        <div class="grid grid-cols-2 gap-6">
          <!-- Thông tin cá nhân -->
          <div class="contact-section">
            <h3 class="section-title">{{ $t('contact.management.personalInformation') }}</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">{{ $t('contact.title') }}</span>
                <span class="info-value">{{ selectedContact.title }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ $t('contact.email') }}</span>
                <span class="info-value">{{ selectedContact.email }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ $t('contact.phone') }}</span>
                <span class="info-value">{{ selectedContact.phone }}</span>
              </div>
            </div>
          </div>

          <!-- Thông tin trạng thái -->
          <div class="contact-section">
            <h3 class="section-title">{{ $t('contact.management.statusInformation') }}</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">{{ $t('contact.management.createdDate') }}</span>
                <span class="info-value">{{ new Date(selectedContact.createDate).toLocaleString() }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ $t('contact.management.Status') }}</span>
                <VaTag :color="selectedContact.staffId ? 'success' : 'warning'" class="status-tag">
                  {{ selectedContact.staffId ? 'Assigned' : 'Pending' }}
                </VaTag>
              </div>
              <div class="info-item">
                <span class="info-label">{{ $t('contact.management.staffName') }}</span>
                <span class="info-value">{{ selectedContact.staffName || 'Not assigned' }}</span>
              </div>
            </div>
          </div>

          <!-- Nội dung liên hệ -->
          <div class="contact-section col-span-2">
            <h3 class="section-title">{{ $t('contact.management.contactContent') }}</h3>
            <div class="content-box">
              <div class="mb-4">
                <span class="info-label">{{ $t('contact.content') }}</span>
                <p class="content-text">{{ selectedContact.content }}</p>
              </div>
              <div v-if="selectedContact.emailContext">
                <span class="info-label">{{ $t('contact.emailContext') }}</span>
                <p class="content-text">{{ selectedContact.emailContext }}</p>
              </div>
            </div>
          </div>

          <!-- Hình ảnh -->
          <div v-if="selectedContact.imageUrl?.length" class="contact-section col-span-2">
            <h3 class="section-title">{{ $t('contact.management.attachedImages') }}</h3>
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
          <VaButton color="gray" @click="showDetailsModal = false">{{ $t('common.close') }}</VaButton>
        </div>
      </template>
    </VaModal>

    <!-- Send Email Modal -->
    <VaModal
      v-model="showEmailModal"
      :title="$t('contact.management.sendEmail')"
      hide-default-actions
      class="email-modal"
    >
      <div class="p-6">
        <!-- Email field -->
        <div class="mb-6">
          <div class="flex items-center border-b border-gray-200 pb-2">
            <span class="text-sm font-medium w-16 text-gray-600">{{ $t('contact.email') }}:</span>
            <VaInput
              v-model="emailData.to"
              type="email"
              readonly
              class="flex-grow"
              :style="{
                '--va-input-wrapper-border-color': 'transparent',
                '--va-input-wrapper-background': 'transparent',
              }"
            />
          </div>
        </div>

        <!-- Subject field -->
        <div class="mb-6">
          <div class="flex items-center border-b border-gray-200 pb-2">
            <span class="text-sm font-medium w-16 text-gray-600">{{ $t('contact.management.subject') }}:</span>
            <VaInput
              v-model="emailData.subject"
              :placeholder="$t('contact.management.subject')"
              class="flex-grow"
              :style="{
                '--va-input-wrapper-border-color': 'transparent',
                '--va-input-wrapper-background': 'transparent',
              }"
            />
          </div>
        </div>

        <!-- Message content -->
        <div class="email-content">
          <VaTextarea
            v-model="emailData.content"
            rows="12"
            :placeholder="$t('contact.management.writeMessage')"
            class="w-full"
            autosize
            :style="{
              '--va-textarea-background': 'var(--va-background-primary)',
              '--va-textarea-border-color': 'var(--va-background-border)',
            }"
          />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end items-center px-6 py-4 border-t">
          <div class="flex gap-4">
            <VaButton color="gray" @click="showEmailModal = false">{{ $t('common.cancel') }}</VaButton>
            <VaButton color="primary" :loading="isSubmitting" @click="submitEmail"> {{ $t('common.send') }} </VaButton>
          </div>
        </div>
      </template>
    </VaModal>

    <!-- Update Call Image Modal -->
    <VaModal
      v-model="showImageModal"
      :title="$t('contact.management.uploadImages')"
      hide-default-actions
      class="upload-modal"
    >
      <div class="p-6">
        <p class="text-sm text-gray-600 mb-4">{{ $t('contact.management.uploadImages') }}</p>

        <div
          class="upload-area mb-6"
          @dragover.prevent="handleDragOver"
          @dragleave.prevent="handleDragLeave"
          @drop.prevent="handleDrop"
        >
          <div
            class="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg bg-gray-50"
            :class="isDragging ? 'border-primary border-solid' : 'border-gray-300'"
          >
            <div class="mb-4">
              <i class="va-icon material-icons text-4xl text-gray-400">cloud_upload</i>
            </div>
            <p class="text-center mb-2">{{ $t('contact.management.dragAndDrop') }}</p>
            <p class="text-sm text-gray-500 mb-4">{{ $t('contact.management.orClick') }}</p>
            <VaFileUpload
              v-model="selectedImages"
              multiple
              accept="image/*"
              hide-file-list
              class="upload-btn"
              @paste="handlePaste"
            >
              <VaButton color="primary">{{ $t('contact.management.selectFiles') }}</VaButton>
            </VaFileUpload>
          </div>
        </div>

        <!-- Preview Grid -->
        <div v-if="imagePreviewUrls.length" class="preview-grid mb-6">
          <div v-for="(url, index) in imagePreviewUrls" :key="index" class="preview-item">
            <img :src="url" :alt="`Preview ${index + 1}`" class="preview-image" />
            <button class="remove-btn" @click="removeImage(index)">
              <i class="va-icon material-icons">close</i>
            </button>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-4 p-4 border-t">
          <VaButton color="gray" @click="closeImageModal">{{ $t('common.cancel') }}</VaButton>
          <VaButton color="primary" :loading="isSubmitting" @click="submitImages">
            {{ $t('contact.management.addToProfile') }}
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
          <VaButton color="gray" @click="showImagePreview = false">{{ $t('common.close') }}</VaButton>
        </div>
      </template>
    </VaModal>

    <!-- Available Contacts Modal test Tuan -->
    <VaModal
      v-model="showAvailableContacts"
      :title="$t('contact.management.availableContacts')"
      hide-default-actions
      class="available-contacts-modal"
    >
      <div class="p-4">
        <VaInput v-model="availableContactsSearch" :placeholder="$t('common.search')" class="mb-4" clearable>
          <template #appendInner>
            <i class="va-icon material-icons">search</i>
          </template>
        </VaInput>

        <VaDataTable
          class="custom-table"
          :items="availableContacts"
          :columns="availableContactsColumns"
          hoverable
          sticky-header
          striped
          :no-data-html="`<div class='text-center'>${t('contact.management.no_contacts')}</div>`"
        >
          <template #cell(title)="{ row }">
            <div class="flex items-center">
              <span class="truncate">{{ row.rowData.title }}</span>
            </div>
          </template>

          <template #cell(email)="{ row }">
            <div class="flex items-center">
              <span class="truncate">{{ row.rowData.email }}</span>
            </div>
          </template>

          <template #cell(phone)="{ row }">
            <div class="flex items-center">
              <span class="truncate">{{ row.rowData.phone }}</span>
            </div>
          </template>

          <template #cell(actions)="{ row }">
            <VaButton small color="primary" @click="handleTakeContact(row.rowData as ContactInfo)">
              {{ $t('common.take') }}
            </VaButton>
          </template>
        </VaDataTable>

        <div class="flex justify-between items-center mt-4">
          <div>
            <b>{{ totalAvailableContacts }} {{ $t('contact.results') }}.</b>
            {{ $t('contact.resultsPerPage') }}
            <VaSelect v-model="availableContactsPageSize" class="!w-20" :options="[10, 50, 100]" />
          </div>
          <VaPagination
            v-if="totalAvailablePages > 1"
            v-model="availableContactsPage"
            :pages="totalAvailablePages"
            :visible-pages="5"
            buttons-preset="secondary"
            :boundary-links="true"
            :direction-links="true"
          />
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2 p-4">
          <VaButton color="gray" @click="showAvailableContacts = false">{{ $t('common.close') }}</VaButton>
        </div>
      </template>
    </VaModal>
    <!-- End of test Tuan -->
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useToast } from 'vuestic-ui'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useContactStaffStore } from '@/stores/modules/contact-staff.module'
import { useAuthStore } from '@/stores/modules/auth.module'
import type { ContactInfo, AdvancedSearch } from './types'
import { computed } from 'vue'

const { t } = useI18n()
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

const columns = computed(() => [
  { key: 'title', label: t('contact.title'), width: '30%' },
  { key: 'email', label: t('contact.email'), width: '30%' },
  { key: 'phone', label: t('contact.phone'), width: '25%' },
  { key: 'actions', label: t('contact.actions'), width: '15%' },
])

// const searchFields = ['title', 'email', 'phone', 'content']
// const sortFields = ['title', 'email', 'phone', 'createdAt']

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
      message: t('contact.failedToFetchContacts'),
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
const emailData = reactive({
  to: '',
  subject: '',
  content: '',
})
const selectedImages = ref<File[]>([])
const isSubmitting = ref(false)
const selectedContactId = ref('')

// Thêm hàm để tạo template email
const generateDentalEmailTemplate = (title: string) => {
  return `We reply from your title "${title}",

Thank you for contacting Dental Clinic. We have received your inquiry and would like to provide you with the following information:

Regarding your dental consultation request, we would like to:
- Confirm your appointment details
- Provide information about the requested treatment
- Answer any specific questions you may have

Our dental team is committed to providing you with the highest quality of care. If you need any additional information or would like to reschedule your appointment, please don't hesitate to contact us.

Best regards,
Dental Care Team
Phone: (123) 456-7890
Email: contact@dentalcare.com`
}

// Cập nhật hàm handleSendEmail
const handleSendEmail = (contact: ContactInfo) => {
  selectedContactId.value = contact.contactId
  selectedContact.value = contact
  emailData.to = contact.email
  emailData.subject = 'Re: Dental Care Consultation'
  emailData.content = generateDentalEmailTemplate(contact.title)
  showEmailModal.value = true
}

const submitEmail = async () => {
  if (!emailData.content.trim()) {
    init({
      message: t('contact.pleaseEnterEmailContent'),
      color: 'warning',
      duration: 3000,
    })
    return
  }

  try {
    isSubmitting.value = true
    await contactStaffStore.sendEmail(selectedContactId.value, emailData.content)
    showEmailModal.value = false
    // Reset form data
    emailData.to = ''
    emailData.subject = ''
    emailData.content = ''

    init({
      message: t('contact.emailSentSuccessfully'),
      color: 'success',
      duration: 3000,
    })
  } catch (error) {
    init({
      message: t('contact.failedToSendEmail'),
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
      message: t('contact.pleaseSelectAtLeastOneImage'),
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
      message: t('contact.imagesUpdatedSuccessfully'),
      color: 'success',
      duration: 3000,
    })

    await fetchContacts()
  } catch (error) {
    console.error('Error uploading images:', error)
    init({
      message: error instanceof Error ? error.message : t('contact.failedToUpdateImages'),
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
      message: t('common.unauthorized'),
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

// Hàm helper để tạo preview cho files
const createPreviewsForFiles = (files: File[]) => {
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

// Handle drag & drop
const handleDragOver = (event: DragEvent) => {
  isDragging.value = true
  event.dataTransfer!.dropEffect = 'copy'
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  const files = Array.from(event.dataTransfer!.files)
  const imageFiles = files.filter((file) => file.type.startsWith('image/'))

  if (imageFiles.length) {
    selectedImages.value = [...selectedImages.value, ...imageFiles]
    // Không cần gọi createPreviewsForFiles ở đây vì watch sẽ xử lý
  }
}

// Watch selectedImages để xử lý khi có thay đổi (từ cả drag & drop và button upload)
watch(selectedImages, (files) => {
  if (files && files.length) {
    // Reset previews và tạo mới cho tất cả files
    imagePreviewUrls.value = []
    createPreviewsForFiles(files)
  } else {
    // Reset previews nếu không có files
    imagePreviewUrls.value = []
  }
})

// Handle paste from clipboard
const handlePaste = (event: ClipboardEvent) => {
  const items = event.clipboardData?.items
  if (!items) return

  for (const item of Array.from(items)) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (file) {
        selectedImages.value = [...selectedImages.value, file]
        // Không cần gọi createPreviewsForFiles ở đây vì watch sẽ xử lý
      }
    }
  }
}

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

// Thêm ref để track trạng thái kéo thả
const isDragging = ref(false)

// Thêm vào phần đầu của script, cùng với các ref khác
const imagePreviewUrls = ref<string[]>([])

// Available Contacts Modal test Tuan
const showAvailableContacts = ref(false)
const availableContactsSearch = ref('')
const availableContacts = ref<ContactInfo[]>([])
const availableContactsPage = ref(1)
const availableContactsPageSize = ref(10)
const totalAvailablePages = ref(0)
const totalAvailableContacts = ref(0)

const availableContactsColumns = computed(() => [
  { key: 'title', label: t('contact.management.title'), width: '30%' },
  { key: 'email', label: t('contact.management.email'), width: '30%' },
  { key: 'phone', label: t('contact.management.phone'), width: '25%' },
  { key: 'actions', label: t('contact.management.actions'), width: '15%' },
])

// Fetch available contacts that have no staff assigned
const fetchAvailableContacts = async () => {
  try {
    const response = await contactStaffStore.getAllContacts({
      pageNumber: availableContactsPage.value - 1,
      pageSize: availableContactsPageSize.value,
      hasStaff: false,
      orderBy: [],
      keyword: availableContactsSearch.value,
      advancedSearch: {
        fields: [],
        keyword: '',
      },
    })

    availableContacts.value = response.data
    availableContactsPage.value = response.currentPage + 1
    totalAvailablePages.value = response.totalPages
    totalAvailableContacts.value = response.totalCount
  } catch (error) {
    init({
      message: t('contact.failedToFetchAvailableContacts'),
      color: 'danger',
      duration: 3000,
    })
  }
}

// Handle taking a contact
const handleTakeContact = async (contact: ContactInfo) => {
  try {
    await contactStaffStore.addStaffContact(authStore.user?.id || '', contact.contactId)

    init({
      message: t('contact.contactTakenSuccessfully'),
      color: 'success',
      duration: 3000,
    })

    // Refresh both contact lists
    await fetchAvailableContacts()
    await fetchContacts()
  } catch (error) {
    init({
      message: t('contact.failedToTakeContact'),
      color: 'danger',
      duration: 3000,
    })
  }
}

// Watch for changes in available contacts search and pagination
watch([availableContactsSearch, availableContactsPage, availableContactsPageSize], () => {
  fetchAvailableContacts()
})

// Update onMounted to check for Staff role instead of Admin
onMounted(async () => {
  if (!authStore.musHaveRole('Staff')) {
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

// Watch for modal open to fetch available contacts
watch(showAvailableContacts, (newValue) => {
  if (newValue) {
    fetchAvailableContacts()
  }
})
// End of test Tuan
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
  margin: 0 auto !important;
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
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
  margin: 0 auto !important;
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
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
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  transition: background 0.2s;
}

.remove-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}

/* Thêm vào phần style hiện có */
.email-modal {
  max-width: 600px !important;
  margin: 0 auto !important;
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
}

.email-modal :deep(.va-input__content) {
  border: none !important;
  padding: 0;
}

.email-content {
  background-color: var(--va-background-primary);
  border-radius: 8px;
}

.email-content :deep(.va-textarea__content) {
  padding: 12px;
}

/* Remove default input styles */
:deep(.va-input-wrapper) {
  background: transparent !important;
  border: none !important;
}

:deep(.va-input__content) {
  padding: 0 !important;
}

.upload-modal {
  max-width: 500px !important;
  margin: 0 auto !important;
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
}

.upload-area {
  transition: all 0.3s ease;
}

.upload-area:hover {
  border-color: var(--va-primary);
}

.upload-btn :deep(.va-file-upload__button) {
  display: none;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
}

.preview-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  transition: background 0.2s;
}

.remove-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}

.upload-area {
  transition: all 0.3s ease;
}

.border-primary {
  border-color: var(--va-primary) !important;
  background-color: var(--va-background-secondary) !important;
}

/* Responsive styles */
@media screen and (max-width: 768px) {
  .my-contacts {
    padding: 16px;
  }

  .contact-details-modal {
    max-width: 95% !important;
    margin: 10px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .image-gallery {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }

  .preview-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  }

  .email-modal {
    max-width: 95% !important;
    margin: 10px;
  }

  .upload-modal {
    max-width: 95% !important;
    margin: 10px;
  }
}

@media screen and (max-width: 576px) {
  .my-contacts {
    padding: 12px;
  }

  .flex.justify-between.mb-4 {
    flex-direction: column;
    gap: 10px;
  }

  .flex.gap-2.w-full {
    flex-wrap: wrap;
  }

  .flex.gap-2.w-full .va-button {
    flex: 1 1 auto;
    min-width: calc(50% - 5px);
  }

  .image-gallery {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }

  .preview-grid {
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  }

  .contact-section {
    padding: 1rem;
  }

  .section-title {
    font-size: 1.1rem;
  }

  .info-label {
    font-size: 0.85rem;
  }

  .content-box {
    padding: 0.75rem;
  }
}

@media screen and (max-width: 480px) {
  .flex.gap-2.w-full .va-button {
    min-width: 100%;
  }

  .image-gallery {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  }

  .preview-grid {
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  }

  .contact-section {
    padding: 0.75rem;
  }
}

:deep(.va-modal__overlay) {
  background-color: transparent !important;
}

:deep(.va-modal__container) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  border-radius: 8px !important;
  background: var(--va-background-primary) !important;
}

.available-contacts-modal {
  max-width: 800px !important;
  margin: 0 auto !important;
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
}

.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

:deep(.va-data-table__table-td) {
  padding: 8px 16px !important;
}

:deep(.va-data-table__table-th) {
  padding: 12px 16px !important;
  font-weight: 600 !important;
}

.custom-table {
  width: 100%;
}
</style>
