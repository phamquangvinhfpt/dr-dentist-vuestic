<template>
  <div class="payment-management-container">
    <VaCard class="payment-card">
      <VaCardTitle class="card-title">
        <i class="fas fa-money-bill-wave title-icon"></i>
        {{ t('payment.myPayments') }}
      </VaCardTitle>

      <VaCardContent>
        <div class="flex justify-between mb-4">
          <div class="flex flex-col md:flex-row gap-2">
            <VaInput v-model="searchKeyword" placeholder="Search..." @keyup.enter="handleSearch">
              <template #appendInner>
                <i class="va-icon material-icons">search</i>
              </template>
            </VaInput>

            <div class="date-range-picker flex items-center gap-2 p-2 border rounded">
              <VaInput
                v-model="startDate"
                type="date"
                :max="maxDate"
                class="date-input"
                placeholder="Start Date"
                @update:modelValue="handleDateChange"
              />
              <span class="mx-2 hidden md:block">-</span>
              <VaInput
                v-model="endDate"
                type="date"
                :min="startDate"
                :max="maxDate"
                class="date-input"
                placeholder="End Date"
                @update:modelValue="handleDateChange"
              />
            </div>
          </div>
        </div>

        <!-- Desktop View -->
        <div class="hidden md:block">
          <VaDataTable
            class="my-table va-table--hoverable"
            :items="paginatedPayments"
            :columns="columns"
            hoverable
            :loading="isLoading"
            sticky-header
            no-data-html="<div class='text-center'>No payments found</div>"
          >
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
                <span>{{ !row.rowData.depositDate ? 'N/A' : formatDate(new Date(row.rowData.depositDate)) }}</span>
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

            <template #cell(actions)="{ row }">
              <div class="flex items-center gap-2">
                <VaButton
                  v-tooltip="t('common.view')"
                  icon="visibility"
                  preset="secondary"
                  size="small"
                  class="action-button"
                  @click="router.push(`/payment-detail/${row.rowData.paymentId}`)"
                />
              </div>
            </template>
          </VaDataTable>
        </div>

        <!-- Mobile View -->
        <div class="md:hidden">
          <VaScrollContainer class="max-h-screen" vertical>
            <VaList v-if="paginatedPayments.length > 0" class="space-y-3">
              <VaListItem
                v-for="payment in paginatedPayments"
                :key="payment.paymentId"
                class="rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors payment-list-item"
                @click="router.push(`/payment-detail/${payment.paymentId}`)"
              >
                <VaListItemSection class="flex-1 min-w-0 space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="font-medium truncate">{{ payment.serviceName }}</span>
                    <span :class="getStatusClass(payment.status)" class="text-sm font-medium">
                      {{ getStatusText(payment.status) }}
                    </span>
                  </div>

                  <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <div class="flex items-center justify-between">
                      <span>{{ t('payment.totalAmount') }}:</span>
                      <span class="font-semibold">{{ formatPrice(payment.totalAmount) }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span>{{ t('payment.depositAmount') }}:</span>
                      <span>{{ formatPrice(payment.depositAmount) }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span>{{ t('payment.remainingAmount') }}:</span>
                      <span>{{ formatPrice(payment.remainingAmount) }}</span>
                    </div>
                    <div class="flex items-center justify-between text-xs text-gray-500">
                      <span>{{ t('payment.method') }}:</span>
                      <span>{{ getPaymentMethod(payment.method) }}</span>
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ !payment.depositDate ? 'N/A' : formatDate(new Date(payment.depositDate)) }}
                    </div>
                  </div>
                </VaListItemSection>

                <VaListItemSection icon class="ml-4">
                  <VaIcon name="chevron_right" color="gray" />
                </VaListItemSection>
              </VaListItem>
            </VaList>

            <div v-else class="flex flex-col items-center justify-center py-12">
              <VaIcon name="payments" size="large" color="gray" class="mb-4 text-5xl" />
              <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{{ t('payment.noPayments') }}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 text-center">
                {{ t('payment.noPaymentsDesc') }}
              </p>
            </div>
          </VaScrollContainer>
        </div>

        <VaCardContent>
          <div
            v-if="paymentList.length > 0"
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

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vuestic-ui'
import { usePaymentStore } from '@/stores/modules/payment.module'
import { useAuthStore } from '@/stores/modules/auth.module'
import { PaymentMethod, PaymentStatus } from './types'
import type { PaginationFilter, PaginationResponse, PaymentDTO } from './types'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const { init } = useToast()
const router = useRouter()
const paymentStore = usePaymentStore()
const authStore = useAuthStore()

// State
const formData = reactive<PaginationFilter>({
  pageNumber: 1,
  pageSize: 10,
  orderBy: [],
})

const searchKeyword = ref('')
const currentPage = ref(1)
const startDate = ref(new Date().toISOString().split('T')[0])
const endDate = ref(new Date().toISOString().split('T')[0])
const maxDate = ref(new Date().toISOString().split('T')[0])

const isLoading = computed(() => paymentStore.isLoading)
const paymentListResponse = ref<PaginationResponse<PaymentDTO> | null>(null)
const paymentList = ref<PaymentDTO[]>([])

const filteredPayments = computed(() => {
  if (!paymentList.value || paymentList.value.length === 0) return []

  const query = searchKeyword.value.toLowerCase().trim()
  if (!query) return paymentList.value

  return paymentList.value.filter(
    (payment) =>
      (payment.serviceName?.toLowerCase() || '').includes(query) ||
      (payment.patientCode?.toLowerCase() || '').includes(query) ||
      formatPrice(payment.totalAmount).toLowerCase().includes(query),
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

// Columns
const columns = [
  { key: 'serviceName', label: t('payment.serviceName') },
  { key: 'depositAmount', label: t('payment.depositAmount') },
  { key: 'depositDate', label: t('payment.depositDate') },
  { key: 'remainingAmount', label: t('payment.remainingAmount') },
  { key: 'totalAmount', label: t('payment.totalAmount') },
  { key: 'method', label: t('payment.method') },
  { key: 'status', label: t('payment.status') },
  { key: 'actions', label: '' },
]

// Methods
const getAllPaymentsPagination = async () => {
  try {
    const res = await paymentStore.getPatientPayments(
      {
        pageNumber: currentPage.value,
        pageSize: formData.pageSize,
        orderBy: formData.orderBy,
        keyword: searchKeyword.value,
      },
      startDate.value,
      endDate.value,
    )

    paymentListResponse.value = res
    paymentList.value = res.data
  } catch (error) {
    console.error('Error:', error)
    paymentListResponse.value = null
    paymentList.value = []
    init({
      message: t('common.errorOccurred'),
      color: 'danger',
      duration: 3000,
    })
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
  getAllPaymentsPagination()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  getAllPaymentsPagination()
}

const handlePageSizeChange = (size: number) => {
  formData.pageSize = size
  currentPage.value = 1
  getAllPaymentsPagination()
}

// Helpers
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price)
}

const formatDate = (date: Date | null) => {
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

const getStatusClass = (status: number) => {
  switch (status) {
    case PaymentStatus.Waiting:
      return 'text-blue-500'
    case PaymentStatus.Incomplete:
      return 'text-yellow-500'
    case PaymentStatus.Completed:
      return 'text-green-500'
    case PaymentStatus.Canceled:
      return 'text-red-500'
    case PaymentStatus.Failed:
      return 'text-red-700'
    default:
      return ''
  }
}

// Lifecycle
onMounted(async () => {
  if (!authStore.musHaveRole('Patient')) {
    init({
      message: t('common.unauthorized'),
      color: 'danger',
      duration: 3000,
    })
    router.push({ name: 'dashboard' })
    return
  }
  await getAllPaymentsPagination()
})

watch(
  () => paymentStore.paymentList,
  (newValue) => {
    console.log('Payment store updated:', newValue)
  },
  { deep: true },
)

let searchTimeout: ReturnType<typeof setTimeout>
watch(searchKeyword, (newValue) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    if (!newValue.trim()) {
      getAllPaymentsPagination()
    }
    currentPage.value = 1
  }, 300)
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

.payment-list-item {
  border: 1px solid var(--va-background-border);
  margin-bottom: 0.5rem;
  padding: 1rem;
}

.date-range-picker {
  display: flex;
  align-items: center;
  background: var(--va-background-secondary);
  border-radius: 8px;
  border-color: var(--va-border-color);
}

.date-input {
  width: 130px;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .payment-management-container {
    padding: 16px;
  }

  .card-title {
    font-size: 1.6rem;
    padding: 1.2rem;
  }

  .date-input {
    width: 120px;
  }
}

@media (max-width: 768px) {
  .payment-management-container {
    padding: 12px;
  }

  .card-title {
    font-size: 1.4rem;
    padding: 1rem;
  }

  .date-range-picker {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem;
  }

  .date-input {
    width: 100%;
  }

  .flex.justify-between.mb-4 {
    flex-direction: column;
    gap: 1rem;
  }

  .flex.gap-2 {
    flex-direction: column;
    width: 100%;
  }

  .va-input {
    width: 100%;
  }

  .va-pagination {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 576px) {
  .payment-management-container {
    padding: 8px;
  }

  .payment-card {
    border-radius: 10px;
  }

  .card-title {
    font-size: 1.2rem;
    padding: 0.8rem;
  }

  .title-icon {
    font-size: 1.2rem;
  }

  .va-pagination {
    font-size: 0.9rem;
  }

  .va-pagination :deep(button) {
    min-width: 30px;
    height: 30px;
    padding: 0;
  }
}
</style>
