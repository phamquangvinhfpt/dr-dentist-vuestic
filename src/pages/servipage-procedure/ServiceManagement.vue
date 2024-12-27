<template>
  <div class="service-management-container">
    <VaCard class="service-card">
      <VaCardTitle class="card-title">
        <i class="fas fa-cog title-icon"></i>
        Service Management
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

          <VaSelect
            v-model="selectedTypeFilter"
            :options="typeServices"
            text-by="typeName"
            value-by="id"
            placeholder="Filter by type"
            class="type-filter"
            size="large"
            style="flex: 1"
            @update:modelValue="handleTypeFilter"
          />

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
          :items="paginatedServices"
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
              <span class="w-24">{{ row.rowData.name }}</span>
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
              <span class="w-24">{{ row.rowData.description }}</span>
            </div>
          </template>

          <template #cell(typeName)="{ row }">
            <div class="flex items-center gap-2 ellipsis max-w-[230px]">
              <span class="w-24">{{ row.rowData.typeName }}</span>
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
                  @click="viewDetails(row.rowData.serviceID)"
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
                  @click="handleToggleStatus(row.rowData as ServiceDTO)"
                >
                  <VaIcon :name="row.rowData.isActive ? 'toggle_off' : 'toggle_on'" />
                </VaButton>
                <VaButton
                  color="danger"
                  size="small"
                  class="action-button-circle"
                  round
                  @click="confirmDelete(row.rowData as ServiceDTO)"
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
                  @click="handleRestore(row.rowData as ServiceDTO)"
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
        <p class="font-bold mt-2">{{ selectedService?.name }}</p>
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
          <VaSelect
            v-model="selectedTypeID"
            label="Type Service"
            :options="typeServices"
            text-by="typeName"
            value-by="id"
            placeholder="Choose a service type"
          />
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
import { onMounted, Ref, ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ListServicePagination, ServiceDTO, TypeService } from './types'
import { VaButton } from 'vuestic-ui'
import { useToast } from 'vuestic-ui'
import { useAuthStore } from '@/stores/modules/auth.module'
import { getErrorMessage } from '@/services/utils'

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
  typeID: '',
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

const searchQuery = ref('')
const searchTimeout = ref<number | null>(null)

const handleSearch = () => {
  if (searchTimeout.value) {
    window.clearTimeout(searchTimeout.value)
  }

  searchTimeout.value = window.setTimeout(() => {
    currentPage.value = 1
    getAllServicesPagination()
  }, 300)
}

// Add watch for search
watch(searchQuery, (newValue) => {
  if (searchTimeout.value) {
    window.clearTimeout(searchTimeout.value)
  }
  searchTimeout.value = window.setTimeout(() => {
    if (!newValue.trim()) {
      getAllServicesPagination()
    }
    currentPage.value = 1
  }, 300)
})

const filteredServices = computed(() => {
  if (!serviceList.value || serviceList.value.length === 0) return []

  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return serviceList.value

  return serviceList.value.filter(
    (service) =>
      (service.name || '').toLowerCase().includes(query) ||
      (service.description || '').toLowerCase().includes(query) ||
      (service.typeName || '').toLowerCase().includes(query),
  )
})

const paginatedServices = computed(() => {
  const query = searchQuery.value.trim()
  if (query) {
    const start = (currentPage.value - 1) * formData.pageSize
    const end = start + formData.pageSize
    return filteredServices.value.slice(start, end)
  }
  return serviceList.value
})

const totalPages = computed(() => {
  if (searchQuery.value.trim()) {
    return Math.ceil(filteredServices.value.length / formData.pageSize)
  }
  return serviceListResponse.value?.totalPages ?? 1
})

const selectedTypeFilter = ref('')

const handleTypeFilter = () => {
  console.log('Selected Type:', selectedTypeFilter.value)
  currentPage.value = 1
  getAllServicesPagination()
}

const getAllServicesPagination = async () => {
  try {
    const filters = []

    // Add type filter
    if (selectedTypeFilter.value) {
      filters.push({
        field: 'typeServiceID',
        operator: 'eq',
        value: selectedTypeFilter.value,
      })
    }

    // Add search filter
    if (searchQuery.value) {
      filters.push({
        field: 'name',
        operator: 'contains',
        value: searchQuery.value,
      })
    }

    const filterParams = {
      pageNumber: currentPage.value,
      pageSize: formData.pageSize,
      isActive: formData.isActive,
      orderBy: formData.orderBy,
      advancedFilter:
        filters.length > 0
          ? {
              logic: 'and',
              filters: filters,
            }
          : null,
    }

    console.log('Calling getAllServicesPagination with filter:', filterParams)

    const res = showBin.value
      ? await serviceStore.getDeletedServices(filterParams)
      : await serviceStore.getAllServices(filterParams)

    serviceListResponse.value = {
      data:
        res.data.map((service) => ({
          ...service,
          id: service.serviceID,
          serviceName: service.name,
          serviceDescription: service.description,
          typeServiceID: service.typeServiceID || '',
        })) || [],
      currentPage: res.currentPage || 1,
      totalPages: res.totalPages || Math.ceil((res.data?.length || 0) / formData.pageSize),
      totalCount: res.totalCount || res.data?.length || 0,
      pageSize: res.pageSize || formData.pageSize,
      hasPreviousPage: res.hasPreviousPage || false,
      hasNextPage: res.hasNextPage || false,
    }

    serviceList.value =
      res.data.map((service) => ({
        ...service,
        id: service.serviceID,
        serviceName: service.name,
        serviceDescription: service.description,
        typeServiceID: service.typeServiceID || '',
      })) || []

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
    { key: 'typeName', label: t('service.type') },
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
    await serviceStore.deleteService(selectedService.value.serviceID)

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

const typeServices = ref<TypeService[]>([])
const selectedTypeID = ref('')

const handleGetServiceTypes = async () => {
  try {
    const response = await serviceStore.getServiceTypes()
    typeServices.value = response.data
    console.log('Fetched Type Services:', typeServices.value)
  } catch (error) {
    const message = getErrorMessage(error)
    init({
      title: 'Error',
      message: message,
      color: 'danger',
    })
  }
}

const handleCreate = async () => {
  try {
    isSubmitting.value = true

    // Log the data being sent to the createService method
    console.log('Creating service with data:', {
      name: formData.name,
      description: formData.description,
      isModify: formData.isModify,
      typeID: selectedTypeID.value, // Log the selected type ID
    })

    // Log the selected type ID
    console.log('Selected Type ID:', selectedTypeID.value)

    await serviceStore.createService({
      name: formData.name,
      description: formData.description,
      isModify: formData.isModify,
      typeID: selectedTypeID.value,
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
    console.error('Error creating service:', error) // Log the error if it occurs
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
    await serviceStore.updateService(selectedService.value.serviceID, {
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
    await serviceStore.restoreService(service.serviceID)
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
  formData.typeID = ''

  selectedService.value = null
}

const handleToggleStatus = async (service: ServiceDTO) => {
  try {
    isToggling.value = true

    await serviceStore.toggleServiceStatus({
      id: service.serviceID,
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
  await handleGetServiceTypes() // Gọi hàm khi component được mount
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
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-section {
  flex: 1;
  min-width: 300px;
}

.search-input {
  width: 100%;
}

.search-input :deep(input) {
  height: 42px;
  border-radius: 8px;
  padding: 8px 16px;
  border: 1px solid var(--va-border-color);
  transition: all 0.3s;
  background: var(--va-background-secondary);
  font-size: 0.95rem;
  color: var(--va-text-primary);
}

.search-input :deep(input:focus) {
  border-color: #3b82f6;
  background: var(--va-background-secondary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-input :deep(.va-input-wrapper) {
  border: none;
  background: transparent;
}

.search-input :deep(.va-input) {
  box-shadow: none;
}

.search-icon {
  color: #64748b;
  font-size: 1rem;
  margin-right: 12px;
}

.filter-section {
  flex: 1;
  min-width: 300px;
}

.type-filter {
  width: 100%;
}

.type-filter :deep(.va-select__value) {
  height: 42px;
  border-radius: 8px;
  border: 1px solid var(--va-border-color);
  background: var(--va-background-secondary);
  transition: all 0.3s;
  padding: 8px 16px;
  font-size: 0.95rem;
  color: var(--va-text-primary);
  display: flex;
  align-items: center;
}

.type-filter :deep(.va-select) {
  height: 42px;
  box-shadow: none;
}

.type-filter :deep(.va-select__value-container) {
  padding: 0;
}

.type-filter :deep(.va-select__input) {
  height: 42px;
  min-height: 42px;
}

.type-filter :deep(.va-select__tags) {
  margin: 0;
  padding: 0;
}

.type-filter :deep(.va-select__dropdown-toggle) {
  height: 42px;
  min-height: 42px;
  padding: 0;
}

.button-group {
  display: flex;
  gap: 0.75rem;
  align-items: center;
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
  background-color: var(--va-background-secondary) !important;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
  padding: 1rem;
  text-align: center;
  color: var(--va-text-primary) !important;
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
}

:deep(.va-modal__actions) {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--va-border-color);
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
  gap: 0.25rem;
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
  background: var(--va-background-element);
  color: var(--va-text-primary);
}

.action-button-circle i {
  font-size: 1.2rem;
  margin: 0;
}

.action-button-circle:hover {
  background: var(--va-background-secondary);
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

/* Update existing styles to use CSS variables */
.stat-card {
  background: var(--va-background-secondary);
  border-radius: 20px;
  padding: 1.8rem;
  display: flex;
  align-items: center;
  gap: 1.2rem;
  box-shadow: var(--va-box-shadow);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-value {
  color: var(--va-text-primary);
}

.stat-label {
  color: var(--va-text-secondary);
}

.subtitle {
  color: var(--va-text-secondary);
}

.custom-table :deep(th) {
  background-color: var(--va-background-secondary) !important;
  color: var(--va-text-primary) !important;
}

.custom-table :deep(td) {
  color: var(--va-text-primary);
}

.custom-table :deep(tr:hover) {
  background-color: var(--va-background-element) !important;
}

.description-text {
  color: var(--va-text-secondary);
}

.description-text:hover {
  color: var(--va-text-primary);
}

/* Update scrollbar colors */
.custom-scrollbar::-webkit-scrollbar-track {
  background: var(--va-background-secondary);
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--va-primary);
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: var(--va-primary-dark);
}

/* Update modal styles */
:deep(.va-modal) {
  background: var(--va-background-secondary);
}

:deep(.va-modal__title) {
  color: var(--va-text-primary);
  border-bottom: 2px solid var(--va-border-color);
}

/* Update form elements */
:deep(.va-input__content) {
  background: var(--va-background-element) !important;
  color: var(--va-text-primary) !important;
}

:deep(.va-select__content) {
  background: var(--va-background-element) !important;
  color: var(--va-text-primary) !important;
}

/* Update action buttons */
.action-button-circle {
  background: var(--va-background-element);
  color: var(--va-text-primary);
}

.action-button-circle:hover {
  background: var(--va-background-secondary);
}

/* Update status colors */
.status-active {
  color: var(--va-success);
}

.status-inactive {
  color: var(--va-danger);
}

/* Add transition for smooth theme switching */
* {
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}
</style>
