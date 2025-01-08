<template>
  <div class="payment-detail-container">
    <div class="payment-card">
      <div class="card-title">
        <button class="back-button" @click="router.back()">
          <i class="fas fa-arrow-left"></i>
        </button>
        <div class="success-text">{{ t('payment.paymentDetails') }}</div>
      </div>

      <div v-if="paymentDetail">
        <!-- Amount Section -->
        <div class="info-section">
          <div class="info-item">
            <span class="amount-label">{{ t('payment.amount') }}</span>
            <span class="amount">{{ formatPrice(paymentDetail.totalAmount) }}</span>
          </div>
        </div>

        <!-- Transaction Details -->
        <div class="info-section">
          <div class="info-grid">
            <div class="info-item">
              <span class="label">{{ t('payment.patientName') }}</span>
              <span>{{ paymentDetail.patientName }}</span>
            </div>
            <div class="info-item">
              <span class="label">{{ t('payment.patientCode') }}</span>
              <span>{{ paymentDetail.patientCode }}</span>
            </div>
            <div class="info-item">
              <span class="label">{{ t('payment.serviceName') }}</span>
              <span>{{ paymentDetail.serviceName }}</span>
            </div>
            <div class="info-item">
              <span class="label">{{ t('payment.depositDate') }}</span>
              <span>{{ formatDate(paymentDetail.depositDate) }}</span>
            </div>
            <div class="info-item">
              <span class="label">{{ t('payment.status') }}</span>
              <span :class="getStatusClass(paymentDetail.status)">
                {{ t(`payment.status${getStatusText(paymentDetail.status)}`) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Procedures Table -->
        <div v-if="paymentDetail?.details && paymentDetail.details.length > 0" class="info-section">
          <div class="section-title">{{ t('payment.procedures') }}</div>
          <VaDataTable :items="paymentDetail.details" :columns="procedureColumns" class="my-table">
            <template #cell(paymentAmount)="{ row }">
              {{ formatPrice(row.rowData.paymentAmount) }}
            </template>
            <template #cell(paymentStatus)="{ row }">
              <span :class="getStatusClass(row.rowData.paymentStatus)">
                {{ t(`payment.status${getStatusText(row.rowData.paymentStatus)}`) }}
              </span>
            </template>
          </VaDataTable>
        </div>
      </div>

      <div v-else-if="isLoading" class="text-center py-8">
        <VaSkeleton />
      </div>

      <div v-else class="text-center py-8">
        {{ t('payment.noPaymentFound') }}
      </div>
    </div>
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
  position: relative;
}

.payment-card {
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  background: var(--va-background-secondary);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  position: relative;
}

.back-button {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: #f8f9fa;
  border: none;
  color: #9d72ff;
  font-size: 22px;
  padding: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;
  border-radius: 50%;
  width: 42px;
  height: 42px;
  box-shadow: 0 2px 8px rgba(157, 114, 255, 0.15);
}

.back-button::before {
  content: '←';
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
  font-weight: 600;
}

.back-button:hover {
  background: #fff;
  box-shadow: 0 4px 12px rgba(157, 114, 255, 0.25);
  transform: translateY(-52%);
}

.back-button:active {
  transform: translateY(-50%) scale(0.95);
  box-shadow: 0 2px 4px rgba(157, 114, 255, 0.15);
}

.back-button i {
  display: none;
}

.success-text {
  flex: 1;
  text-align: center;
  color: #1a1a1a;
  font-size: 18px;
  font-weight: 600;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--va-text-primary);
}

.info-section {
  background: var(--va-background-secondary);
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

/* Mobile Responsive */
@media (max-width: 768px) {
  .payment-detail-container {
    padding: 0;
    background: #9d72ff;
    min-height: 100vh;
  }

  .payment-card {
    margin: 16px;
    background: #fff;
    border-radius: 16px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }

  .card-title {
    padding: 20px;
    text-align: center;
    border-bottom: none;
    position: relative;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .back-button {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: #f3f0ff;
    border: none;
    color: #9d72ff;
    font-size: 18px;
    padding: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    z-index: 10;
    box-shadow: 0 2px 8px rgba(157, 114, 255, 0.15);
  }

  .back-button::before {
    content: '←';
    font-family:
      system-ui,
      -apple-system,
      sans-serif;
    font-weight: 600;
  }

  .back-button:hover {
    background: #e3d4ff;
  }

  .back-button:active {
    transform: translateY(-50%) scale(0.95);
  }

  .back-button i {
    display: none;
  }

  .success-text {
    color: #9d72ff;
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0 auto;
  }

  .info-section {
    margin: 0;
    padding: 20px;
    background: #fff;
    border-bottom: 1px solid #eee;
  }

  .info-section:last-child {
    border-bottom: none;
  }

  .section-title {
    font-size: 14px;
    color: #666;
    margin-bottom: 16px;
    font-weight: 600;
  }

  .info-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .label {
    font-size: 13px;
    color: #666;
  }

  .info-item span:not(.label) {
    font-size: 15px;
    color: #000;
    font-weight: 500;
  }

  /* Special styling for amount */
  .info-item span[style*='currency'] {
    color: #9d72ff;
    font-size: 24px;
    font-weight: 700;
  }

  /* Reference number styling */
  .reference-number {
    text-align: center;
    padding: 16px;
    background: #f8f8f8;
    margin: 16px 0;
  }

  .reference-number .label {
    color: #666;
    margin-bottom: 8px;
  }

  .reference-number .value {
    font-size: 20px;
    font-weight: 600;
    color: #000;
  }

  /* Action buttons */
  .action-buttons {
    display: none;
  }

  /* Status badges */
  .text-blue-500,
  .text-yellow-500,
  .text-green-500,
  .text-red-500,
  .text-red-700 {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 500;
    text-align: center;
  }

  .text-green-500 {
    background: #f3f0ff;
    color: #9d72ff;
  }

  .text-red-500,
  .text-red-700 {
    background: #fee;
    color: #d32f2f;
  }

  .text-yellow-500 {
    background: #fff8e1;
    color: #ffa000;
  }

  .text-blue-500 {
    background: #e3f2fd;
    color: #1976d2;
  }

  /* Table styles */
  .my-table {
    margin: 0;
    width: 100%;
    border-collapse: collapse;
  }

  .my-table :deep(th) {
    padding: 12px 16px;
    text-align: left;
    background: #f8f8f8;
    font-size: 13px;
    color: #666;
    font-weight: 600;
  }

  .my-table :deep(td) {
    padding: 12px 16px;
    border-bottom: 1px solid #eee;
    font-size: 14px;
    color: #000;
  }

  /* New Transaction Button */
  .new-transaction {
    display: none;
  }
}

/* Special styling for amount section */
.info-section:first-of-type {
  background: linear-gradient(145deg, rgba(157, 114, 255, 0.05), rgba(157, 114, 255, 0.02));
  text-align: center;
  padding: 32px 20px;
  border-bottom: 1px solid rgba(157, 114, 255, 0.1);
  position: relative;
  overflow: hidden;
  margin-bottom: 0;
}

/* Decorative patterns */
.info-section:first-of-type::before,
.info-section:first-of-type::after {
  content: '';
  position: absolute;
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, rgba(0, 161, 156, 0.05) 0%, transparent 70%);
  border-radius: 50%;
  z-index: 0;
}

.info-section:first-of-type::before {
  top: -100px;
  left: -100px;
  transform: rotate(-45deg);
}

.info-section:first-of-type::after {
  bottom: -100px;
  right: -100px;
  transform: rotate(135deg);
}

/* Side decorations */
.info-section:first-of-type .info-item::after,
.info-section:first-of-type .info-item::before {
  content: '';
  position: absolute;
  width: 60px;
  height: 2px;
  background: repeating-linear-gradient(
    90deg,
    rgba(157, 114, 255, 0.2),
    rgba(157, 114, 255, 0.2) 4px,
    transparent 4px,
    transparent 8px
  );
}

.info-section:first-of-type .info-item::after {
  right: 20px;
  top: 50%;
}

.info-section:first-of-type .info-item::before {
  left: 20px;
  top: 50%;
}

.info-section:first-of-type .info-item {
  justify-content: center;
  flex-direction: column;
  gap: 12px;
  position: relative;
  z-index: 1;
  padding: 0 40px;
}

/* Amount label */
.info-section:first-of-type .amount-label {
  font-size: 14px;
  color: #9d72ff;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  display: inline-block;
  padding: 0 15px;
}

.info-section:first-of-type .amount-label::before,
.info-section:first-of-type .amount-label::after {
  content: '•';
  color: #9d72ff;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

.info-section:first-of-type .amount-label::before {
  left: 0;
}

.info-section:first-of-type .amount-label::after {
  right: 0;
}

/* Amount value */
.info-item span[style*='currency'] {
  color: #9d72ff;
  font-size: 36px;
  font-weight: 700;
  letter-spacing: 0.5px;
  line-height: 1.2;
  display: block;
  text-shadow: 2px 2px 0 rgba(157, 114, 255, 0.1);
  position: relative;
  padding: 8px 0;
}

.info-item span[style*='currency']::before {
  content: '';
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 0;
  width: 80px;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(157, 114, 255, 0.2) 20%,
    rgba(157, 114, 255, 0.2) 80%,
    transparent 100%
  );
}

.info-item span[style*='currency']::after {
  content: 'VND';
  font-size: 14px;
  color: #666;
  margin-left: 4px;
  font-weight: 500;
  text-shadow: none;
  vertical-align: top;
  position: relative;
  top: 2px;
}

/* Remove reference number styles */
.reference-number {
  display: none;
}
</style>
