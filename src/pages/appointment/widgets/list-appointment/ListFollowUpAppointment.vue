<template>
  <div class="p-4 max-w-md mx-auto">
    <VaScrollContainer class="max-h-screen" vertical>
      <VaList v-if="followups.length > 0" class="space-y-6">
        <VaListItem
          v-for="followup in followups"
          :key="followup.appointmentId"
          class="rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
          @click="navigateToDetail(followup.appointmentId)"
        >
          <VaListItemSection avatar class="mr-4">
            <VaAvatar
              size="small"
              :src="getSrcAvatar(followup.patientAvatar)"
              :fallback-text="followup.patientName?.charAt(0).toUpperCase()"
              class="border-2 border-primary"
            />
          </VaListItemSection>

          <VaListItemSection class="flex-1 min-w-0 space-y-2">
            <div class="flex items-center gap-3">
              <span class="font-medium truncate">
                {{ role?.includes('Patient') ? followup.doctorName : followup.patientName }}
              </span>
              <span :class="getStatusColorClass(followup.status)" class="text-sm font-medium">
                {{ getStatusLabel(followup.status) }}
              </span>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <div class="flex items-center gap-3">
                <VaIcon name="room" size="small" />
                <span>{{ followup.roomName }}</span>
                <span>•</span>
                <span>{{ followup.startTime.slice(0, 5) }}</span>
              </div>
              <div class="truncate">{{ followup.serviceName }}</div>
            </div>
          </VaListItemSection>

          <VaListItemSection icon class="ml-4">
            <VaIcon name="chevron_right" color="gray" />
          </VaListItemSection>
        </VaListItem>
      </VaList>

      <div v-else class="flex flex-col items-center justify-center py-12">
        <VaIcon name="event_busy" size="large" color="gray" class="mb-4 text-5xl" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Không có cuộc hẹn nào</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 text-center">
          Không tìm thấy cuộc hẹn nào cho ngày {{ formatDate(props.date) }}
        </p>
      </div>
    </VaScrollContainer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { FollowUpAppointment, CalendarStatus } from '../../types'
import { getErrorMessage, getSrcAvatar } from '@/services/utils'
import { useToast } from 'vuestic-ui/web-components'
import { useAuthStore } from '@/stores/modules/auth.module'
import { useRouter } from 'vue-router'
import { useAppointmentStore } from '@/stores/modules/appointment.module'

const loading = ref(false)
const storeFollowUps = useAppointmentStore()
const authStore = useAuthStore()
const role = computed(() => authStore.user?.roles)
const followups = ref<FollowUpAppointment[]>([])
const router = useRouter()

const { init } = useToast()
const props = defineProps<{
  date: string
}>()

const fetchFollowUps = () => {
  loading.value = true
  const request = {
    date: props.date,
  }

  storeFollowUps
    .getFollowUpAppointments(request)
    .then((response) => {
      followups.value = response.data
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

const formatDate = (date: string | Date) => {
  if (typeof date === 'string') {
    date = new Date(date)
  }
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
}

const getStatusColorClass = (status: CalendarStatus) => {
  const colors = {
    [CalendarStatus.Failed]: 'text-red-600',
    [CalendarStatus.Waiting]: 'text-yellow-600',
    [CalendarStatus.Booked]: 'text-green-600',
    [CalendarStatus.Completed]: 'text-blue-600',
    [CalendarStatus.Canceled]: 'text-red-600',
    [CalendarStatus.Checkin]: 'text-green-600',
  }
  return colors[status] || 'text-gray-600'
}

const getStatusLabel = (status: CalendarStatus) => {
  return CalendarStatus[status].toUpperCase()
}

const navigateToDetail = (id: string) => {
  router.push({ name: 'followup-detail', params: { id: id } })
}

watch(
  () => props.date,
  () => {
    fetchFollowUps()
  },
)

onMounted(() => {
  fetchFollowUps()
})
</script>

<style scoped>
.list__item:not(:last-child) {
  margin-bottom: 1rem;
}
</style>
