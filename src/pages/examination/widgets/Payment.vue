<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTreatmentStore } from '@/stores/modules/treatment.module'
import { useToast, VaInnerLoading, VaCard, VaButton, VaRadio, VaDivider, VaDataTable } from 'vuestic-ui'
import { PaymentDetailResponse, PaymentMethod } from '../types'
import { generateQRCode, getErrorMessage } from '@/services/utils'
import QrSelection from '@/pages/appointment/widgets/create-appointment/QrSelection.vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

// const for payment
const router = useRoute()
const appointmentId = router.params.id as string
const showQrCode = ref(false)
const bankInfo = ref<any>({
  bankName: 'Vietcombank',
  accountNo: '1017044309',
  accountName: 'PHAM QUANG VINH',
  acqId: 970436,
  amount: '',
  addInfo: '',
})
const qrCodeUrl = ref<string>('')
const showSuccessModal = ref(false)
const isMobile = computed(() => window.innerWidth < 768)
const result = ref(false)
const loading = ref(false)
const { init } = useToast()
const { t } = useI18n()
const storeTreatment = useTreatmentStore()
const paymentDetailResponse = ref<PaymentDetailResponse>()
const selectedPaymentMethod = ref<PaymentMethod>(PaymentMethod.None)

const getRemainingAppointment = () => {
  loading.value = true
  storeTreatment
    .getRemainingAppointment(appointmentId)
    .then((response) => {
      paymentDetailResponse.value = response
      console.log(paymentDetailResponse.value)
    })
    .catch((error) => {
      const errorMessage = getErrorMessage(error)
      init({
        message: errorMessage,
        color: 'danger',
        title: 'Error',
      })
    })
    .finally(() => {
      loading.value = false
    })
}

const totalAmount = computed(() => {
  return paymentDetailResponse.value?.paymentResponse.totalAmount || 0
})

const formatCurrency = (value: number | string) => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(numValue)
}

const paymentDetailsColumns = computed(() => [
  { key: 'procedureName', label: t('payment.procedure_name') },
  { key: 'paymentAmount', label: t('payment.amount') },
])

const confirmPayment = () => {
  if (selectedPaymentMethod.value === PaymentMethod.None) {
    init({
      message: t('payment.none_select_method'),
      color: 'warning',
      title: 'Warning',
    })
    return
  } else if (selectedPaymentMethod.value === PaymentMethod.Cash) {
    loading.value = true
    const request = {
      paymentID: paymentDetailResponse.value?.paymentResponse.paymentId,
      appointmentId: appointmentId,
      patientCode: paymentDetailResponse.value?.paymentResponse.patientCode,
      amount: paymentDetailResponse.value?.paymentResponse.remainingAmount,
      method: PaymentMethod.Cash,
      isPay: true,
    }
    storeTreatment
      .sendPayment(request)
      .then(() => {
        init({
          message: t('payment.payment_success'),
          color: 'success',
          title: 'Success',
        })
        getRemainingAppointment()
      })
      .catch((error) => {
        const errorMessage = getErrorMessage(error)
        init({
          message: errorMessage,
          color: 'danger',
          title: 'Error',
        })
      })
      .finally(() => {
        loading.value = false
      })
  } else if (selectedPaymentMethod.value === PaymentMethod.BankTransfer) {
    loading.value = true
    const request = {
      paymentID: paymentDetailResponse.value?.paymentResponse.paymentId,
      appointmentId: appointmentId,
      patientCode: paymentDetailResponse.value?.paymentResponse.patientCode,
      amount: paymentDetailResponse.value?.paymentResponse.remainingAmount,
      method: PaymentMethod.BankTransfer,
      isPay: false,
      time: '00:10:00',
    }
    storeTreatment
      .sendPayment(request)
      .then(() => {
        init({
          message: t('payment.scan_qr_code'),
          color: 'success',
          title: 'Success',
        })
        showQrCode.value = true
        bankInfo.value.amount = paymentDetailResponse.value?.paymentResponse.remainingAmount
        bankInfo.value.description = paymentDetailResponse.value?.paymentResponse.patientCode
        generateQRCode(
          bankInfo.value.accountNo,
          bankInfo.value.accountName,
          bankInfo.value.acqId,
          bankInfo.value.amount,
          bankInfo.value.addInfo,
        ).then((url) => {
          qrCodeUrl.value = url
        })
      })
      .catch((error) => {
        const errorMessage = getErrorMessage(error)
        init({
          message: errorMessage,
          color: 'danger',
          title: 'Error',
        })
      })
      .finally(() => {
        loading.value = false
      })
  }
}

const handleShowQrCode = (show: boolean) => {
  showQrCode.value = show
}

const handleCloseSubmit = () => {
  showQrCode.value = false
}

const handleCloseSuccessModal = () => {
  showSuccessModal.value = false
}

const receiveNotification = (type: string, notification: any) => {
  console.log('Received paid notification:', type, notification)
  if (type === 'Payment') {
    showQrCode.value = false
    showSuccessModal.value = true
    result.value = true
  }
}

onMounted(() => {
  getRemainingAppointment()
})

defineExpose({
  receiveNotification,
})
</script>

<template>
  <div class="container mx-auto max-w-5xl px-4 m-10">
    <VaInnerLoading :loading="loading">
      <VaCard v-if="paymentDetailResponse" class="w-full p-4">
        <h2 class="text-2xl font-bold mb-4 text-center">{{ t('payment.payment_bill') }}</h2>

        <div class="mb-4">
          <strong>{{ t('payment.patient') }}:</strong> {{ paymentDetailResponse.paymentResponse.patientName }} ({{
            paymentDetailResponse.paymentResponse.patientCode
          }})
        </div>

        <div class="mb-4">
          <strong>{{ t('payment.service') }}:</strong> {{ paymentDetailResponse.paymentResponse.serviceName }}
        </div>

        <VaDivider />

        <h3 class="text-xl font-semibold my-4">{{ t('payment.payment_detail') }}</h3>

        <VaDataTable :columns="paymentDetailsColumns" :items="paymentDetailResponse.details" striped hoverable>
          <template #cell(paymentAmount)="{ value }">
            {{ formatCurrency(Number(value)) }}
          </template>
        </VaDataTable>

        <VaDivider />

        <div class="mt-4 grid grid-rows-3 text-right">
          <div>
            <strong>{{ t('payment.total_amount') }}:</strong> {{ formatCurrency(Number(totalAmount)) }}
          </div>
          <div>
            <strong>{{ t('payment.deposit_amount') }}:</strong>
            {{ formatCurrency(Number(paymentDetailResponse.paymentResponse.depositAmount)) }}
          </div>
          <VaDivider />
          <div>
            <strong>{{ t('payment.remaining_amount') }}:</strong>
            {{ formatCurrency(Number(paymentDetailResponse.paymentResponse.remainingAmount)) }}
          </div>
        </div>

        <VaDivider />

        <h3 class="text-xl font-semibold my-4 flex justify-end">{{ t('payment.payment_method') }}</h3>

        <div class="mb-4 flex justify-end">
          <div>
            <VaRadio v-model="selectedPaymentMethod" :option="PaymentMethod.Cash" :label="t('payment.cash')" />
            <VaRadio
              v-model="selectedPaymentMethod"
              :option="PaymentMethod.BankTransfer"
              :label="t('payment.bankTransfer')"
            />
          </div>
        </div>

        <div class="flex justify-end items-center mt-4">
          <VaButton color="success" @click="confirmPayment">{{ t('payment.confirm_payment') }}</VaButton>
        </div>
      </VaCard>
      <QrSelection
        v-model:show-success-modal="showSuccessModal"
        v-model:success="result"
        :bank-info="bankInfo"
        :qr-code-url="qrCodeUrl"
        :show-qr-code="showQrCode"
        :is-mobile="isMobile"
        :final-payment="true"
        @update:showQrCode="handleShowQrCode"
        @update:closeSubmit="handleCloseSubmit"
      />
      <div
        v-if="showSuccessModal"
        class="fixed inset-0 p-4 flex flex-wrap justify-center items-center w-full h-full z-[1000] before:fixed before:inset-0 before:w-full before:h-full before:bg-[rgba(0,0,0,0.5)] overflow-auto font-[sans-serif]"
      >
        <div class="w-full max-w-lg bg-white shadow-lg rounded-lg p-6 relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-3.5 cursor-pointer shrink-0 fill-gray-400 hover:fill-red-500 float-right"
            viewBox="0 0 320.591 320.591"
            @click="handleCloseSuccessModal"
          >
            <path
              d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z"
              data-original="#000000"
            ></path>
            <path
              d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z"
              data-original="#000000"
            ></path>
          </svg>

          <div class="my-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-14 shrink-0 fill-green-500 inline" viewBox="0 0 512 512">
              <path
                d="M383.841 171.838c-7.881-8.31-21.02-8.676-29.343-.775L221.987 296.732l-63.204-64.893c-8.005-8.213-21.13-8.393-29.35-.387-8.213 7.998-8.386 21.137-.388 29.35l77.492 79.561a20.687 20.687 0 0 0 14.869 6.275 20.744 20.744 0 0 0 14.288-5.694l147.373-139.762c8.316-7.888 8.668-21.027.774-29.344z"
                data-original="#000000"
              />
              <path
                d="M256 0C114.84 0 0 114.84 0 256s114.84 256 256 256 256-114.84 256-256S397.16 0 256 0zm0 470.487c-118.265 0-214.487-96.214-214.487-214.487 0-118.265 96.221-214.487 214.487-214.487 118.272 0 214.487 96.221 214.487 214.487 0 118.272-96.215 214.487-214.487 214.487z"
                data-original="#000000"
              />
            </svg>
            <h4 class="text-xl text-gray-800 font-semibold mt-4">{{ t('payment.payment_success') }}!</h4>
            <p className="text-sm text-gray-600 leading-relaxed mt-4">
              {{ t('payment.tks') }}
            </p>
          </div>

          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              <strong>{{ t('payment.warning') }}:</strong>
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>{{ t('payment.tks') }}</li>
              <li>{{ t('payment.tks') }}</li>
              <li>{{ t('payment.tks') }}</li>
            </ul>
          </div>

          <a
            type="button"
            class="px-5 py-2.5 mt-6 text-center w-full rounded-lg text-white text-sm border-none outline-none bg-gray-800 hover:bg-gray-700"
            href="/appointment"
          >
            Đóng
          </a>
        </div>
      </div>
    </VaInnerLoading>
  </div>
</template>
