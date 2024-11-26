<script lang="ts" setup>
import { Appointment } from '@/pages/appointment/types'
import { onMounted, ref, computed, reactive } from 'vue'
import { useToast, VaInnerLoading, VaCollapse, VaCard, VaCardContent, VaIcon, VaButton } from 'vuestic-ui'
import { TreatmentPlanResponse, TreatmentPlanStatus } from '../types'
import { useTreatmentStore } from '@/stores/modules/treatment.module'
import { getErrorMessage } from '@/services/utils'
import { DateInputModelValue, DateInputValue } from 'vuestic-ui/dist/types/components/va-date-input/types'
import Prescription from './Prescription.vue'
import { useAuthStore } from '@/stores/modules/auth.module'
import { useMedicalRecordStore } from '@/stores/modules/medicalrecord.module'

const loading = ref(false)
const props = defineProps<{
  appointment: Appointment | undefined
}>()

const emit = defineEmits(['update:appointment'])

const { init } = useToast()
const storeTreatment = useTreatmentStore()
const storeMedicalRecord = useMedicalRecordStore()
const showModalTreatment = ref(false)
const titleModalTreatment = computed(() => {
  if (selectedTreatmentPlan.value?.status === TreatmentPlanStatus.Pending) {
    return 'Add Treatment Detail'
  } else if (
    selectedTreatmentPlan.value?.status === TreatmentPlanStatus.Active &&
    !isToday(selectedTreatmentPlan.value?.startDate)
  ) {
    return 'Reschedule Treatment'
  }
  return 'Treatment Details'
})
const selectedTreatmentPlanId = ref('')
const selectedTreatmentPlan = ref<TreatmentPlanResponse>()
const date = ref(new Date())
const startTime = ref('')
const notes = ref('')
const appointmentStatus = props.appointment?.status
const treatmentplans = ref<TreatmentPlanResponse[]>([])
const user = useAuthStore()
const isDoctor = user.musHaveRole('Dentist')
const showModalCreateRecord = ref(false)
const allColumns = [
  { key: 'step', sortable: true, title: 'S.L' },
  { key: 'procedureName', sortable: true, title: 'Tên thủ thuật' },
  { key: 'startDate', sortable: true, title: 'Ngày bắt đầu' },
  { key: 'doctorName', sortable: true, title: 'Bác sĩ' },
  { key: 'price', sortable: true, title: 'Đơn giá' },
  { key: 'planCost', sortable: true, title: 'Tổng chi phí' },
  { key: 'status', sortable: true, title: 'Tình trạng' },
  { key: 'action', title: 'Hành động' },
]

const columns = computed(() => {
  return allColumns.filter((column) => {
    if (!isDoctor) {
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

const optionsStartTimes = computed(() => {
  const slots = []
  for (let hour = 8; hour < 17; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`)
    slots.push(`${hour.toString().padStart(2, '0')}:30`)
  }
  return slots
})

const isToday = (dateString: string) => {
  const today = new Date()
  const date = new Date(dateString)
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

const toogleAppointmentStatus = async () => {
  loading.value = true
  await storeTreatment
    .toogleAppointment(props.appointment?.appointmentId)
    .then((response) => {
      treatmentplans.value = response.sort((a: any, b: any) => a.step - b.step)
    })
    .catch((error) => {
      const errorMessage = getErrorMessage(error)
      init({
        message: errorMessage,
        color: 'error',
        title: 'Error',
      })
    })
    .finally(() => {
      loading.value = false
    })
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
        color: 'error',
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
    .then((response) => {
      init({
        message: response,
        color: 'success',
        title: 'Success',
      })
      getTreatmentPlans()
    })
    .catch((error) => {
      const errorMessage = getErrorMessage(error)
      init({
        message: errorMessage,
        color: 'error',
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
  showModalTreatment.value = true
}

const handleTreatmentSchedule = (item: TreatmentPlanResponse) => {
  selectedTreatmentPlanId.value = item.treatmentPlanID
  selectedTreatmentPlan.value = item
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
      .then((response) => {
        init({
          message: response,
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
    !isToday(selectedTreatmentPlan.value?.startDate)
  ) {
    storeTreatment
      .updateTreatmentDetail(request)
      .then((response) => {
        init({
          message: response,
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

const fetchTreatment = () => {
  getTreatmentPlans()
}

const formData = reactive({
  appointmentId: props.appointment?.appointmentId,
  basicExamination: {
    examinationContent: '',
    treatmentPlanNote: '',
  },
  diagnosis: {
    toothNumber: '',
    teethConditions: [] as string[],
  },
  indication: {
    indicationType: [] as string[],
    description: '',
  },
})

const closeModal = () => {
  showModalCreateRecord.value = false
}

const updateTeethConditions = (code: string, checked: boolean) => {
  if (checked) {
    formData.diagnosis.teethConditions.push(code)
  } else {
    const index = formData.diagnosis.teethConditions.indexOf(code)
    if (index > -1) {
      formData.diagnosis.teethConditions.splice(index, 1)
    }
  }
}

const updateIndicationType = (code: string, checked: boolean) => {
  if (checked) {
    formData.indication.indicationType.push(code)
  } else {
    const index = formData.indication.indicationType.indexOf(code)
    if (index > -1) {
      formData.indication.indicationType.splice(index, 1)
    }
  }
}

const createMedicalRecord = async () => {
  loading.value = true
  await storeMedicalRecord
    .createMedicalRecord(formData)
    .then((response) => {
      init({
        message: response,
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

onMounted(() => {
  if (appointmentStatus === 2) {
    if (isDoctor) {
      toogleAppointmentStatus()
      emit('update:appointment', { ...props.appointment, status: 3 })
    }
  } else {
    getTreatmentPlans()
  }
})
</script>

<template>
  <VaCard>
    <VaCardContent class="space-y-3">
      <VaCollapse>
        <template #header="{ value, attrs, iconAttrs }">
          <div
            v-bind="attrs"
            class="w-full flex items-center justify-between border-2 border-solid border-[var(--va-background-border)] p-4 bg-[var(--va-background-element)] rounded"
          >
            <div class="flex items-center">
              <VaIcon name="expand_more" :class="value ? '' : '-rotate-90'" v-bind="iconAttrs" />
              <div class="flex justify-between items-center">
                <span class="ml-2 font-medium">KẾ HOẠCH ĐIỀU TRỊ</span>
              </div>
            </div>
            <VaButton
              v-if="isDoctor && isToday(props.appointment?.appointmentDate as string)"
              preset="primary"
              icon-right="add"
              class="p-2"
              round
              border-color="primary"
              size="small"
              @click="showModalCreateRecord = true"
            >
              Create Record
            </VaButton>
          </div>
        </template>

        <template #default>
          <VaInnerLoading :loading="loading">
            <div class="p-6 border-2 border-t-0 border-solid border-[var(--va-background-border)]">
              <VaDataTable
                :items="treatmentplans"
                :columns="columns"
                striped
                hoverable
                :items-per-page="10"
                :search="true"
              >
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
                    v-if="rowData.status === TreatmentPlanStatus.Active && isToday(rowData.startDate)"
                    preset="primary"
                    class="mr-6 mb-2"
                    round
                    border-color="primary"
                    size="small"
                    @click="handleTreatmentAction(rowData as TreatmentPlanResponse)"
                  >
                    Điều trị
                  </VaButton>
                  <VaButton
                    v-else-if="rowData.status === TreatmentPlanStatus.Active && !isToday(rowData.startDate)"
                    preset="primary"
                    class="mr-6 mb-2"
                    round
                    border-color="primary"
                    size="small"
                    @click="handleTreatmentSchedule(rowData as TreatmentPlanResponse)"
                  >
                    Reschedule
                  </VaButton>
                  <VaButton
                    v-else-if="rowData.status === TreatmentPlanStatus.Pending"
                    preset="primary"
                    class="mr-6 mb-2"
                    round
                    border-color="primary"
                    size="small"
                    @click="handleTreatmentDetails(rowData as TreatmentPlanResponse)"
                  >
                    Details
                  </VaButton>
                  <Prescription
                    v-else-if="!rowData.hasPrescription"
                    :items="rowData as TreatmentPlanResponse"
                    @update:refresh="fetchTreatment"
                  />
                </template>
              </VaDataTable>

              <!-- Summary Section -->
              <div class="mt-6 space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">Chi phí dự kiến:</span>
                  <span class="font-medium">{{ formatCurrency(totalExpectedCost) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Tổng chi phí dự kiến:</span>
                  <span class="font-medium">{{ formatCurrency(totalFinalCost) }}</span>
                </div>
              </div>
            </div>
          </VaInnerLoading>
        </template>
      </VaCollapse>
    </VaCardContent>
  </VaCard>
  <!-- Add TreatmentDetail modal -->
  <VaModal v-model="showModalTreatment" ok-text="Apply" @close="handleCloseTreatmentDetail" @ok="submitTreatmentDetail">
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
        />
        <VaSelect v-model="startTime" class="col-span-1" label="Time" :options="optionsStartTimes" />
        <VaTextarea v-model="notes" class="col-span-2" label="Notes" />
      </div>
    </VaCard>
  </VaModal>
  <!-- Create Medical Record -->
  <VaModal v-model="showModalCreateRecord" close-button size="large" @close="closeModal" @ok="createMedicalRecord">
    <VaCard>
      <VaCardContent>
        <h2 class="text-2xl font-bold mb-6">Create Medical Record</h2>

        <!-- General Examination Section -->
        <div class="mb-6">
          <h3 class="text-xl font-semibold mb-4">KHÁM TỔNG QUÁT</h3>
          <div class="grid grid-cols-2 gap-4">
            <VaTextarea v-model="formData.basicExamination.examinationContent" label="Nội dung khám" class="mt-4" />
            <VaTextarea v-model="formData.basicExamination.treatmentPlanNote" label="Kế hoạch điều trị" class="mt-4" />
          </div>
        </div>

        <!-- Tooth Conditions Section -->
        <div class="mb-6">
          <h3 class="text-xl font-semibold mb-4">TÌNH TRẠNG RĂNG</h3>
          <VaInput v-model="formData.diagnosis.toothNumber" label="Số răng" type="number" class="mb-4 w-[60px]" />
          <div class="grid grid-cols-2 gap-4">
            <VaCheckbox
              v-for="condition in toothConditions"
              :key="condition.code"
              :model-value="formData.diagnosis.teethConditions.includes(condition.code)"
              :label="condition.label"
              @update:modelValue="updateTeethConditions(condition.code, $event)"
            />
          </div>
        </div>

        <!-- Indications Section -->
        <div class="mb-6">
          <h3 class="text-xl font-semibold mb-4">CHỈ ĐỊNH</h3>
          <div class="grid grid-cols-2 gap-4">
            <VaCheckbox
              v-for="indication in indicationTypes"
              :key="indication.code"
              :model-value="formData.indication.indicationType.includes(indication.code)"
              :label="indication.label"
              @update:modelValue="updateIndicationType(indication.code, $event)"
            />
          </div>
          <VaTextarea
            v-model="formData.indication.description"
            label="Mô tả"
            class="mt-4 w-full"
            counter
            required-mark
            :rules="[(v: any) => (v && v.length > 0) || 'Required', (v: any) => v && v.length < 125]"
          />
        </div>
      </VaCardContent>
    </VaCard>
  </VaModal>
</template>

<style scoped>
.va-inner-loading {
  min-height: 200px;
}
</style>
