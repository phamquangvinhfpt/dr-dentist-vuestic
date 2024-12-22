<template>
  <div class="form-dentist-container">
    <VaCard class="form-card">
      <VaCardTitle class="card-title">
        <div class="flex items-center gap-4">
          <i class="fas fa-file-alt title-icon"></i>
          <h2 class="text-2xl font-semibold">{{ t('form.MyForms') }}</h2>
        </div>
      </VaCardTitle>

      <VaCardContent>
        <div class="header-actions">
          <div class="search-section">
            <VaInput v-model="searchQuery" :placeholder="$t('form.SearchForms')" class="search-input" size="medium">
              <template #prepend>
                <VaIcon name="search" color="primary" class="search-icon" />
              </template>
              <template v-if="searchQuery" #append>
                <VaIcon name="clear" class="clear-icon" color="gray" @click="searchQuery = ''" />
              </template>
            </VaInput>
          </div>

          <div class="button-group flex items-center gap-4">
            <VaButton
              class="create-button"
              color="primary"
              icon="add"
              @click="router.push({ name: 'form-application' })"
            >
              {{ t('form.CreateApplication') }}
            </VaButton>

            <div class="status-tabs">
              <div
                v-for="status in statusFilterOptions"
                :key="status.id"
                class="status-tab"
                :class="{
                  active: selectedStatusFilter === status.value,
                }"
                @click="handleStatusFilterChange(status.value)"
              >
                {{ status.label }}
              </div>
            </div>
          </div>
        </div>

        <VaDataTable
          class="custom-table"
          :items="formList"
          :columns="columns"
          hoverable
          sticky-header
          striped
          no-data-html="<div class='text-center'>No forms found</div>"
        >
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
              <div class="status-badge" :class="getStatusDotClass(row.rowData.status)">
                {{ getStatusText(row.rowData.status) }}
              </div>
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

    <!-- Form Details Modal -->
    <VaModal v-model="showDetailsModal" :title="$t('form.FormDetails')" hide-default-actions class="details-modal">
      <div v-if="selectedForm" class="form-details-container">
        <div class="details-header">
          <div class="status-badge" :class="getStatusColor(selectedForm.status)">
            <div class="status-dot" :class="getStatusDotClass(selectedForm.status)"></div>
            {{ getStatusText(selectedForm.status) }}
          </div>
        </div>

        <div class="details-grid">
          <div class="detail-section">
            <h3 class="section-title"><i class="fas fa-info-circle mr-2"></i>{{ t('form.BasicInformation') }}</h3>
            <div class="detail-content">
              <div class="detail-item">
                <span class="detail-label">{{ t('form.WorkingDate') }}</span>
                <span class="detail-value">{{ formatDate(selectedForm.workingDate) }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3 class="section-title"><i class="fas fa-clock mr-2"></i>{{ t('form.WorkingHours') }}</h3>
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
            <h3 class="section-title"><i class="fas fa-align-left mr-2"></i>{{ t('form.Description') }}</h3>
            <div class="detail-content">
              <p class="description-text">{{ selectedForm.description || 'No description provided' }}</p>
            </div>
          </div>

          <div class="detail-section full-width">
            <h3 class="section-title"><i class="fas fa-sticky-note mr-2"></i>{{ t('form.Notes') }}</h3>
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
            <i class="fas fa-times mr-2"></i>{{ t('form.Close') }}
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
import { useAuthStore } from '@/stores/modules/auth.module'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const { init } = useToast()
const formStore = useFormStore()
const authStore = useAuthStore()

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
const showDetailsModal = ref(false)
const selectedForm = ref<FormDTO | null>(null)
const router = useRouter()

const totalPages = computed(() => {
  return Math.ceil(formList.value.length / formData.pageSize)
})

const columns = computed(() => [
  { key: 'workingDate', label: t('form.workingDate') },
  { key: 'workingTimes', label: t('form.workingTimes') },
  { key: 'description', label: t('form.description') },
  { key: 'status', label: t('form.status') },
  { key: 'action', label: t('common.actions') },
])

const getAllForms = async () => {
  try {
    const currentUserID = authStore.user?.id

    if (!currentUserID) {
      throw new Error('User ID not found')
    }

    const filter: FilterForm = {
      pageNumber: currentPage.value,
      pageSize: formData.pageSize,
      isActive: formData.isActive,
      orderBy: formData.orderBy,
      advancedFilter: {
        logic: 'and',
        filters: [
          {
            field: 'userID',
            operator: 'eq',
            value: currentUserID,
          },
          ...(selectedStatusFilter.value !== null
            ? [
                {
                  field: 'status',
                  operator: 'eq',
                  value: selectedStatusFilter.value.toString(),
                },
              ]
            : []),
        ],
      },
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

// Utility functions
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

const formatTime = (time: string) => {
  if (!time) return ''
  return new Date(`1970-01-01T${time}`).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getStatusText = (status: number) => {
  switch (status) {
    case 0:
      return t('form.waiting')
    case 1:
      return t('form.accepted')
    case 2:
      return t('form.failed')
    default:
      return ''
  }
}

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

// Event handlers
const handlePageChange = (page: number) => {
  currentPage.value = page
  getAllForms()
}

const handlePageSizeChange = (size: number) => {
  formData.pageSize = size
  currentPage.value = 1
  getAllForms()
}

const viewDetails = (form: FormDTO) => {
  selectedForm.value = form
  showDetailsModal.value = true
}

// Status filter options and handlers
const statusFilterOptions = [
  { id: 'all', value: null, label: t('form.allStatus') },
  { id: 'waiting', value: 0, label: t('form.waiting') },
  { id: 'accepted', value: 1, label: t('form.accepted') },
  { id: 'failed', value: 2, label: t('form.failed') },
]

const handleStatusFilterChange = (status: number | null) => {
  selectedStatusFilter.value = status
  getAllForms()
}

// Search functionality
const handleSearch = (query: string) => {
  if (!query) {
    getAllForms()
    return
  }

  // Tách query thành các từ riêng biệt
  const searchTerms = query
    .toLowerCase()
    .split(' ')
    .filter((term) => term)

  const filteredForms = formList.value.filter((form) => {
    const description = form.description.toLowerCase()

    // Tìm kiếm chính xác cụm từ
    if (description.includes(query.toLowerCase())) {
      return true
    }

    // Tìm kiếm theo từng từ riêng lẻ
    const matchedTerms = searchTerms.filter((term) => description.includes(term))

    // Form phải chứa ít nhất 1 từ khóa tìm kiếm
    return matchedTerms.length > 0
  })

  formList.value = filteredForms
}

// Debounce search để tránh gọi quá nhiều lần
const debouncedSearch = (query: string) => {
  clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => {
    handleSearch(query)
  }, 300) // Đợi 300ms sau khi người dùng ngừng gõ
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

onMounted(async () => {
  // Check if user is Admin
  if (!authStore.musHaveRole('Dentist')) {
    init({
      message: t('common.unauthorized'),
      color: 'danger',
      duration: 3000,
    })
    router.push({ name: 'dashboard' })
    return
  }

  await getAllForms()
})
</script>

<style scoped>
.form-dentist-container {
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
  background: linear-gradient(45deg, var(--va-primary) 0%, #4f46e5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  margin-bottom: 1rem;
  gap: 1.5rem;
}

.search-section {
  width: 60%;
  max-width: 600px;
}

.search-input {
  width: 100%;
  transition: all 0.3s ease;
}

.search-input:deep(input) {
  height: 40px;
  font-size: 0.95rem;
  background: var(--va-background-element) !important;
  border: none !important;
  border-radius: 8px;
  padding: 0 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.search-input:deep(input):focus {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.search-input:deep(input)::placeholder {
  color: var(--va-text-secondary);
  opacity: 0.7;
}

.search-icon {
  font-size: 1.1rem;
  margin-left: 1rem;
  color: var(--va-text-secondary) !important;
  opacity: 0.7;
}

.clear-icon {
  cursor: pointer;
  padding: 0.4rem;
  margin-right: 1rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  opacity: 0.7;
}

.clear-icon:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.05);
}

.status-filter-button {
  height: 45px;
  min-width: 150px;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
  color: var(--va-text-primary) !important;
  border-bottom: 2px solid #e2e8f0;
}

.custom-table:deep(td) {
  padding: 1.2rem 1.5rem;
  color: var(--va-text-primary);
  border-bottom: 1px solid #f1f5f9;
}

.custom-table:deep(tr:hover td) {
  background: var(--va-background-element) !important;
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

.status-badge {
  padding: 8px 16px;
  border-radius: 30px;
  font-size: 0.875rem;
  font-weight: 600;
  text-align: center;
  min-width: 120px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
  background: var(--va-background-secondary);
}

:deep(.va-list-item) {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

:deep(.va-list-item:last-child) {
  border-bottom: none;
}

:deep(.va-list-item__label) {
  font-size: 1rem;
  color: #334155;
}

.working-times-list {
  margin-top: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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

.form-card {
  animation: fadeIn 0.5s ease-out;
}

/* Status filter dropdown */
.status-dropdown-content {
  min-width: 200px;
  padding: 8px;
  border-radius: 15px;
  background: white;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.status-item {
  padding: 10px 15px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.status-item:hover {
  background: #f8fafc;
  transform: translateX(5px);
}

.status-item-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.status-check {
  color: var(--va-primary);
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

/* Thêm styles mới cho status filter */
.status-tabs {
  display: flex;
  gap: 1px;
  background: var(--va-background-secondary);
  padding: 4px;
  border-radius: 8px;
}

.status-tab {
  padding: 8px 16px;
  text-align: center;
  cursor: pointer;
  font-weight: 500;
  color: var(--va-text-primary);
  border-radius: 6px;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.status-tab:hover {
  color: var(--va-text-primary);
  background: rgba(255, 255, 255, 0.7);
}

.status-tab.active {
  background: var(--va-background-secondary);
  color: var(--va-primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Responsive */
@media (max-width: 640px) {
  .status-tabs {
    flex-wrap: wrap;
    gap: 4px;
  }

  .status-tab {
    flex: 1;
    min-width: calc(50% - 2px);
  }
}

/* Giữ nguyên tất cả các styles khác không liên quan đến màu sắc */

.create-button {
  padding: 0.5rem 1rem;
  height: 38px;
  font-size: 0.9rem;
  border-radius: 8px;
  background: var(--va-primary);
  color: white;
}

.create-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.button-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* Thêm responsive styles */
@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    gap: 0.75rem;
  }

  .search-section {
    width: 100%;
    max-width: none;
  }

  .button-group {
    width: 100%;
    justify-content: space-between;
  }

  .create-button {
    width: auto;
  }
}
</style>
