<template>
  <div
    class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-2xl mx-auto">
      <div class="bg-background-secondary rounded-2xl shadow-2xl p-8 space-y-8 border border-border-color">
        <!-- Header with improved styling -->
        <div class="text-center">
          <h2
            class="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
          >
            Application Form
          </h2>
          <p class="mt-2 text-sm text-gray-500">Please fill in the details below</p>
        </div>

        <form class="space-y-8" @submit.prevent="submitForm">
          <!-- Calendar Select with improved styling -->
          <div class="transition-all duration-200 hover:shadow-md p-4 rounded-lg border border-gray-100">
            <label for="calendarID" class="block text-sm font-semibold text-gray-700 mb-2"> Select Working Date </label>
            <VaSelect
              v-model="formData.calendarID"
              :options="calendarOptions"
              value-by="calendarID"
              :text-by="formatOptionText"
              :error="!!formErrors.calendarID"
              :error-messages="formErrors.calendarID"
              placeholder="Select working date"
              class="w-full"
              @update:modelValue="handleCalendarChange"
            />
          </div>

          <!-- Leave Type Select with improved styling -->
          <div class="transition-all duration-200 hover:shadow-md p-4 rounded-lg border border-gray-100">
            <label class="block text-sm font-semibold text-gray-700 mb-2"> Leave Type </label>
            <div class="flex gap-6">
              <VaRadio
                v-model="formData.leaveType"
                :option="LeaveType.TIME_SLOT"
                label="Time Slot"
                class="hover:opacity-80 transition-opacity"
              />
              <VaRadio
                v-model="formData.leaveType"
                :option="LeaveType.ALL_DAY"
                label="All Day"
                class="hover:opacity-80 transition-opacity"
              />
            </div>
          </div>

          <!-- Time Slot Select with improved styling -->
          <div
            v-if="formData.leaveType === LeaveType.TIME_SLOT"
            class="transition-all duration-200 hover:shadow-md p-4 rounded-lg border border-gray-100"
          >
            <label for="timeID" class="block text-sm font-semibold text-gray-700 mb-2"> Select Time Slot </label>
            <VaSelect
              v-model="formData.timeID"
              :options="timeSlots"
              value-by="timeID"
              :text-by="formatTimeSlot"
              :error="!!formErrors.timeID"
              :error-messages="formErrors.timeID"
              placeholder="Select time slot"
              class="w-full"
              :disabled="!formData.calendarID"
            />
          </div>

          <!-- Description with improved styling -->
          <div class="transition-all duration-200 hover:shadow-md p-4 rounded-lg border border-gray-100">
            <label for="description" class="block text-sm font-semibold text-gray-700 mb-2"> Description </label>
            <VaTextarea
              id="description"
              v-model="formData.description"
              rows="4"
              class="w-full"
              :error="!!formErrors.description"
              :error-messages="formErrors.description"
              placeholder="Please describe your reason for the application..."
              required
            />
          </div>

          <!-- Submit Button with improved styling -->
          <div class="flex justify-end gap-4 pt-4">
            <VaButton
              preset="secondary"
              class="px-8 py-3 rounded-lg transform transition-transform hover:scale-105"
              @click="router.back()"
            >
              <span class="flex items-center">
                <i class="fas fa-arrow-left mr-2"></i>
                Back
              </span>
            </VaButton>
            <VaButton
              preset="primary"
              :loading="isSubmitting"
              type="submit"
              class="px-8 py-3 rounded-lg transform transition-transform hover:scale-105"
            >
              <template v-if="isSubmitting">
                <span class="flex items-center">
                  <i class="fas fa-spinner fa-spin mr-2"></i>
                  Submitting...
                </span>
              </template>
              <template v-else>
                <span class="flex items-center">
                  <i class="fas fa-paper-plane mr-2"></i>
                  Submit Application
                </span>
              </template>
            </VaButton>
          </div>
        </form>
      </div>
    </div>

    <!-- Success Modal with improved styling -->
    <VaModal v-model="showSuccessModal" hide-default-actions class="rounded-xl">
      <template #header>
        <div class="text-center p-4">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <i class="fas fa-check text-green-600 text-xl"></i>
          </div>
          <h3 class="text-xl font-semibold text-gray-900">Application Submitted!</h3>
        </div>
      </template>

      <div class="px-4 pb-4">
        <p class="text-sm text-gray-500 text-center">
          Your application has been successfully submitted. We will process it shortly.
        </p>
      </div>

      <div class="mt-5 flex justify-center pb-6">
        <VaButton
          preset="primary"
          class="px-6 py-2 rounded-lg transform transition-transform hover:scale-105"
          @click="closeSuccessModal"
        >
          <i class="fas fa-check mr-2"></i>
          Got it!
        </VaButton>
      </div>
    </VaModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/modules/auth.module'
import { useFormStore } from '@/stores/modules/form.module'
import { useToast } from 'vuestic-ui'
import { useRouter } from 'vue-router'
import { LeaveType } from './types'
import type { ApplicationFormRequest, CalendarOption } from './types'
import type { WorkingCalendar, WorkingTime } from '@/pages/working-calendar/types'

const router = useRouter()
const { init } = useToast()
const authStore = useAuthStore()
const formStore = useFormStore()

const isSubmitting = ref(false)
const showSuccessModal = ref(false)
const workingCalendars = ref<WorkingCalendar[]>([])
const timeSlots = ref<WorkingTime[]>([])

// Format date for API
const formatDateForApi = (date: Date) => {
  return date.toISOString().split('T')[0]
}

// Fetch working calendars for current user
const fetchWorkingCalendars = async () => {
  try {
    const today = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + 1)

    const response = await formStore.getWorkingCalendar(formatDateForApi(today), formatDateForApi(endDate), {
      doctorId: authStore.user?.id,
    })

    if (response?.data) {
      const calendars = response.data[0]?.calendarDetails || []
      workingCalendars.value = calendars.map((calendar: any) => ({
        calendarID: calendar.calendarID,
        workingDate: calendar.date,
        workingTimes: [],
        roomName: calendar.roomName,
        workingStatus: calendar.workingStatus,
      }))
      console.log('Working Calendars:', workingCalendars.value)
    }
  } catch (error) {
    console.error('Error fetching calendars:', error)
    init({
      message: 'Failed to load working calendars',
      color: 'danger',
    })
  }
}

// Sửa lại interface WorkingCalendar trong working-calendar/types.ts để thêm roomName
// interface CalendarDetail {
//   calendarID: string
//   date: string
//   roomName: string
//   workingStatus: number
// }

// Sửa lại computed property với type annotation
const calendarOptions = computed<CalendarOption[]>(() => {
  return workingCalendars.value.map((calendar) => ({
    calendarID: calendar.calendarID,
    workingDate: formatDateDisplay(calendar.workingDate),
    roomName: calendar.roomName,
  }))
})

// Sửa lại text-by prop với type annotation
const formatOptionText = (option: CalendarOption) => {
  return `${option.workingDate} - ${option.roomName}`
}

// Format date display
const formatDateDisplay = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

// Handle calendar selection
const handleCalendarChange = async (calendarID: string) => {
  try {
    formData.timeID = '' // Reset time selection
    timeSlots.value = [] // Reset time slots

    if (!calendarID) return

    const selectedCalendar = workingCalendars.value.find((cal) => cal.calendarID === calendarID)
    if (selectedCalendar) {
      // Gọi API để lấy time slots
      const response = await formStore.getTimeWorkingOfDoctor({
        userID: authStore.user?.id || '',
        date: selectedCalendar.workingDate,
      })

      if (response) {
        timeSlots.value = response
        console.log('Time Slots:', timeSlots.value)
      }
    }
  } catch (error) {
    console.error('Error fetching time slots:', error)
    init({
      message: 'Failed to load time slots',
      color: 'danger',
    })
  }
}

const formData = reactive<ApplicationFormRequest>({
  userID: authStore.user?.id || '',
  calendarID: '',
  timeID: '',
  description: '',
  leaveType: LeaveType.TIME_SLOT,
})

const formErrors = reactive({
  calendarID: '',
  timeID: '',
  description: '',
})

// Format time slot for display
const formatTimeSlot = (timeSlot: WorkingTime) => {
  return `${timeSlot.startTime} - ${timeSlot.endTime}`
}

function validateForm(): boolean {
  let isValid = true
  formErrors.calendarID = ''
  formErrors.timeID = ''
  formErrors.description = ''

  if (!formData.calendarID) {
    formErrors.calendarID = 'Calendar ID is required'
    isValid = false
  }

  if (formData.leaveType === LeaveType.TIME_SLOT && !formData.timeID) {
    formErrors.timeID = 'Time ID is required'
    isValid = false
  }

  if (!formData.description) {
    formErrors.description = 'Description is required'
    isValid = false
  } else if (formData.description.length < 10) {
    formErrors.description = 'Description must be at least 10 characters'
    isValid = false
  }

  return isValid
}

async function submitForm() {
  if (!validateForm()) return

  try {
    isSubmitting.value = true
    await formStore.submitForm(formData)
    showSuccessModal.value = true

    // Reset form
    formData.calendarID = ''
    formData.timeID = ''
    formData.description = ''
  } catch (error: any) {
    init({
      message: error.message || 'An error occurred while submitting the form',
      color: 'danger',
    })
  } finally {
    isSubmitting.value = false
  }
}

function closeSuccessModal() {
  showSuccessModal.value = false
  router.push('/dashboard')
}

onMounted(async () => {
  await fetchWorkingCalendars()
})

// Reset form data khi đổi leave type
watch(
  () => formData.leaveType,
  () => {
    formData.timeID = ''
  },
)
</script>

<style scoped>
/* Add these CSS variables */
:root {
  --primary-50: var(--va-primary-lighter);
  --primary-100: var(--va-primary-light);
  --background-secondary: var(--va-background-secondary);
  --border-color: var(--va-border-color);
  --text-primary: var(--va-text-primary);
  --text-secondary: var(--va-text-secondary);
}

.form-section {
  background: var(--va-background-secondary);
  border-color: var(--va-border-color);
}

:deep(.va-input__content),
:deep(.va-textarea__content),
:deep(.va-select__content) {
  background: var(--va-background-element) !important;
  color: var(--va-text-primary) !important;
}

:deep(.va-modal) {
  background: var(--va-background-secondary);
}

:deep(.va-modal__title) {
  color: var(--va-text-primary);
}

/* Custom scrollbar for dark mode */
.dark ::-webkit-scrollbar-track {
  background: var(--va-background-secondary);
}

.dark ::-webkit-scrollbar-thumb {
  background: var(--va-primary);
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: var(--va-primary-dark);
}

/* Add transition for smooth theme switching */
* {
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.va-input {
  margin-bottom: 1rem;
}

.va-textarea {
  margin-bottom: 1rem;
}

.va-select {
  width: 100%;
}

/* Add smooth transitions */
.va-button {
  transition: all 0.3s ease;
}

/* Add hover effects */
.form-section {
  transition: all 0.3s ease;
}

.form-section:hover {
  transform: translateY(-2px);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
