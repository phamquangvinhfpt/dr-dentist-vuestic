<template>
  <div class="max-h-screen">
    <main v-if="appointment" class="content">
      <div class="px-4 py-3">
        <VaButton class="mb-2" icon="arrow_back" preset="plain" @click="router.back()"> Back </VaButton>
        <div class="text-center mb-4">
          <VaAvatar
            :src="getSrcAvatar(appointment.patientAvatar)"
            :text="appointment.patientName?.charAt(0).toUpperCase()"
            :fallback-text="appointment.patientName?.charAt(0).toUpperCase()"
            color="primary"
            size="96px"
            class="mb-3"
          />
          <h2 class="text-h6 mb-2">
            {{ role?.includes('Patient') ? appointment.dentistName : appointment.patientName }}
          </h2>
          <VaBadge :color="getStatusColor(appointment.status)" :text="getStatusLabel(appointment.status)" />
        </div>

        <div class="relative">
          <VaButton
            v-if="canCancel || canReschedule"
            icon="more_vert"
            preset="plain"
            class="absolute top-0 right-0 -mt-12"
            @click="showActionMenu = true"
          />
        </div>

        <div class="appointment-info">
          <div class="info-item">
            <VaIcon name="event" />
            <div class="info-content">
              <span class="info-label">Date & Time</span>
              <span class="info-value">{{ appointment.appointmentDate }}</span>
              <span class="info-value">{{ appointment.startTime.slice(0, 5) }} ({{ appointment.duration }})</span>
            </div>
          </div>

          <div class="info-item">
            <VaIcon name="medical_services" />
            <div class="info-content">
              <span class="info-label">Service</span>
              <span class="info-value">{{ appointment.serviceName }}</span>
              <span class="info-value price">{{ formatPrice(appointment.servicePrice) }}</span>
            </div>
          </div>

          <div class="info-item">
            <VaIcon name="room" />
            <div class="info-content">
              <span class="info-label">Room</span>
              <span class="info-value">{{ appointment.roomName }}</span>
            </div>
          </div>

          <div class="info-item">
            <VaIcon name="payments" />
            <div class="info-content">
              <span class="info-label">Payment Status</span>
              <VaBadge
                :color="getPaymentStatusColor(appointment.paymentStatus)"
                :text="getPaymentStatusLabel(appointment.paymentStatus)"
              />
            </div>
          </div>

          <div v-if="appointment.dentistName" class="info-item">
            <VaIcon name="person" />
            <div class="info-content">
              <span class="info-label">Dentist</span>
              <span class="info-value">{{ appointment.dentistName }}</span>
            </div>
          </div>

          <div v-if="appointment.patientPhone" class="info-item">
            <VaIcon name="phone" />
            <div class="info-content">
              <span class="info-label">Contact</span>
              <span class="info-value">{{ appointment.patientPhone }}</span>
            </div>
          </div>

          <div v-if="appointment.notes" class="info-item" style="grid-column: 1 / -1">
            <VaIcon name="note" />
            <div class="info-content">
              <span class="info-label">Notes</span>
              <span class="info-value">{{ appointment.notes }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <VaModal v-model="showCancelModal" title="Cancel Appointment" class="dark-theme">
      <p>Are you sure you want to cancel this appointment?</p>
      <template #footer>
        <VaButton @click="showCancelModal = false">No</VaButton>
        <VaButton color="danger" @click="confirmCancelAppointment">Yes, Cancel</VaButton>
      </template>
    </VaModal>

    <VaModal v-model="showActionMenu" hide-default-actions class="dark-theme">
      <VaList>
        <VaListItem v-if="canReschedule" @click="rescheduleAppointment">
          <VaListItemSection icon>
            <VaIcon name="event" />
          </VaListItemSection>
          <VaListItemSection class="hover:cursor-pointer">Reschedule</VaListItemSection>
        </VaListItem>
        <VaListItem v-if="canCancel" @click="cancelAppointment">
          <VaListItemSection icon>
            <VaIcon name="cancel" color="danger" />
          </VaListItemSection>
          <VaListItemSection class="text-danger hover:cursor-pointer">Cancel Appointment</VaListItemSection>
        </VaListItem>
      </VaList>
    </VaModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppointmentStore } from '@/stores/modules/appointment.module'
import { Appointment, AppointmentStatus, PaymentStatus } from '../../types'
import { getErrorMessage, getSrcAvatar } from '@/services/utils'
import { useToast } from 'vuestic-ui'
import { useAuthStore } from '@/stores/modules/auth.module'

const route = useRoute()
const router = useRouter()
const { init } = useToast()
const store = useAppointmentStore()
const appointment = ref<Appointment | null>(null)
const authStore = useAuthStore()
const role = computed(() => authStore.user?.roles)

const showCancelModal = ref(false)
const showActionMenu = ref(false)

const getStatusColor = (status: AppointmentStatus) => {
  const colors = {
    [AppointmentStatus.Failed]: 'danger',
    [AppointmentStatus.Pending]: 'warning',
    [AppointmentStatus.Confirmed]: 'success',
    [AppointmentStatus.Come]: 'info',
    [AppointmentStatus.Cancelled]: 'danger',
    [AppointmentStatus.Done]: 'success',
    [AppointmentStatus.Examinated]: 'success',
  }
  return colors[status] || 'gray'
}

const getPaymentStatusColor = (status: PaymentStatus) => {
  const colors = {
    [PaymentStatus.Waiting]: 'warning',
    [PaymentStatus.Incomplete]: 'warning',
    [PaymentStatus.Completed]: 'success',
    [PaymentStatus.Canceled]: 'danger',
    [PaymentStatus.Failed]: 'danger',
  }
  return colors[status] || 'gray'
}

const getStatusLabel = (status: AppointmentStatus) => {
  return AppointmentStatus[status].toUpperCase()
}

const getPaymentStatusLabel = (status: PaymentStatus) => {
  return PaymentStatus[status].toUpperCase()
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price)
}

const canCancel = computed(() => {
  return (
    appointment.value?.status === AppointmentStatus.Pending || appointment.value?.status === AppointmentStatus.Confirmed
  )
})

const canReschedule = computed(() => {
  return (
    appointment.value?.status === AppointmentStatus.Pending || appointment.value?.status === AppointmentStatus.Confirmed
  )
})

const cancelAppointment = () => {
  showActionMenu.value = false
  showCancelModal.value = true
}

const confirmCancelAppointment = async () => {
  try {
    await store.cancelAppointment(appointment.value!.appointmentId)
    init({
      title: 'Success',
      message: 'Appointment cancelled successfully',
      color: 'success',
    })
    router.push('/appointments')
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

const rescheduleAppointment = () => {
  showActionMenu.value = false
  router.push(`/appointments/${appointment.value?.appointmentId}/reschedule`)
}

onMounted(async () => {
  const id = route.params.id as string
  try {
    appointment.value = await store.getAppointmentById(id)
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
.appointment-detail {
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

.appointment-info {
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

.info-value.price {
  font-weight: bold;
  color: var(--va-primary);
}

.dark-theme {
  /* Dark theme variables */
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
