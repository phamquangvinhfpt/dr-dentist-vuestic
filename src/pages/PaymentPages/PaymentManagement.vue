<template>
  <div class="payment-management-container">
    <VaCard class="payment-card">
      <VaCardTitle class="card-title">
        <i class="fas fa-money-bill-wave title-icon"></i>
        {{ t('payment.management') }}
      </VaCardTitle>

      <VaCardContent>
        <div class="search-filter-container">
          <div class="top-row">
            <div class="search-box">
              <VaInput
                v-model="searchKeyword"
                :placeholder="searchPlaceholder"
                class="search-input"
                @keyup.enter="handleSearch"
              >
                <template #append>
                  <i class="fas fa-search search-icon"></i>
                </template>
              </VaInput>
            </div>

            <div class="date-range">
              <div class="date-input-group">
                <VaInput
                  v-model="startDate"
                  type="date"
                  :max="maxDate"
                  class="date-input"
                  @update:modelValue="handleDateChange"
                >
                  <template #prepend>
                    <i class="fas fa-calendar text-gray-500"></i>
                  </template>
                </VaInput>
                <div class="date-separator">
                  <div class="separator-line"></div>
                </div>
                <VaInput
                  v-model="endDate"
                  type="date"
                  :min="startDate"
                  :max="maxDate"
                  class="date-input"
                  @update:modelValue="handleDateChange"
                >
                  <template #prepend>
                    <i class="fas fa-calendar text-gray-500"></i>
                  </template>
                </VaInput>
              </div>
            </div>

            <div class="export-button-container">
              <VaButton class="export-button" preset="secondary" :loading="isExporting" @click="handleExport">
                <i class="va-icon material-icons">file_download</i>
              </VaButton>
            </div>
          </div>

          <div class="bottom-row">
            <div class="patient-selector">
              <VaSelect
                v-model="selectedPatient"
                :options="patientOptions"
                track-by="id"
                text-by="name"
                :placeholder="t('payment.selectPatient')"
                class="patient-select"
                clearable
                searchable
              />
            </div>

            <div class="status-filter">
              <div class="status-tabs">
                <button
                  v-for="status in statusFilterOptions"
                  :key="status.id"
                  class="status-tab"
                  :class="{ active: selectedStatusFilter === status.value }"
                  :data-status="status.id"
                  @click="handleStatusFilterChange(status.value)"
                >
                  {{ status.label }}
                </button>
              </div>
            </div>

            <div class="method-filter">
              <div class="method-tabs">
                <button
                  v-for="method in methodFilterOptions"
                  :key="method.id"
                  class="method-tab"
                  :class="{ active: selectedMethodFilter === method.value }"
                  :data-method="method.id"
                  @click="handleMethodFilterChange(method.value)"
                >
                  {{ method.label }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <VaDataTable
          class="my-table va-table--hoverable"
          :items="paginatedPayments"
          :columns="columns"
          hoverable
          sticky-header
          striped
          :no-data-html="`<div class='text-center'>${t('payment.noPaymentFound')}</div>`"
        >
          <template #cell(patientCode)="{ row }">
            <div class="flex items-center gap-2">
              <span>{{ row.rowData.patientCode }}</span>
            </div>
          </template>

          <template #cell(patientName)="{ row }">
            <div class="flex items-center gap-2">
              <span>{{ row.rowData.patientName }}</span>
            </div>
          </template>

          <template #cell(serviceName)="{ row }">
            <div class="flex items-center gap-2">
              <span>{{ row.rowData.serviceName }}</span>
            </div>
          </template>

          <template #cell(depositAmount)="{ row }">
            <div class="flex items-center gap-2">
              <span>{{ formatPrice(row.rowData.depositAmount) }}</span>
            </div>
          </template>

          <template #cell(depositDate)="{ row }">
            <div class="flex items-center gap-2">
              <span>{{
                !row.rowData.depositDate ? t('payment.notDeposited') : formatDate(row.rowData.depositDate)
              }}</span>
            </div>
          </template>

          <template #cell(remainingAmount)="{ row }">
            <div class="flex items-center gap-2">
              <span>{{ formatPrice(row.rowData.remainingAmount) }}</span>
            </div>
          </template>

          <template #cell(totalAmount)="{ row }">
            <div class="flex items-center gap-2">
              <span>{{ formatPrice(row.rowData.totalAmount) }}</span>
            </div>
          </template>

          <template #cell(method)="{ row }">
            <div class="flex items-center gap-2">
              <span>{{ getPaymentMethod(row.rowData.method) }}</span>
            </div>
          </template>

          <template #cell(status)="{ row }">
            <div class="flex items-center gap-2">
              <span :class="getStatusClass(row.rowData.status)">
                {{ getStatusText(row.rowData.status) }}
              </span>
            </div>
          </template>
        </VaDataTable>

        <VaCardContent>
          <div
            v-if="paginatedPayments.length > 0"
            class="flex flex-col-reverse md:flex-row gap-2 justify-between items-center p-2"
          >
            <div>
              <b>{{ filteredPayments.length }} {{ t('common.result') }}.</b>
              {{ t('common.resultPerPage') }}
              <VaSelect
                v-model="formData.pageSize"
                class="!w-20"
                :options="[10, 50, 100]"
                @update:modelValue="handlePageSizeChange"
              />
            </div>
            <div v-if="totalPages > 1" class="flex">
              <VaPagination
                v-model="currentPage"
                buttons-preset="secondary"
                :pages="totalPages"
                :visible-pages="5"
                :boundary-links="true"
                :direction-links="true"
                @update:modelValue="handlePageChange"
              />
            </div>
          </div>
        </VaCardContent>
      </VaCardContent>
    </VaCard>
  </div>
</template>

<script lang="ts" setup>
import { usePaymentStore } from '@/stores/modules/payment.module'
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vuestic-ui'
import { PaymentMethod, PaymentStatus } from './types'
import type { PaginationFilter } from './types'
import type { PaymentDTO } from './types'
import { useAuthStore } from '@/stores/modules/auth.module'
// import userService from '@/services/user.service'
import apiService from '@/services/api.service'
import { useUserProfileStore } from '@/stores/modules/user.module'

const { t } = useI18n()
const { init } = useToast()
const paymentStore = usePaymentStore()
const authStore = useAuthStore()
const userStore = useUserProfileStore()

const route = useRoute()
const router = useRouter()

const formData = reactive<PaginationFilter>({
  pageNumber: 1,
  pageSize: 10,
  orderBy: [],
})

const searchKeyword = ref('')
const currentPage = ref(1)
const paymentList = ref<PaymentDTO[]>([])

const filteredPayments = computed(() => {
  if (!paymentList.value || paymentList.value.length === 0) return []

  const query = searchKeyword.value.toLowerCase().trim()
  if (!query) return paymentList.value

  return paymentList.value.filter(
    (payment) =>
      (payment.patientCode || '').toLowerCase().includes(query) ||
      (payment.patientName || '').toLowerCase().includes(query) ||
      (payment.serviceName || '').toLowerCase().includes(query),
  )
})

const totalItems = computed(() => filteredPayments.value.length)

const totalPages = computed(() => Math.ceil(totalItems.value / formData.pageSize))

const paginatedPayments = computed(() => {
  const start = (currentPage.value - 1) * formData.pageSize
  const end = start + formData.pageSize
  return filteredPayments.value.slice(start, end)
})

const columns = [
  { key: 'patientCode', label: t('payment.patientCode') },
  { key: 'patientName', label: t('payment.patientName') },
  { key: 'serviceName', label: t('payment.serviceName') },
  { key: 'depositAmount', label: t('payment.depositAmount') },
  { key: 'remainingAmount', label: t('payment.remainingAmount') },
  { key: 'totalAmount', label: t('payment.totalAmount') },
  { key: 'method', label: t('payment.method') },
  { key: 'status', label: t('payment.status') },
]

const startDate = ref((route.params.startDate as string) || new Date().toISOString().split('T')[0])
const endDate = ref((route.params.endDate as string) || new Date().toISOString().split('T')[0])
const maxDate = ref(new Date().toISOString().split('T')[0])

const selectedStatusFilter = ref<PaymentStatus | null>(null)

const statusFilterOptions = [
  { id: 'all', value: null, label: t('payment.allStatus') },
  { id: 'incomplete', value: PaymentStatus.Incomplete, label: t('payment.incomplete') },
  { id: 'completed', value: PaymentStatus.Completed, label: t('payment.completed') },
]

const handleStatusFilterChange = async (status: PaymentStatus | null) => {
  selectedStatusFilter.value = status
  currentPage.value = 1
  await getAllPaymentsPagination()
}

const getAllPaymentsPagination = async () => {
  try {
    const filters = []

    if (selectedStatusFilter.value !== null) {
      filters.push({
        field: 'status',
        operator: 'eq',
        value: selectedStatusFilter.value.toString(),
      })
    }

    if (selectedMethodFilter.value !== null) {
      filters.push({
        field: 'method',
        operator: 'eq',
        value: selectedMethodFilter.value.toString(),
      })
    }

    const res = await paymentStore.getAllPayments(
      {
        pageNumber: 1,
        pageSize: 100000,
        orderBy: formData.orderBy,
        advancedFilter:
          filters.length > 0
            ? {
                logic: 'and',
                filters: filters,
              }
            : undefined,
      },
      startDate.value,
      endDate.value,
    )

    paymentList.value = res.data || []
  } catch (error) {
    console.error('Error fetching payments:', error)
    paymentList.value = []
  }
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price)
}

const formatDate = (date: string | null) => {
  if (!date) return 'N/A'

  try {
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return 'N/A'

    return dateObj.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return 'N/A'
  }
}

const getPaymentMethod = (method: number) => {
  switch (method) {
    case PaymentMethod.None:
      return t('payment.other')
    case PaymentMethod.Cash:
      return t('payment.cash')
    case PaymentMethod.BankTransfer:
      return t('payment.bankTransfer')
    default:
      return t('payment.other')
  }
}

const getStatusText = (status: number) => {
  switch (status) {
    case PaymentStatus.Waiting:
      return t('form.waiting')
    case PaymentStatus.Incomplete:
      return t('payment.incomplete')
    case PaymentStatus.Completed:
      return t('payment.completed')
    case PaymentStatus.Canceled:
      return t('validateUtils.Cancel')
    case PaymentStatus.Failed:
      return t('form.failed')
    default:
      return t('payment.other')
  }
}

// const getStatusDotClass = (status: PaymentStatus | null) => {
//   if (status === null) return 'bg-gray-400'
//   switch (status) {
//     case PaymentStatus.Incomplete:
//       return 'bg-yellow-500'  // Màu vàng
//     case PaymentStatus.Completed:
//       return 'bg-green-500'   // Màu xanh lá
//     default:
//       return 'bg-gray-400'
//   }
// }

const getStatusClass = (status: number) => {
  switch (status) {
    case PaymentStatus.Incomplete:
      return 'text-yellow-500' // Màu vàng
    case PaymentStatus.Completed:
      return 'text-green-500' // Màu xanh lá
    default:
      return ''
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
}

const handlePageSizeChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  if (target) {
    formData.pageSize = parseInt(target.value, 10)
    currentPage.value = 1
  }
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleDateChange = () => {
  if (new Date(endDate.value) < new Date(startDate.value)) {
    endDate.value = startDate.value
  }

  router.push(`/payment-management/${startDate.value}/${endDate.value}`)
  getAllPaymentsPagination()
}

watch(searchKeyword, () => {
  currentPage.value = 1
})

watch(
  () => paymentStore.paymentList,
  (newValue) => {
    console.log('Payment store updated:', newValue)
  },
  { deep: true },
)

const selectedMethodFilter = ref<PaymentMethod | null>(null)
const isExporting = ref(false)

const methodFilterOptions = [
  { id: 'all', value: null, label: t('payment.allMethods') },
  { id: 'cash', value: PaymentMethod.Cash, label: t('payment.cash') },
  { id: 'bank', value: PaymentMethod.BankTransfer, label: t('payment.bankTransfer') },
]

const handleMethodFilterChange = async (method: PaymentMethod | null) => {
  selectedMethodFilter.value = method
  currentPage.value = 1
  await getAllPaymentsPagination()
}

interface Patient {
  id: string
  fullName?: string
  userName: string
}

const selectedPatient = ref<{ id: string; name: string } | null>(null)
const patientOptions = ref<Array<{ id: string; name: string }>>([])

const loadPatients = async () => {
  try {
    const response = await userStore.getPatients({
      pageNumber: 1,
      pageSize: 100000,
      isActive: true,
    })

    if (response?.data) {
      patientOptions.value = response.data
        .map((patient: Patient) => ({
          id: patient.id,
          name: patient.fullName || formatUserName(patient.userName) || 'Unknown Patient',
        }))
        .filter((option: { id: string; name: string }) => option.id)
    }
  } catch (error) {
    console.error('Error loading patients:', error)
    init({
      message: t('payment.loadPatientError'),
      color: 'danger',
      duration: 3000,
    })
  }
}

const formatUserName = (userName: string): string => {
  if (!userName) return ''
  // Split by dot and capitalize each part
  return userName
    .split('.')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

// Watch for patient selection changes
watch(selectedPatient, async (newValue) => {
  if (newValue) {
    console.log('Selected patient changed:', newValue)
    currentPage.value = 1
    await getAllPaymentsPagination()
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

  if (!route.params.startDate || !route.params.endDate) {
    const today = new Date().toISOString().split('T')[0]
    startDate.value = today
    endDate.value = today
    await router.push(`/payment-management/${today}/${today}`)
  } else {
    // Remove this check since we want to allow end date to be today
    // if (new Date(endDate.value) > new Date(maxDate.value)) {
    //   endDate.value = maxDate.value
    //   await router.push(`/payment-management/${startDate.value}/${maxDate.value}`)
    // }
  }

  await Promise.all([getAllPaymentsPagination(), loadPatients()])
})

const handleExport = async () => {
  try {
    isExporting.value = true
    console.log('Starting export...')

    const exportParams = {
      startDate: startDate.value,
      endDate: endDate.value,
      paymentStatus: selectedStatusFilter.value ?? 0,
      paymentMethod: selectedMethodFilter.value ?? 0,
      userID: selectedPatient.value?.id,
    }
    console.log('Export params:', exportParams)

    const axiosInstance = apiService.getAxiosInstance()
    const response = await axiosInstance.post('/v1/payment/export-payment', exportParams, {
      responseType: 'arraybuffer',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('Export response received')

    if (!response.data) {
      throw new Error(t('payment.noDataReceived'))
    }

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const fileName = selectedPatient.value
      ? t('payment.exportFileName', {
          name: selectedPatient.value.name,
          startDate: startDate.value,
          endDate: endDate.value,
        })
      : t('payment.exportFileNameAll', {
          startDate: startDate.value,
          endDate: endDate.value,
        })
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()

    setTimeout(() => {
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    }, 100)

    init({
      message: t('payment.exportSuccess'),
      color: 'success',
      duration: 3000,
    })
  } catch (error: unknown) {
    console.error('Export failed:', error)

    let errorMessage = t('payment.exportError')
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: ArrayBuffer } }
      if (axiosError.response?.data) {
        try {
          const decoder = new TextDecoder('utf-8')
          const jsonString = decoder.decode(axiosError.response.data)
          const errorData = JSON.parse(jsonString)
          errorMessage = errorData.message || errorMessage
        } catch (e) {
          // Ignore parse error
        }
      }
    }

    init({
      message: errorMessage,
      color: 'danger',
      duration: 3000,
    })
  } finally {
    isExporting.value = false
  }
}

// Thay đổi placeholder của search input
const searchPlaceholder = computed(() => {
  return t('common.search')
})
</script>

<style scoped>
.payment-management-container {
  padding: 2rem;
  background: var(--va-background-primary);
  min-height: 100vh;
}

.payment-card {
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  background: var(--va-background-primary);
}

.card-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--va-text-primary);
  padding: 1.5rem;
  border-bottom: 2px solid #edf2f7;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.va-table-responsive {
  overflow: auto;
}

/* Filter Tabs Styles */
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

.tab-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

/* Status Colors */
.tab-button.active.tab-incomplete {
  color: #eab308; /* Yellow-500 */
}

.tab-button.active.tab-completed {
  color: #22c55e; /* Green-500 */
}

.tab-button.active.tab-all {
  color: var(--va-primary);
}

/* Responsive */
@media (max-width: 1200px) {
  .search-filter-container {
    padding: 1rem;
    margin: 1rem;
  }

  .top-row {
    flex-wrap: wrap;
    gap: 1rem;
  }

  .search-box {
    flex: 1 1 100%;
    max-width: 100%;
  }

  .date-range {
    flex: 1 1 calc(100% - 60px);
  }

  .export-button-container {
    flex: 0 0 auto;
  }
}

@media (max-width: 768px) {
  .payment-management-container {
    padding: 12px;
  }

  .search-filter-container {
    padding: 0.75rem;
    margin: 0.75rem;
  }

  .top-row,
  .bottom-row {
    flex-direction: column;
    gap: 0.75rem;
  }

  .search-box,
  .date-range,
  .patient-selector,
  .status-filter,
  .method-filter {
    width: 100%;
  }

  .date-input-group {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem;
  }

  .date-separator {
    display: none;
  }

  .date-input {
    width: 100%;
  }

  .status-tabs,
  .method-tabs {
    flex-wrap: wrap;
    height: auto;
    min-height: 42px;
  }

  .status-tab,
  .method-tab {
    flex: 1 1 auto;
    min-width: 100px;
    padding: 8px;
    font-size: 0.875rem;
  }

  .card-title {
    font-size: 1.4rem;
    padding: 1rem;
  }

  /* Table responsive adjustments */
  :deep(.va-data-table) {
    font-size: 0.875rem;
  }

  :deep(.va-data-table__th),
  :deep(.va-data-table__td) {
    padding: 8px;
  }
}

/* Add smooth scaling for larger screens */
@media (min-width: 1201px) {
  .payment-management-container {
    padding: 2rem;
  }

  .search-filter-container {
    transition: all 0.3s ease;
  }

  .search-box,
  .date-range,
  .patient-selector,
  .status-filter,
  .method-filter {
    transition: all 0.3s ease;
  }

  .card-title {
    transition: font-size 0.3s ease;
  }
}

/* Improve table responsiveness */
:deep(.va-data-table) {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

:deep(.va-data-table__table) {
  min-width: 800px;
}

/* Improve dark mode contrast */
.dark {
  :deep(.va-data-table__th) {
    background: var(--va-background-secondary);
  }

  :deep(.va-data-table__tr:hover) {
    background: rgba(255, 255, 255, 0.05);
  }

  .search-input :deep(input),
  .date-input-group,
  .status-tabs,
  .method-tabs {
    background: var(--va-background-element);
  }
}

/* Add fluid typography */
html {
  font-size: clamp(14px, 1vw, 16px);
}

.card-title {
  font-size: clamp(1.4rem, 2.5vw, 1.8rem);
}

.search-input :deep(input),
.date-input :deep(input),
.status-tab,
.method-tab {
  font-size: clamp(0.875rem, 1.5vw, 0.95rem);
}

/* Improve button responsiveness */
.export-button {
  width: clamp(42px, 5vw, 48px) !important;
  height: clamp(42px, 5vw, 48px) !important;
}

.export-button i {
  font-size: clamp(18px, 2.5vw, 20px);
}

.search-filter-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  background: var(--va-background-secondary);
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
  margin: 1.5rem;
  border: 1px solid var(--va-border-color);
}

.top-row {
  display: flex;
  gap: 1.5rem;
  width: 100%;
  align-items: center;
  justify-content: space-between;
}

.bottom-row {
  display: flex;
  gap: 1.5rem;
  width: 100%;
  align-items: center;
  justify-content: space-between;
}

.search-box {
  flex: 1;
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
  color: var(--va-text-primary);
  font-size: 1rem;
  margin-right: 12px;
}

/* Date Range */
.date-range {
  display: flex;
  align-items: center;
  flex: 1;
}

.date-input-group {
  display: flex;
  align-items: center;
  background: var(--va-background-secondary);
  border: 1px solid var(--va-border-color);
  border-radius: 8px;
  padding: 4px 8px;
  transition: all 0.3s;
  width: 100%;
}

.date-input-group:hover {
  border-color: #3b82f6;
}

.date-input {
  flex: 1;
}

.date-input :deep(input) {
  height: 42px;
  border: none !important;
  background: transparent;
  font-size: 0.95rem;
  color: var(--va-text-primary);
  padding: 0 12px;
}

.date-separator {
  padding: 0 12px;
}

.separator-line {
  width: 20px;
  height: 2px;
  background: var(--va-border-color);
  border-radius: 2px;
}

/* Export Button */
.export-button-container {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  margin-left: 1rem;
}

.export-button {
  width: 42px !important;
  height: 42px !important;
  padding: 0 !important;
  border-radius: 8px !important;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  background: var(--va-background-secondary) !important;
  color: var(--va-text-secondary) !important;
  border: 1px solid var(--va-border-color) !important;
  position: relative;
}

.export-button i {
  font-size: 20px;
  transition: all 0.3s ease;
}

.export-button:hover {
  background: #3b82f6 !important;
  color: white !important;
  border-color: #3b82f6 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.15) !important;
}

.export-button:hover i {
  transform: scale(1.1);
}

.export-button:active {
  transform: translateY(0);
  box-shadow: none !important;
}

/* Patient Selector */
.patient-selector {
  flex: 2;
}

.patient-select {
  width: 100%;
}

.patient-select :deep(.va-select__value) {
  height: 42px;
  border-radius: 8px;
  border: 1px solid var(--va-border-color);
  background: var(--va-background-secondary);
  transition: all 0.3s;
  padding: 0 12px;
}

.patient-select :deep(.va-select__value:hover) {
  border-color: #3b82f6;
}

/* Status Filter */
.status-filter {
  flex: 2;
}

.status-tabs {
  display: flex;
  background: var(--va-background-primary);
  border: 1px solid var(--va-border-color);
  border-radius: 8px;
  padding: 4px;
  width: 100%;
  height: 42px;
}

.status-tab {
  padding: 0;
  border: none;
  background: transparent;
  color: var(--va-text-primary);
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  flex: 1;
  text-align: center;
  border-radius: 6px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 2px;
  border-color: var(--va-border-color);
}

.status-tab.active {
  background: var(--va-background-secondary);
  box-shadow: 0 2px 4px var(--va-background-primary);
  color: var(--va-primary);
}

/* Method Filter */
.method-filter {
  flex: 2;
}

.method-tabs {
  display: flex;
  background: var(--va-background-primary);
  border: 1px solid var(--va-border-color);
  border-radius: 8px;
  padding: 4px;
  width: 100%;
  height: 42px;
}

.method-tab {
  padding: 0;
  border: none;
  background: transparent;
  color: var(--va-text-primary);
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  flex: 1;
  text-align: center;
  border-radius: 6px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 2px;
  border-color: var(--va-border-color);
}

.method-tab.active {
  background: var(--va-background-secondary);
  color: var(--va-primary);
  box-shadow: 0 2px 4px var(--va-background-primary);
}

.status-tab:hover:not(.active),
.method-tab:hover:not(.active) {
  background: var(--va-background-secondary);
}

/* Responsive */
@media (max-width: 1200px) {
  .search-box,
  .date-range,
  .export-button-container {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .search-filter-container {
    gap: 1rem;
  }

  .top-row,
  .bottom-row {
    flex-direction: column;
    gap: 1rem;
  }

  .search-box,
  .date-range,
  .export-button-container,
  .patient-selector,
  .status-filter,
  .method-filter {
    width: 100%;
  }

  .status-tabs,
  .method-tabs {
    width: 100%;
  }

  .status-tab,
  .method-tab {
    flex: 1;
    min-width: auto;
    padding: 8px 12px;
  }

  .date-input-group {
    width: 100%;
  }

  .export-button {
    width: 100%;
  }
}

/* Thêm styles cho table trong darkmode */
:deep(.va-data-table) {
  background: var(--va-background-primary);
  color: var(--va-text-primary);
}

:deep(.va-data-table__thead) {
  background: var(--va-background-secondary);
}

:deep(.va-data-table__th) {
  color: var(--va-text-primary);
}

:deep(.va-data-table__td) {
  color: var(--va-text-primary);
  border-bottom: 1px solid var(--va-border-color);
}

/* Thêm hover effect cho table rows */
:deep(.va-data-table__tr:hover) {
  background: var(--va-background-secondary);
}
</style>
