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
              <template #cell(date)="{ value }">
                {{ formatDate(value) }}
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
  </VaInnerLoading>
</template>

<script lang="ts" setup>
import { getErrorMessage } from '@/services/utils'
import { useDashboardStore } from '@/stores/modules/dashboard.module'
import { computed, onBeforeMount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { DataTableItem, useColors, useToast } from 'vuestic-ui'
import DataSectionItem from './DataSectionItem.vue'
import { Appointment, FollowUpAppointment } from '@/pages/appointment/types'
import { DateInputModelValue } from 'vuestic-ui/dist/types/components/va-date-input/types'

const isLoading = ref(false)
const dashboardStore = useDashboardStore()
const current_date = ref<string>()
const isAppointment = ref(true)
const appointments = ref<Appointment[]>([])
const followups = ref<FollowUpAppointment[]>([])

const tableItems = computed<DataTableItem[]>(() => (isAppointment.value ? appointments.value : followups.value))

const options = computed(() => [
  { value: true, label: t('appointment.appointment') },
  { value: false, label: t('appointment.follow_up') },
])

const columns = computed(() => {
  if (isAppointment.value) {
    return [
      { key: 'appointmentDate', label: t('appointment.appointment_data_table.date'), name: 'appointmentDate' },
      { key: 'roomName', label: t('appointment.appointment_data_table.room'), name: 'roomName' },
      { key: 'startTime', label: t('appointment.appointment_data_table.time'), name: 'startTime' },
      { key: 'patientName', label: t('appointment.appointment_data_table.patient'), name: 'patientName' },
      { key: 'patientPhone', label: t('appointment.appointment_data_table.phone'), name: 'patientPhone' },
      { key: 'dentistName', label: t('appointment.appointment_data_table.doctor'), name: 'dentistName' },
      { key: 'serviceName', label: t('appointment.appointment_data_table.service'), name: 'serviceName' },
    ]
  }
  return [
    { key: 'date', label: t('appointment.appointment_data_table.date'), name: 'date' },
    { key: 'roomName', label: t('appointment.appointment_data_table.room'), name: 'roomName' },
    { key: 'startTime', label: t('appointment.appointment_data_table.time'), name: 'startTime' },
    { key: 'patientName', label: t('appointment.appointment_data_table.patient'), name: 'patientName' },
    { key: 'doctorName', label: t('appointment.appointment_data_table.doctor'), name: 'doctorName' },
    { key: 'step', label: t('appointment.appointment_data_table.step'), name: 'step' },
    { key: 'serviceName', label: t('appointment.appointment_data_table.service'), name: 'serviceName' },
    { key: 'procedureName', label: t('appointment.appointment_data_table.procedure'), name: 'procedureName' },
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
  dashboardStore.getFollowUpAppointmentUnExamination('2025-01-08').then((data) => {
    followups.value = data.data as FollowUpAppointment[]
    console.log(followups.value)
  })

  isLoading.value = false
})
</script>
