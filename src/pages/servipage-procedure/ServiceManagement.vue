<template>
  <div class="service-management-container">
    <VaCard class="service-card">
      <VaCardTitle class="card-title">
        <i class="fas fa-cog title-icon"></i>
        Service Management
      </VaCardTitle>

      <VaCardContent>
        <div class="header-actions">
          <div class="search-section">
            <VaInput v-model="searchQuery" placeholder="Search services..." class="search-input">
              <template #prepend>
                <VaIcon name="search" />
              </template>
            </VaInput>
          </div>

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
          :items="serviceList"
          :columns="columns"
          hoverable
          select-mode="multiple"
          :disable-client-side-sorting="false"
          sticky-header
          striped
          no-data-html="<div class='text-center'>No services found</div>"
        >
          <template #cell(serviceName)="{ row }">
            <div class="flex items-center gap-2 ellipsis max-w-[230px]">
              <span class="w-24">{{ row.rowData.serviceName }}</span>
            </div>
          </template>

          <template v-if="showBin" #cell(deletedOn)="{ row }">
            <div class="flex items-center gap-2">
              <span>{{ formatDate(row.rowData.deletedOn) }}</span>
            </div>
          </template>

          <template v-if="showBin" #cell(deletedBy)="{ row }">
            <div class="flex items-center gap-2">
              <span>{{ row.rowData.deletedBy }}</span>
            </div>
          </template>

          <template #cell(serviceDescription)="{ row }">
            <div class="flex items-center gap-2 ellipsis max-w-[230px]">
              <span class="w-24">{{ row.rowData.serviceDescription }}</span>
            </div>
          </template>

          <template #cell(totalPrice)="{ row }">
            <div class="flex items-center gap-2 ellipsis max-w-[230px]">
              <span class="w-24">{{ formatPrice(row.rowData.totalPrice) }}</span>
            </div>
          </template>

          <template #cell(status)="{ row }">
            <div class="flex items-center gap-2">
              <span :class="row.rowData.isActive ? 'text-green-500' : 'text-red-500'">
                {{ row.rowData.isActive ? t('common.active') : t('common.inactive') }}
              </span>
            </div>
          </template>

          <template #cell(action)="{ row }">
            <div class="action-buttons">
              <template v-if="!showBin">
                <VaButton
                  color="info"
                  size="small"
                  class="action-button-circle"
                  preset="primary"
                  round
                  @click="viewDetails(row.rowData.id)"
                >
                  <VaIcon name="visibility" />
                </VaButton>
                <VaButton
                  color="warning"
                  size="small"
                  class="action-button-circle"
                  :disabled="isToggling"
                  :loading="isToggling"
                  round
                  @click="handleToggleStatus(row.rowData)"
                >
                  <VaIcon :name="row.rowData.isActive ? 'toggle_off' : 'toggle_on'" />
                </VaButton>
                <VaButton
                  color="danger"
                  size="small"
                  class="action-button-circle"
                  round
                  @click="confirmDelete(row.rowData)"
                >
                  <VaIcon name="delete" />
                </VaButton>
              </template>
              <template v-else>
                <VaButton
                  color="success"
                  size="small"
                  class="action-button-circle"
                  round
                  @click="handleRestore(row.rowData)"
                >
                  <VaIcon name="restore" />
                </VaButton>
              </template>
            </div>
          </template>
        </VaDataTable>

        <div class="table-footer">
          <div v-if="serviceList.length > 0" class="footer-content">
            <div class="records-info">
              <b>{{ serviceList.length }} {{ t('common.result') }}</b>
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

    <VaModal v-model="showDeleteModal" hide-default-actions>
      <template #header>
        <h3>{{ t('common.confirmDelete') }}</h3>
      </template>

      <div class="px-4 py-2">
        <p>{{ t('service.deleteConfirmMessage') }}</p>
        <p class="font-bold mt-2">{{ selectedService?.serviceName }}</p>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <VaButton color="gray" @click="showDeleteModal = false">
            {{ t('common.cancel') }}
          </VaButton>
          <VaButton color="danger" :loading="isDeleting" @click="handleDelete">
            {{ t('common.delete') }}
          </VaButton>
        </div>
      </template>
    </VaModal>

    <VaModal v-model="showCreateModal" title="Create New Service" hide-default-actions>
      <div class="p-4">
        <form class="flex flex-col gap-4" @submit.prevent="handleCreate">
          <VaInput v-model="formData.name" label="Service Name" required />
          <VaTextarea v-model="formData.description" label="Description" required />
          <VaCheckbox v-model="formData.isModify" label="Is Modifiable" />
        </form>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <VaButton color="gray" @click="showCreateModal = false">Cancel</VaButton>
          <VaButton color="primary" :loading="isSubmitting" @click="handleCreate">Create</VaButton>
        </div>
      </template>
    </VaModal>

    <VaModal v-model="showEditModal" title="Edit Service" hide-default-actions>
      <div class="p-4">
        <form class="flex flex-col gap-4" @submit.prevent="handleUpdate">
          <VaInput v-model="formData.name" label="Service Name" required />
          <VaTextarea v-model="formData.description" label="Description" required />
        </form>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <VaButton color="gray" @click="showEditModal = false">Cancel</VaButton>
          <VaButton color="primary" :loading="isSubmitting" @click="handleUpdate">Update</VaButton>
        </div>
      </template>
    </VaModal>
  </div>
</template>

<script lang="ts" setup>
import { useServiceStore } from '@/stores/modules/service.module'
import { useRouter } from 'vue-router'
import { onMounted, Ref, ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ListServicePagination, ServiceDTO } from './types'
import { VaButton } from 'vuestic-ui'
import { useToast } from 'vuestic-ui'
import { useAuthStore } from '@/stores/modules/auth.module'

const { t } = useI18n()
const { init } = useToast()
const serviceStore = useServiceStore()
const router = useRouter()
const authStore = useAuthStore()

const formData = reactive({
  pageNumber: 1,
  pageSize: 10,
  isActive: true,
  orderBy: [],
  name: '',
  description: '',
  isModify: true,
})

const serviceListResponse: Ref<ListServicePagination | null> = ref(null)
const serviceList: Ref<ServiceDTO[]> = ref([])

const showDeleteModal = ref(false)
const selectedService = ref<ServiceDTO | null>(null)
const isDeleting = ref(false)
const showBin = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const isSubmitting = ref(false)
const isToggling = ref(false)

const currentPage = ref(1)

const totalPages = computed(() => {
  return serviceListResponse.value?.totalPages || Math.ceil(serviceList.value.length / formData.pageSize)
})

const getAllServicesPagination = async () => {
  try {
    const res = showBin.value
      ? await serviceStore.getDeletedServices({
        pageNumber: currentPage.value,
        pageSize: formData.pageSize,
        orderBy: formData.orderBy,
        isActive: false,
      })
      : await serviceStore.getAllServices({
        pageNumber: currentPage.value,
        pageSize: formData.pageSize,
        isActive: formData.isActive,
        orderBy: formData.orderBy,
      })

    serviceListResponse.value = {
      data: res.data || [],
      currentPage: res.currentPage || 1,
      totalPages: res.totalPages || Math.ceil((res.data?.length || 0) / formData.pageSize),
      totalCount: res.totalCount || res.data?.length || 0,
      pageSize: res.pageSize || formData.pageSize,
      hasPreviousPage: res.hasPreviousPage || false,
      hasNextPage: res.hasNextPage || false,
    }

    serviceList.value = res.data || []

    console.log('Processed Response:', {
      isRecycleBin: showBin.value,
      data: serviceList.value,
      totalCount: serviceListResponse.value.totalCount,
      totalPages: serviceListResponse.value.totalPages,
      currentPage: serviceListResponse.value.currentPage,
    })
  } catch (error) {
    console.error('Error fetching services:', error)
    serviceListResponse.value = null
    serviceList.value = []
  }
}

const viewDetails = (id: string) => {
  router.push({ name: 'ServiceProcedures', params: { id } })
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price)
}

const columns = computed(() => {
  const baseColumns = [
    { key: 'serviceName', label: t('service.name') },
    { key: 'serviceDescription', label: t('service.description') },
    { key: 'totalPrice', label: t('service.price') },
  ]

  if (showBin.value) {
    baseColumns.push(
      { key: 'deletedOn', label: t('common.deletedOn') },
      { key: 'deletedBy', label: t('common.deletedBy') },
    )
  } else {
    baseColumns.push({ key: 'status', label: t('service.status') })
  }

  baseColumns.push({ key: 'action', label: t('common.actions') })
  return baseColumns
})

const confirmDelete = (service: ServiceDTO) => {
  selectedService.value = service
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!selectedService.value) return

  try {
    isDeleting.value = true
    await serviceStore.deleteService(selectedService.value.id)

    init({
      message: t('service.deleteSuccess'),
      color: 'success',
      duration: 3000,
    })

    showDeleteModal.value = false
    await getAllServicesPagination() // Refresh the list
  } catch (error) {
    init({
      message: t('service.deleteError'),
      color: 'danger',
      duration: 3000,
    })
  } finally {
    isDeleting.value = false
  }
}

const handleCreate = async () => {
  try {
    isSubmitting.value = true
    await serviceStore.createService({
      name: formData.name,
      description: formData.description,
      isModify: formData.isModify,
    })
    init({
      message: t('service.createSuccess'),
      color: 'success',
      duration: 3000,
    })
    showCreateModal.value = false
    resetForm()
    getAllServicesPagination()
  } catch (error) {
    init({
      message: t('service.createError'),
      color: 'danger',
      duration: 3000,
    })
  } finally {
    isSubmitting.value = false
  }
}

// const handleEdit = (service: ServiceDTO) => {
//   selectedService.value = service
//   formData.name = service.serviceName
//   formData.description = service.serviceDescription
//   showEditModal.value = true
// }

const handleUpdate = async () => {
  if (!selectedService.value) return
  try {
    isSubmitting.value = true
    await serviceStore.updateService(selectedService.value.id, {
      name: formData.name,
      description: formData.description,
    })
    init({
      message: t('service.updateSuccess'),
      color: 'success',
      duration: 3000,
    })
    showEditModal.value = false
    resetForm()
    getAllServicesPagination()
  } catch (error) {
    init({
      message: t('service.updateError'),
      color: 'danger',
      duration: 3000,
    })
  } finally {
    isSubmitting.value = false
  }
}

const handleRestore = async (service: ServiceDTO) => {
  try {
    await serviceStore.restoreService(service.id)
    init({
      message: t('service.restoreSuccess'),
      color: 'success',
      duration: 3000,
    })
    getAllServicesPagination()
  } catch (error) {
    init({
      message: t('service.restoreError'),
      color: 'danger',
      duration: 3000,
    })
  }
}

const toggleBin = () => {
  showBin.value = !showBin.value
  currentPage.value = 1
  formData.pageSize = 10
  getAllServicesPagination()
}

const resetForm = () => {
  // Reset filter
  formData.pageNumber = 1
  formData.pageSize = 10
  formData.isActive = true
  formData.orderBy = []

  // Reset form
  formData.name = ''
  formData.description = ''
  formData.isModify = true

  selectedService.value = null
}

const handleToggleStatus = async (service: ServiceDTO) => {
  try {
    isToggling.value = true

    await serviceStore.toggleServiceStatus({
      id: service.id,
      activate: !service.isActive,
    })

    await getAllServicesPagination()

    init({
      message: 'Status updated successfully',
      color: 'success',
      duration: 3000,
    })
  } catch (error) {
    console.error('Toggle status error:', error)
    init({
      message: 'Failed to update status',
      color: 'danger',
      duration: 3000,
    })
  } finally {
    isToggling.value = false
  }
}

// Thêm các hàm xử lý pagination
const handlePageChange = (page: number) => {
  currentPage.value = page
  getAllServicesPagination()
}

const handlePageSizeChange = (size: number) => {
  formData.pageSize = size
  currentPage.value = 1
  getAllServicesPagination()
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('vi-VN')
}

const searchQuery = ref('')

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

  await getAllServicesPagination()
})
</script>

<style scoped>
.service-management-container {
  padding: 2rem;
  background: linear-gradient(to bottom right, #f8f9fa 0%, #e9ecef 100%);
  min-height: 100vh;
}

.service-card {
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  background: white;
  transition: transform 0.3s ease;
}

.service-card:hover {
  transform: translateY(-5px);
}

.card-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #2c3e50;
  padding: 1.5rem;
  border-bottom: 2px solid #edf2f7;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.title-icon {
  color: var(--va-primary);
  font-size: 1.5rem;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-section {
  flex: 1;
  max-width: 400px;
}

.search-input {
  border-radius: 8px;
}

.button-group {
  display: flex;
  gap: 0.75rem;
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

.action-button i {
  font-size: 1.1rem;
}

.create-button {
  background: linear-gradient(135deg, #0396ff 0%, #42b0ff 100%);
  border: none;
  box-shadow: 0 2px 8px rgba(3, 150, 255, 0.2);
}

.create-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(3, 150, 255, 0.3);
}

.create-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(3, 150, 255, 0.4);
}

.bin-button {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid #dee2e6;
  color: #495057;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.bin-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
}

.bin-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.bin-button.warning {
  background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
  border: none;
  color: #fff;
}

.bin-button.warning:hover {
  background: linear-gradient(135deg, #fad0c4 0%, #ff9a9e 100%);
}

.custom-table {
  margin-top: 1rem;
  border-radius: 8px;
  overflow: hidden;
}

.custom-table :deep(th) {
  background-color: #f8fafc !important;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
  padding: 1rem;
}

.custom-table :deep(td) {
  padding: 1rem;
}

.custom-table :deep(tr:hover) {
  background-color: #f1f5f9 !important;
}

.table-footer {
  margin-top: 1.5rem;
  padding: 1rem 0;
  border-top: 1px solid #edf2f7;
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
  color: #64748b;
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-size-select {
  width: 80px !important;
}

.pagination-container {
  display: flex;
  justify-content: center;
}

/* Modal styles */
:deep(.va-modal) {
  border-radius: 15px;
  overflow: hidden;
}

:deep(.va-modal__title) {
  font-size: 1.5rem;
  color: #2c3e50;
  padding: 1.5rem;
  border-bottom: 2px solid #edf2f7;
}

:deep(.va-modal__content) {
  padding: 1.5rem;
}

:deep(.va-modal__actions) {
  padding: 1rem 1.5rem;
  border-top: 1px solid #edf2f7;
}

/* Button styles in table */
.va-button--small {
  width: 36px !important;
  height: 36px !important;
  padding: 0 !important;
  border-radius: 8px;
}

.va-button--small i {
  font-size: 1.2rem;
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.action-button-circle {
  width: 36px !important;
  height: 36px !important;
  padding: 0 !important;
  border-radius: 50% !important;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-button-circle i {
  font-size: 1.2rem;
  margin: 0;
}

/* View button */
.action-button-circle[color='info'] {
  background: linear-gradient(135deg, #0396ff 0%, #42b0ff 100%);
  border: none;
  box-shadow: 0 2px 10px rgba(3, 150, 255, 0.2);
}

.action-button-circle[color='info']:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(3, 150, 255, 0.4);
  background: linear-gradient(135deg, #42b0ff 0%, #0396ff 100%);
}

/* Toggle button */
.action-button-circle[color='warning'] {
  background: linear-gradient(135deg, #ffb75e 0%, #ed8f03 100%);
  border: none;
  box-shadow: 0 2px 10px rgba(255, 183, 94, 0.2);
}

.action-button-circle[color='warning']:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 183, 94, 0.4);
  background: linear-gradient(135deg, #ed8f03 0%, #ffb75e 100%);
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

.action-button-circle:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
</style>
