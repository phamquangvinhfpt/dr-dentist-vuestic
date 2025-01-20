<template>
  <VaInnerLoading :loading="isLoading" class="p-4">
    <div class="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-4 gap-4 md:w-full">
      <DataSectionItem
        v-for="metric in dashboardMetrics"
        :key="metric.id"
        :title="metric.title"
        :value="metric.value"
        :icon-background="metric.iconBackground"
        :icon-color="metric.iconColor"
      >
        <template #icon>
          <VaIcon :name="metric.icon" size="large" />
        </template>
      </DataSectionItem>
      <div class="col-span-2 sm:col-span-1 md:col-span-4">
        <VaCard class="mt-3 overflow-auto">
          <VaButtonToggle
            v-model="isAppointment"
            preset="secondary"
            border-color="primary"
            :options="options"
            class="p-3"
          />
          <VaCardTitle class="flex items-start justify-between">
            <h1 class="card-title text-secondary font-bold uppercase">
              {{ isAppointment ? t('appointment.appointment') : t('appointment.follow_up') }}
            </h1>
          </VaCardTitle>
          <VaCardContent>
            <VaDataTable
              :items="tableItems"
              :columns="columns"
              :per-page="5"
              :current-page="currentPage"
              :no-data-html="t('appointment.no_items_found')"
            >
              <template #cell(appointmentDate)="{ value }">
                {{ formatDate(value) }}
              </template>
              <template #cell(startTime)="{ value }">
                {{ formatTime(value) }}
              </template>
              <template #cell(date)="{ value }">
                {{ formatDate(value) }}
              </template>
              <template #cell(actions)="{ rowData }">
                <div class="space-x-2">
                  <VaButton
                    v-if="rowData.status === 2"
                    round
                    icon="sync"
                    color="warning"
                    icon-color="#812E9E"
                    @click="rescheduleModal(rowData)"
                  />
                  <VaButton
                    v-if="rowData.status === 3 || rowData.status === 2"
                    round
                    icon="clear"
                    color="danger"
                    icon-color="#812E9E"
                    @click="cancelModal(rowData)"
                  />
                </div>
              </template>
              <template #footer>
                <tr>
                  <td>
                    <div class="flex justify-center mt-4">
                      <VaPagination v-model="currentPage" :pages="isAppointment ? pagesA : pagesF" />
                    </div>
                  </td>
                </tr>
              </template>
            </VaDataTable>
          </VaCardContent>
        </VaCard>
      </div>
    </div>
    <!-- Reschedule Appointment Modal -->
    <VaModal
      v-model="showModalReschedule"
      ok-text="Reschedule"
      close-button
      hide-default-actions
      @close="handleCloseReschedule"
      @ok="isSelectDoctor ? handleAssignBooking() : submitReschedule(isAppointment)"
    >
      <div class="grid grid-cols-2 gap-4">
        <h3 class="va-h3">{{ t('appointment.reschedule_appointment.title') }}</h3>
        <VaSelect
          v-model="selectedDoctorId"
          autocomplete
          highlight-matched-text
          clearable
          :label="t('appointment.assign_doctor_modal.doctor')"
          :options="doctors"
        />
      </div>
      <VaCard>
        <VaForm>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <VaDateInput
              v-model="date"
              manual-input
              required-mark
              class="col-span-1"
              :format="formatDate"
              :parse="parseDate"
              :label="t('appointment.reschedule_appointment.date')"
              clearable
              :rules="[
                (v) => !!v || t('appointment.reschedule_appointment.date_required'),
                (v) => !validateDate(v) || t('appointment.reschedule_appointment.date_today'),
              ]"
            />
            <VaSelect
              v-model="startTime"
              class="col-span-1"
              required-mark
              :label="t('appointment.reschedule_appointment.time')"
              :options="availableTimes"
              :rules="[
                (v) => !!v || t('appointment.reschedule_appointment.time_required'),
                (v) => !validateTime(v) || !isToday(date) || t('appointment.reschedule_appointment.time_today'),
              ]"
            />
          </div>

          <div class="flex items-end justify-end mt-5">
            <VaButton class="mr-6" color="#ECF0F1" @click="showModalReschedule = false">{{
              t('appointment.reschedule_appointment.cancel')
            }}</VaButton>
            <VaButton
              :disabled="!isRescheduleFormValid"
              @click="isSelectDoctor ? handleAssignBooking() : submitReschedule(isAppointment)"
              >{{ t('appointment.reschedule_appointment.submit') }}</VaButton
            >
          </div>
        </VaForm>
      </VaCard>
    </VaModal>

    <!-- Cancel Appointment Modal -->
    <VaModal v-model="showModalCancel" close-button @close="handleCloseCancel" @ok="submitCancel(isAppointment)">
      <h3 class="va-h3">{{ t('appointment.cancel_appointment.title') }}</h3>
      <VaCard>
        <p>{{ t('appointment.cancel_appointment.subtitle') }}</p>
      </VaCard>
      <VaAlert color="#fdeae7" text-color="#940909" class="mt-4">
        <p>{{ t('appointment.cancel_appointment.warning') }}</p>
      </VaAlert>
    </VaModal>
  </VaInnerLoading>
</template>

<script lang="ts" setup>
import { formatTime, getErrorMessage, isToday, validateDate, validateTime } from '@/services/utils'
import { useDashboardStore } from '@/stores/modules/dashboard.module'
import { computed, onBeforeMount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { DataTableItem, useColors, useToast } from 'vuestic-ui'
import DataSectionItem from './DataSectionItem.vue'
import { Appointment, FollowUpAppointment } from '@/pages/appointment/types'
import { DateInputModelValue, DateInputValue } from 'vuestic-ui/dist/types/components/va-date-input/types'
import { useAppointmentStore } from '@/stores/modules/appointment.module'
import { useCalendarStore } from '@/stores/modules/calendar.module'
import { useDoctorProfileStore } from '@/stores/modules/doctor.module'
import { useTreatmentStore } from '@/stores/modules/treatment.module'

const isLoading = ref(false)
const dashboardStore = useDashboardStore()
const appointmentStore = useAppointmentStore()
const calendarStore = useCalendarStore()
const doctorStore = useDoctorProfileStore()
const treatmentStore = useTreatmentStore()
const current_date = ref<string>()
const isAppointment = ref(true)
const showModalCancel = ref(false)
const showModalReschedule = ref(false)
const userId = ref('')
const appointmentId = ref('')
const date = ref(new Date())
const startTime = ref('')
const duration = ref('00:30:00')
const current_follow_up = ref<any>()
const current_appointment = ref<any>()
const availableTimes = ref<string[]>([])
const appointments = ref<Appointment[]>([])
const followups = ref<FollowUpAppointment[]>([])

interface Options {
  text: string
  value: string
}
const selectedDoctorId = ref<Options>()
const isSelectDoctor = computed(() => {
  const check = selectedDoctorId.value?.value !== ''
  console.log('check', check)
  return check
})
const doctors = ref<Options[]>([])
const tableItems = computed<DataTableItem[]>(() => (isAppointment.value ? appointments.value : followups.value))

const options = computed(() => [
  { value: true, label: t('appointment.appointment') },
  { value: false, label: t('appointment.follow_up') },
])

const columns = computed(() => {
  if (isAppointment.value) {
    return [
      { key: 'appointmentDate', label: t('appointment.appointment_data_table.date'), name: 'appointmentDate' },
      { key: 'startTime', label: t('appointment.appointment_data_table.time'), name: 'startTime' },
      { key: 'patientName', label: t('appointment.appointment_data_table.patient'), name: 'patientName' },
      { key: 'patientPhone', label: t('appointment.appointment_data_table.phone'), name: 'patientPhone' },
      { key: 'dentistName', label: t('appointment.appointment_data_table.doctor'), name: 'dentistName' },
      { key: 'serviceName', label: t('appointment.appointment_data_table.service'), name: 'serviceName' },
      { key: 'actions', label: t('appointment.appointment_data_table.actions'), name: 'actions' },
    ]
  }
  return [
    { key: 'date', label: t('appointment.appointment_data_table.date'), name: 'date' },
    { key: 'startTime', label: t('appointment.appointment_data_table.time'), name: 'startTime' },
    { key: 'patientName', label: t('appointment.appointment_data_table.patient'), name: 'patientName' },
    { key: 'doctorName', label: t('appointment.appointment_data_table.doctor'), name: 'doctorName' },
    { key: 'patientPhone', label: t('appointment.appointment_data_table.phone'), name: 'patientPhone' },
    { key: 'serviceName', label: t('appointment.appointment_data_table.service'), name: 'serviceName' },
    { key: 'procedureName', label: t('appointment.appointment_data_table.procedure'), name: 'procedureName' },
    { key: 'actions', label: t('appointment.appointment_data_table.actions'), name: 'actions' },
  ]
})

interface DashboardMetric {
  id: string
  title: string
  value: string
  icon: string
  iconBackground: string
  iconColor: string
}

const { getColor } = useColors()
const { t } = useI18n()
const { init } = useToast()

const dashboardMetrics = computed(() => {
  return [
    {
      id: 'appointments',
      title: t('dashboard.total_appointments'),
      value: String(dashboardStore.total_appointment) as string,
      icon: 'book_online',
      iconBackground: getColor('success'),
      iconColor: getColor('on-success'),
    },
    {
      id: 'new_contacts',
      title: t('dashboard.new_contacts'),
      value: String(dashboardStore.new_contacts),
      icon: 'contact_support',
      iconBackground: getColor('info'),
      iconColor: getColor('on-info'),
    },
    {
      id: 'follow_up',
      title: t('dashboard.follow_up'),
      value: String(dashboardStore.follow_up),
      icon: 'change_circle',
      iconBackground: getColor('danger'),
      iconColor: getColor('on-danger'),
    },
    {
      id: 'unassign',
      title: t('dashboard.unassign'),
      value: String(dashboardStore.unassign),
      icon: 'add_circle',
      iconBackground: getColor('warning'),
      iconColor: getColor('on-warning'),
    },
  ] satisfies DashboardMetric[]
})

const currentPage = ref(1)
const pagesA = computed(() => Math.ceil(appointments.value.length / 5))
const pagesF = computed(() => Math.ceil(followups.value.length / 5))

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

const cancelModal = (appointment: any) => {
  appointmentId.value = appointment.appointmentId
  userId.value = isAppointment.value ? appointment.patientId : appointment.patientProfileID
  showModalCancel.value = true
}

const handleCloseCancel = () => {
  appointmentId.value = ''
  userId.value = ''
}

const submitCancel = (isAppointment: any) => {
  const request = {
    appointmentID: appointmentId.value,
    userID: userId.value,
  }
  appointmentStore
    .cancelAppointment(request)
    .then(() => {
      init({
        title: 'success',
        message: t('appointment.cancel_appointment.success'),
        color: 'success',
      })
      showModalCancel.value = false
      if (isAppointment) {
        dashboardStore.getAppointmentUnExamination(current_date.value).then((data) => {
          appointments.value = data.data as Appointment[]
        })
      } else {
        dashboardStore.getFollowUpAppointmentUnExamination(current_date.value).then((data) => {
          followups.value = data.data as FollowUpAppointment[]
        })
      }
    })
    .catch((error) => {
      const message = getErrorMessage(error)
      init({
        title: 'error',
        message: message,
        color: 'danger',
      })
    })
}

const handleCloseReschedule = () => {
  appointmentId.value = ''
  date.value = new Date()
  startTime.value = ''
}

const formatDateForm = (date: string | Date): string => {
  if (!date) return ''
  // Convert string to Date object if needed
  const dateObj = typeof date === 'string' ? new Date(date) : date
  // Check if date is valid
  if (isNaN(dateObj.getTime())) return ''

  // Use local time methods instead of UTC
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0')
  const day = dateObj.getDate().toString().padStart(2, '0')
  const year = dateObj.getFullYear()

  return `${year}-${month}-${day}`
}

const getAvailablesTimesForDoctor = (data: any) => {
  isLoading.value = true
  calendarStore
    .getAvailableTimeSlots(data)
    .then((response) => {
      availableTimes.value = response.data.map((slot: any) => slot.time.slice(0, 5))
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
      isLoading.value = false
    })
}

const rescheduleModal = (appointment: any) => {
  appointmentId.value = appointment.appointmentId
  date.value = isAppointment.value ? appointment.appointmentDate : appointment.date
  startTime.value = ''
  selectedDoctorId.value = { text: '', value: '' }
  const request = {
    doctorID: isAppointment.value ? appointment.dentistUserID : appointment.doctorUserID,
    date: isAppointment.value ? formatDateForm(appointment.appointmentDate) : formatDateForm(appointment.date),
  }
  current_appointment.value = appointment
  if (validateDate(date.value)) {
    getAvailablesTimesForDoctor(request)
  }
  showModalReschedule.value = true
  if (!isAppointment.value) {
    current_follow_up.value = appointment
  }

  fetchAvailableDoctors()
}

const isRescheduleFormValid = computed(() => {
  return (
    date.value &&
    startTime.value &&
    !validateDate(date.value) &&
    (!validateTime(startTime.value) || (validateTime(startTime.value) && !isToday(date.value)))
  )
})

const submitReschedule = (isAppointment: any) => {
  if (!isRescheduleFormValid.value) {
    return
  }
  let request
  if (isAppointment) {
    request = {
      appointmentID: appointmentId.value,
      appointmentDate: formatDateForm(date.value),
      startTime: startTime.value + ':00',
      duration: duration.value,
    }
  } else {
    request = {
      appointmentID: appointmentId.value,
      treatmentId: current_follow_up.value.treatmentID,
      treatmentDate: formatDateForm(date.value),
      treatmentTime: startTime.value + ':00',
      note: '',
    }
  }

  appointmentStore
    .rescheduleAppointment(isAppointment, request)
    .then(() => {
      init({
        title: 'success',
        message: t('appointment.reschedule_appointment.success'),
        color: 'success',
      })
      showModalReschedule.value = false
      if (isAppointment) {
        dashboardStore.getAppointmentUnExamination(current_date.value).then((data) => {
          appointments.value = data.data as Appointment[]
        })
      } else {
        dashboardStore.getFollowUpAppointmentUnExamination(current_date.value).then((data) => {
          followups.value = data.data as FollowUpAppointment[]
        })
      }
    })
    .catch((error) => {
      const message = getErrorMessage(error)
      init({
        title: 'error',
        message: message,
        color: 'danger',
      })
    })

  showModalReschedule.value = false
}

const addMinutesToTime = (time: string, minutesToAdd: number): string => {
  const [hours, mins, seconds] = time.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, mins, seconds)
  date.setMinutes(date.getMinutes() + minutesToAdd)

  return date.toTimeString().slice(0, 8)
}

const fetchAvailableDoctors = async () => {
  isLoading.value = true
  const request = {
    serviceID: isAppointment.value ? current_appointment.value.serviceId : current_follow_up.value.serviceID,
    date: formatDateForm(date.value),
    startTime: startTime.value
      ? startTime.value + ':00'
      : isAppointment.value
        ? current_appointment.value.startTime
        : current_follow_up.value.startTime,
    endTime: addMinutesToTime(
      startTime.value
        ? startTime.value + ':00'
        : isAppointment.value
          ? current_appointment.value.startTime
          : current_follow_up.value.startTime,
      30,
    ),
  }
  doctorStore
    .getAvailableDoctors(request)
    .then((response) => {
      if (response && response.length > 0) {
        doctors.value = response.map((doctor: any) => ({
          text: `${doctor.firstName} ${doctor.lastName}`,
          value: doctor.doctorProfile.id,
        }))
      }
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
      isLoading.value = false
    })
}

const handleAssignBooking = () => {
  console.log('selectedDoctorId', selectedDoctorId.value)
  console.log('isAppointment', isSelectDoctor.value)
  isLoading.value = true
  const request = {
    appointmentId: appointmentId.value,
    treatmentId: isAppointment.value ? current_appointment.value.treatmentID : current_follow_up.value.treatmentID,
    treatmentDate: formatDateForm(date.value),
    treatmentTime: startTime.value + ':00',
    note: '',
    doctorID: selectedDoctorId.value?.value,
  }
  treatmentStore
    .updateTreatmentDetail(request)
    .then((response) => {
      init({
        title: 'success',
        message: response.data,
        color: 'success',
      })
      showModalReschedule.value = false
      if (isAppointment.value) {
        dashboardStore.getAppointmentUnExamination(current_date.value).then((data) => {
          appointments.value = data.data as Appointment[]
        })
      } else {
        dashboardStore.getFollowUpAppointmentUnExamination(current_date.value).then((data) => {
          followups.value = data.data as FollowUpAppointment[]
        })
      }
      isLoading.value = false
    })
    .catch((error) => {
      const message = getErrorMessage(error)
      init({
        title: 'error',
        message: message,
        color: 'danger',
      })
      isLoading.value = false
    })
    .finally(() => {
      isLoading.value = false
    })
}

watch(
  [date, startTime],
  () => {
    if (date.value && !validateDate(date.value) && showModalReschedule && current_appointment.value) {
      const request = {
        doctorID: isAppointment.value
          ? current_appointment.value.dentistUserID
          : current_appointment.value.doctorUserID,
        date: formatDateForm(date.value),
      }

      getAvailablesTimesForDoctor(request)
      fetchAvailableDoctors()
    }
  },
  { deep: true },
)

onBeforeMount(() => {
  const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0]
  }
  current_date.value = getCurrentDate()
})

onMounted(async () => {
  isLoading.value = true
  await Promise.all([
    dashboardStore.getTotalAppointments(current_date.value),
    dashboardStore.getNewContacts(current_date.value),
    dashboardStore.getFollowUp(current_date.value),
    dashboardStore.getUnassign(current_date.value),
  ]).catch((error) => {
    const errorMessage = getErrorMessage(error)
    init({
      title: 'error',
      message: errorMessage,
      color: 'danger',
    })
    isLoading.value = false
  })

  dashboardStore.getAppointmentUnExamination(current_date.value).then((data) => {
    appointments.value = data.data as Appointment[]
  })
  dashboardStore.getFollowUpAppointmentUnExamination(current_date.value).then((data) => {
    followups.value = data.data as FollowUpAppointment[]
    console.log(followups.value)
  })

  isLoading.value = false
})
</script>
