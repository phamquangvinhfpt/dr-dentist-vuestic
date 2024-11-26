<template>
  <div class="flex justify-between mb-4">
    <div class="flex gap-2">
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
        <span class="mx-2">-</span>
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

  <VaDataTable
    class="my-table va-table--hoverable"
    :items="paymentList"
    :columns="columns"
    hoverable
    :loading="isLoading"
    :disable-client-side-sorting="false"
    :style="{
      '--va-data-table-thead-background': 'var(--va-background-element)',
      '--va-data-table-grid-tr-border': '1px solid var(--va-background-border)',
    }"
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
    <div v-if="paymentList.length > 0" class="flex flex-col-reverse md:flex-row gap-2 justify-between items-center p-2">
      <div>
        <b>{{ paymentListResponse?.totalCount ?? 0 }} {{ t('common.result') }}.</b>
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

const totalPages = computed(() => {
  return paymentListResponse.value?.totalPages ?? 1
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

const getAllPaymentsPagination = async () => {
  try {
    const res = await paymentStore.getAllPayments(
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

    console.log('Processed Response:', {
      data: paymentList.value,
      totalCount: res.totalCount,
      totalPages: res.totalPages,
      currentPage: res.currentPage,
    })
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

const handlePageChange = (page: number) => {
  currentPage.value = page
  getAllPaymentsPagination()
}

const handlePageSizeChange = (size: number) => {
  formData.pageSize = size
  currentPage.value = 1
  getAllPaymentsPagination()
}

const handleSearch = () => {
  currentPage.value = 1
  getAllPaymentsPagination()
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

watch(
  () => paymentStore.paymentList,
  (newValue) => {
    console.log('Payment store updated:', newValue)
    console.log('Computed paymentList:', paymentList.value)
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
.va-table-responsive {
  overflow: auto;
}

.flex {
  display: flex;
}

.gap-2 {
  gap: 0.5rem;
}

.justify-end {
  justify-content: flex-end;
}

.date-range-picker {
  background-color: var(--va-background-element);
  border-color: var(--va-background-border);
}

.date-input {
  width: 140px;
}

.items-center {
  align-items: center;
}

.border {
  border-width: 1px;
}

.rounded {
  border-radius: 0.25rem;
}

.mx-2 {
  margin-left: 0.5rem;
  margin-right: 0.5rem;
}

.p-2 {
  padding: 0.5rem;
}
</style>
