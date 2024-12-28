<template>
  <div class="service-management-container">
    <VaCard class="service-card">
      <VaCardTitle class="card-title">
        <i class="fas fa-cog title-icon"></i>
        Procedure Management
      </VaCardTitle>

      <VaCardContent>
        <div class="header-actions">
          <div class="button-group">
            <VaButton color="primary" class="action-button create-button" @click="showCreateModal = true">
              <i class="va-icon material-icons mr-2">add</i>
              <span class="ml-1">Create</span>
            </VaButton>
            <VaButton
              :color="showBin ? 'warning' : 'secondary'"
              :class="['action-button bin-button', { warning: showBin }]"
              @click="toggleBin"
            >
              <i class="va-icon material-icons mr-2">{{ showBin ? 'list' : 'delete' }}</i>
              <span class="ml-1">{{ showBin ? 'Active' : 'Bin' }}</span>
            </VaButton>
          </div>
        </div>

        <VaDataTable
          class="custom-table"
          :items="procedureList"
          :columns="columnsWithActions"
          hoverable
          select-mode="multiple"
          :disable-client-side-sorting="false"
          sticky-header
          striped
          no-data-html="<div class='text-center'>No procedures found</div>"
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
                  color="primary"
                  class="action-button-circle"
                  @click="handleEdit(row.rowData as ProcedureDTO)"
                >
                  <i class="va-icon material-icons">edit</i>
                </VaButton>
                <VaButton
                  small
                  round
                  color="danger"
                  class="action-button-circle"
                  @click="confirmDelete(row.rowData as ProcedureDTO)"
                >
                  <i class="va-icon material-icons">delete</i>
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
                  <i class="va-icon material-icons">restore</i>
                </VaButton>
              </template>
            </div>
          </template>
        </VaDataTable>

        <div class="table-footer">
          <div v-if="procedureList.length > 0 && procedureListResponse" class="footer-content">
            <div class="records-info">
              <b>{{ procedureListResponse.totalCount }} {{ t('common.result') }}</b>
              <span class="page-size-selector">
                {{ t('common.resultPerPage') }}
                <VaSelect v-model="filterData.pageSize" class="page-size-select" :options="[10, 50, 100]" />
              </span>
            </div>
            <div v-if="procedureListResponse && procedureListResponse.totalPages > 1" class="pagination-container">
              <VaPagination
                v-model="procedureListResponse.currentPage"
                buttons-preset="primary"
                :pages="procedureListResponse.totalPages"
                :visible-pages="5"
                :boundary-links="true"
                :direction-links="true"
              />
            </div>
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <VaModal v-model="showCreateModal" title="Create New Procedure" hide-default-actions>
      <div class="p-4">
        <form class="flex flex-col gap-4" @submit.prevent="handleCreate">
          <VaInput v-model="formData.name" label="Name" required />
          <VaTextarea v-model="formData.description" label="Description" required />
          <VaInput v-model="formData.price" label="Price" type="number" required />
        </form>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <VaButton color="gray" @click="showCreateModal = false">Cancel</VaButton>
          <VaButton color="primary" :loading="isSubmitting" @click="handleCreate"> Create </VaButton>
        </div>
      </template>
    </VaModal>

    <VaModal v-model="showEditModal" title="Edit Procedure" hide-default-actions>
      <div class="p-4">
        <form class="flex flex-col gap-4" @submit.prevent="handleUpdate">
          <VaInput v-model="formData.name" label="Name" required />
          <VaTextarea v-model="formData.description" label="Description" required />
          <VaInput v-model="formData.price" label="Price" type="number" required />
        </form>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <VaButton color="gray" @click="showEditModal = false">Cancel</VaButton>
          <VaButton color="primary" :loading="isSubmitting" @click="handleUpdate"> Update </VaButton>
        </div>
      </template>
    </VaModal>

    <VaModal v-model="showDeleteModal" title="Confirm Delete" hide-default-actions>
      <div class="p-4">Are you sure you want to delete this procedure?</div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <VaButton color="gray" @click="showDeleteModal = false">Cancel</VaButton>
          <VaButton color="danger" :loading="isDeleting" @click="handleDelete"> Delete </VaButton>
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
import type { ListProcedurePagination, ProcedureDTO, FilterProcedure, ProcedureFormData } from './types'

const { t } = useI18n()
const { init } = useToast()
const serviceStore = useServiceStore()
const authStore = useAuthStore()
const router = useRouter()

const filterData = reactive<FilterProcedure>({
  pageNumber: 1,
  pageSize: 10,
  isActive: true,
  orderBy: [],
})

const formData = reactive<ProcedureFormData>({
  name: '',
  description: '',
  price: 0,
})

const procedureListResponse: Ref<ListProcedurePagination | null> = ref(null)
const procedureList: Ref<ProcedureDTO[]> = ref([])

const showBin = ref(false)
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const showEditModal = ref(false)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const selectedProcedure = ref<ProcedureDTO | null>(null)

watch(
  () => procedureListResponse.value?.currentPage,
  (newPage) => {
    if (newPage && newPage !== filterData.pageNumber) {
      filterData.pageNumber = newPage
      getAllProceduresPagination()
    }
  },
)

watch(
  () => filterData.pageSize,
  () => {
    filterData.pageNumber = 1 // Reset về trang 1 khi đổi page size
    getAllProceduresPagination()
  },
)

const getAllProceduresPagination = async () => {
  try {
    const res = showBin.value
      ? await serviceStore.getDeletedProcedures({
          pageNumber: filterData.pageNumber,
          pageSize: filterData.pageSize,
          isActive: filterData.isActive,
          orderBy: filterData.orderBy,
        })
      : await serviceStore.getAllProcedures({
          pageNumber: filterData.pageNumber,
          pageSize: filterData.pageSize,
          isActive: filterData.isActive,
          orderBy: filterData.orderBy,
        })
    procedureListResponse.value = res
    procedureList.value = res.data
  } catch (error) {
    console.error('Error fetching procedures:', error)
    procedureListResponse.value = null
    procedureList.value = []
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

const columnsWithActions = computed(() => [...columns.value, { key: 'actions', label: 'Actions' }])

const handleEdit = (procedure: ProcedureDTO) => {
  resetForm()
  selectedProcedure.value = procedure
  formData.name = procedure.name
  formData.description = procedure.description
  formData.price = procedure.price
  showEditModal.value = true
}

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

const handleUpdate = async () => {
  if (!selectedProcedure.value) return
  try {
    isSubmitting.value = true
    await serviceStore.updateProcedure(selectedProcedure.value.id, formData)
    init({
      message: 'Procedure updated successfully',
      color: 'success',
      duration: 3000,
    })
    showEditModal.value = false
    resetForm()
    getAllProceduresPagination()
  } catch (error) {
    init({
      message: 'Update failed',
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
      message: 'Procedure deleted successfully',
      color: 'success',
      duration: 3000,
    })
    showDeleteModal.value = false
    getAllProceduresPagination()
  } catch (error) {
    init({
      message: 'Delete failed',
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
      message: 'Procedure restored successfully',
      color: 'success',
      duration: 3000,
    })
    getAllProceduresPagination()
  } catch (error) {
    init({
      message: 'Restore failed',
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
watch([showCreateModal, showEditModal], (newValues, oldValues) => {
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

.custom-table {
  margin-top: 1rem;
  border-radius: 8px;
  overflow: hidden;
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
}

.custom-table :deep(td) {
  padding: 1rem;
  color: var(--va-text-primary);
}

.custom-table :deep(tr:hover) {
  background-color: var(--va-background-element) !important;
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
