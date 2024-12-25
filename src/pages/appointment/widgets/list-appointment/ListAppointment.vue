<template>
  <div class="p-4 max-w-md mx-auto">
    <VaScrollContainer class="max-h-screen" vertical>
      <VaList class="space-y-6">
        <VaListItem
          v-for="appointment in appointments"
          :key="appointment.appointmentId"
          class="rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
          @click="navigateToDetail(appointment.appointmentId)"
        >
          <VaListItemSection avatar class="mr-4">
            <VaAvatar
              size="small"
              :src="getSrcAvatar(appointment.patientAvatar)"
              :fallback-text="appointment.patientName?.charAt(0).toUpperCase()"
              class="border-2 border-primary"
            />
          </VaListItemSection>

          <VaListItemSection class="flex-1 min-w-0 space-y-2">
            <div class="flex items-center gap-3">
              <span class="font-medium truncate">
                {{ role?.includes('Patient') ? appointment.dentistName : appointment.patientName }}
              </span>
              <span :class="getStatusColorClass(appointment.status)" class="text-sm font-medium">
                {{ getStatusLabel(appointment.status) }}
              </span>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <div class="flex items-center gap-3">
                <VaIcon name="room" size="small" />
                <span>{{ appointment.roomName }}</span>
                <span>•</span>
                <span>{{ appointment.startTime.slice(0, 5) }}</span>
              </div>
              <div class="truncate">{{ appointment.serviceName }}</div>
            </div>
          </VaListItemSection>

          <VaListItemSection icon class="ml-4">
            <VaIcon name="chevron_right" color="gray" />
          </VaListItemSection>
        </VaListItem>
      </VaList>
    </VaScrollContainer>
  </div>
</template>
<script setup lang="ts">
import { useAppointmentStore } from '@/stores/modules/appointment.module'
import { computed, onMounted, ref, watch } from 'vue'
import { Appointment, AppointmentStatus } from '../../types'
import { getErrorMessage, getSrcAvatar } from '@/services/utils'
import { useToast } from 'vuestic-ui/web-components'
import { useAuthStore } from '@/stores/modules/auth.module'
import { useRouter } from 'vue-router'

const loading = ref(false)
const storeAppointments = useAppointmentStore()
const authStore = useAuthStore()
const role = computed(() => authStore.user?.roles)
const appointments = ref<Appointment[]>([])
const router = useRouter()

const { init } = useToast()
const props = defineProps<{
  date: string
}>()

const fetchAppointments = () => {
  loading.value = true
  const request = {
    date: props.date,
  }

  storeAppointments
    .getAppointments(request)
    .then((response) => {
      appointments.value = response.data
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

const getStatusColorClass = (status: AppointmentStatus) => {
  const colors = {
    [AppointmentStatus.Failed]: 'text-red-600',
    [AppointmentStatus.Pending]: 'text-yellow-600',
    [AppointmentStatus.Confirmed]: 'text-green-600',
    [AppointmentStatus.Come]: 'text-blue-600',
    [AppointmentStatus.Cancelled]: 'text-red-600',
    [AppointmentStatus.Done]: 'text-green-600',
    [AppointmentStatus.Examinated]: 'text-green-600',
  }
  return colors[status] || 'text-gray-600'
}

const getStatusLabel = (status: AppointmentStatus) => {
  return AppointmentStatus[status].toUpperCase()
}

const navigateToDetail = (id: string) => {
  router.push({ name: 'appointment-detail', params: { id: id } })
}

watch(
  () => props.date,
  () => {
    fetchAppointments()
  },
)

onMounted(() => {
  fetchAppointments()
})
</script>
<style scoped>
.list__item:not(:last-child) {
  margin-bottom: 1rem;
}
</style>
