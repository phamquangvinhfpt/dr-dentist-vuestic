<template>
  <VaCard class="payment-export-card">
    <VaCardTitle>
      <div class="title-section">
        <i class="fas fa-file-export title-icon"></i>
        <span>Export Payment History</span>
      </div>
    </VaCardTitle>

    <VaCardContent>
      <div class="export-form">
        <!-- Patient Selection -->
        <div class="form-section">
          <div class="section-header">
            <i class="fas fa-user-circle section-icon"></i>
            <h3>Patient Information</h3>
          </div>
          <VaSelect
            v-model="selectedPatientId"
            :options="patientOptions"
            text-by="text"
            value-by="value"
            label-by="label"
            placeholder="Select patient"
            :error="patientError"
            :error-messages="patientError ? 'Please select a patient' : ''"
            class="patient-select"
            @update:modelValue="onPatientSelect"
          />
        </div>

        <!-- Date Range Selection -->
        <div class="form-section">
          <div class="section-header">
            <i class="fas fa-calendar-alt section-icon"></i>
            <h3>Date Range</h3>
          </div>
          <div class="date-range">
            <div class="date-input">
              <label>Start Date</label>
              <VaInput
                v-model="startDate"
                type="date"
                placeholder="Start date"
                :error="startDateError"
                :error-messages="startDateError ? 'Start date is required' : ''"
              />
            </div>
            <div class="date-input">
              <label>End Date</label>
              <VaInput
                v-model="endDate"
                type="date"
                placeholder="End date"
                :error="endDateError"
                :error-messages="endDateError ? 'End date is required' : ''"
              />
            </div>
          </div>
        </div>

        <!-- Export Button -->
        <div class="export-button-section">
          <VaButton preset="primary" :loading="isLoading" size="large" class="export-button" @click="handleExport">
            <i class="fas fa-file-excel button-icon"></i>
            Export to Excel
          </VaButton>
        </div>
      </div>
    </VaCardContent>
  </VaCard>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { usePaymentStore } from '@/stores/modules/payment.module'
import { storeToRefs } from 'pinia'
import { useToast } from 'vuestic-ui'
import dayjs from 'dayjs'
import userService from '@/services/user.service'
import type { PatientDTO } from '@/pages/PaymentPages/types'
import apiService from '@/services/api.service'

const { init } = useToast()
const paymentStore = usePaymentStore()
const { exportLoading: isLoading } = storeToRefs(paymentStore)

const startDate = ref('')
const endDate = ref('')
const selectedPatientId = ref('')
const patients = ref<PatientDTO[]>([])
const maxDate = ref(new Date().toISOString().split('T')[0])

// Lưu trữ thông tin chi tiết của patient được chọn
// const selectedPatient = computed(() => {
//   const patient = patients.value.find(patient => patient.id === selectedPatientId.value)
//   console.log('Selected patient computed:', patient)
//   return patient
// })

const patientOptions = computed(() => {
  return patients.value.map((patient) => ({
    value: patient.id,
    text: patient.fullName,
    label: patient.fullName,
  }))
})

const onPatientSelect = (value: any) => {
  console.log('Raw selected value:', value)
  selectedPatientId.value = value
  const patient = patients.value.find((p) => p.id === value)
  console.log('Found patient:', patient)
}

const startDateError = computed(() => startDate.value === '')
const endDateError = computed(() => endDate.value === '')
const patientError = computed(() => selectedPatientId.value === '')

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD')
}

const loadPatients = async () => {
  try {
    console.log('Loading patients...')
    const response = await userService.getAllPatients({
      pageNumber: 1,
      pageSize: 1000,
      isActive: true,
    })
    console.log('Raw patients response:', response)

    if (response?.data) {
      patients.value = response.data.map((patient: any) => {
        console.log('Raw patient data:', patient)
        return {
          id: patient.id,
          fullName: patient.userName,
          code: patient.code,
        }
      })
      console.log('Mapped patients:', patients.value)
    } else {
      console.error('Invalid patients response structure:', response)
      init({
        message: 'Dữ liệu bệnh nhân không hợp lệ',
        color: 'danger',
      })
    }
  } catch (error) {
    console.error('Failed to load patients:', error)
    init({
      message: 'Không thể tải danh sách bệnh nhân',
      color: 'danger',
    })
  }
}

const handleDateChange = () => {
  if (new Date(endDate.value) > new Date(maxDate.value)) {
    endDate.value = maxDate.value
  }

  if (new Date(endDate.value) < new Date(startDate.value)) {
    endDate.value = startDate.value
  }
}

// Watch for date changes
watch([startDate, endDate], () => {
  handleDateChange()
})

const handleExport = async () => {
  try {
    if (!startDate.value || !endDate.value || !selectedPatientId.value) {
      init({
        message: 'Vui lòng chọn bệnh nhân và khoảng thời gian',
        color: 'danger',
      })
      return
    }

    // Validate date range
    if (new Date(startDate.value) > new Date(endDate.value)) {
      init({
        message: 'Ngày bắt đầu không thể lớn hơn ngày kết thúc',
        color: 'danger',
      })
      return
    }

    if (new Date(endDate.value) > new Date(maxDate.value)) {
      init({
        message: 'Ngày kết thúc không thể lớn hơn ngày hiện tại',
        color: 'danger',
      })
      return
    }

    // Kiểm tra xem có patient được chọn không
    const patient = patients.value.find((p) => p.id === selectedPatientId.value)
    if (!patient) {
      init({
        message: 'Không tìm thấy thông tin bệnh nhân',
        color: 'danger',
      })
      return
    }

    console.log('Export - Selected patient:', patient)
    console.log('Export - Patient ID:', patient.id)

    const params = {
      startDate: formatDate(startDate.value),
      endDate: formatDate(endDate.value),
      paymentStatus: 0,
      paymentMethod: 0,
      userID: patient.id,
    }
    console.log('Export - Request params:', params)

    // Gọi API trực tiếp với axios
    const axiosInstance = apiService.getAxiosInstance()
    const response = await axiosInstance.post('/v1/payment/export-payment', params, {
      responseType: 'arraybuffer',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Kiểm tra response
    if (!response.data) {
      throw new Error('No data received')
    }

    // Tạo blob với đúng MIME type cho Excel
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    // Tạo URL và download
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const fileName = `lich-su-thanh-toan-${patient.fullName}-${formatDate(startDate.value)}-den-${formatDate(endDate.value)}.xlsx`
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    }, 100)

    init({
      message: 'Xuất file thành công',
      color: 'success',
    })
  } catch (error: any) {
    console.error('Export failed:', error)

    // Thử parse error message nếu có
    let errorMessage = 'Xuất file thất bại. Vui lòng thử lại sau'
    if (error.response?.data) {
      try {
        const decoder = new TextDecoder('utf-8')
        const jsonString = decoder.decode(error.response.data)
        const errorData = JSON.parse(jsonString)
        errorMessage = errorData.message || errorMessage
      } catch (e) {
        // Ignore parse error
      }
    }

    init({
      message: errorMessage,
      color: 'danger',
    })
  }
}

onMounted(() => {
  loadPatients()
})
</script>

<style scoped>
.payment-export-card {
  max-width: 800px;
  margin: 2rem auto;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.5rem;
  color: var(--va-primary);
  padding: 1rem 0;
}

.title-icon {
  font-size: 1.8rem;
}

.export-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1rem 0;
}

.form-section {
  background-color: var(--va-background-primary);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1.2rem;
}

.section-icon {
  font-size: 1.2rem;
  color: var(--va-primary);
}

.section-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--va-text-primary);
  margin: 0;
}

.patient-select {
  width: 100%;
}

.date-range {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.date-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.date-input label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--va-text-primary);
}

.export-button-section {
  display: flex;
  justify-content: center;
  padding-top: 1rem;
}

.export-button {
  min-width: 200px;
  height: 48px;
  font-size: 1.1rem;
}

.button-icon {
  margin-right: 0.8rem;
}

@media (max-width: 768px) {
  .payment-export-card {
    margin: 1rem;
  }

  .date-range {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .export-button {
    width: 100%;
  }
}
</style>
