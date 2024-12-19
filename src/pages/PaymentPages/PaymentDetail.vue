<template>
  <div class="payment-detail-container">
    <VaCard class="payment-card">
      <VaCardTitle class="card-title">
        <div class="flex items-center gap-4">
          <VaButton icon="arrow_back" preset="secondary" @click="router.back()" />
          <div>
            <i class="fas fa-file-invoice-dollar title-icon"></i>
            {{ t('payment.paymentDetail') }}
          </div>
        </div>
      </VaCardTitle>

      <VaCardContent v-if="paymentDetail">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- Patient Information -->
          <div class="info-section">
            <h3 class="section-title">{{ t('payment.patientInfo') }}</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">{{ t('payment.patientName') }}:</span>
                <span>{{ paymentDetail.patientName }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ t('payment.patientCode') }}:</span>
                <span>{{ paymentDetail.patientCode }}</span>
              </div>
            </div>
          </div>

          <!-- Service Information -->
          <div class="info-section">
            <h3 class="section-title">{{ t('payment.serviceInfo') }}</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">{{ t('payment.serviceName') }}:</span>
                <span>{{ paymentDetail.serviceName }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ t('payment.totalAmount') }}:</span>
                <span>{{ formatPrice(paymentDetail.totalAmount) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment Information -->
        <div class="info-section mb-6">
          <h3 class="section-title">{{ t('payment.paymentInfo') }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="info-item">
              <span class="label">{{ t('payment.depositAmount') }}:</span>
              <span>{{ formatPrice(paymentDetail.depositAmount) }}</span>
            </div>
            <div class="info-item">
              <span class="label">{{ t('payment.depositDate') }}:</span>
              <span>{{ formatDate(paymentDetail.depositDate) }}</span>
            </div>
            <div class="info-item">
              <span class="label">{{ t('payment.remainingAmount') }}:</span>
              <span>{{ formatPrice(paymentDetail.remainingAmount) }}</span>
            </div>
            <!-- <div class="info-item">
              <span class="label">{{ t('payment.method') }}:</span>
              <span>{{ getPaymentMethod(paymentDetail.method) }}</span>
            </div> -->
            <div class="info-item">
              <span class="label">{{ t('payment.status') }}:</span>
              <span :class="getStatusClass(paymentDetail.status)">
                {{ getStatusText(paymentDetail.status) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Procedures Table -->
        <div class="info-section">
          <h3 class="section-title">{{ t('payment.procedures') }}</h3>
          <VaDataTable
            v-if="paymentDetail?.details && paymentDetail.details.length > 0"
            :items="paymentDetail.details"
            :columns="procedureColumns"
            class="my-table va-table--hoverable"
            hoverable
          >
            <template #cell(paymentAmount)="{ row }">
              {{ formatPrice(row.rowData.paymentAmount) }}
            </template>
            <template #cell(paymentStatus)="{ row }">
              <span :class="getStatusClass(row.rowData.paymentStatus)">
                {{ getStatusText(row.rowData.paymentStatus) }}
              </span>
            </template>
          </VaDataTable>
          <div v-else class="text-center py-4">
            {{ t('payment.noProcedures') }}
          </div>
        </div>
      </VaCardContent>

      <VaCardContent v-else-if="isLoading" class="text-center py-8">
        <VaSkeleton />
      </VaCardContent>

      <VaCardContent v-else class="text-center py-8">
        {{ t('payment.noPaymentFound') }}
      </VaCardContent>
    </VaCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vuestic-ui'
import { usePaymentStore } from '@/stores/modules/payment.module'
import { useAuthStore } from '@/stores/modules/auth.module'
import { PaymentStatus } from './types'
import type { PaymentDetailResponse } from './types'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { init } = useToast()
const paymentStore = usePaymentStore()
const authStore = useAuthStore()

const paymentDetail = ref<PaymentDetailResponse['data']['paymentResponse'] | null>(null)
const isLoading = ref(false)

const procedureColumns = [
  { key: 'procedureName', label: t('payment.procedureName') },
  { key: 'paymentAmount', label: t('payment.amount') },
  { key: 'paymentStatus', label: t('payment.status') },
]

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price)
}

const formatDate = (date: string | null) => {
  if (!date) return t('payment.notDeposited')
  try {
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return t('payment.notDeposited')

    return dateObj.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  } catch {
    return t('payment.notDeposited')
  }
}

// const getPaymentMethod = (method: number) => {
//   switch (method) {
//     case PaymentMethod.None:
//       return 'None'
//     case PaymentMethod.Cash:
//       return 'Cash'
//     case PaymentMethod.BankTransfer:
//       return 'Bank Transfer'
//     default:
//       return 'Unknown'
//   }
// }

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

  const paymentId = route.params.id as string
  if (!paymentId) {
    init({
      message: t('payment.invalidPaymentId'),
      color: 'danger',
      duration: 3000,
    })
    router.back()
    return
  }

  try {
    isLoading.value = true
    console.log('Fetching payment detail for ID:', paymentId)
    const response = await paymentStore.getPaymentDetail(paymentId)
    console.log('Raw API Response:', response)
    console.log('Payment Response:', response?.data?.paymentResponse)
    console.log('Deposit Date from API:', response?.data?.paymentResponse?.depositDate)

    if (response?.data?.paymentResponse) {
      console.log('Payment Response Data:', response.data.paymentResponse)
      console.log('Deposit Date:', response.data.paymentResponse.depositDate)
      paymentDetail.value = response.data.paymentResponse
    } else {
      console.error('Invalid response structure:', response)
      throw new Error('Invalid response format')
    }
  } catch (error) {
    console.error('Error fetching payment detail:', error)
    init({
      message: t('common.errorOccurred'),
      color: 'danger',
      duration: 3000,
    })
    router.back()
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.payment-detail-container {
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
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--va-text-primary);
}

.info-section {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 8px;
}

.info-grid {
  display: grid;
  gap: 1rem;
}

.info-item {
  display: flex;
  gap: 0.5rem;
}

.label {
  font-weight: 500;
  color: var(--va-text-secondary);
}

.title-icon {
  margin-right: 0.5rem;
}
</style>
