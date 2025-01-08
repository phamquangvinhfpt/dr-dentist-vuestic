<template>
  <div class="form-dentist-container">
    <VaCard class="form-card">
      <VaCardTitle class="card-title">
        <div class="flex items-center gap-4">
          <i class="fas fa-file-alt title-icon"></i>
          <h2 class="text-2xl font-semibold">{{ t('form.MyForms') }}</h2>
        </div>
      </VaCardTitle>

      <VaCardContent>
        <div class="header-actions">
          <div class="search-section">
            <VaInput v-model="searchQuery" :placeholder="$t('form.SearchForms')" class="search-input" size="medium">
              <template #prepend>
                <VaIcon name="search" color="primary" class="search-icon" />
              </template>
              <template v-if="searchQuery" #append>
                <VaIcon name="clear" class="clear-icon" color="gray" @click="searchQuery = ''" />
              </template>
            </VaInput>
          </div>

          <div class="button-group flex items-center gap-4">
            <VaButton class="create-button" color="primary" icon="add" @click="handleCreateButtonClick">
              {{ t('form.CreateApplication') }}
            </VaButton>

            <div class="status-tabs">
              <div
                v-for="status in statusFilterOptions"
                :key="status.id"
                class="status-tab"
                :class="{
                  active: selectedStatusFilter === status.value,
                }"
                @click="handleStatusFilterChange(status.value)"
              >
                {{ status.label }}
              </div>
            </div>
          </div>
        </div>

        <VaDataTable
          class="custom-table"
          :items="formList"
          :columns="columns"
          hoverable
          sticky-header
          striped
          no-data-html="<div class='text-center'>No forms found</div>"
        >
          <template #cell(workingDate)="{ row }">
            <div class="flex items-center gap-2">
              <span>{{ formatDate(row.rowData.workingDate) }}</span>
            </div>
          </template>

          <template #cell(workingTimes)="{ row }">
            <div class="working-times-cell">
              <div v-for="time in row.rowData.workingTimes" :key="time.timeID" class="time-item">
                <span class="time-text">{{ formatTime(time.startTime) }} - {{ formatTime(time.endTime) }}</span>
              </div>
            </div>
          </template>

          <template #cell(description)="{ row }">
            <div class="flex items-center gap-2 ellipsis max-w-[230px]">
              <span class="w-24">{{ row.rowData.description }}</span>
            </div>
          </template>

          <template #cell(status)="{ row }">
            <div class="flex items-center gap-2">
              <div class="status-badge" :class="getStatusDotClass(row.rowData.status)">
                {{ getStatusText(row.rowData.status) }}
              </div>
            </div>
          </template>

          <template #cell(action)="{ row }">
            <div class="action-buttons">
              <VaButton
                color="info"
                size="small"
                class="action-button-circle"
                preset="primary"
                round
                @click="viewDetails(row.rowData as FormDTO)"
              >
                <VaIcon name="visibility" />
              </VaButton>
            </div>
          </template>
        </VaDataTable>

        <div class="table-footer">
          <div v-if="formList.length > 0" class="footer-content">
            <div class="records-info">
              <b>{{ formList.length }} {{ t('common.result') }}</b>
              <span class="page-size-selector">
                {{ t('common.resultPerPage') }}
                <VaSelect
                  v-model="formData.pageSize"
                  class="page-size-select"
                  :options="[10, 50, 100]"
                  @update:modelValue="handlePageSizeChange"
                />
              </span>
            </div>
            <div v-if="totalPages > 1" class="pagination-container">
              <VaPagination
                v-model="currentPage"
                buttons-preset="primary"
                :pages="totalPages"
                :visible-pages="5"
                :boundary-links="true"
                :direction-links="true"
                @update:modelValue="handlePageChange"
              />
            </div>
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Form Details Modal -->
    <VaModal v-model="showDetailsModal" :title="$t('form.FormDetails')" hide-default-actions class="details-modal">
      <div v-if="selectedForm" class="form-details-container">
        <div class="details-header">
          <div class="status-badge" :class="getStatusColor(selectedForm.status)">
            <div class="status-dot" :class="getStatusDotClass(selectedForm.status)"></div>
            {{ getStatusText(selectedForm.status) }}
          </div>
        </div>

        <div class="details-grid">
          <div class="detail-section">
            <h3 class="section-title"><i class="fas fa-info-circle mr-2"></i>{{ t('form.BasicInformation') }}</h3>
            <div class="detail-content">
              <div class="detail-item">
                <span class="detail-label">{{ t('form.WorkingDate') }}</span>
                <span class="detail-value">{{ formatDate(selectedForm.workingDate) }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3 class="section-title"><i class="fas fa-clock mr-2"></i>{{ t('form.WorkingHours') }}</h3>
            <div class="detail-content">
              <div class="working-times-grid">
                <div v-for="time in selectedForm.workingTimes" :key="time.timeID" class="time-slot">
                  <i class="fas fa-business-time mr-2"></i>
                  <span>{{ formatTime(time.startTime) }} - {{ formatTime(time.endTime) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="detail-section full-width">
            <h3 class="section-title"><i class="fas fa-align-left mr-2"></i>{{ t('form.Description') }}</h3>
            <div class="detail-content">
              <p class="description-text">{{ selectedForm.description || $t('form.noDescription') }}</p>
            </div>
          </div>

          <div class="detail-section full-width">
            <h3 class="section-title"><i class="fas fa-sticky-note mr-2"></i>{{ t('form.Notes') }}</h3>
            <div class="detail-content">
              <div class="note-container">
                <p class="note-text">{{ selectedForm.note || $t('form.noNotes') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="modal-footer">
          <VaButton color="gray" class="close-button" @click="showDetailsModal = false">
            <i class="fas fa-times mr-2"></i>{{ t('form.Close') }}
          </VaButton>
        </div>
      </template>
    </VaModal>

    <!-- Application Form Modal -->
    <VaModal v-model="showApplicationModal" hide-default-actions class="application-modal">
      <div class="application-form-container">
        <div class="text-center mb-6">
          <h2
            class="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
          >
            {{ t('form.ApplicationForm') }}
          </h2>
          <p class="mt-2 text-sm text-gray-500">{{ t('form.PleaseDetails') }}</p>
        </div>

        <form class="space-y-8" @submit.prevent="submitApplicationForm">
          <!-- Calendar Select -->
          <div class="transition-all duration-200 hover:shadow-md p-4 rounded-lg border border-gray-100">
            <label for="calendarID" class="block text-sm font-semibold text-gray-700 mb-2">
              {{ t('form.SelectWorkingDate') }}
            </label>
            <VaSelect
              v-model="applicationFormData.calendarID"
              :options="calendarOptions"
              value-by="calendarID"
              :text-by="formatOptionText"
              :error="!!applicationFormErrors.calendarID"
              :error-messages="applicationFormErrors.calendarID"
              :placeholder="t('form.SelectWorkingDate')"
              class="w-full"
              @update:modelValue="handleCalendarChange"
            />
          </div>

          <!-- Leave Type Select -->
          <div class="transition-all duration-200 hover:shadow-md p-4 rounded-lg border border-gray-100">
            <label class="block text-sm font-semibold text-gray-700 mb-2">{{ t('form.LeaveType') }}</label>
            <div class="flex gap-6">
              <VaRadio
                v-model="applicationFormData.leaveType"
                :option="LeaveType.TIME_SLOT"
                :label="t('form.TimeSlot')"
                class="hover:opacity-80 transition-opacity"
              />
              <VaRadio
                v-model="applicationFormData.leaveType"
                :option="LeaveType.ALL_DAY"
                :label="t('form.AllDay')"
                class="hover:opacity-80 transition-opacity"
              />
            </div>
          </div>

          <!-- Time Slot Select -->
          <div
            v-if="applicationFormData.leaveType === LeaveType.TIME_SLOT"
            class="transition-all duration-200 hover:shadow-md p-4 rounded-lg border border-gray-100"
          >
            <label for="timeID" class="block text-sm font-semibold text-gray-700 mb-2">
              {{ t('form.SelectTimeSlot') }}
            </label>
            <VaSelect
              v-model="applicationFormData.timeID"
              :options="timeSlots"
              value-by="timeID"
              :text-by="formatTimeSlot"
              :error="!!applicationFormErrors.timeID"
              :error-messages="applicationFormErrors.timeID"
              :placeholder="t('form.SelectTimeSlot')"
              class="w-full"
              :disabled="!applicationFormData.calendarID"
            />
          </div>

          <!-- Description -->
          <div class="transition-all duration-200 hover:shadow-md p-4 rounded-lg border border-gray-100">
            <label for="description" class="block text-sm font-semibold text-gray-700 mb-2">
              {{ t('form.Description') }}
            </label>
            <VaTextarea
              id="description"
              v-model="applicationFormData.description"
              rows="4"
              class="w-full"
              :error="!!applicationFormErrors.description"
              :error-messages="applicationFormErrors.description"
              :placeholder="t('form.DescriptionPlaceholder')"
              required
            />
          </div>

          <!-- Submit Buttons -->
          <div class="flex justify-end gap-4 pt-4">
            <VaButton
              preset="secondary"
              class="px-8 py-3 rounded-lg transform transition-transform hover:scale-105"
              @click="showApplicationModal = false"
            >
              <span class="flex items-center">
                <i class="fas fa-arrow-left mr-2"></i>
                {{ t('common.Back') }}
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
                  {{ t('common.Submitting') }}
                </span>
              </template>
              <template v-else>
                <span class="flex items-center">
                  <i class="fas fa-paper-plane mr-2"></i>
                  {{ t('form.SubmitApplication') }}
                </span>
              </template>
            </VaButton>
          </div>
        </form>
      </div>
    </VaModal>

    <!-- Success Modal -->
    <VaModal v-model="showSuccessModal" hide-default-actions class="rounded-xl">
      <template #header>
        <div class="text-center p-4">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <i class="fas fa-check text-green-600 text-xl"></i>
          </div>
          <h3 class="text-xl font-semibold text-gray-900">{{ t('form.ApplicationSubmitted') }}</h3>
        </div>
      </template>

      <div class="px-4 pb-4">
        <p class="text-sm text-gray-500 text-center">
          {{ t('form.ApplicationSuccess') }}
        </p>
      </div>

      <div class="mt-5 flex justify-center pb-6">
        <VaButton
          preset="primary"
          class="px-6 py-2 rounded-lg transform transition-transform hover:scale-105"
          @click="closeSuccessModal"
        >
          <i class="fas fa-check mr-2"></i>
          {{ t('form.GotIt') }}
        </VaButton>
      </div>
    </VaModal>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, reactive, computed, watch, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vuestic-ui'
import { useAuthStore } from '@/stores/modules/auth.module'
import { useRouter } from 'vue-router'
import { useFormStore } from '@/stores/modules/form.module'
import { LeaveType } from './types'
import type { FormDTO, FilterForm, ApplicationFormRequest, CalendarOption } from './types'
import type { WorkingCalendar, WorkingTime } from '@/pages/working-calendar/types'

const { t } = useI18n()
const { init } = useToast()
const formStore = useFormStore()
const authStore = useAuthStore()
const router = useRouter()

// Form list data
const formData = reactive({
  pageNumber: 1,
  pageSize: 10,
  isActive: true,
  orderBy: [],
})

const formList = ref<FormDTO[]>([])
const allForms = ref<FormDTO[]>([])
const searchQuery = ref('')
const currentPage = ref(1)
const selectedStatusFilter = ref<number | null>(null)
const showDetailsModal = ref(false)
const selectedForm = ref<FormDTO | null>(null)

// Application Form Data
const showApplicationModal = ref(false)
const showSuccessModal = ref(false)
const isSubmitting = ref(false)
const workingCalendars = ref<WorkingCalendar[]>([])
const timeSlots = ref<WorkingTime[]>([])

const applicationFormData = reactive<ApplicationFormRequest>({
  userID: authStore.user?.id || '',
  calendarID: '',
  timeID: '',
  description: '',
  leaveType: LeaveType.TIME_SLOT,
})

const applicationFormErrors = reactive({
  calendarID: '',
  timeID: '',
  description: '',
})

// Computed properties
const filteredForms = computed(() => {
  let filtered = [...allForms.value]

  if (selectedStatusFilter.value !== null) {
    filtered = filtered.filter((form) => form.status === selectedStatusFilter.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter((form) => {
      const description = form.description.toLowerCase()
      const date = formatDate(form.workingDate)
      const dateVariants = [date, date.split('/')[0], date.split('/').slice(0, 2).join('/'), date.replace(/\//g, '')]

      if (description.includes(query)) {
        return true
      }

      return dateVariants.some((variant) => variant.includes(query.replace(/\//g, '')))
    })
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredForms.value.length / formData.pageSize))

const columns = computed(() => [
  { key: 'workingDate', label: t('form.workingDate') },
  { key: 'workingTimes', label: t('form.workingTimes') },
  { key: 'description', label: t('form.description') },
  { key: 'status', label: t('form.status') },
  { key: 'action', label: t('common.actions') },
])

const calendarOptions = computed<CalendarOption[]>(() => {
  return workingCalendars.value.map((calendar) => ({
    calendarID: calendar.calendarID,
    workingDate: formatDateDisplay(calendar.workingDate),
    roomName: calendar.roomName,
  }))
})

// Utility functions
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

const formatTime = (time: string) => {
  if (!time) return ''
  return new Date(`1970-01-01T${time}`).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatDateForApi = (date: Date) => {
  return date.toISOString().split('T')[0]
}

const formatDateDisplay = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

const formatTimeSlot = (timeSlot: WorkingTime) => {
  return `${timeSlot.startTime} - ${timeSlot.endTime}`
}

const formatOptionText = (option: CalendarOption) => {
  return `${option.workingDate} - ${option.roomName}`
}

const getStatusText = (status: number) => {
  switch (status) {
    case 0:
      return t('form.waiting')
    case 1:
      return t('form.accepted')
    case 2:
      return t('form.failed')
    default:
      return ''
  }
}

const getStatusColor = (status: number) => {
  switch (status) {
    case 0:
      return 'warning'
    case 1:
      return 'success'
    case 2:
      return 'danger'
    default:
      return 'gray'
  }
}

const getStatusDotClass = (status: number) => {
  switch (status) {
    case 0:
      return 'warning'
    case 1:
      return 'success'
    case 2:
      return 'danger'
    default:
      return ''
  }
}

// API calls
const getAllForms = async () => {
  try {
    const currentUserID = authStore.user?.id

    if (!currentUserID) {
      throw new Error('User ID not found')
    }

    const filter: FilterForm = {
      pageNumber: 1,
      pageSize: 1000, // Get all forms at once
      isActive: formData.isActive,
      orderBy: formData.orderBy,
      advancedFilter: {
        logic: 'and',
        filters: [
          {
            field: 'userID',
            operator: 'eq',
            value: currentUserID,
          },
        ],
      },
    }

    const response = await formStore.getAllForms(filter)
    allForms.value = response.data
    updateDisplayedForms()
  } catch (error) {
    console.error('Error fetching forms:', error)
    init({
      message: t('form.fetchError'),
      color: 'danger',
      duration: 3000,
    })
  }
}

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
    }
  } catch (error) {
    console.error('Error fetching calendars:', error)
    init({
      message: t('form.CalendarLoadError'),
      color: 'danger',
    })
  }
}

// Event handlers
const handlePageChange = (page: number) => {
  currentPage.value = page
  formData.pageNumber = page
  updateDisplayedForms()
}

const handlePageSizeChange = (size: number) => {
  formData.pageSize = size
  formData.pageNumber = 1
  currentPage.value = 1
  updateDisplayedForms()
}

const handleCalendarChange = async (calendarID: string) => {
  try {
    applicationFormData.timeID = ''
    timeSlots.value = []

    if (!calendarID) return

    const selectedCalendar = workingCalendars.value.find((cal) => cal.calendarID === calendarID)
    if (selectedCalendar) {
      const response = await formStore.getTimeWorkingOfDoctor({
        userID: authStore.user?.id || '',
        date: selectedCalendar.workingDate,
      })

      if (response) {
        // Filter out time slots that are already in existing forms
        const existingForms = formList.value.filter(
          (form) => form.calendarID === calendarID && form.status !== 2, // Exclude rejected forms
        )

        const usedTimeSlots = new Set(existingForms.flatMap((form) => form.workingTimes.map((time) => time.timeID)))

        timeSlots.value = response.filter((timeSlot: any) => !usedTimeSlots.has(timeSlot.timeID))
      }
    }
  } catch (error) {
    console.error('Error fetching time slots:', error)
    init({
      message: t('form.TimeSlotsLoadError'),
      color: 'danger',
    })
  }
}

const handleStatusFilterChange = (status: number | null) => {
  selectedStatusFilter.value = status
  formData.pageNumber = 1
  currentPage.value = 1
  updateDisplayedForms()
}

const viewDetails = (form: FormDTO) => {
  selectedForm.value = form
  showDetailsModal.value = true
}

// Status filter options
const statusFilterOptions = [
  { id: 'all', value: null, label: t('form.allStatus') },
  { id: 'waiting', value: 0, label: t('form.waiting') },
  { id: 'accepted', value: 1, label: t('form.accepted') },
  { id: 'failed', value: 2, label: t('form.failed') },
]

// Form validation and submission
function validateApplicationForm(): boolean {
  let isValid = true
  applicationFormErrors.calendarID = ''
  applicationFormErrors.timeID = ''
  applicationFormErrors.description = ''

  if (!applicationFormData.calendarID) {
    applicationFormErrors.calendarID = t('form.CalendarRequired')
    isValid = false
  }

  if (applicationFormData.leaveType === LeaveType.TIME_SLOT && !applicationFormData.timeID) {
    applicationFormErrors.timeID = t('form.TimeRequired')
    isValid = false
  }

  // Check for existing forms on the same date
  const existingForms = formList.value.filter(
    (form) =>
      form.status !== 2 && // Exclude rejected forms
      form.calendarID === applicationFormData.calendarID,
  )

  if (existingForms.length > 0) {
    // Check if there's any ALL_DAY form
    const hasAllDayForm = existingForms.some((form) => {
      // If the form has multiple time slots, it's likely an ALL_DAY form
      return form.workingTimes.length > 1
    })

    // Check if there's any TIME_SLOT form
    const hasTimeSlotForm = existingForms.some((form) => {
      // If the form has exactly one time slot, it's a TIME_SLOT form
      return form.workingTimes.length === 1
    })

    if (applicationFormData.leaveType === LeaveType.ALL_DAY) {
      // If trying to create ALL_DAY form but TIME_SLOT forms exist
      if (hasTimeSlotForm || hasAllDayForm) {
        applicationFormErrors.calendarID = t('form.HasTimeSlotError')
        isValid = false
      }
    } else {
      // If trying to create TIME_SLOT form but ALL_DAY form exists
      if (hasAllDayForm) {
        applicationFormErrors.timeID = t('form.HasAllDayError')
        isValid = false
      } else {
        // Check for duplicate time slot
        const hasTimeConflict = existingForms.some((form) =>
          form.workingTimes.some((time) => time.timeID === applicationFormData.timeID),
        )
        if (hasTimeConflict) {
          applicationFormErrors.timeID = t('form.DuplicateTimeError')
          isValid = false
        }
      }
    }
  }

  if (!applicationFormData.description) {
    applicationFormErrors.description = t('form.DescriptionRequired')
    isValid = false
  } else if (applicationFormData.description.length < 10) {
    applicationFormErrors.description = t('form.DescriptionLength')
    isValid = false
  }

  return isValid
}

async function submitApplicationForm() {
  if (!validateApplicationForm()) return

  try {
    isSubmitting.value = true
    await formStore.submitForm(applicationFormData)
    showSuccessModal.value = true
    showApplicationModal.value = false

    // Reset form
    applicationFormData.calendarID = ''
    applicationFormData.timeID = ''
    applicationFormData.description = ''
    await getAllForms()
  } catch (error: any) {
    init({
      message: error.message || t('form.SubmitError'),
      color: 'danger',
    })
  } finally {
    isSubmitting.value = false
  }
}

function closeSuccessModal() {
  showSuccessModal.value = false
  getAllForms()
}

// Lifecycle hooks
onMounted(async () => {
  if (!authStore.musHaveRole('Dentist')) {
    init({
      message: t('common.unauthorized'),
      color: 'danger',
      duration: 3000,
    })
    router.push({ name: 'dashboard' })
    return
  }

  await getAllForms()
})

onBeforeUnmount(() => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
})

// Watchers
watch(searchQuery, () => {
  formData.pageNumber = 1
  currentPage.value = 1
  updateDisplayedForms()
})

watch(
  () => applicationFormData.leaveType,
  () => {
    applicationFormData.timeID = ''
  },
)

// Update create button click handler
const searchTimeout = ref<NodeJS.Timeout>()

// Update create button click handler
const handleCreateButtonClick = async () => {
  showApplicationModal.value = true
  await fetchWorkingCalendars()
}

// Add new function to update displayed forms
const updateDisplayedForms = () => {
  const startIndex = (formData.pageNumber - 1) * formData.pageSize
  const endIndex = startIndex + formData.pageSize
  formList.value = filteredForms.value.slice(startIndex, endIndex)
}
</script>

<style scoped>
.form-dentist-container {
  padding: 2rem;
  background: var(--va-background-primary);
  min-height: 100vh;
}

.form-card {
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  background: var(--va-background-secondary);
  border: 1px solid var(--va-border-color);
  transition: all 0.3s ease;
  animation: fadeIn 0.5s ease-out;
}

.form-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
}

.card-title {
  padding: 1.8rem;
  border-bottom: 1px solid var(--va-border-color);
  background: var(--va-background-secondary);
}

.title-icon {
  font-size: 2.2rem;
  background: linear-gradient(45deg, var(--va-primary) 0%, #4f46e5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  margin-bottom: 1rem;
  gap: 1.5rem;
}

.search-section {
  width: 60%;
  max-width: 600px;
}

.search-icon {
  font-size: 1.1rem;
  margin-left: 1rem;
  color: var(--va-text-secondary) !important;
  opacity: 0.7;
}

.clear-icon {
  cursor: pointer;
  padding: 0.4rem;
  margin-right: 1rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  opacity: 0.7;
}

.clear-icon:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.05);
}

.status-filter-button {
  height: 45px;
  min-width: 150px;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.status-filter-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.custom-table {
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
}

.custom-table:deep(th) {
  background: var(--va-background-secondary) !important;
  font-size: 1rem;
  font-weight: 600;
  padding: 1.2rem 1.5rem;
  color: var(--va-text-primary) !important;
  border-bottom: 2px solid #e2e8f0;
}

.custom-table:deep(td) {
  padding: 1.2rem 1.5rem;
  color: var(--va-text-primary);
  border-bottom: 1px solid #f1f5f9;
}

.custom-table:deep(tr:hover td) {
  background: var(--va-background-element) !important;
}

.working-times-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 220px;
}

.time-item {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  background: var(--va-background-secondary);
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.time-item:hover {
  background: var(--va-background-secondary);
  border-color: var(--va-primary);
  transform: translateX(5px);
}

.time-text {
  font-size: 0.9rem;
  color: var(--va-text-primary);
  font-weight: 500;
}

.status-badge {
  padding: 8px 16px;
  border-radius: 30px;
  font-size: 0.875rem;
  font-weight: 600;
  text-align: center;
  min-width: 120px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.status-badge.warning {
  background: linear-gradient(45deg, #fef3c7 0%, #fde68a 100%);
  color: #b45309;
}

.status-badge.success {
  background: linear-gradient(45deg, #d1fae5 0%, #a7f3d0 100%);
  color: #047857;
}

.status-badge.danger {
  background: linear-gradient(45deg, #fee2e2 0%, #fecaca 100%);
  color: #b91c1c;
}

.action-button-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-button-circle:hover {
  transform: rotate(15deg) scale(1.1);
}

.table-footer {
  margin-top: 2rem;
  padding: 1.5rem;
  border-top: 1px solid var(--va-background-secondary);
  background: var(--va-background-secondary);
  border-radius: 0 0 15px 15px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.records-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  color: var(--va-text-primary);
  font-size: 1.1rem;
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 1rem;
}

.page-size-select {
  width: 90px;
}

/* Modal styles */
:deep(.va-modal__container) {
  border-radius: 20px;
  overflow: hidden;
}

:deep(.va-modal__title) {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  padding: 1.5rem;
  border-bottom: 1px solid #edf2f7;
  background: var(--va-background-secondary);
}

:deep(.va-list-item) {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

:deep(.va-list-item:last-child) {
  border-bottom: none;
}

:deep(.va-list-item__label) {
  font-size: 1rem;
  color: #334155;
}

.working-times-list {
  margin-top: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-card {
  animation: fadeIn 0.5s ease-out;
}

/* Status filter dropdown */
.status-dropdown-content {
  min-width: 200px;
  padding: 8px;
  border-radius: 15px;
  background: white;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.status-item {
  padding: 10px 15px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.status-item:hover {
  background: #f8fafc;
  transform: translateX(5px);
}

.status-item-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.status-check {
  color: var(--va-primary);
}

/* Form Details Modal Styles */
.details-modal :deep(.va-modal__container) {
  max-width: 800px;
  width: 90%;
}

.form-details-container {
  padding: 1.5rem;
}

.details-header {
  margin-bottom: 2rem;
  display: flex;
  justify-content: flex-end;
}

.status-badge {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  gap: 0.5rem;
}

.status-badge.warning {
  background-color: #fff7ed;
  color: #c2410c;
}

.status-badge.success {
  background-color: #f0fdf4;
  color: #15803d;
}

.status-badge.danger {
  background-color: #fef2f2;
  color: #b91c1c;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.detail-section {
  background: var(--va-background-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px var(--va-text-primary);
  transition: all 0.3s ease;
}

.detail-section:hover {
  box-shadow: 0 4px 6px var(--va-text-primary);
  transform: translateY(-2px);
}

.detail-section.full-width {
  grid-column: 1 / -1;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--va-text-primary);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #f1f5f9;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.detail-label {
  color: var(--va-text-primary);
  font-weight: 500;
}

.detail-value {
  color: var(--va-text-primary);
  font-weight: 600;
}

.working-times-grid {
  display: grid;
  gap: 0.75rem;
}

.time-slot {
  background: var(--va-background-secondary);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  color: var(--va-text-primary);
  font-weight: 500;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
}

.time-slot:hover {
  background: var(--va-background-secondary);
  transform: translateX(5px);
}

.description-text {
  color: var(--va-text-primary);
  line-height: 1.6;
  white-space: pre-line;
}

.note-container {
  background: #fffbeb;
  border-left: 4px solid #f59e0b;
  padding: 1rem;
  border-radius: 0 8px 8px 0;
}

.note-text {
  color: #92400e;
  line-height: 1.6;
  font-style: italic;
}

.modal-footer {
  padding: 1rem 1.5rem;
  background: var(--va-background-secondary);
  display: flex;
  justify-content: flex-end;
}

.close-button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.close-button:hover {
  transform: translateY(-2px);
}

@media (max-width: 640px) {
  .details-grid {
    grid-template-columns: 1fr;
  }

  .detail-item {
    flex-direction: column;
    gap: 0.5rem;
  }

  .detail-value {
    padding-left: 1rem;
  }
}

/* Thêm styles mới cho status filter */
.status-tabs {
  display: flex;
  gap: 1px;
  background: var(--va-background-secondary);
  padding: 4px;
  border-radius: 8px;
}

.status-tab {
  padding: 8px 16px;
  text-align: center;
  cursor: pointer;
  font-weight: 500;
  color: var(--va-text-primary);
  border-radius: 6px;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.status-tab:hover {
  color: var(--va-text-primary);
  background: var(--va-background-element);
}

.status-tab.active {
  background: var(--va-background-secondary);
  color: var(--va-primary);
  box-shadow: 0 1px 3px var(--va-background-primary);
}

/* Responsive */
@media (max-width: 640px) {
  .status-tabs {
    flex-wrap: wrap;
    gap: 4px;
  }

  .status-tab {
    flex: 1;
    min-width: calc(50% - 2px);
  }
}

/* Giữ nguyên tất cả các styles khác không liên quan đến màu sắc */

.create-button {
  padding: 0.5rem 1rem;
  height: 38px;
  font-size: 0.9rem;
  border-radius: 8px;
  background: var(--va-primary);
  color: white;
}

.create-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.button-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--va-background-element);
  padding: 4px;
  border-radius: 8px;
}

/* Thêm responsive styles */
@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    gap: 0.75rem;
  }

  .search-section {
    width: 100%;
    max-width: none;
  }

  .button-group {
    width: 100%;
    justify-content: space-between;
  }

  .create-button {
    width: auto;
  }
}

/* Add styles for application modal */
.application-modal :deep(.va-modal__container) {
  max-width: 800px;
  width: 90%;
}

.application-form-container {
  padding: 2rem;
}

/* Add any additional styles needed for the application form */

/* Add responsive styles */
@media screen and (max-width: 1400px) {
  .form-dentist-container {
    padding: 1.5rem;
  }

  .details-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

@media screen and (max-width: 1200px) {
  .header-actions {
    flex-direction: column;
    gap: 1rem;
  }

  .search-section {
    width: 100%;
  }

  .button-group {
    width: 100%;
    justify-content: space-between;
  }
}

@media screen and (max-width: 992px) {
  .custom-table {
    overflow-x: auto;
  }

  .custom-table:deep(table) {
    min-width: 800px;
  }

  .status-tabs {
    width: 100%;
    justify-content: center;
  }
}

@media screen and (max-width: 768px) {
  .form-dentist-container {
    padding: 1rem;
  }

  .card-title {
    padding: 1.2rem;
  }

  .title-icon {
    font-size: 1.8rem;
  }

  .records-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .page-size-selector {
    width: 100%;
    justify-content: space-between;
  }

  .details-modal :deep(.va-modal__container),
  .application-modal :deep(.va-modal__container) {
    width: 95%;
    margin: 0.5rem;
  }
}

@media screen and (max-width: 576px) {
  .form-dentist-container {
    padding: 0.5rem;
  }

  .card-title h2 {
    font-size: 1.5rem;
  }

  .status-tabs {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .status-tab {
    width: calc(50% - 0.25rem);
    padding: 0.5rem;
    font-size: 0.9rem;
  }

  .table-footer {
    padding: 1rem;
  }

  .form-details-container,
  .application-form-container {
    padding: 1rem;
  }

  .detail-section {
    padding: 1rem;
  }

  .time-slot {
    padding: 0.5rem;
    font-size: 0.9rem;
  }

  :deep(.va-modal__dialog) {
    margin: 0.5rem;
  }
}

@media screen and (max-width: 480px) {
  .button-group {
    flex-direction: column;
    width: 100%;
  }

  .create-button {
    width: 100%;
  }

  .status-tabs {
    width: 100%;
  }

  .status-tab {
    width: 100%;
  }

  .action-buttons {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
  }
}
</style>
