<template>
  <div class="max-h-screen">
    <main v-if="followup" class="content">
      <div class="px-4 py-3">
        <VaButton class="mb-2" icon="arrow_back" preset="plain" @click="router.back()"> Back </VaButton>
        <div class="text-center mb-4">
          <VaAvatar
            :src="getSrcAvatar(followup.patientAvatar)"
            :text="followup.patientName?.charAt(0).toUpperCase()"
            :fallback-text="followup.patientName?.charAt(0).toUpperCase()"
            color="primary"
            size="96px"
            class="mb-3"
          />
          <h2 class="text-h6 mb-2">
            {{ role?.includes('Patient') ? followup.doctorName : followup.patientName }}
          </h2>
          <VaBadge :color="getStatusColorClass(followup.status)" :text="getStatusLabel(followup.status)" />
        </div>

        <div class="relative">
          <VaButton
            icon="more_vert"
            preset="plain"
            class="absolute top-0 right-0 -mt-12"
            @click="showActionMenu = true"
          />
        </div>

        <div class="followup-info">
          <div class="info-item">
            <VaIcon name="event" />
            <div class="info-content">
              <span class="info-label">Date & Time</span>
              <span class="info-value">{{ followup.date }}</span>
              <span class="info-value">{{ followup.startTime.slice(0, 5) }}</span>
            </div>
          </div>

          <div class="info-item">
            <VaIcon name="medical_services" />
            <div class="info-content">
              <span class="info-label">Service</span>
              <span class="info-value">{{ followup.serviceName }}</span>
            </div>
          </div>

          <div class="info-item">
            <VaIcon name="room" />
            <div class="info-content">
              <span class="info-label">Room</span>
              <span class="info-value">{{ followup.roomName }}</span>
            </div>
          </div>

          <div class="info-item">
            <VaIcon name="person" />
            <div class="info-content">
              <span class="info-label">Doctor</span>
              <span class="info-value">{{ followup.doctorName }}</span>
            </div>
          </div>

          <div class="info-item">
            <VaIcon name="assignment" />
            <div class="info-content">
              <span class="info-label">Procedure</span>
              <span class="info-value">{{ followup.procedureName }}</span>
            </div>
          </div>

          <div class="info-item">
            <VaIcon name="format_list_numbered" />
            <div class="info-content">
              <span class="info-label">Step</span>
              <span class="info-value">{{ followup.step }}</span>
            </div>
          </div>

          <div v-if="followup.note" class="info-item" style="grid-column: 1 / -1">
            <VaIcon name="note" />
            <div class="info-content">
              <span class="info-label">Notes</span>
              <span class="info-value">{{ followup.note }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <VaModal v-model="showCancelModal" title="Cancel Follow-up" class="dark-theme">
      <p>Are you sure you want to cancel this follow-up appointment?</p>
      <template #footer>
        <VaButton @click="showCancelModal = false">No</VaButton>
        <VaButton color="danger" @click="confirmCancelFollowup">Yes, Cancel</VaButton>
      </template>
    </VaModal>

    <VaModal v-model="showActionMenu" hide-default-actions close-button class="dark-theme">
      <VaList>
        <VaListItem @click="rescheduleFollowup">
          <VaListItemSection icon>
            <VaIcon name="event" />
          </VaListItemSection>
          <VaListItemSection class="hover:cursor-pointer">Reschedule</VaListItemSection>
        </VaListItem>
        <VaListItem @click="cancelFollowup">
          <VaListItemSection icon>
            <VaIcon name="cancel" color="danger" />
          </VaListItemSection>
          <VaListItemSection class="text-danger hover:cursor-pointer">Cancel</VaListItemSection>
        </VaListItem>
      </VaList>
    </VaModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FollowUpAppointment, CalendarStatus } from '../../types'
import { getErrorMessage, getSrcAvatar } from '@/services/utils'
import { useToast } from 'vuestic-ui'
import { useAuthStore } from '@/stores/modules/auth.module'
import { useAppointmentStore } from '@/stores/modules/appointment.module'

const route = useRoute()
const router = useRouter()
const { init } = useToast()
const store = useAppointmentStore()
const followup = ref<FollowUpAppointment | null>(null)
const authStore = useAuthStore()
const role = computed(() => authStore.user?.roles)

const showCancelModal = ref(false)
const showActionMenu = ref(false)

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

// const canCancel = computed(() => {
//   return followup.value?.status === CalendarStatus.Booked || followup.value?.status === CalendarStatus.Waiting
// })

// const canReschedule = computed(() => {
//   return followup.value?.status === CalendarStatus.Booked || followup.value?.status === CalendarStatus.Waiting
// })

const cancelFollowup = () => {
  showActionMenu.value = false
  showCancelModal.value = true
}

const confirmCancelFollowup = async () => {
  try {
    // await store.cancelFollowUp(followup.value!.appointmentId)
    // init({
    //   title: 'Success',
    //   message: 'Follow-up appointment cancelled successfully',
    //   color: 'success',
    // })
    router.push('/followups')
  } catch (error) {
    const message = getErrorMessage(error)
    init({
      title: 'Error',
      message: message,
      color: 'danger',
    })
  } finally {
    showCancelModal.value = false
  }
}

const rescheduleFollowup = () => {
  showActionMenu.value = false
  router.push(`/followups/${followup.value?.appointmentId}/reschedule`)
}

onMounted(async () => {
  const id = route.params.id as string
  try {
    followup.value = await store.getAppointmentById(id)
  } catch (error) {
    const message = getErrorMessage(error)
    init({
      title: 'Error',
      message: message,
      color: 'danger',
    })
  }
})
</script>

<style scoped>
.followup-detail {
  background-color: var(--va-background-dark);
  color: var(--va-text-dark);
}

.header {
  background-color: var(--va-background-element-dark);
  border-bottom: 1px solid var(--va-border-dark);
}

.patient-profile {
  background-color: var(--va-background-element-dark);
  margin-bottom: 1rem;
  position: relative;
}

.followup-info {
  display: grid;
  gap: 1.5rem;
  margin-top: 1rem;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.info-item .va-icon {
  color: var(--va-primary);
  margin-top: 0.25rem;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.info-label {
  color: var(--va-text-secondary);
  font-size: 0.875rem;
}

.info-value {
  color: var(--va-text-dark);
}

.dark-theme {
  --va-background-dark: #1a1a1a;
  --va-background-element-dark: #2a2a2a;
  --va-text-dark: #ffffff;
  --va-text-secondary: #888888;
  --va-border-dark: #333333;
  --va-primary: #4b7bec;

  /* Override vuestic variables */
  --va-background-primary: var(--va-background-element-dark);
  --va-text-primary: var(--va-text-dark);
}

/* Added styles for centered avatar */
.va-avatar {
  margin: 0 auto;
}
</style>
