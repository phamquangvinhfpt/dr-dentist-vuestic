<template>
  <div class="form-management-container">
    <VaCard class="form-card">
      <VaCardTitle class="card-title">
        <div class="flex items-center gap-4">
          <i class="fas fa-file-alt title-icon"></i>
          <h2 class="text-2xl font-semibold">Form Management</h2>
        </div>
      </VaCardTitle>

      <VaCardContent>
        <div class="header-actions">
          <div class="search-section">
            <VaInput v-model="searchQuery" placeholder="Search forms..." class="search-input" size="medium">
              <template #prepend>
                <VaIcon name="search" color="primary" class="search-icon" />
              </template>
              <template v-if="searchQuery" #append>
                <VaIcon name="clear" class="clear-icon" color="gray" @click="searchQuery = ''" />
              </template>
            </VaInput>
          </div>

          <div class="button-group">
            <div class="filter-tabs">
              <div class="tab-wrapper">
                <button
                  v-for="status in statusFilterOptions"
                  :key="status.id"
                  class="tab-button"
                  :class="{
                    active: selectedStatusFilter === status.value,
                    'tab-waiting': status.value === 0,
                    'tab-accepted': status.value === 1,
                    'tab-failed': status.value === 2,
                    'tab-all': status.value === null,
                  }"
                  @click="handleStatusFilterChange(status.value)"
                >
                  {{ status.label }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <VaDataTable
          class="custom-table"
          :items="formList"
          :columns="columns"
          hoverable
          select-mode="multiple"
          :disable-client-side-sorting="false"
          sticky-header
          striped
          no-data-html="<div class='text-center'>No forms found</div>"
        >
          <template #cell(name)="{ row }">
            <div class="flex items-center gap-2 ellipsis max-w-[230px]">
              <span class="w-24">{{ row.rowData.name }}</span>
            </div>
          </template>

          <template #cell(workingDate)="{ row }">
            <div class="flex items-center gap-2">
              <span>{{ formatDate(row.rowData.workingDate) }}</span>
            </div>
          </template>

          <template #cell(workingTimes)="{ row }">
            <div class="working-times-cell">
              <div v-for="time in row.rowData.workingTimes" :key="time.timeID" class="time-item">
                <span class="time-text">{{ formatTime(time.startTime) }} - {{ formatTime(time.endTime) }}</span>
              </div>
            </div>
          </template>

          <template #cell(description)="{ row }">
            <div class="flex items-center gap-2 ellipsis max-w-[230px]">
              <span class="w-24">{{ row.rowData.description }}</span>
            </div>
          </template>

          <template #cell(status)="{ row }">
            <div class="flex items-center gap-2">
              <VaDropdown
                :value="row.rowData.status"
                placement="bottom"
                class="status-dropdown"
                :disabled="row.rowData.status === 1 || row.rowData.status === 2"
              >
                <template #anchor>
                  <VaButton
                    :color="getStatusColor(row.rowData.status)"
                    size="small"
                    class="status-button"
                    :disabled="row.rowData.status === 1 || row.rowData.status === 2"
                  >
                    <div class="status-content">
                      <div class="status-dot" :class="getStatusDotClass(row.rowData.status)"></div>
                      {{ getStatusText(row.rowData.status) }}
                    </div>
                    <VaIcon v-if="row.rowData.status === 0" name="expand_more" />
                  </VaButton>
                </template>

                <VaDropdownContent v-if="row.rowData.status === 0" class="status-dropdown-content">
                  <div class="status-list">
                    <div
                      v-for="status in statusOptions"
                      :key="status.value"
                      class="status-item"
                      :class="{
                        'status-item--disabled': status.value === row.rowData.status,
                        'status-item--warning': status.value === 0,
                        'status-item--success': status.value === 1,
                        'status-item--danger': status.value === 2,
                      }"
                      @click="
                        status.value !== row.rowData.status &&
                          openStatusChangeDialog(row.rowData as FormDTO, status.value)
                      "
                    >
                      <div class="status-item-content">
                        <div class="status-dot" :class="getStatusDotClass(status.value)"></div>
                        <span>{{ status.label }}</span>
                      </div>
                      <VaIcon v-if="status.value === row.rowData.status" name="check" class="status-check" />
                    </div>
                  </div>
                </VaDropdownContent>
              </VaDropdown>
            </div>
          </template>

          <template #cell(action)="{ row }">
            <div class="action-buttons">
              <VaButton
                color="info"
                size="small"
                class="action-button-circle"
                preset="primary"
                round
                @click="viewDetails(row.rowData as FormDTO)"
              >
                <VaIcon name="visibility" />
              </VaButton>
            </div>
          </template>
        </VaDataTable>

        <div class="table-footer">
          <div v-if="formList.length > 0" class="footer-content">
            <div class="records-info">
              <b>{{ formList.length }} {{ t('common.result') }}</b>
              <span class="page-size-selector">
                {{ t('common.resultPerPage') }}
                <VaSelect
                  v-model="formData.pageSize"
                  class="page-size-select"
                  :options="[10, 50, 100]"
                  @update:modelValue="handlePageSizeChange"
                />
              </span>
            </div>
            <div v-if="totalPages > 1" class="pagination-container">
              <VaPagination
                v-model="currentPage"
                buttons-preset="primary"
                :pages="totalPages"
                :visible-pages="5"
                :boundary-links="true"
                :direction-links="true"
                @update:modelValue="handlePageChange"
              />
            </div>
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <VaModal
      v-model="showStatusDialog"
      title="Change Status"
      ok-text="Confirm"
      cancel-text="Cancel"
      class="status-change-modal"
      size="medium"
      @ok="confirmStatusChange"
      @cancel="cancelStatusChange"
    >
      <template #header>
        <div class="modal-header">
          <h3 class="modal-title">Change Status</h3>
        </div>
      </template>
      <div class="status-change-form">
        <p class="status-change-text">
          Are you sure you want to change the status to <b>{{ getStatusText(newStatus) }}</b
          >?
        </p>
        <VaTextarea
          v-model="statusNote"
          label="Note"
          placeholder="Enter a note for this status change..."
          class="mt-4"
          :rules="[(value: string) => !!value || 'Note is required']"
        />
      </div>
    </VaModal>

    <VaModal v-model="showDetailsModal" title="Form Details" hide-default-actions class="details-modal">
      <div v-if="selectedForm" class="form-details-container">
        <div class="details-header">
          <div class="status-badge" :class="getStatusColor(selectedForm.status)">
            <div class="status-dot" :class="getStatusDotClass(selectedForm.status)"></div>
            {{ getStatusText(selectedForm.status) }}
          </div>
        </div>

        <div class="details-grid">
          <div class="detail-section">
            <h3 class="section-title"><i class="fas fa-info-circle mr-2"></i>Basic Information</h3>
            <div class="detail-content">
              <div class="detail-item">
                <span class="detail-label">Name</span>
                <span class="detail-value">{{ selectedForm.name }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Working Date</span>
                <span class="detail-value">{{ formatDate(selectedForm.workingDate) }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3 class="section-title"><i class="fas fa-clock mr-2"></i>Working Hours</h3>
            <div class="detail-content">
              <div class="working-times-grid">
                <div v-for="time in selectedForm.workingTimes" :key="time.timeID" class="time-slot">
                  <i class="fas fa-business-time mr-2"></i>
                  <span>{{ formatTime(time.startTime) }} - {{ formatTime(time.endTime) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="detail-section full-width">
            <h3 class="section-title"><i class="fas fa-align-left mr-2"></i>Description</h3>
            <div class="detail-content">
              <p class="description-text">{{ selectedForm.description || 'No description provided' }}</p>
            </div>
          </div>

          <div class="detail-section full-width">
            <h3 class="section-title"><i class="fas fa-sticky-note mr-2"></i>Notes</h3>
            <div class="detail-content">
              <div class="note-container">
                <p class="note-text">{{ selectedForm.note || 'No notes available' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="modal-footer">
          <VaButton color="gray" class="close-button" @click="showDetailsModal = false">
            <i class="fas fa-times mr-2"></i>Close
          </VaButton>
        </div>
      </template>
    </VaModal>
  </div>
</template>

<script lang="ts" setup>
import { useFormStore } from '@/stores/modules/form.module'
import { onMounted, ref, reactive, computed, watch, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FormDTO, FilterForm } from './types'
import { useToast } from 'vuestic-ui'

const { t } = useI18n()
const { init } = useToast()
const formStore = useFormStore()

const formData = reactive({
  pageNumber: 1,
  pageSize: 10,
  isActive: true,
  orderBy: [],
})

const formList = ref<FormDTO[]>([])
const searchQuery = ref('')
const currentPage = ref(1)
const selectedStatusFilter = ref<number | null>(null)

const totalPages = computed(() => {
  return Math.ceil(formList.value.length / formData.pageSize)
})

const columns = computed(() => [
  { key: 'name', label: t('form.name') },
  { key: 'workingDate', label: t('form.workingDate') },
  { key: 'workingTimes', label: t('form.workingTimes') },
  { key: 'description', label: t('form.description') },
  { key: 'status', label: t('form.status') },
  { key: 'action', label: t('common.actions') },
])

const getAllForms = async () => {
  try {
    const filter: FilterForm = {
      pageNumber: currentPage.value,
      pageSize: formData.pageSize,
      isActive: formData.isActive,
      orderBy: formData.orderBy,
      advancedFilter:
        selectedStatusFilter.value !== null
          ? {
              logic: 'and',
              filters: [
                {
                  field: 'status',
                  operator: 'eq',
                  value: selectedStatusFilter.value.toString(),
                },
              ],
            }
          : undefined,
    }

    const response = await formStore.getAllForms(filter)
    formList.value = response.data
  } catch (error) {
    console.error('Error fetching forms:', error)
    init({
      message: t('form.fetchError'),
      color: 'danger',
      duration: 3000,
    })
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

// const getStatusClass = (status: number) => {
//   switch (status) {
//     case 0:
//       return 'text-yellow-500'
//     case 1:
//       return 'text-green-500'
//     case 2:
//       return 'text-red-500'
//   }
// }

const getStatusText = (status: number) => {
  switch (status) {
    case 0:
      return t('form.waiting')
    case 1:
      return t('form.accepted')
    case 2:
      return t('form.failed')
  }
}

const viewDetails = (form: FormDTO) => {
  selectedForm.value = form
  showDetailsModal.value = true
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  getAllForms()
}

const handlePageSizeChange = (size: number) => {
  formData.pageSize = size
  currentPage.value = 1
  getAllForms()
}

// Search functionality
const handleSearch = (query: string) => {
  if (!query) {
    getAllForms()
    return
  }

  const searchTerms = query
    .toLowerCase()
    .split(' ')
    .filter((term) => term)

  const filteredForms = formList.value.filter((form) => {
    const name = form.name.toLowerCase()
    const description = form.description.toLowerCase()
    const date = formatDate(form.workingDate) // VD: "23/02/2024"
    const dateVariants = [
      date, // 23/02/2024
      date.split('/')[0], // 23
      date.split('/').slice(0, 2).join('/'), // 23/02
      date.replace(/\//g, ''), // 23022024
    ]

    // Tìm kiếm chính xác cụm từ
    if (name.includes(query.toLowerCase()) || description.includes(query.toLowerCase())) {
      return true
    }

    // Tìm kiếm theo ngày
    if (dateVariants.some((variant) => variant.includes(query.toLowerCase().replace(/\//g, '')))) {
      return true
    }

    // Tìm kiếm theo từng từ riêng lẻ
    return searchTerms.some((term) => {
      // Tìm trong name và description
      if (name.includes(term) || description.includes(term)) {
        return true
      }

      // Tìm trong các dạng ngày
      const termWithoutSlash = term.replace(/\//g, '')
      return dateVariants.some((variant) => variant.includes(termWithoutSlash))
    })
  })

  formList.value = filteredForms
}

// Debounce search để tránh gọi quá nhiều lần
const debouncedSearch = (query: string) => {
  clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => {
    handleSearch(query)
  }, 300)
}

// Watch search query với debounce
watch(searchQuery, (newValue) => {
  debouncedSearch(newValue)
})

// Thêm ref cho timeout
const searchTimeout = ref<NodeJS.Timeout>()

// Cleanup khi component unmount
onBeforeUnmount(() => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
})

const showStatusDialog = ref(false)
const statusNote = ref('')
const newStatus = ref(0)
const selectedForm = ref<FormDTO | null>(null)

const statusOptions = [
  { value: 0, label: t('form.waiting') },
  { value: 1, label: t('form.accepted') },
  { value: 2, label: t('form.failed') },
]

const getStatusColor = (status: number) => {
  switch (status) {
    case 0:
      return 'warning'
    case 1:
      return 'success'
    case 2:
      return 'danger'
    default:
      return 'gray'
  }
}

const openStatusChangeDialog = (form: FormDTO, status: number) => {
  console.log('Form being changed:', form)
  selectedForm.value = form
  newStatus.value = status
  statusNote.value = ''
  showStatusDialog.value = true
}

const confirmStatusChange = async () => {
  if (!statusNote.value.trim() || !selectedForm.value) {
    init({
      message: t('form.noteRequired'),
      color: 'danger',
      duration: 3000,
    })
    return
  }

  try {
    console.log('Request payload:', {
      formID: selectedForm.value.formID,
      status: newStatus.value,
      note: statusNote.value.trim(),
    })

    await formStore.toggleFormStatus({
      formID: selectedForm.value.formID,
      status: newStatus.value,
      note: statusNote.value.trim(),
    })

    init({
      message: t('form.statusUpdateSuccess'),
      color: 'success',
      duration: 3000,
    })

    showStatusDialog.value = false
    statusNote.value = ''
    selectedForm.value = null
    await getAllForms()
  } catch (error: any) {
    console.error('Error updating status:', error)
    const errorMessage =
      error.response?.data?.messages?.[0] || error.response?.data?.exception || t('form.statusUpdateError')

    init({
      message: errorMessage,
      color: 'danger',
      duration: 3000,
    })
  }
}

const cancelStatusChange = () => {
  showStatusDialog.value = false
  statusNote.value = ''
  selectedForm.value = null
}

onMounted(async () => {
  await getAllForms()
})

const getStatusDotClass = (status: number) => {
  switch (status) {
    case 0:
      return 'warning'
    case 1:
      return 'success'
    case 2:
      return 'danger'
    default:
      return ''
  }
}

const showDetailsModal = ref(false)

const formatTime = (time: string) => {
  if (!time) return ''
  return new Date(`1970-01-01T${time}`).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const handleStatusFilterChange = async (status: number | null) => {
  selectedStatusFilter.value = status

  const filter: FilterForm = {
    pageNumber: currentPage.value,
    pageSize: formData.pageSize,
    isActive: formData.isActive,
    orderBy: formData.orderBy,
    advancedFilter:
      status !== null
        ? {
            logic: 'and',
            filters: [
              {
                field: 'status',
                operator: 'eq',
                value: status.toString(),
              },
            ],
          }
        : undefined,
  }

  try {
    const response = await formStore.getAllForms(filter)
    formList.value = response.data
  } catch (error) {
    console.error('Error filtering forms:', error)
    init({
      message: t('form.fetchError'),
      color: 'danger',
      duration: 3000,
    })
  }
}

const statusFilterOptions = [
  { id: 'all', value: null, label: t('form.allStatus') },
  { id: 'waiting', value: 0, label: t('form.waiting') },
  { id: 'accepted', value: 1, label: t('form.accepted') },
  { id: 'failed', value: 2, label: t('form.failed') },
]
</script>

<style scoped>
.form-management-container {
  padding: 2rem;
  background: var(--va-background-primary);
  min-height: 100vh;
}

.form-card {
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  background: var(--va-background-secondary);
  border: 1px solid var(--va-border-color);
  transition: all 0.3s ease;
  animation: fadeIn 0.5s ease-out;
}

.form-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
}

.card-title {
  padding: 1.8rem;
  border-bottom: 1px solid var(--va-border-color);
  background: var(--va-background-secondary);
}

.title-icon {
  font-size: 2.2rem;
  background: linear-gradient(45deg, var(--va-primary) 0%, var(--va-primary-light) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  background: var(--va-background-element);
  border-radius: 15px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);
}

.search-section {
  width: 70%;
  max-width: 800px;
  transition: all 0.3s ease;
}

.search-input {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.search-input:deep(input) {
  height: 45px;
  font-size: 1rem;
  padding: 0 1.2rem;
  background: var(--va-background-secondary);
  color: var(--va-text-primary);
  border: 2px solid var(--va-border-color);
  transition: all 0.3s ease;
}

.search-input:deep(input):focus {
  border-color: var(--va-primary);
  box-shadow: 0 0 0 4px rgba(var(--va-primary-rgb), 0.1);
}

.search-icon {
  font-size: 1.3rem;
  margin-left: 0.8rem;
}

.clear-icon {
  cursor: pointer;
  padding: 0.4rem;
  margin-right: 0.8rem;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.button-group {
  display: flex;
  gap: 1rem;
}

.status-filter-button {
  height: 45px;
  min-width: 150px;
  width: 150px;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: center;
  align-items: center;
}

.status-filter-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.custom-table {
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
}

.custom-table:deep(th) {
  background: var(--va-background-secondary) !important;
  font-size: 1rem;
  font-weight: 600;
  padding: 1.2rem 1.5rem;
  color: var(--va-text-primary);
  border-bottom: 2px solid var(--va-border-color);
}

.custom-table:deep(td) {
  padding: 1.2rem 1.5rem;
  color: var(--va-text-primary);
  border-bottom: 1px solid var(--va-border-color);
}

.custom-table:deep(tr:hover td) {
  background: var(--va-background-element);
}

.working-times-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 220px;
}

.time-item {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  background: var(--va-background-secondary);
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.time-item:hover {
  background: var(--va-background-secondary);
  border-color: var(--va-primary);
  transform: translateX(5px);
}

.time-text {
  font-size: 0.9rem;
  color: var(--va-text-primary);
  font-weight: 500;
}

.status-button {
  min-width: 150px;
  width: 150px;
  padding: 8px 16px;
  border-radius: 30px;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.status-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: flex-start;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.status-dot.warning {
  background: linear-gradient(45deg, var(--va-warning) 0%, var(--va-warning-light) 100%);
  box-shadow: 0 0 10px var(--va-warning-lighter);
}

.status-dot.success {
  background: linear-gradient(45deg, var(--va-success) 0%, var(--va-success-light) 100%);
  box-shadow: 0 0 10px var(--va-success-lighter);
}

.status-dot.danger {
  background: linear-gradient(45deg, var(--va-danger) 0%, var(--va-danger-light) 100%);
  box-shadow: 0 0 10px var(--va-danger-lighter);
}

.action-buttons {
  display: flex;
  gap: 0.8rem;
}

.action-button-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-button-circle:hover {
  transform: rotate(15deg) scale(1.1);
}

.table-footer {
  margin-top: 2rem;
  padding: 1.5rem;
  border-top: 1px solid var(--va-background-secondary);
  background: var(--va-background-secondary);
  border-radius: 0 0 15px 15px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.records-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  color: var(--va-text-primary);
  font-size: 1.1rem;
}

.page-size-selector {
  display: flex;
  align-items: center;
  color: var(--va-text-primary);
  gap: 0.8rem;
  font-size: 1rem;
}

.page-size-select {
  width: 90px;
}

/* Modal styles */
:deep(.va-modal__container) {
  border-radius: 20px;
  overflow: hidden;
}

:deep(.va-modal__title) {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  padding: 1.5rem;
  border-bottom: 1px solid #edf2f7;
  background: #f8fafc;
}

:deep(.va-modal__content) {
  padding: 1.5rem;
}

:deep(.va-modal__actions) {
  padding: 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #edf2f7;
}

.status-change-form {
  padding: 1rem;
}

.status-change-form p {
  font-size: 1.1rem;
  color: #334155;
  margin-bottom: 1rem;
}

/* Status dropdown */
.status-dropdown-content {
  min-width: 150px;
  width: 150px;
  padding: 8px;
  border-radius: 15px;
  background: white;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-item {
  width: 100%;
  padding: 10px 15px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-item:not(.status-item--disabled):hover {
  background: #f8fafc;
  transform: translateX(5px);
}

.status-item--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.status-item-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.status-item {
  animation: slideIn 0.3s ease-out;
}

/* Hover effects */
.search-input:hover:deep(input) {
  border-color: rgba(var(--va-primary-rgb), 0.3);
}

.clear-icon:hover {
  background-color: rgba(0, 0, 0, 0.05);
  transform: rotate(90deg);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    gap: 1rem;
  }

  .search-section {
    width: 100%;
  }

  .button-group {
    width: 100%;
    justify-content: flex-end;
  }
}

/* Form Details Modal Styles */
.details-modal :deep(.va-modal__container) {
  max-width: 800px;
  width: 90%;
}

.form-details-container {
  padding: 1.5rem;
}

.details-header {
  margin-bottom: 2rem;
  display: flex;
  justify-content: flex-end;
}

.status-badge {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  gap: 0.5rem;
}

.status-badge.warning {
  background-color: #fff7ed;
  color: #c2410c;
}

.status-badge.success {
  background-color: #f0fdf4;
  color: #15803d;
}

.status-badge.danger {
  background-color: #fef2f2;
  color: #b91c1c;
}
.status-badge.warning {
  background: linear-gradient(45deg, #fef3c7 0%, #fde68a 100%);
  color: #b45309;
}

.status-badge.success {
  background: linear-gradient(45deg, #d1fae5 0%, #a7f3d0 100%);
  color: #047857;
}

.status-badge.danger {
  background: linear-gradient(45deg, #fee2e2 0%, #fecaca 100%);
  color: #b91c1c;
}
.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.detail-section {
  background: var(--va-background-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px var(--va-text-primary);
  transition: all 0.3s ease;
}

.detail-section:hover {
  box-shadow: 0 4px 6px var(--va-text-primary);
  transform: translateY(-2px);
}

.detail-section.full-width {
  grid-column: 1 / -1;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--va-text-primary);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #f1f5f9;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.detail-label {
  color: var(--va-text-primary);
  font-weight: 500;
}

.detail-value {
  color: var(--va-text-primary);
  font-weight: 600;
}

.working-times-grid {
  display: grid;
  gap: 0.75rem;
}

.time-slot {
  background: var(--va-background-secondary);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  color: var(--va-text-primary);
  font-weight: 500;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
}

.time-slot:hover {
  background: var(--va-background-secondary);
  transform: translateX(5px);
}

.description-text {
  color: var(--va-text-primary);
  line-height: 1.6;
  white-space: pre-line;
}

.note-container {
  background: #fffbeb;
  border-left: 4px solid #f59e0b;
  padding: 1rem;
  border-radius: 0 8px 8px 0;
}

.note-text {
  color: #92400e;
  line-height: 1.6;
  font-style: italic;
}

.modal-footer {
  padding: 1rem 1.5rem;
  background: var(--va-background-secondary);
  display: flex;
  justify-content: flex-end;
}

.close-button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.close-button:hover {
  transform: translateY(-2px);
}

@media (max-width: 640px) {
  .details-grid {
    grid-template-columns: 1fr;
  }

  .detail-item {
    flex-direction: column;
    gap: 0.5rem;
  }

  .detail-value {
    padding-left: 1rem;
  }
}

.filter-tabs {
  margin-bottom: 20px;
}

.tab-wrapper {
  display: flex;
  gap: 8px;
  background: var(--va-background-element);
  padding: 4px;
  border-radius: 8px;
  width: fit-content;
}

.tab-button {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
  color: var(--va-text-secondary);
}

.tab-button:hover {
  background: var(--va-background-secondary);
}

.tab-button.active {
  background: var(--va-background-secondary);
}

.tab-button.active.tab-waiting {
  color: var(--va-warning);
}

.tab-button.active.tab-accepted {
  color: var(--va-success);
}

.tab-button.active.tab-failed {
  color: var(--va-danger);
}

.tab-button.active.tab-all {
  color: var(--va-primary);
}

/* Remove the old status filter button styles if you're not using them anymore */
.status-filter-button {
  display: none;
}

.status-button[disabled] {
  opacity: 1 !important;
  cursor: default !important;
}

.status-button[disabled]:hover {
  transform: none !important;
  box-shadow: none !important;
}

.status-dropdown[disabled] {
  cursor: default !important;
}

/* Add transition for smooth theme switching */
* {
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

/* CSS updates */
.status-change-modal {
  :deep(.va-modal__container) {
    min-width: 600px;
    background: var(--va-background-secondary);
  }

  .modal-header {
    padding: 1.5rem;
    border-bottom: 1px solid var(--va-background-border);
    background: var(--va-background-element);
  }

  .modal-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--va-text-primary);
    margin: 0;
  }

  :deep(.va-modal__content) {
    padding: 1.5rem;
    background: var(--va-background-secondary);
  }

  :deep(.va-modal__actions) {
    padding: 1.5rem;
    background: var(--va-background-element);
    border-top: 1px solid var(--va-background-border);
  }

  :deep(.va-button--default) {
    background: var(--va-background-element);
    color: var(--va-text-primary);
    border: 1px solid var(--va-background-border);

    &:hover {
      background: var(--va-background-primary);
      border-color: var(--va-primary);
    }
  }

  :deep(.va-button--primary) {
    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--va-box-shadow);
    }
  }
}

.status-change-form {
  padding: 1rem;
  width: 100%;

  .status-change-text {
    font-size: 1.1rem;
    color: var(--va-text-primary);
    margin-bottom: 1.5rem;

    b {
      color: var(--va-primary);
      font-weight: 600;
    }
  }

  :deep(.va-textarea) {
    width: 100%;

    .va-input__container {
      background: var(--va-background-element);
      border: 1px solid var(--va-background-border);
      border-radius: 8px;
      transition: all 0.3s ease;
      padding: 0.5rem;

      &:hover {
        border-color: var(--va-primary);
      }

      &:focus-within {
        border-color: var(--va-primary);
        box-shadow: 0 0 0 3px rgba(var(--va-primary-rgb), 0.1);
      }
    }

    .va-input__label {
      color: var(--va-text-primary);
      font-weight: 500;
      margin-bottom: 0.5rem;
    }

    textarea {
      width: 100%;
      min-height: 120px;
      color: var(--va-text-primary);
      background: var(--va-background-element);
      border: none;
      resize: vertical;
      padding: 0.75rem;
      font-size: 1rem;
      line-height: 1.5;

      &::placeholder {
        color: var(--va-text-secondary);
      }

      &:focus {
        outline: none;
      }
    }
  }
}

/* Status dropdown styles */
.status-dropdown-content {
  min-width: 150px;
  width: 150px;
  padding: 8px;
  border-radius: 15px;
  background: var(--va-background-secondary);
  box-shadow: var(--va-box-shadow);
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-item {
  width: 100%;
  padding: 10px 15px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--va-text-primary);
  background: var(--va-background-element);

  &:not(.status-item--disabled):hover {
    background: var(--va-background-primary);
    transform: translateX(5px);
  }

  &--disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.status-item-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Details modal styles */
.details-modal {
  :deep(.va-modal__container) {
    max-width: 800px;
    width: 90%;
    background: var(--va-background-primary);
  }

  .form-details-container {
    padding: 1.5rem;
  }

  .details-header {
    margin-bottom: 2rem;
    display: flex;
    justify-content: flex-end;
  }

  .status-badge {
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.9rem;
    gap: 0.5rem;

    &.warning {
      background: var(--va-warning-lighter);
      color: var(--va-warning-darker);
    }

    &.success {
      background: var(--va-success-lighter);
      color: var(--va-success-darker);
    }

    &.danger {
      background: var(--va-danger-lighter);
      color: var(--va-danger-darker);
    }
  }
}

/* Add transition for smooth theme switching */
* {
  transition:
    background-color 0.3s ease,
    color 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease;
}
</style>
