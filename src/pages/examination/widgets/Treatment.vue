<script lang="ts" setup>
import { Appointment } from '@/pages/appointment/types'
import { onMounted, ref, computed, reactive, watch } from 'vue'
import {
  useToast,
  VaInnerLoading,
  VaCard,
  VaCardContent,
  VaButton,
  VaModal,
  VaDateInput,
  VaSelect,
  VaTextarea,
  VaCheckbox,
  VaChip,
  VaDataTable,
} from 'vuestic-ui'
import { PrescriptionResponse, TreatmentPlanResponse, TreatmentPlanStatus } from '../types'
import { useTreatmentStore } from '@/stores/modules/treatment.module'
import { getErrorMessage, isToday, validateDate, validateTime } from '@/services/utils'
import { DateInputModelValue, DateInputValue } from 'vuestic-ui/dist/types/components/va-date-input/types'
import Prescription from './Prescription.vue'
import { useAuthStore } from '@/stores/modules/auth.module'
import { useMedicalRecordStore } from '@/stores/modules/medicalrecord.module'
import DentalChart from './DentalChart.vue'
import { useI18n } from 'vue-i18n'
import { useCalendarStore } from '@/stores/modules/calendar.module'
import signalRService from '@/signalR'
import PrescriptionModal from './PrescriptionModal.vue'
import { storeToRefs } from 'pinia'

const loading = ref(false)
const props = defineProps<{
  appointment: Appointment | undefined
}>()

const { init } = useToast()
const { t } = useI18n()
const storeTreatment = useTreatmentStore()
const storeMedicalRecord = useMedicalRecordStore()
const storeCalendar = useCalendarStore()
const { update } = storeToRefs(storeTreatment)
const showModalTreatment = ref(false)
const prevent = ref(false)
const titleModalTreatment = computed(() => {
  if (selectedTreatmentPlan.value?.status === TreatmentPlanStatus.Pending) {
    return t('examination.add_treatment_detail')
  } else if (
    selectedTreatmentPlan.value?.status === TreatmentPlanStatus.Active &&
    !checkToday(selectedTreatmentPlan.value?.startDate)
  ) {
    return t('examination.reschedule_treatment')
  }
  return t('examination.treatment_detail')
})
const selectedTreatmentPlanId = ref('')
const selectedTreatmentPlan = ref<TreatmentPlanResponse>()
const date = ref(new Date())
const startTime = ref('')
const notes = ref('')
const treatmentplans = ref<TreatmentPlanResponse[]>([])
const user = useAuthStore()
const isDoctor = user.musHaveRole('Dentist')
const isStaff = user.musHaveRole('Staff')
const isAdmin = user.musHaveRole('Admin')
const isPatient = user.musHaveRole('Patient')
const showModalCreateRecord = ref(false)
const prescription = ref<PrescriptionResponse>()
const showPrescriptionModal = ref(false)
const allColumns = computed(() => [
  { key: 'step', sortable: true, title: 'S.L', label: t('examination.treatment_plan_table.step') },
  {
    key: 'procedureName',
    sortable: true,
    title: 'Tên thủ thuật',
    label: t('examination.treatment_plan_table.procedure'),
  },
  { key: 'startDate', sortable: true, title: 'Ngày bắt đầu', label: t('examination.treatment_plan_table.date') },
  { key: 'doctorName', sortable: true, title: 'Bác sĩ', label: t('examination.treatment_plan_table.doctor') },
  { key: 'price', sortable: true, title: 'Đơn giá', label: t('examination.treatment_plan_table.price') },
  { key: 'planCost', sortable: true, title: 'Tổng chi phí', label: t('examination.treatment_plan_table.plan_cost') },
  { key: 'status', sortable: true, title: 'Tình trạng', label: t('examination.treatment_plan_table.status') },
  { key: 'action', title: 'Hành động', label: t('examination.treatment_plan_table.actions') },
])

const columns = computed(() => {
  return allColumns.value.filter((column) => {
    if (!isDoctor && !isStaff && !isAdmin && !isPatient) {
      return column.key !== 'action'
    } else {
      return column.key !== 'doctorName'
    }
  })
})

const toothConditions = [
  { code: 'Hàm giả tháo lắp', label: 'Hàm giả tháo lắp' },
  { code: 'Implant', label: 'Implant' },
  { code: 'Sâu Răng', label: 'Sâu răng' },
  { code: 'Răng khấp khểnh', label: 'Răng khấp khểnh' },
  { code: 'RĂNG VIÊM', label: 'RĂNG VIÊM' },
  { code: 'Răng siêu khôn', label: 'Răng siêu khôn' },
  { code: 'Khác', label: 'Khác' },
]

const indicationTypes = [
  { code: 'Cephalometric', label: 'Cephalometric' },
  { code: 'Panorama', label: 'Panorama' },
  { code: '3D 5x5', label: '3D 5x5' },
  { code: '3D', label: '3D' },
  { code: 'Ảnh (ext)', label: 'Ảnh (ext)' },
  { code: 'Khác', label: 'Khác' },
  { code: 'Cắn chụp', label: 'Cắn chụp' },
  { code: 'Ảnh (int)', label: 'Ảnh (int)' },
  { code: 'Xét nghiệm huyết học', label: 'Xét nghiệm huyết học' },
  { code: 'Xét nghiệm sinh hóa', label: 'Xét nghiệm sinh hóa' },
]

// Computed properties for totals
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

const getStatusText = (status: TreatmentPlanStatus) => {
  return ['Pending', 'Active', 'Completed', 'Cancelled', 'Rescheduled'][status]
}

const totalExpectedCost = computed(() => treatmentplans.value.reduce((sum, plan) => sum + plan.price, 0))

const totalFinalCost = computed(() => treatmentplans.value.reduce((sum, plan) => sum + plan.planCost, 0))

const formatDate = (date: DateInputModelValue): string => {
  if (date === null || date === undefined) return ''

  const dateObj =
    date instanceof Date
      ? date
      : typeof date === 'string'
        ? new Date(date)
        : date instanceof Number
          ? new Date(Number(date))
          : new Date()

  if (isNaN(dateObj.getTime())) return ''

  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0')
  const day = dateObj.getDate().toString().padStart(2, '0')
  const year = dateObj.getFullYear()

  return `${day}/${month}/${year}`
}

const parseDate = (dateStr: string): DateInputValue => {
  if (!dateStr) return null

  const date = new Date(dateStr)
  return isNaN(date.getTime()) ? null : date
}

const formatDateOnly = (date: any) => {
  if (!date) return ''
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) return ''

  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0')
  const day = dateObj.getDate().toString().padStart(2, '0')
  const year = dateObj.getFullYear()

  return `${year}-${month}-${day}`
}

const optionsStartTimes = ref<string[]>([])

const checkToday = (dateString: string) => {
  const today = new Date()
  const date = new Date(dateString)
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

const getTreatmentPlans = async () => {
  loading.value = true
  await storeTreatment
    .getTreatmentList(props.appointment?.appointmentId)
    .then((response) => {
      treatmentplans.value = response.sort((a: any, b: any) => a.step - b.step)
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

const handleTreatmentAction = (item: TreatmentPlanResponse) => {
  loading.value = true
  storeTreatment
    .doTreatment(item.treatmentPlanID)
    .then(() => {
      init({
        message: t('examination.treatment_success'),
        color: 'success',
        title: 'Success',
      })
      getTreatmentPlans()
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

const handleTreatmentDetails = (item: TreatmentPlanResponse) => {
  selectedTreatmentPlanId.value = item.treatmentPlanID
  selectedTreatmentPlan.value = item
  getAvailablesTimesForDoctor({
    date: formatDateOnly(date.value),
    doctorId: selectedTreatmentPlan.value?.doctorID,
  })
  showModalTreatment.value = true
}

const handleTreatmentSchedule = (item: TreatmentPlanResponse) => {
  selectedTreatmentPlanId.value = item.treatmentPlanID
  selectedTreatmentPlan.value = item
  getAvailablesTimesForDoctor({
    date: formatDateOnly(date.value),
    doctorId: selectedTreatmentPlan.value?.doctorID,
  })
  showModalTreatment.value = true
}

const handleCloseTreatmentDetail = () => {
  showModalTreatment.value = false
}

const submitTreatmentDetail = () => {
  const request = {
    appointmentID: props.appointment?.appointmentId,
    treatmentId: selectedTreatmentPlanId.value,
    treatmentDate: formatDateOnly(date.value),
    treatmentTime: `${startTime.value}:00`,
    note: notes.value,
  }

  loading.value = true
  if (selectedTreatmentPlan.value?.status === TreatmentPlanStatus.Pending) {
    storeTreatment
      .addTreatmentDetail(request)
      .then(() => {
        init({
          message: t('examination.add_treatment_success'),
          color: 'success',
          title: 'Success',
        })
        getTreatmentPlans()
        handleCloseTreatmentDetail()
        date.value = new Date()
        startTime.value = ''
        notes.value = ''
        selectedTreatmentPlanId.value = ''
      })
      .catch((error) => {
        const errorMessage = getErrorMessage(error)
        init({
          message: errorMessage,
          color: 'warning',
          title: 'Error',
        })
      })
      .finally(() => {
        loading.value = false
      })
  } else if (
    selectedTreatmentPlan.value?.status === TreatmentPlanStatus.Active &&
    !checkToday(selectedTreatmentPlan.value?.startDate)
  ) {
    storeTreatment
      .updateTreatmentDetail(request)
      .then(() => {
        init({
          message: t('examination.reschedule_treatment_success'),
          color: 'success',
          title: 'Success',
        })
        getTreatmentPlans()
        handleCloseTreatmentDetail()
        date.value = new Date()
        startTime.value = ''
        notes.value = ''
        selectedTreatmentPlanId.value = ''
      })
      .catch((error) => {
        const errorMessage = getErrorMessage(error)
        init({
          message: errorMessage,
          color: 'warning',
          title: 'Error',
        })
      })
      .finally(() => {
        loading.value = false
      })
  }
}

const getPrescriptionByTreatmentPlanId = (treatmentPlanId: string) => {
  storeTreatment
    .getPrescription(treatmentPlanId)
    .then((response) => {
      prescription.value = response
      console.log(response)
      showPrescriptionModal.value = true
    })
    .catch((error) => {
      const errorMessage = getErrorMessage(error)
      init({
        message: errorMessage,
        color: 'danger',
        title: 'Error',
      })
    })
}

const handleShowPrescription = (item: TreatmentPlanResponse) => {
  console.log(item)
  getPrescriptionByTreatmentPlanId(item.treatmentPlanID)
}

const fetchTreatment = () => {
  getTreatmentPlans()
}

const formData = reactive({
  AppointmentId: props.appointment?.appointmentId,
  BasicExamination: {
    ExaminationContent: '',
    TreatmentPlanNote: '',
  },
  Diagnosis: [] as Array<{
    toothNumber: number
    teethConditions: string[]
  }>,
  Indication: {
    IndicationType: [] as string[],
    Description: '',
  },
  IndicationImages: [] as Array<{
    images: File
    imageType: string
    imageUrl?: string
  }>,
})

// const resetForm = () => {
//   formData.BasicExamination.ExaminationContent = ''
//   formData.BasicExamination.TreatmentPlanNote = ''
//   formData.Diagnosis = []
//   formData.Indication.IndicationType = []
//   formData.Indication.Description = ''
//   formData.IndicationImages = []
// }

const closeModal = () => {
  showModalCreateRecord.value = false
  // resetForm()
}

const updateTeethConditions = (code: string, checked: boolean) => {
  // Find the diagnosis for the current tooth
  const currentDiagnosis = formData.Diagnosis.find((diagnosis: any) => diagnosis.toothNumber === current_tooth.value)

  if (currentDiagnosis) {
    if (checked) {
      // Add condition if it doesn't already exist
      if (!currentDiagnosis.teethConditions.includes(code)) {
        currentDiagnosis.teethConditions.push(code)
      }
    } else {
      // Remove condition if it exists
      const index = currentDiagnosis.teethConditions.indexOf(code)
      if (index > -1) {
        currentDiagnosis.teethConditions.splice(index, 1)
      }
    }

    // Update tooth conditions in dental chart for the current tooth
    dentalChartRef.value.updateToothConditions(current_tooth.value, currentDiagnosis.teethConditions)
  }
}

const updateIndicationType = (code: string, checked: boolean) => {
  if (checked) {
    if (!formData.Indication.IndicationType.includes(code)) {
      formData.Indication.IndicationType.push(code)
      uploadImage(code)
    }
  } else {
    const index = formData.Indication.IndicationType.indexOf(code)
    if (index > -1) {
      formData.Indication.IndicationType.splice(index, 1)
      removeImage(code, index)
    }
  }
}

const validateForm = () => {}

const createMedicalRecord = async () => {
  loading.value = true
  const form = new FormData()
  form.append('AppointmentId', props.appointment?.appointmentId || '')

  // Phẳng hóa BasicExamination
  form.append('BasicExamination.ExaminationContent', formData.BasicExamination.ExaminationContent)
  form.append('BasicExamination.TreatmentPlanNote', formData.BasicExamination.TreatmentPlanNote)

  // Xử lý Diagnosis
  formData.Diagnosis.forEach((diagnosis, index) => {
    form.append(`Diagnosis[${index}].toothNumber`, diagnosis.toothNumber.toString())
    diagnosis.teethConditions.forEach((condition, conditionIndex) => {
      form.append(`Diagnosis[${index}].teethConditions[${conditionIndex}]`, condition)
    })
  })

  // Xử lý Indication
  formData.Indication.IndicationType.forEach((type, index) => {
    form.append(`Indication.IndicationType[${index}]`, type)
  })
  form.append('Indication.Description', formData.Indication.Description)

  // Xử lý IndicationImages
  formData.IndicationImages.forEach((image, index) => {
    form.append(`IndicationImages[${index}].images`, image.images)
    form.append(`IndicationImages[${index}].imageType`, image.imageType)
  })

  console.log(formData)

  await storeMedicalRecord
    .createMedicalRecord(form)
    .then(() => {
      init({
        message: t('examination.create_record_success'),
        color: 'success',
        title: 'Success',
      })
      closeModal()
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

const current_tooth = ref<number>()
const handleSelectedTeeth = (teeth: number[]) => {
  // Lọc ra các răng không còn được chọn
  const teethToRemove = formData.Diagnosis.filter((d) => !teeth.map(Number).includes(d.toothNumber)).map(
    (d) => d.toothNumber,
  )

  // Xóa các răng không còn được chọn
  teethToRemove.forEach((tooth) => {
    const indexToRemove = formData.Diagnosis.findIndex((item) => item.toothNumber === tooth)
    if (indexToRemove > -1) {
      formData.Diagnosis.splice(indexToRemove, 1)
      dentalChartRef.value.updateToothConditions(tooth, []) // Xóa tình trạng răng khi bỏ chọn
    }
  })

  // Thêm các răng mới chưa tồn tại
  teeth.forEach((tooth) => {
    const existingToothIndex = formData.Diagnosis.findIndex((item) => item.toothNumber === tooth)
    if (existingToothIndex === -1) {
      formData.Diagnosis.push({
        toothNumber: tooth,
        teethConditions: [], // Đảm bảo tình trạng mới là rỗng khi thêm răng
      })
    }
  })

  current_tooth.value = teeth[teeth.length - 1]
}

const dentalChartRef = ref()
const hoveredTooth = ref<number | null>(null)
const popupStyle = ref({})

const handleToothHover = ({
  toothNumber,
  event,
  isHovered,
}: {
  toothNumber: number
  event: MouseEvent | null
  isHovered: boolean
}) => {
  if (isHovered && event) {
    hoveredTooth.value = toothNumber
    popupStyle.value = {
      position: 'fixed',
      left: `${event.clientX}px`,
      top: `${event.clientY + 10}px`,
    }
  } else {
    hoveredTooth.value = null
  }
}

const getToothConditions = (toothNumber: number) => {
  const diagnosis = formData.Diagnosis.find((d) => d.toothNumber === toothNumber)
  return diagnosis ? diagnosis.teethConditions : []
}

const isRemoving = ref(false)

const uploadImage = (type?: string) => {
  if (prevent.value || isRemoving.value) {
    return
  }
  const fileInput = document.createElement('input')
  fileInput.type = 'file'
  fileInput.accept = 'image/*'
  fileInput.style.display = 'none'
  document.body.appendChild(fileInput)

  fileInput.onchange = (event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (file) {
      handleFileUpload(file, type || 'Unknown')
    }
    document.body.removeChild(fileInput)
  }

  fileInput.click()
}

const handleFileUpload = (file: File, type: any) => {
  // Logic xử lý file upload
  const reader = new FileReader()
  reader.onload = (e) => {
    // Thêm ảnh vào mảng IndicationImages
    formData.IndicationImages.push({
      images: file,
      imageType: type,
      imageUrl: e.target?.result as string,
    })
  }
  reader.readAsDataURL(file)
  reader.onerror = (error) => {
    console.error('Error reading file:', error)
    init({
      message: 'Có lỗi xảy ra khi đọc file. Vui lòng thử lại.',
      color: 'danger',
      title: 'Lỗi',
    })
  }
}

const removeImage = (type: any, index: number) => {
  isRemoving.value = true
  formData.Indication.IndicationType = formData.Indication.IndicationType.filter(
    (types: any, key: number) => !(types === type && index === key),
  )
  formData.IndicationImages = formData.IndicationImages.filter(
    (value: any, key: number) => !(value.imageType === type && index === key),
  )
  setTimeout(() => {
    isRemoving.value = false
  }, 0)
}

const isRescheduleFormValid = computed(() => {
  return (
    date.value &&
    startTime.value &&
    !validateDate(date.value) &&
    (!validateTime(startTime.value) || (validateTime(startTime.value) && !isToday(date.value)))
  )
})

const getAvailablesTimesForDoctor = (data: any) => {
  loading.value = true
  storeCalendar
    .getAvailableTimeSlots(data)
    .then((response) => {
      optionsStartTimes.value = response.data.map((slot: any) => slot.time.slice(0, 5))
    })
    .catch((error) => {
      const message = getErrorMessage(error)
      init({
        title: 'error',
        message: message,
        color: 'danger',
      })
    })
    .finally(() => {
      loading.value = false
    })
}

const handleFetchNewTreatment = (data: any) => {
  if (data) {
    getTreatmentPlans()
  }
}

const isFormValid = computed(() => {
  return (
    formData.BasicExamination.ExaminationContent &&
    formData.BasicExamination.TreatmentPlanNote &&
    formData.Diagnosis.length > 0 &&
    formData.Indication.IndicationType.length > 0 &&
    formData.IndicationImages.length > 0
  )
})

watch(
  update,
  () => {
    if (update) {
      fetchTreatment()
      update.value = false
    }
  },
  { immediate: true },
)

watch(
  date,
  (newVal) => {
    if (newVal && !validateDate(newVal)) {
      getAvailablesTimesForDoctor({
        date: formatDateOnly(newVal),
        doctorId: selectedTreatmentPlan.value?.doctorID,
      })
    }
  },
  { deep: true },
)

onMounted(() => {
  getTreatmentPlans()
  if (signalRService.isConnected()) {
    signalRService.on('Fetch', handleFetchNewTreatment)
  }
})
</script>

<template>
  <VaCard class="m-6">
    <VaCardContent class="space-y-3">
      <div
        class="w-full flex items-center justify-between border-2 border-solid border-[var(--va-background-border)] p-4 bg-[var(--va-background-element)] rounded"
      >
        <div class="flex items-center">
          <span class="ml-2 font-medium">{{ t('examination.treatment_plan_table.title') }}</span>
        </div>
        <VaButton
          v-if="isDoctor"
          preset="primary"
          icon-right="add"
          class="p-2"
          round
          border-color="primary"
          size="small"
          @click="showModalCreateRecord = true"
        >
          {{ t('examination.create_record') }}
        </VaButton>
      </div>

      <VaInnerLoading :loading="loading">
        <div class="p-6 border-2 border-solid border-[var(--va-background-border)]">
          <VaDataTable :items="treatmentplans" :columns="columns" striped hoverable :items-per-page="10" :search="true">
            <template #cell(price)="{ value }">
              {{ formatCurrency(Number(value)) }}
            </template>
            <template #cell(planCost)="{ value }">
              {{ formatCurrency(Number(value)) }}
            </template>
            <template #cell(startDate)="{ value, rowData }">
              {{ rowData.status === TreatmentPlanStatus.Pending ? 'N/A' : formatDate(value) }}
            </template>
            <template #cell(status)="{ value }">
              <VaChip
                :color="
                  (value as unknown as number) === TreatmentPlanStatus.Completed
                    ? 'success'
                    : (value as unknown as number) === TreatmentPlanStatus.Active
                      ? 'warning'
                      : (value as unknown as number) === TreatmentPlanStatus.Cancelled
                        ? 'danger'
                        : (value as unknown as number) === TreatmentPlanStatus.Rescheduled
                          ? 'info'
                          : 'gray'
                "
              >
                {{ getStatusText(Number(value)) }}
              </VaChip>
            </template>
            <template #cell(action)="{ rowData }">
              <VaButton
                v-if="rowData.status === TreatmentPlanStatus.Active && checkToday(rowData.startDate) && isDoctor"
                preset="primary"
                class="mr-6 mb-2"
                round
                border-color="primary"
                size="small"
                @click="handleTreatmentAction(rowData as TreatmentPlanResponse)"
              >
                {{ t('examination.treatment_plan_table.treatment') }}
              </VaButton>
              <VaButton
                v-else-if="
                  rowData.status === TreatmentPlanStatus.Active &&
                  !checkToday(rowData.startDate) &&
                  (isStaff || isAdmin)
                "
                preset="primary"
                class="mr-6 mb-2"
                round
                border-color="primary"
                size="small"
                @click="handleTreatmentSchedule(rowData as TreatmentPlanResponse)"
              >
                {{ t('examination.treatment_plan_table.reschedule') }}
              </VaButton>
              <VaButton
                v-else-if="rowData.hasPrescription"
                preset="primary"
                class="mr-6 mb-2"
                round
                border-color="primary"
                size="small"
                @click="handleShowPrescription(rowData as TreatmentPlanResponse)"
              >
                {{ t('examination.treatment_plan_table.prescription') }}
              </VaButton>
              <VaButton
                v-else-if="rowData.status === TreatmentPlanStatus.Pending && isDoctor"
                preset="primary"
                class="mr-6 mb-2"
                round
                border-color="primary"
                size="small"
                @click="handleTreatmentDetails(rowData as TreatmentPlanResponse)"
              >
                {{ t('examination.treatment_plan_table.detail') }}
              </VaButton>
              <Prescription
                v-else-if="!rowData.hasPrescription && rowData.status === TreatmentPlanStatus.Completed && isDoctor"
                :items="rowData as TreatmentPlanResponse"
                @update:refresh="fetchTreatment"
              />
            </template>
          </VaDataTable>

          <!-- Summary Section -->
          <div class="mt-6 space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-600">{{ t('examination.expected_cost') }}:</span>
              <span class="font-medium">{{ formatCurrency(totalExpectedCost) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">{{ t('examination.total_cost') }}:</span>
              <span class="font-medium">{{ formatCurrency(totalFinalCost) }}</span>
            </div>
          </div>
        </div>
      </VaInnerLoading>
    </VaCardContent>
  </VaCard>

  <!-- Add TreatmentDetail modal -->
  <VaModal
    v-model="showModalTreatment"
    hide-default-actions
    close-button
    @close="handleCloseTreatmentDetail"
    @ok="submitTreatmentDetail"
  >
    <h3 class="va-h3">{{ titleModalTreatment }}</h3>
    <VaCard>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <VaDateInput
          v-model="date"
          :format="formatDate"
          :parse="parseDate"
          manual-input
          class="col-span-1"
          label="Date"
          clearable
          required-mark
          :rules="[
            (v) => !!v || t('appointment.reschedule_appointment.date_required'),
            (v) => !validateDate(v) || t('appointment.reschedule_appointment.date_today'),
          ]"
        />
        <VaSelect
          v-model="startTime"
          class="col-span-1"
          label="Time"
          :options="optionsStartTimes"
          required-mark
          :rules="[
            (v) => !!v || t('appointment.reschedule_appointment.time_required'),
            (v) => !validateTime(v) || !isToday(date) || t('appointment.reschedule_appointment.time_today'),
          ]"
        />
        <VaTextarea v-model="notes" class="col-span-2" label="Notes" />
      </div>

      <div class="flex items-end justify-end mt-5">
        <VaButton class="mr-6" color="#ECF0F1" @click="showModalTreatment = false">{{
          t('appointment.reschedule_appointment.cancel')
        }}</VaButton>
        <VaButton :disabled="!isRescheduleFormValid" @click="submitTreatmentDetail">{{
          t('appointment.reschedule_appointment.submit')
        }}</VaButton>
      </div>
    </VaCard>
  </VaModal>

  <!-- Create Medical Record -->
  <VaModal
    v-model="showModalCreateRecord"
    close-button
    size="large"
    hide-default-actions
    @close="closeModal"
    @beforeOk="validateForm"
    @ok="createMedicalRecord"
  >
    <VaCard>
      <VaCardContent>
        <!-- General Examination Section -->
        <VaForm ref="record_form">
          <div class="mb-6">
            <h3 class="text-xl font-semibold mb-4">{{ t('examination.general_examination') }}</h3>
            <div class="grid grid-cols-2 gap-4">
              <VaTextarea
                v-model="formData.BasicExamination.ExaminationContent"
                :label="t('examination.examinationContent')"
                class="mt-4"
                :rules="[(v: any) => (v && v.length > 0) || t('examination.examinationContent_not_empty')]"
                required-mark
              />
              <VaTextarea
                v-model="formData.BasicExamination.TreatmentPlanNote"
                :label="t('examination.treatmentPlanNote')"
                class="mt-4"
                :rules="[(v: any) => (v && v.length > 0) || t('examination.treatmentPlanNote_not_empty')]"
                required-mark
              />
            </div>
          </div>

          <!-- Tooth Conditions Section -->
          <div class="mb-6">
            <h3 class="text-xl font-semibold mb-4">
              {{ t('examination.teeth_condition') }} <span class="text-red-500 text-sm">*</span>
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="relative">
                <DentalChart
                  ref="dentalChartRef"
                  :is-view="false"
                  @toothNumber="handleSelectedTeeth"
                  @toothHover="handleToothHover"
                />
                <div
                  v-if="hoveredTooth && getToothConditions(hoveredTooth).length > 0"
                  class="tooth-popup"
                  :style="popupStyle"
                >
                  <h4 class="font-bold mb-2">{{ t('examination.tooth') }} {{ hoveredTooth }}</h4>
                  <div v-if="getToothConditions(hoveredTooth).length > 0">
                    <p v-for="condition in getToothConditions(hoveredTooth)" :key="condition">
                      {{ condition }}
                    </p>
                  </div>
                  <p v-else>{{ t('examination.no_condition') }}</p>
                </div>
              </div>
              <div class="grid grid-cols-2 place-content-center gap-8">
                <VaCheckbox
                  v-for="condition in toothConditions"
                  :key="condition.code"
                  :model-value="
                    formData.Diagnosis.some(
                      (d) => d.teethConditions.includes(condition.code) && d.toothNumber === current_tooth,
                    )
                  "
                  :label="condition.label"
                  @update:modelValue="updateTeethConditions(condition.code, $event)"
                />
              </div>
            </div>
          </div>

          <!-- Indications Section -->
          <div class="mb-6">
            <h3 class="text-xl font-semibold mb-4">
              {{ t('examination.indications') }} <span class="text-red-500 text-sm">*</span>
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <VaCheckbox
                v-for="indication in indicationTypes"
                :key="indication.code"
                :model-value="formData.Indication.IndicationType.includes(indication.code)"
                :label="indication.label"
                @update:modelValue="updateIndicationType(indication.code, $event)"
              />
            </div>
            <div class="grid grid-cols-3 gap-4 mt-4">
              <div v-for="(image, index) in formData.IndicationImages" :key="image.imageType" class="relative">
                <img
                  :src="image.imageUrl"
                  :alt="image.imageType"
                  class="w-full h-64 object-cover border-2 border-dashed"
                />
                <div class="text-center">{{ image.imageType }}</div>
                <button
                  class="absolute top-0 right-0 transform scale-75 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  @click.stop="removeImage(image.imageType, index)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <VaTextarea
              v-model="formData.Indication.Description"
              :label="t('examination.description')"
              class="mt-4 w-full"
              counter
              required-mark
            />
          </div>

          <div class="flex items-end justify-end mt-5">
            <VaButton class="mr-6" color="#ECF0F1" @click="closeModal">{{
              t('appointment.create_appointment.cancel')
            }}</VaButton>
            <VaButton :disabled="!isFormValid" @click="createMedicalRecord">{{
              t('appointment.create_appointment.submit')
            }}</VaButton>
          </div>
        </VaForm>
      </VaCardContent>
    </VaCard>
  </VaModal>

  <!-- Prescription Modal -->
  <PrescriptionModal v-model:isOpen="showPrescriptionModal" :prescription-data="prescription" />
</template>

<style scoped>
.va-inner-loading {
  min-height: 200px;
}

.tooth-popup {
  position: fixed;
  background-color: white;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}
</style>
