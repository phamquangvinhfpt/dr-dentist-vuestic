<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useDoctorProfileStore } from '@/stores/modules/doctor.module'
import { useServiceStore } from '@/stores/modules/service.module'
import { useToast, VaCard, VaInnerLoading } from 'vuestic-ui'
import ServiceSelection from './widgets/ServiceSelection.vue'
import DateSelection from './widgets/DateSelection.vue'
import TimeSelection from './widgets/TimeSelection.vue'
import DoctorSelection from './widgets/DoctorSelection.vue'
import { getErrorMessage } from '@/services/utils'
import QrSelection from './widgets/QrSelection.vue'
import SubmitSelection from './widgets/SubmitSelection.vue'
import { useAppointmentStore } from '@/stores/modules/appointment.module'
import { useAuthStore } from '@/stores/modules/auth.module'
import { AppointmentDepositRequest, AppointmentForm } from './types'

const loading = ref(false)
const serviceStore = useServiceStore()
const doctorStore = useDoctorProfileStore()
const appointmentStore = useAppointmentStore()
const userStore = useAuthStore()
const services = ref<any[]>([])
const practitioners = ref<any[]>([])
const selectedService = ref<any | null>(null)
const selectedDate = ref<string | null>(null)
const selectedTime = ref<string | null>(null)
const selectedPractitioner = ref<any | null>(null)
const showDoctorsList = ref(false)
const showQrCode = ref(false)
const doShowModal = ref(false)
const showSuccessModal = ref(false)
const isDoctorSelected = ref(false)
const checkPaymentStatus = ref(false)
const availableTimes = ref<string[]>([])
const qrCodeUrl = computed(() => {
  return `https://api.vietqr.io/image/970422-0942705605-xd2RIRp.jpg?accountName=PHAM%20QUANG%20VINH&amount=${bankInfo.value.amount}&addInfo=${bankInfo.value.description}`
})
const bankInfo = ref<any>({
  bankName: 'MB Bank',
  accountNumber: '0942705605',
  accountHolder: 'PHAM QUANG VINH',
  amount: '',
  description: '',
})
const appointmentDepositRequest = ref<AppointmentDepositRequest>({
  key: '',
  paymentID: '',
  appointmentId: '',
  patientCode: '',
  depositAmount: 0,
  depositTime: '',
  isDeposit: false,
})
const appointmentForm = ref<AppointmentForm>({
  patientId: userStore.user ? userStore.user.id : undefined,
  dentistId: '',
  serviceId: '',
  appointmentDate: '',
  startTime: '',
  duration: '00:30:00',
  type: 1,
})
const isMobile = computed(() => window.innerWidth < 768)
const { init } = useToast()

const handleGetAllCustomerService = async () => {
  loading.value = true
  serviceStore
    .getAllCustomerServices()
    .then((response) => {
      services.value = response.data
    })
    .catch((error) => {
      const message = getErrorMessage(error)
      init({
        title: 'Error',
        message: message,
        color: 'danger',
      })
    })
    .finally(() => {
      loading.value = false
    })
}

const handleGetAllDoctor = async () => {
  loading.value = true
  const requestData = {}
  doctorStore
    .getDoctors(requestData)
    .then(() => {
      practitioners.value = doctorStore.doctors
    })
    .catch((error) => {
      const message = getErrorMessage(error)
      init({
        title: 'Error',
        message: message,
        color: 'danger',
      })
    })
    .finally(() => {
      loading.value = false
    })
}

const handleGetAvailableTimes = async () => {
  loading.value = true
  const requestData = {
    doctorID: selectedPractitioner.value.id,
    date: selectedDate.value,
  }
  doctorStore
    .getAvailableTime(requestData)
    .then((response) => {
      availableTimes.value = response.data.map((item: any) => item.time)
    })
    .catch((error) => {
      const message = getErrorMessage(error)
      init({
        title: 'Error',
        message: message,
        color: 'danger',
      })
    })
    .finally(() => {
      loading.value = false
    })
}

const toggleDoctorsList = () => {
  showDoctorsList.value = !showDoctorsList.value
}

const handleSelectDoctor = (doctor: any) => {
  selectedPractitioner.value = doctor
  console.log('Selected Doctor:', selectedPractitioner.value)
  isDoctorSelected.value = true
  selectedTime.value = null
  showDoctorsList.value = false
  handleGetAvailableTimes()
}

const handleUpdateSelectedTime = (time: string) => {
  selectedTime.value = time
  if (!isDoctorSelected.value) {
    selectedPractitioner.value = null
  } else {
    showDoctorsList.value = false
  }
}

const bookAppointment = () => {
  console.log('show modal', doShowModal.value)
  doShowModal.value = true
  console.log('Booking appointment:', {
    service: selectedService.value,
    date: selectedDate.value,
    time: selectedTime.value,
    practitioner: selectedPractitioner.value,
  })
}

const handleSubmit = async () => {
  try {
    appointmentForm.value.serviceId = selectedService.value.id
    appointmentForm.value.appointmentDate = selectedDate.value?.toString()
    appointmentForm.value.startTime = selectedTime.value
    appointmentForm.value.dentistId = selectedPractitioner.value ? selectedPractitioner.value.id : null
    await saveBookingData(appointmentForm.value)
    doShowModal.value = false
  } catch (error) {
    console.error('Error saving booking:', error)
  }
}

const saveBookingData = async (data: any) => {
  loading.value = true
  checkPaymentStatus.value = true
  appointmentStore
    .createAppointment(data)
    .then((response) => {
      appointmentDepositRequest.value = response.data
      console.log('Appointment deposit request:', appointmentDepositRequest.value)
      bankInfo.value.amount = appointmentDepositRequest.value.depositAmount
      bankInfo.value.description = appointmentDepositRequest.value.patientCode
      showQrCode.value = true
    })
    .catch((error) => {
      const message = getErrorMessage(error)
      init({
        title: 'Error',
        message: message,
        color: 'danger',
      })
    })
    .finally(() => {
      loading.value = false
    })
}

const handleShowQrCode = (show: boolean) => {
  showQrCode.value = show
}

const handleCloseSubmit = () => {
  doShowModal.value = false
}

const receiveNotification = (type: string, notification: any) => {
  console.log('Received notification:', type, notification)
  showQrCode.value = false
  showSuccessModal.value = true
  checkPaymentStatus.value = false
}

const handleCloseSuccessModal = () => {
  console.log('Close success modal')
  showSuccessModal.value = false
  console.log('Show success modal:', showSuccessModal.value)
}

watch([selectedService, selectedDate, selectedTime], ([newService, newDate, newTime]) => {
  if (newService && newDate && newTime) {
    showDoctorsList.value = false
  }
})

onMounted(() => {
  handleGetAllCustomerService()
  handleGetAllDoctor()
})

defineExpose({
  receiveNotification,
})
</script>
<template>
  <VaInnerLoading :loading="loading">
    <VaCard>
      <div class="min-h-screen bg-white dark:bg-gray-900">
        <div class="mx-auto max-w-4xl p-6">
          <div class="relative overflow-hidden rounded-t-xl bg-emerald-400 py-16 text-center shadow-xl mb-8">
            <h1 class="text-3xl font-bold text-white md:text-5xl">Book an appointment</h1>
            <p class="mt-4 text-lg text-white">Get an appointment with our experienced professionals</p>
            <img
              class="absolute top-0 left-0 -z-10 h-full w-full object-cover"
              src="https://images.unsplash.com/photo-1504672281656-e4981d70414b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
              alt=""
            />
          </div>

          <div class="space-y-8">
            <ServiceSelection v-model:selectedService="selectedService" :services="services" />

            <DateSelection v-if="selectedService" v-model:selectedDate="selectedDate" />

            <TimeSelection
              v-if="selectedDate"
              v-model:selectedTime="selectedTime"
              :is-doctor-selected="isDoctorSelected"
              :available-times="availableTimes"
              @update:selectedTime="handleUpdateSelectedTime"
            />

            <div v-if="selectedService && selectedDate">
              <button
                v-if="selectedTime || showDoctorsList"
                class="w-full border border-dashed border-emerald-500 bg-white text-emerald-600 px-4 py-2 rounded-lg mb-4 hover:bg-emerald-50 transition-colors"
                @click="toggleDoctorsList"
              >
                {{ showDoctorsList ? 'Hide Doctors List' : 'Book Doctor?' }}
              </button>

              <DoctorSelection
                v-if="showDoctorsList"
                v-model:selectedPractitioner="selectedPractitioner"
                :practitioners="practitioners"
                @practitionerSelected="handleSelectDoctor"
              />
            </div>

            <div v-if="selectedPractitioner" class="mt-4">
              <button
                class="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                @click="toggleDoctorsList"
              >
                <span>Selected Doctor: {{ selectedPractitioner.firstName }} {{ selectedPractitioner.lastName }}</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <button
              v-if="selectedService && selectedDate && selectedTime"
              class="mt-8 w-full sm:w-56 rounded-full border-8 border-emerald-500 bg-emerald-600 px-10 py-4 text-lg font-bold text-white transition hover:translate-y-1 dark:border-emerald-700 dark:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!selectedService || !selectedDate || !selectedTime"
              @click="bookAppointment"
            >
              Book Now
            </button>

            <SubmitSelection
              v-model:is-visible="doShowModal"
              :selected-service="selectedService"
              :selected-date="selectedDate"
              :selected-time="selectedTime"
              :selected-practitioner="selectedPractitioner"
              @submit="handleSubmit"
            />
            <QrSelection
              v-model:show-success-modal="showSuccessModal"
              :bank-info="bankInfo"
              :qr-code-url="qrCodeUrl"
              :show-qr-code="showQrCode"
              :is-mobile="isMobile"
              @update:showQrCode="handleShowQrCode"
              @update:closeSubmit="handleCloseSubmit"
            />
          </div>
        </div>
      </div>

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
            <h4 class="text-xl text-gray-800 font-semibold mt-4">Đặt khám thành công!</h4>
            <p className="text-sm text-gray-600 leading-relaxed mt-4">
              Cảm ơn bạn đã đặt lịch khám. Chúng tôi đã nhận được khoản đặt cọc giữ chỗ của bạn. Vui lòng kiểm tra email
              để xem chi tiết cuộc hẹn và hướng dẫn tiếp theo.
            </p>
          </div>

          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Lưu ý quan trọng:</strong>
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>Vui lòng đến trước giờ hẹn 15 phút để làm thủ tục</li>
              <li>Mang theo giấy tờ tùy thân và thẻ bảo hiểm y tế (nếu có)</li>
              <li>Khoản đặt cọc sẽ được trừ vào tổng chi phí khám</li>
            </ul>
          </div>

          <button
            type="button"
            class="px-5 py-2.5 mt-6 w-full rounded-lg text-white text-sm border-none outline-none bg-gray-800 hover:bg-gray-700"
            @click="handleCloseSuccessModal"
          >
            Got it
          </button>
        </div>
      </div>
    </VaCard>
  </VaInnerLoading>
</template>
<style scoped>
.scroll {
  scrollbar-width: none;
}
</style>
