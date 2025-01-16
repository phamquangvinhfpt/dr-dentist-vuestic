<template>
  <div class="payment-management-mobile">
    <div class="mobile-header">
      <i class="fas fa-money-bill-wave mobile-header-icon"></i>
      {{ t('payment.management') }}
    </div>

    <div class="mobile-search-section">
      <VaInput
        v-model="searchKeyword"
        :placeholder="t('common.search')"
        class="mobile-search-input"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <i class="fas fa-search search-icon"></i>
        </template>
      </VaInput>
    </div>

    <div class="mobile-date-section">
      <VaInput
        v-model="startDate"
        type="date"
        :max="maxDate"
        class="mobile-date-input"
        @update:modelValue="handleDateChange"
      >
        <template #prepend>
          <i class="fas fa-calendar"></i>
        </template>
      </VaInput>
      <VaInput
        v-model="endDate"
        type="date"
        :min="startDate"
        :max="maxDate"
        class="mobile-date-input"
        @update:modelValue="handleDateChange"
      >
        <template #prepend>
          <i class="fas fa-calendar"></i>
        </template>
      </VaInput>
    </div>

    <div class="mobile-filters">
      <VaSelect
        v-model="selectedPatient"
        :options="patientOptions"
        track-by="id"
        text-by="name"
        :placeholder="t('payment.selectPatient')"
        class="mobile-select"
        clearable
        searchable
      />

      <div class="mobile-status-filter">
        <button
          v-for="status in statusFilterOptions"
          :key="status.id"
          class="mobile-status-btn"
          :class="{ active: selectedStatusFilter === status.value }"
          @click="handleStatusFilterChange(status.value)"
        >
          {{ status.label }}
        </button>
      </div>

      <div class="mobile-method-filter">
        <button
          v-for="method in methodFilterOptions"
          :key="method.id"
          class="mobile-method-btn"
          :class="{ active: selectedMethodFilter === method.value }"
          @click="handleMethodFilterChange(method.value)"
        >
          {{ method.label }}
        </button>
      </div>
    </div>

    <div class="mobile-export">
      <VaButton class="mobile-export-btn" preset="secondary" :loading="isExporting" @click="handleExport">
        <i class="va-icon material-icons">file_download</i>
        {{ t('common.export') }}
      </VaButton>
    </div>

    <VaInnerLoading :loading="isLoading">
      <template #default>
        <div class="mobile-table-container">
          <div v-for="payment in paginatedPayments" :key="payment.paymentId" class="mobile-payment-card">
            <div class="payment-card-header">
              <span class="patient-code">{{ payment.patientCode }}</span>
              <span :class="['payment-status', getStatusClass(payment.status)]">
                {{ getStatusText(payment.status) }}
              </span>
            </div>

            <div class="payment-card-body">
              <div class="payment-info-row">
                <span class="info-label">{{ t('payment.patientName') }}:</span>
                <span class="info-value">{{ payment.patientName }}</span>
              </div>
              <div class="payment-info-row">
                <span class="info-label">{{ t('payment.serviceName') }}:</span>
                <span class="info-value">{{ payment.serviceName }}</span>
              </div>
              <div class="payment-info-row">
                <span class="info-label">{{ t('payment.depositAmount') }}:</span>
                <span class="info-value">{{ formatPrice(payment.depositAmount) }}</span>
              </div>
              <div class="payment-info-row">
                <span class="info-label">{{ t('payment.remainingAmount') }}:</span>
                <span class="info-value">{{ formatPrice(payment.remainingAmount) }}</span>
              </div>
              <div class="payment-info-row">
                <span class="info-label">{{ t('payment.totalAmount') }}:</span>
                <span class="info-value total-amount">{{ formatPrice(payment.totalAmount) }}</span>
              </div>
              <div class="payment-info-row">
                <span class="info-label">{{ t('payment.method') }}:</span>
                <span class="info-value">{{ getPaymentMethod(payment.method) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="paginatedPayments.length > 0" class="mobile-pagination">
          <div class="results-info">
            <b>{{ filteredPayments.length }} {{ t('common.result') }}</b>
          </div>
          <div class="page-size-selector">
            {{ t('common.resultPerPage') }}
            <VaSelect
              v-model="formData.pageSize"
              class="mobile-page-size"
              :options="[10, 50, 100]"
              @update:modelValue="handlePageSizeChange"
            />
          </div>
          <div v-if="totalPages > 1" class="pagination-controls">
            <VaPagination
              v-model="currentPage"
              buttons-preset="secondary"
              :pages="totalPages"
              :visible-pages="3"
              :boundary-links="true"
              :direction-links="true"
              @update:modelValue="handlePageChange"
            />
          </div>
        </div>
      </template>
    </VaInnerLoading>
  </div>
</template>

<script setup lang="ts">
import { usePaymentStore } from '@/stores/modules/payment.module'
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vuestic-ui'
import { PaymentMethod, PaymentStatus } from './types'
import type { PaginationFilter } from './types'
import type { PaymentDTO } from './types'
import { useAuthStore } from '@/stores/modules/auth.module'
import apiService from '@/services/api.service'
import { useUserProfileStore } from '@/stores/modules/user.module'

const { t } = useI18n()
const { init } = useToast()
const paymentStore = usePaymentStore()
const authStore = useAuthStore()
const userStore = useUserProfileStore()
const isLoading = ref(false)
const isExporting = ref(false)

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

const startDate = ref((route.params.startDate as string) || new Date().toISOString().split('T')[0])
const endDate = ref((route.params.endDate as string) || new Date().toISOString().split('T')[0])
const maxDate = ref(new Date().toISOString().split('T')[0])

const selectedStatusFilter = ref<PaymentStatus | null>(null)
const selectedMethodFilter = ref<PaymentMethod | null>(null)
const selectedPatient = ref<{ id: string; name: string } | null>(null)
const patientOptions = ref<Array<{ id: string; name: string }>>([])

// Reuse all the existing methods from PaymentManagement.vue
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

const statusFilterOptions = [
  { id: 'all', value: null, label: t('payment.allStatus') },
  { id: 'incomplete', value: PaymentStatus.Incomplete, label: t('payment.incomplete') },
  { id: 'completed', value: PaymentStatus.Completed, label: t('payment.completed') },
]

const methodFilterOptions = [
  { id: 'all', value: null, label: t('payment.allMethods') },
  { id: 'cash', value: PaymentMethod.Cash, label: t('payment.cash') },
  { id: 'bank', value: PaymentMethod.BankTransfer, label: t('payment.bankTransfer') },
]

// Reuse all the handler methods from PaymentManagement.vue
const handleStatusFilterChange = async (status: PaymentStatus | null) => {
  selectedStatusFilter.value = status
  currentPage.value = 1
  await getAllPaymentsPagination()
}

const handleMethodFilterChange = async (method: PaymentMethod | null) => {
  selectedMethodFilter.value = method
  currentPage.value = 1
  await getAllPaymentsPagination()
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
  getAllPaymentsPagination()
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price)
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

const getStatusClass = (status: number) => {
  switch (status) {
    case PaymentStatus.Incomplete:
      return 'status-incomplete'
    case PaymentStatus.Completed:
      return 'status-completed'
    default:
      return ''
  }
}

const getAllPaymentsPagination = async () => {
  try {
    isLoading.value = true
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
  } finally {
    isLoading.value = false
  }
}

const loadPatients = async () => {
  try {
    isLoading.value = true
    const response = await userStore.getPatients({
      pageNumber: 1,
      pageSize: 100000,
      isActive: true,
    })

    if (response?.data) {
      patientOptions.value = response.data
        .map((patient: { id: string; fullName?: string; userName: string }) => ({
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
  } finally {
    isLoading.value = false
  }
}

const formatUserName = (userName: string): string => {
  if (!userName) return ''
  return userName
    .split('.')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

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

    const axiosInstance = apiService.getAxiosInstance()
    const response = await axiosInstance.post('/v1/payment/export-payment', exportParams, {
      responseType: 'arraybuffer',
      headers: {
        'Content-Type': 'application/json',
      },
    })

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

watch(selectedPatient, async (newValue) => {
  if (newValue) {
    currentPage.value = 1
    await getAllPaymentsPagination()
  }
})

onMounted(async () => {
  if (!authStore.musHaveRole('Admin')) {
    init({
      message: t('common.unauthorized'),
      color: 'danger',
      duration: 3000,
    })
    router.push({ name: 'dashboard' })
    return
  }

  const today = new Date()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
  const currentDate = today.toISOString().split('T')[0]

  startDate.value = (route.params.startDate as string) || firstDayOfMonth
  endDate.value = (route.params.endDate as string) || currentDate

  await Promise.all([getAllPaymentsPagination(), loadPatients()])
})
</script>

<style scoped>
.payment-management-mobile {
  background: var(--va-background-primary);
  min-height: 100vh;
  padding: 0.5rem;
}

.mobile-header {
  background: var(--va-background-secondary);
  padding: 1rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--va-text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid var(--va-border-color);
  position: sticky;
  top: 0;
  z-index: 10;
}

.mobile-header-icon {
  font-size: 1.2rem;
  color: var(--va-primary);
}

.mobile-search-section {
  padding: 0.75rem;
}

.mobile-search-input :deep(input) {
  height: 40px;
  border-radius: 8px;
  font-size: 14px;
}

.mobile-date-section {
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mobile-date-input :deep(input) {
  height: 40px;
  border-radius: 8px;
  font-size: 14px;
}

.mobile-filters {
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mobile-select {
  width: 100%;
}

.mobile-status-filter,
.mobile-method-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  background: var(--va-background-secondary);
  padding: 0.5rem;
  border-radius: 8px;
}

.mobile-status-btn,
.mobile-method-btn {
  flex: 1 1 calc(33.33% - 0.5rem);
  min-width: 0;
  height: 36px;
  font-size: 12px;
  border: 1px solid var(--va-border-color);
  border-radius: 6px;
  background: var(--va-background-primary);
  color: var(--va-text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mobile-status-btn.active,
.mobile-method-btn.active {
  background: var(--va-primary);
  color: white;
  border-color: var(--va-primary);
}

.mobile-export {
  padding: 0.75rem;
}

.mobile-export-btn {
  width: 100% !important;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.mobile-table-container {
  padding: 0.75rem;
}

.mobile-payment-card {
  background: var(--va-background-secondary);
  border-radius: 8px;
  margin-bottom: 1rem;
  overflow: hidden;
  border: 1px solid var(--va-border-color);
}

.payment-card-header {
  padding: 0.75rem;
  background: var(--va-background-element);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--va-border-color);
}

.patient-code {
  font-weight: 600;
  font-size: 14px;
}

.payment-status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-incomplete {
  background: #fff3cd;
  color: #856404;
}

.status-completed {
  background: #d4edda;
  color: #155724;
}

.payment-card-body {
  padding: 0.75rem;
}

.payment-info-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--va-border-color);
  font-size: 14px;
}

.payment-info-row:last-child {
  border-bottom: none;
}

.info-label {
  color: var(--va-text-secondary);
}

.info-value {
  font-weight: 500;
}

.total-amount {
  color: var(--va-primary);
  font-weight: 600;
}

.mobile-pagination {
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.results-info {
  font-size: 14px;
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 14px;
}

.mobile-page-size {
  width: 80px;
}

.pagination-controls {
  width: 100%;
  display: flex;
  justify-content: center;
}

:deep(.va-pagination) {
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.25rem;
}

:deep(.va-pagination__item) {
  min-width: 32px;
  height: 32px;
  font-size: 13px;
}

/* Dark mode adjustments */
.dark {
  .mobile-payment-card {
    background: var(--va-background-element);
  }

  .payment-card-header {
    background: var(--va-background-secondary);
  }

  .mobile-status-btn,
  .mobile-method-btn {
    background: var(--va-background-element);
  }

  .status-incomplete {
    background: rgba(255, 243, 205, 0.1);
    color: #ffd700;
  }

  .status-completed {
    background: rgba(212, 237, 218, 0.1);
    color: #28a745;
  }
}

/* Landscape mode adjustments */
@media screen and (orientation: landscape) {
  .mobile-date-section {
    flex-direction: row;
    gap: 1rem;
  }

  .mobile-status-filter,
  .mobile-method-filter {
    flex-wrap: nowrap;
  }

  .mobile-status-btn,
  .mobile-method-btn {
    flex: 1;
  }
}
</style>
