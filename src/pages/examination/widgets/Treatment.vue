<script lang="ts" setup>
import { Appointment } from '@/pages/appointment/types'
import { onMounted, ref, computed } from 'vue'
import { useToast, VaInnerLoading, VaCollapse, VaCard, VaCardContent, VaIcon } from 'vuestic-ui'
import { TreatmentPlanResponse, TreatmentPlanStatus } from '../types'
import { useTreatmentStore } from '@/stores/modules/treatment.module'
import { getErrorMessage } from '@/services/utils'
import { DateInputValue } from 'vuestic-ui/dist/types/components/va-date-input/types'
import Prescription from './Prescription.vue'

const loading = ref(false)
const props = defineProps<{
  appointment: Appointment | undefined
}>()

const { init } = useToast()
const storeTreatment = useTreatmentStore()
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
const columns = [
  { key: 'step', sortable: true, title: 'S.L' },
  { key: 'procedureName', sortable: true, title: 'Tên thủ thuật' },
  { key: 'startDate', sortable: true, title: 'Ngày bắt đầu' },
  { key: 'doctorName', sortable: true, title: 'Bác sĩ' },
  { key: 'price', sortable: true, title: 'Đơn giá' },
  { key: 'discountAmount', sortable: true, title: 'Giảm giá (%)' },
  { key: 'planCost', sortable: true, title: 'Tổng chi phí' },
  { key: 'status', sortable: true, title: 'Tình trạng' },
  { key: 'action', title: 'Hành động' },
]

// Computed properties for totals
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

const getStatusText = (status: TreatmentPlanStatus) => {
  return ['Pending', 'Active', 'Completed', 'Cancelled', 'Rescheduled'][status]
}

const totalExpectedCost = computed(() => treatmentplans.value.reduce((sum, plan) => sum + plan.price, 0))

const totalDiscount = computed(() =>
  treatmentplans.value.reduce((sum, plan) => sum + plan.price * plan.discountAmount, 0),
)

const totalFinalCost = computed(() => treatmentplans.value.reduce((sum, plan) => sum + plan.planCost, 0))

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`
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

onMounted(() => {
  if (appointmentStatus === 2) {
    toogleAppointmentStatus()
  } else {
    getTreatmentPlans()
  }
})
</script>

<template>
  <VaCard>
    <VaCardContent>
      <VaCollapse>
        <template #header="{ value, attrs, iconAttrs }">
          <div
            v-bind="attrs"
            class="w-full flex items-center justify-between border-2 border-solid border-[var(--va-background-border)] p-4 bg-[var(--va-background-element)] rounded"
          >
            <div class="flex items-center">
              <VaIcon name="expand_more" :class="value ? '' : '-rotate-90'" v-bind="iconAttrs" />
              <span class="ml-2 font-medium">KẾ HOẠCH ĐIỀU TRỊ</span>
            </div>
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
                  {{ formatCurrency(value) }}
                </template>
                <template #cell(discountAmount)="{ value }"> {{ (value * 100).toFixed(0) }}% </template>
                <template #cell(planCost)="{ value }">
                  {{ formatCurrency(value) }}
                </template>
                <template #cell(startDate)="{ value, rowData }">
                  {{ rowData.status === TreatmentPlanStatus.Pending ? 'N/A' : formatDate(value) }}
                </template>
                <template #cell(status)="{ value }">
                  <VaChip
                    :color="
                      value === TreatmentPlanStatus.Completed
                        ? 'success'
                        : value === TreatmentPlanStatus.Active
                          ? 'warning'
                          : value === TreatmentPlanStatus.Cancelled
                            ? 'danger'
                            : value === TreatmentPlanStatus.Rescheduled
                              ? 'info'
                              : 'gray'
                    "
                  >
                    {{ getStatusText(value) }}
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
                    @click="handleTreatmentAction(rowData)"
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
                    @click="handleTreatmentSchedule(rowData)"
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
                    @click="handleTreatmentDetails(rowData)"
                  >
                    Details
                  </VaButton>
                  <Prescription
                    v-else-if="!rowData.hasPrescription"
                    :items="rowData"
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
                  <span class="text-gray-600">Giảm giá:</span>
                  <span class="font-medium">{{ formatCurrency(totalDiscount) }}</span>
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
</template>

<style scoped>
.va-inner-loading {
  min-height: 200px;
}
</style>
