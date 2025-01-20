<template>
  <div class="service-management-container">
    <VaCard class="service-card">
      <VaCardTitle class="card-title">
        <i class="fas fa-cog title-icon"></i>
        {{ t('procedure.ProcedureManagement') }}
      </VaCardTitle>

      <VaCardContent>
        <div class="header-actions">
          <VaInput
            v-model="searchQuery"
            :placeholder="t('common.search')"
            class="search-input"
            size="large"
            style="flex: 1"
            @keyup.enter="handleSearch"
          >
            <template #append>
              <i class="fas fa-search search-icon"></i>
            </template>
          </VaInput>

          <div class="button-group">
            <VaButton color="primary" class="action-button create-button" @click="showCreateModal = true">
              <i class="va-icon material-icons mr-2">{{ t('procedure.add') }}</i>
              <span class="ml-1">{{ t('procedure.create') }}</span>
            </VaButton>
            <VaButton
              :color="showBin ? 'warning' : 'secondary'"
              :class="['action-button bin-button', { warning: showBin }]"
              @click="toggleBin"
            >
              <i class="va-icon material-icons mr-2">{{ showBin ? 'list' : 'delete' }}</i>
              <span class="ml-1">{{ showBin ? $t('procedure.active') : $t('procedure.bin') }}</span>
            </VaButton>
          </div>
        </div>

        <div class="table-wrapper">
          <VaInnerLoading :loading="isLoading">
            <VaDataTable
              class="custom-table"
              :items="paginatedProcedures"
              :columns="columnsWithActions"
              hoverable
              select-mode="multiple"
              :disable-client-side-sorting="false"
              sticky-header
              striped
              :no-data-html="`<div class='text-center'>${t('procedure.noProceduresFound')}</div>`"
            >
              <template #cell(name)="{ row }">
                <div class="flex items-center gap-2 ellipsis max-w-[230px]">
                  <span class="w-24">{{ row.rowData.name }}</span>
                </div>
              </template>

              <template #cell(description)="{ row }">
                <div class="flex items-center gap-2 ellipsis max-w-[230px]">
                  <span class="w-24">{{ row.rowData.description }}</span>
                </div>
              </template>

              <template #cell(price)="{ row }">
                <div class="flex items-center gap-2 ellipsis max-w-[230px]">
                  <span class="w-24">{{ formatPrice(row.rowData.price) }}</span>
                </div>
              </template>

              <template #cell(createdOn)="{ row }">
                <div class="flex items-center gap-2 ellipsis max-w-[230px]">
                  <span class="w-24">
                    {{ validateDate(row.rowData.createdOn) ? formatDate(row.rowData.createdOn) : 'Ngày không hợp lệ' }}
                  </span>
                </div>
              </template>

              <template #cell(actions)="{ row }">
                <div class="flex gap-2">
                  <template v-if="!showBin">
                    <VaButton
                      small
                      round
                      color="danger"
                      class="action-button-circle"
                      @click="confirmDelete(row.rowData as ProcedureDTO)"
                    >
                      <i class="va-icon material-icons">{{ t('procedure.delete') }}</i>
                    </VaButton>
                  </template>
                  <template v-else>
                    <VaButton
                      small
                      round
                      color="success"
                      class="action-button-circle"
                      @click="handleRestore(row.rowData as ProcedureDTO)"
                    >
                      <i class="va-icon material-icons">{{ t('procedure.restore') }}</i>
                    </VaButton>
                  </template>
                </div>
              </template>
            </VaDataTable>
          </VaInnerLoading>
        </div>

        <div class="table-footer">
          <div v-if="procedureList.length > 0" class="footer-content">
            <div class="records-info">
              <b>{{ totalItems }} {{ t('common.result') }}</b>
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

    <VaModal v-model="showCreateModal" :title="$t('procedure.createNewProcedure')" hide-default-actions>
      <div class="p-4">
        <form class="flex flex-col gap-4" @submit.prevent="handleCreate">
          <VaInput v-model="formData.name" :label="$t('procedure.name')" required />
          <VaTextarea v-model="formData.description" :label="$t('procedure.description')" required />
          <VaInput v-model="formData.price" :label="$t('procedure.price')" type="number" required />
        </form>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <VaButton color="gray" @click="showCreateModal = false">{{ t('common.cancel') }}</VaButton>
          <VaButton color="primary" :loading="isSubmitting" @click="handleCreate">{{ t('common.create') }}</VaButton>
        </div>
      </template>
    </VaModal>

    <VaModal v-model="showDeleteModal" :title="t('common.confirmDelete')" hide-default-actions>
      <div class="p-4">{{ t('procedure.deleteConfirmMessage') }}</div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <VaButton color="gray" @click="showDeleteModal = false">{{ t('common.cancel') }}</VaButton>
          <VaButton color="danger" :loading="isDeleting" @click="handleDelete">{{ t('common.delete') }}</VaButton>
        </div>
      </template>
    </VaModal>
  </div>
</template>

<script lang="ts" setup>
import { useToast } from 'vuestic-ui'
import { onMounted, Ref, ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useServiceStore } from '@/stores/modules/service.module'
import { useAuthStore } from '@/stores/modules/auth.module'
import { useRouter } from 'vue-router'
import type { ProcedureDTO } from './types'

const { t } = useI18n()
const { init } = useToast()
const serviceStore = useServiceStore()
const authStore = useAuthStore()
const router = useRouter()

const formData = reactive({
  pageNumber: 1,
  pageSize: 10,
  isActive: true,
  orderBy: [],
  name: '',
  description: '',
  price: 0,
})

const procedureList: Ref<ProcedureDTO[]> = ref([])
const currentPage = ref(1)
const searchQuery = ref('')
const isLoading = ref(false)

const filteredProcedures = computed(() => {
  if (!procedureList.value || procedureList.value.length === 0) return []

  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return procedureList.value

  return procedureList.value.filter(
    (procedure) =>
      (procedure.name || '').toLowerCase().includes(query) ||
      (procedure.description || '').toLowerCase().includes(query) ||
      (procedure.price?.toString() || '').includes(query),
  )
})

const totalItems = computed(() => filteredProcedures.value.length)

const totalPages = computed(() => Math.ceil(totalItems.value / formData.pageSize))

const paginatedProcedures = computed(() => {
  const start = (currentPage.value - 1) * formData.pageSize
  const end = start + formData.pageSize
  return filteredProcedures.value.slice(start, end)
})

watch(searchQuery, () => {
  currentPage.value = 1
})

const handleSearch = () => {
  currentPage.value = 1
}

const handlePageChange = (page: number) => {
  currentPage.value = page
}

const handlePageSizeChange = (size: number) => {
  formData.pageSize = size
  currentPage.value = 1
}

const showBin = ref(false)
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const selectedProcedure = ref<ProcedureDTO | null>(null)

const getAllProceduresPagination = async () => {
  try {
    isLoading.value = true
    const res = showBin.value
      ? await serviceStore.getDeletedProcedures({
          pageNumber: 1,
          pageSize: 1000,
          isActive: formData.isActive,
          orderBy: formData.orderBy,
        })
      : await serviceStore.getAllProcedures({
          pageNumber: 1,
          pageSize: 1000,
          isActive: formData.isActive,
          orderBy: formData.orderBy,
        })
    procedureList.value = res.data
  } catch (error) {
    console.error('Error fetching procedures:', error)
    procedureList.value = []
  } finally {
    isLoading.value = false
  }
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price)
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN')
}

const columns = computed(() => [
  { key: 'name', label: t('procedure.name') },
  { key: 'description', label: t('procedure.description') },
  { key: 'price', label: t('procedure.price') },
  { key: 'createdOn', label: t('procedure.createDate') },
])

const columnsWithActions = computed(() => [...columns.value, { key: 'actions', label: t('procedure.actions') }])

const handleCreate = async () => {
  try {
    isSubmitting.value = true
    await serviceStore.createProcedure(formData)
    init({
      message: 'Procedure created successfully',
      color: 'success',
      duration: 3000,
    })
    showCreateModal.value = false
    resetForm()
    getAllProceduresPagination()
  } catch (error) {
    init({
      message: 'Create failed',
      color: 'danger',
      duration: 3000,
    })
  } finally {
    isSubmitting.value = false
  }
}

const confirmDelete = (procedure: ProcedureDTO) => {
  selectedProcedure.value = procedure
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!selectedProcedure.value) return
  try {
    isDeleting.value = true
    await serviceStore.deleteProcedure(selectedProcedure.value.id)
    init({
      message: t('procedure.procedureDeleteSuccess'),
      color: 'success',
      duration: 3000,
    })
    showDeleteModal.value = false
    getAllProceduresPagination()
  } catch (error) {
    init({
      message: t('procedure.procedureDeleteFailed'),
      color: 'danger',
      duration: 3000,
    })
  } finally {
    isDeleting.value = false
  }
}

const handleRestore = async (procedure: ProcedureDTO) => {
  try {
    await serviceStore.restoreProcedure(procedure.id)
    init({
      message: t('procedure.procedureRestoreSuccess'),
      color: 'success',
      duration: 3000,
    })
    getAllProceduresPagination()
  } catch (error) {
    init({
      message: t('procedure.procedureRestoreFailed'),
      color: 'danger',
      duration: 3000,
    })
  }
}

const toggleBin = () => {
  showBin.value = !showBin.value
  getAllProceduresPagination()
}

const resetForm = () => {
  formData.name = ''
  formData.description = ''
  formData.price = 0
  selectedProcedure.value = null
}

const validateDate = (dateString: string): boolean => {
  const date = new Date(dateString)
  return !isNaN(date.getTime()) && dateString !== null && dateString !== undefined
}

// Add watch for modal states to reset form
watch([showCreateModal], (newValues, oldValues) => {
  // If either modal is being closed (changing from true to false)
  if (oldValues.includes(true) && !newValues.includes(true)) {
    resetForm()
  }
})

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

  await getAllProceduresPagination()
})
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
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.button-group {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-left: auto;
}

.action-button {
  border-radius: 12px;
  padding: 0.5rem 1rem;
  height: 40px;
  min-width: 40px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 500;
}

.create-button {
  background: var(--va-primary);
  border: none;
  color: white;
}

.bin-button {
  background: var(--va-background-element);
  border: 1px solid var(--va-border-color);
  color: var(--va-text-primary);
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
  border-radius: 8px;
  position: relative;
}

/* Custom scrollbar styles */
.table-wrapper::-webkit-scrollbar {
  height: 8px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: var(--va-background-element);
  border-radius: 4px;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: var(--va-primary);
  border-radius: 4px;
}

.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: var(--va-primary-dark);
}

.custom-table {
  margin-top: 1rem;
  width: 100%;
}

.custom-table :deep(.va-data-table__table) {
  min-width: 1000px; /* Increased minimum width to force scrolling */
}

.custom-table :deep(th) {
  background-color: var(--va-background-secondary) !important;
  color: var(--va-text-primary) !important;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
  padding: 1rem;
  text-align: center;
  white-space: nowrap; /* Prevent header text wrapping */
}

.custom-table :deep(td) {
  padding: 1rem;
  color: var(--va-text-primary);
  white-space: nowrap; /* Prevent cell content wrapping */
}

.table-footer {
  margin-top: 1.5rem;
  padding: 1rem 0;
  border-top: 1px solid var(--va-border-color);
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
  gap: 1rem;
  color: var(--va-text-secondary);
}

/* Modal styles */
:deep(.va-modal) {
  border-radius: 15px;
  overflow: hidden;
  background: var(--va-background-secondary);
}

:deep(.va-modal__title) {
  font-size: 1.5rem;
  color: var(--va-text-primary);
  padding: 1.5rem;
  border-bottom: 2px solid var(--va-border-color);
}

:deep(.va-modal__content) {
  padding: 1.5rem;
  color: var(--va-text-primary);
}

:deep(.va-modal__actions) {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--va-border-color);
}

/* Form elements */
:deep(.va-input__content),
:deep(.va-textarea__content),
:deep(.va-select__content) {
  background: var(--va-background-element) !important;
  color: var(--va-text-primary) !important;
}

:deep(.va-input__label),
:deep(.va-textarea__label),
:deep(.va-select__label) {
  color: var(--va-text-secondary) !important;
}

/* Pagination */
.pagination-container :deep(.va-pagination) {
  background: var(--va-background-secondary);
}

.pagination-container :deep(.va-pagination__item) {
  color: var(--va-text-primary);
}

.pagination-container :deep(.va-pagination__item--active) {
  background: var(--va-primary);
  color: white;
}

/* Add transition for smooth theme switching */
* {
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

/* Price and date formatting */
.price-value {
  color: var(--va-success);
}

.date-value {
  color: var(--va-text-secondary);
}

/* Status indicators */
.status-active {
  color: var(--va-success);
}

.status-inactive {
  color: var(--va-danger);
}

.action-button-circle {
  width: 36px !important;
  height: 36px !important;
  padding: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-button-circle i {
  font-size: 1.2rem;
  margin: 0;
}

/* View button */
.action-button-circle[color='primary'] {
  background: linear-gradient(135deg, #0396ff 0%, #42b0ff 100%);
  border: none;
  box-shadow: 0 2px 10px rgba(3, 150, 255, 0.2);
}

.action-button-circle[color='primary']:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(3, 150, 255, 0.4);
  background: linear-gradient(135deg, #42b0ff 0%, #0396ff 100%);
}

/* Delete button */
.action-button-circle[color='danger'] {
  background: linear-gradient(135deg, #ff9a9e 0%, #ff5252 100%);
  border: none;
  box-shadow: 0 2px 10px rgba(255, 82, 82, 0.2);
}

.action-button-circle[color='danger']:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 82, 82, 0.4);
  background: linear-gradient(135deg, #ff5252 0%, #ff9a9e 100%);
}

/* Restore button */
.action-button-circle[color='success'] {
  background: linear-gradient(135deg, #48c6ef 0%, #6f86d6 100%);
  border: none;
  box-shadow: 0 2px 10px rgba(72, 198, 239, 0.2);
}

.action-button-circle[color='success']:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(72, 198, 239, 0.4);
  background: linear-gradient(135deg, #6f86d6 0%, #48c6ef 100%);
}

.action-button-circle:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
</style>
