<template>
  <div class="payment-management-container">
    <VaCard class="payment-card">
      <VaCardTitle class="card-title">
        <i class="fas fa-money-bill-wave title-icon"></i>
        Payment Management
      </VaCardTitle>

      <VaCardContent>
        <div class="search-filter-container">
          <!-- Search Box -->
          <div class="search-box">
            <VaInput
              v-model="searchKeyword"
              :placeholder="t('common.search')"
              class="search-input"
              @keyup.enter="handleSearch"
            >
              <template #append>
                <i class="fas fa-search search-icon"></i>
              </template>
            </VaInput>
          </div>

          <!-- Status Filter Pills -->
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

          <!-- Date Range -->
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
        </div>

        <VaDataTable
          class="my-table va-table--hoverable"
          :items="paginatedPayments"
          :columns="columns"
          hoverable
          :loading="isLoading"
          sticky-header
          no-data-html="<div class='text-center'>No payments found</div>"
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
              <span>{{ !row.rowData.depositDate ? 'N/A' : formatDate(row.rowData.depositDate) }}</span>
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
              <b
                >{{ searchKeyword.trim() ? filteredPayments.length : paymentListResponse?.totalCount ?? 0 }}
                {{ t('common.result') }}.</b
              >
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
import type { PaginationResponse, PaymentDTO } from './types'
import { useAuthStore } from '@/stores/modules/auth.module'

const { t } = useI18n()
const { init } = useToast()
const paymentStore = usePaymentStore()
const authStore = useAuthStore()

const route = useRoute()
const router = useRouter()

const formData = reactive<PaginationFilter>({
  pageNumber: 1,
  pageSize: 10,
  orderBy: [],
})

const searchKeyword = ref('')
const currentPage = ref(1)
const isLoading = computed(() => paymentStore.isLoading)
const paymentListResponse = ref<PaginationResponse<PaymentDTO> | null>(null)
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

const totalPages = computed(() => {
  if (searchKeyword.value.trim()) {
    return Math.ceil(filteredPayments.value.length / formData.pageSize)
  }
  return paymentListResponse.value?.totalPages ?? 1
})

const paginatedPayments = computed(() => {
  const query = searchKeyword.value.trim()
  if (query) {
    const start = (currentPage.value - 1) * formData.pageSize
    const end = start + formData.pageSize
    return filteredPayments.value.slice(start, end)
  }
  return paymentList.value
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
    const res = await paymentStore.getAllPayments(
      {
        pageNumber: currentPage.value,
        pageSize: formData.pageSize,
        orderBy: formData.orderBy,
        keyword: searchKeyword.value,
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
      },
      startDate.value,
      endDate.value,
    )

    paymentListResponse.value = res
    paymentList.value = res.data
  } catch (error) {
    console.error('Error fetching payments:', error)
    paymentListResponse.value = null
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
      return 'None'
    case PaymentMethod.Cash:
      return 'Cash'
    case PaymentMethod.BankTransfer:
      return 'Bank Transfer'
    default:
      return 'Unknown'
  }
}

const getStatusText = (status: number) => {
  switch (status) {
    case PaymentStatus.Waiting:
      return 'Waiting'
    case PaymentStatus.Incomplete:
      return 'Incomplete'
    case PaymentStatus.Completed:
      return 'Completed'
    case PaymentStatus.Canceled:
      return 'Canceled'
    case PaymentStatus.Failed:
      return 'Failed'
    default:
      return 'Unknown'
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
  if (!searchKeyword.value.trim()) {
    getAllPaymentsPagination()
  }
}

const handlePageSizeChange = (size: number) => {
  formData.pageSize = size
  currentPage.value = 1
  if (!searchKeyword.value.trim()) {
    getAllPaymentsPagination()
  }
}

const handleSearch = () => {
  currentPage.value = 1
  if (!searchKeyword.value.trim()) {
    getAllPaymentsPagination()
  }
}

const handleDateChange = () => {
  if (new Date(endDate.value) > new Date(maxDate.value)) {
    endDate.value = maxDate.value
  }

  if (new Date(endDate.value) < new Date(startDate.value)) {
    endDate.value = startDate.value
  }

  router.push(`/payment-management/${startDate.value}/${endDate.value}`)
  getAllPaymentsPagination()
}

let searchTimeout: NodeJS.Timeout
watch(searchKeyword, (newValue) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    if (!newValue.trim()) {
      getAllPaymentsPagination()
    }
    currentPage.value = 1
  }, 300)
})

watch(
  () => paymentStore.paymentList,
  (newValue) => {
    console.log('Payment store updated:', newValue)
  },
  { deep: true },
)

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
    if (new Date(endDate.value) > new Date(maxDate.value)) {
      endDate.value = maxDate.value
      await router.push(`/payment-management/${startDate.value}/${maxDate.value}`)
    }
  }

  await getAllPaymentsPagination()
})
</script>

<style scoped>
.payment-management-container {
  padding: 24px;
}

.payment-card {
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  background: white;
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
@media (max-width: 768px) {
  .tab-wrapper {
    width: 100%;
    justify-content: center;
  }
}

.search-filter-container {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.search-box {
  min-width: 280px;
  flex: 1;
  position: relative;
}

.search-input :deep(input) {
  height: 42px;
  border-radius: 8px;
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
  background: white;
}

/* Bỏ viền và background mặc định của Vuestic */
.search-input :deep(.va-input-wrapper) {
  border: none;
  background: transparent;
}

.search-input :deep(.va-input) {
  box-shadow: none;
}

/* Icon search */
.search-icon {
  color: #718096;
  font-size: 14px;
  margin-right: 12px;
}

/* Bỏ các style không cần thiết khác */

/* Status Pills */
.status-filter {
  margin: 1rem 0;
}

.status-tabs {
  display: inline-flex;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 4px;
}

.status-tab {
  padding: 6px 16px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  min-width: 100px;
  text-align: center;
}

.status-tab:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 60%;
  background: #e2e8f0;
}

/* All Status - Màu xanh */
.status-tab[data-status='all'].active,
.status-tab[data-status='all']:hover:not(.active) {
  color: #2563eb;
}

/* Incomplete Status - Màu vàng */
.status-tab[data-status='incomplete'].active,
.status-tab[data-status='incomplete']:hover:not(.active) {
  color: #eab308;
}

/* Completed Status - Màu xanh lá */
.status-tab[data-status='completed'].active,
.status-tab[data-status='completed']:hover:not(.active) {
  color: #22c55e;
}

/* Responsive */
@media (max-width: 768px) {
  .status-tabs {
    width: 100%;
    overflow-x: auto;
    white-space: nowrap;
  }
}

/* Date Range */
.date-range {
  display: flex;
  align-items: center;
}

.date-input-group {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 4px;
}

.date-input {
  width: 160px;
}

.date-input :deep(input) {
  height: 38px;
  border: none !important;
  background: transparent;
  font-size: 14px;
  color: #2d3748;
  padding: 0 8px;
}

/* Bỏ border và background mặc định của Vuestic */
.date-input :deep(.va-input-wrapper) {
  border: none;
  background: transparent;
}

.date-input :deep(.va-input) {
  box-shadow: none;
}

/* Icon calendar */
.date-input :deep(.va-input__prepend-inner) {
  padding-left: 8px;
}

/* Separator */
.date-separator {
  padding: 0 8px;
  display: flex;
  align-items: center;
}

.separator-line {
  width: 16px;
  height: 2px;
  background: #cbd5e0;
  border-radius: 2px;
}

/* Hover & Focus states */
.date-input-group:hover {
  border-color: #cbd5e0;
}

.date-input :deep(input:focus) {
  background: #f7fafc;
  border-radius: 6px;
}

/* Responsive */
@media (max-width: 768px) {
  .date-input-group {
    width: 100%;
  }

  .date-input {
    flex: 1;
  }
}

/* Animation */
.status-pill {
  transform: translateY(0);
  transition: all 0.2s ease;
}

.status-pill:hover {
  transform: translateY(-1px);
}

.status-pill.active {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* All Status - Màu xanh */
.status-tab.active[data-status='all'] {
  color: #2563eb; /* Màu xanh */
}

.status-tab.active[data-status='all'] .status-count {
  background: #3b82f6; /* Màu xanh */
  color: white;
}

/* Incomplete Status - Màu vàng */
.status-tab.active[data-status='incomplete'] {
  color: #eab308; /* Màu vàng */
}

.status-tab.active[data-status='incomplete'] .status-count {
  background: #eab308; /* Màu vàng */
  color: white;
}

/* Completed Status - Màu xanh lá */
.status-tab.active[data-status='completed'] {
  color: #22c55e; /* Màu xanh lá */
}

.status-tab.active[data-status='completed'] .status-count {
  background: #22c55e; /* Màu xanh lá */
  color: white;
}

/* Hover effect theo màu tương ứng */
.status-tab[data-status='all']:hover:not(.active) {
  color: #2563eb;
}

.status-tab[data-status='incomplete']:hover:not(.active) {
  color: #eab308;
}

.status-tab[data-status='completed']:hover:not(.active) {
  color: #22c55e;
}
</style>
