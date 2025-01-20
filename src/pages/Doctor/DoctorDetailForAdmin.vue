<template>
  <VaCard class="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Admin Action Bar -->
      <div class="mb-6 flex justify-between items-center"></div>

      <!-- Doctor Information Card -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Profile Section -->
        <VaCard class="lg:col-span-1 bg-white rounded-xl shadow-lg p-6">
          <div class="flex flex-col items-center">
            <div class="relative">
              <img
                v-if="doctor.imageUrl"
                :src="getSrcAvatar(doctor.imageUrl)"
                :alt="`${doctor.firstName} ${doctor.lastName}`"
                class="h-48 w-48 rounded-full object-cover border-4 border-blue-100 shadow-lg"
              />
              <span v-else class="h-48 w-48 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                <i class="fas fa-user-md text-4xl"></i>
              </span>
            </div>
            <h2 class="mt-4 text-2xl font-bold text-gray-900">{{ doctor.firstName }} {{ doctor.lastName }}</h2>
            <div class="flex items-center mt-2">
              <span v-for="i in 5" :key="i" class="text-yellow-400">
                <Star :class="i <= Math.round(doctor.rating || 0) ? 'fill-current' : 'stroke-current'" />
              </span>
              <span class="ml-2 text-sm font-medium">({{ doctor.totalFeedback }})</span>
            </div>
            <div class="w-full mt-6 space-y-3">
              <VaCard class="flex items-center p-3 bg-gray-50 rounded-lg">
                <Mail class="w-5 h-5 text-gray-500 mr-3" />
                <div>
                  <p class="text-sm text-gray-500">{{ t('doctor.email') }}</p>
                  <p class="font-medium">{{ doctor.email }}</p>
                </div>
              </VaCard>
              <VaCard class="flex items-center p-3 bg-gray-50 rounded-lg">
                <Phone class="w-5 h-5 text-gray-500 mr-3" />
                <div>
                  <p class="text-sm text-gray-500">{{ t('doctor.phone') }}</p>
                  <p class="font-medium">{{ doctor.phoneNumber }}</p>
                </div>
              </VaCard>
            </div>
          </div>
        </VaCard>

        <!-- Professional Info & Stats -->
        <VaCard class="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Stats Cards -->
            <div class="grid grid-cols-2 gap-4">
              <VaCard class="bg-purple-50 p-4 rounded-lg">
                <h3 class="text-sm font-medium text-purple-900">{{ t('doctor.appointments') }}</h3>
                <p class="text-2xl font-bold text-purple-700">{{ appointments.length }}</p>
              </VaCard>
              <VaCard class="bg-orange-50 p-4 rounded-lg">
                <h3 class="text-sm font-medium text-orange-900">{{ t('doctor.avg_rating') }}</h3>
                <p class="text-2xl font-bold text-orange-700">{{ doctor.rating?.toFixed(1) || 0 }}</p>
              </VaCard>
            </div>

            <!-- Professional Details -->
            <div class="space-y-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ t('doctor.Professional_Information') }}</h3>
                <div class="space-y-3">
                  <div>
                    <p class="text-sm font-medium text-gray-500">{{ t('doctor.education') }}</p>
                    <p class="text-gray-900">{{ doctor.doctorProfile?.education || t('doctor.no_info') }}</p>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-500">{{ t('doctor.experience') }}</p>
                    <p class="text-gray-900">{{ doctor.doctorProfile?.yearOfExp || t('doctor.no_info') }}</p>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-500">{{ t('doctor.Job_Type') }}</p>
                    <p class="text-gray-900">
                      {{
                        doctor.doctorProfile?.workingType === 2
                          ? t('doctor.full_time')
                          : doctor.doctorProfile?.workingType === 1
                            ? t('doctor.part_time')
                            : t('doctor.no_info')
                      }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Certification Section -->
          <div class="mt-6 border-t pt-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ t('doctor.certification') }}</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p class="text-gray-900">{{ doctor.doctorProfile?.certification || t('doctor.no_info') }}</p>
              </div>
              <div>
                <img
                  v-if="doctor.doctorProfile?.certificationImage"
                  :src="getSrcAvatar(doctor.doctorProfile.certificationImage)"
                  alt="Certification"
                  class="w-full h-40 object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                />
                <div v-else class="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span class="text-gray-400">{{ t('doctor.no_certification_image') }}</span>
                </div>
              </div>
            </div>
          </div>
        </VaCard>
      </div>

      <!-- Tabs Section -->
      <div class="container mx-auto p-6">
        <!-- Navbar -->
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              v-for="tab in tabs"
              :key="tab.name"
              :class="[
                currentTab === tab.name
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              ]"
              @click="currentTab = tab.name"
            >
              {{ tab.label }}
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="mt-6">
          <div v-if="currentTab === 'reviews'" class="space-y-4">
            <VaCard class="rounded-2xl shadow-xl p-6 sm:p-8">
              <h2 class="text-2xl font-semibold mb-6">{{ t('doctor.Patient_Feedback') }}</h2>
              <div class="flex flex-wrap justify-center gap-2 mb-6">
                <button
                  v-for="i in 6"
                  :key="i"
                  :class="{
                    'bg-blue-600 text-white': selectedRating === i,
                    'hover:bg-blue-600': selectedRating !== i,
                  }"
                  class="px-4 py-2 rounded-full transition-all duration-200 text-sm font-medium"
                  @click="filterRating(i)"
                >
                  <span v-if="i === 6">{{ t('doctor.all') }}</span>
                  <span v-else class="flex items-center space-x-1">
                    <span>{{ i }}</span>
                    <Star class="w-4 h-4" :class="i <= selectedRating ? 'fill-current' : 'stroke-current'" />
                  </span>
                </button>
              </div>
              <div class="space-y-6">
                <div
                  v-for="review in paginatedReviews"
                  :key="review.feedbackID"
                  class="border-b border-gray-200 pb-6 last:border-0"
                >
                  <div class="flex items-center">
                    <img
                      v-if="review.patientAvatar"
                      :src="getSrcAvatar(review.patientAvatar)"
                      alt="Avatar"
                      class="h-10 w-10 rounded-full object-cover mr-3"
                    />
                    <img
                      v-else
                      src="https://png.pngtree.com/png-clipart/20230102/original/pngtree-business-man-avatar-png-image_8855195.png"
                      alt="Avatar"
                      class="h-10 w-10 rounded-full object-cover mr-3"
                    />
                    <p v-if="isUserOnline(review.patientID)" style="font-weight: bold" class="text-sm">Tôi</p>
                    <p v-else style="font-weight: bold" class="text-sm">{{ review.patientName }}</p>
                  </div>
                  <div class="flex justify-between items-center">
                    <p class="text-sm">{{ t('doctor.service') }}: {{ review.serviceName }}</p>
                    <span class="text-sm">{{ formatDate(review.createDate) }}</span>
                  </div>
                  <div class="flex items-center mt-2">
                    <p style="margin-right: 0.5%">{{ review.ratings }}</p>
                    <span v-for="i in 5" :key="i">
                      <Star
                        class="w-5 h-5 cursor-pointer"
                        :class="
                          i <= Math.round(review.ratings || 0)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300 stroke-current'
                        "
                        @click="setRating(i)"
                      />
                    </span>
                  </div>
                  <p class="mt-3">{{ review.message }}</p>
                  <button
                    v-if="review.canFeedback && isUserOnline(review.patientID)"
                    class="mt-2 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                    @click="openEditPopup(review)"
                  >
                    Chỉnh Sửa
                  </button>
                </div>
              </div>
              <div class="flex justify-between mt-8">
                <VaButton
                  :disabled="currentPage === 1"
                  class="px-2 py-1 bg-gray-100 font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  @click="prevPage"
                >
                  <ChevronLeft class="w-5 h-5" />
                </VaButton>
                <VaButton
                  :disabled="currentPage >= totalPages"
                  class="px-2 py-1 bg-gray-100 font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  @click="nextPage"
                >
                  <ChevronRight class="w-5 h-5" />
                </VaButton>
              </div>
            </VaCard>
          </div>
          <div v-else-if="currentTab === 'history'" class="space-y-4">
            <h2 class="text-xl font-semibold">{{ t('doctor.History_of_Examination') }}</h2>
            <div v-if="isLoadingAppointments" class="text-center">{{ t('doctor.loading') }}...</div>
            <div v-else-if="filteredAppointments.length === 0" class="text-gray-500">{{ t('doctor.no_medical') }}</div>
            <ul v-else class="space-y-4">
              <li
                v-for="appointment in paginatedAppointments"
                :key="appointment.id"
                class="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div class="flex justify-between">
                  <span class="font-semibold">{{ appointment.appointmentDate }}</span>
                </div>
                <p class="mt-1">{{ appointment.patientName }}</p>
                <p class="mt-1">{{ t('doctor.service') }}: {{ appointment.serviceName }}</p>
              </li>
            </ul>
            <div class="flex justify-between mt-4">
              <VaButton
                :disabled="currentPage === 1"
                class="px-2 py-1 font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                @click="prevPage2"
              >
                <ChevronLeft class="w-5 h-5" />
              </VaButton>
              <VaButton
                :disabled="currentPage >= totalPages2"
                class="px-2 py-1 bg-gray-100 font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                @click="nextPage2"
              >
                <ChevronRight class="w-5 h-5" />
              </VaButton>
            </div>
          </div>
        </div>
      </div>

      <VaButton
        class="w-full sm:w-auto mt-6 bg-gray-200 font-semibold py-1 px-3 rounded-lg shadow-md hover:bg-gray-300 transition-colors duration-200"
        @click="$router.go(-1)"
      >
        {{ t('doctor.back') }}
      </VaButton>
    </div>
  </VaCard>

  <!-- Edit Feedback Popup -->
  <Transition name="fade">
    <div v-if="isEditPopupOpen" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <VaCard class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h3 class="text-xl font-semibold mb-4">Chỉnh Sửa Phản Hồi</h3>
        <textarea
          v-model="editFeedback.message"
          class="w-full p-3 border dark:bg-[#1F262F] border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows="4"
          placeholder="Nội dung phản hồi"
        ></textarea>
        <div class="mt-4">
          <label class="block text-sm font-medium">{{ t('doctor.rating') }}</label>
          <div class="flex items-center mt-1">
            <Star
              v-for="i in 5"
              :key="i"
              class="w-6 h-6 cursor-pointer"
              :class="i <= editFeedback.rating ? 'fill-current' : 'stroke-current'"
              @click="editFeedback.rating = i"
            />
          </div>
        </div>
        <div class="mt-6 flex justify-end space-x-3">
          <VaButton
            class="px-2 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200"
            @click="isEditPopupOpen = false"
          >
            Hủy
          </VaButton>
          <VaButton
            class="px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            @click="saveEditFeedback"
          >
            Lưu
          </VaButton>
        </div>
      </VaCard>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useDoctorProfileStore } from '@/stores/modules/doctor.module'
import { useAuthStore } from '@/stores/modules/auth.module'
import userService from '@/services/user.service'
import { Star, Mail, Phone, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { getSrcAvatar } from '@/services/utils'
import { useAppointmentStore } from '@/stores/modules/appointment.module'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const route = useRoute()
const doctorStore = useDoctorProfileStore()
const authStore = useAuthStore()
const appointmentStore = useAppointmentStore()
const doctorid = route.params.id as string
const currentTab = ref('reviews') // Mặc định tab "Đánh Giá" được chọn
const tabs = [
  { name: 'reviews', label: t('doctor.rating') },
  { name: 'history', label: t('doctor.History_of_Examination') },
]

interface Doctor {
  rating: number
  totalFeedback: number
  imageUrl: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  doctorProfile: {
    education: string
    college: string
    yearOfExp: string
    workingType: number
    seftDescription: string
    certification: string
    certificationImage: string
    id: string
  }
  doctorFeedback: any[]
}

const doctor = ref<Doctor>({
  rating: 0,
  totalFeedback: 0,
  imageUrl: '',
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  doctorProfile: {
    education: '',
    college: '',
    yearOfExp: '',
    workingType: 0,
    seftDescription: '',
    certification: '',
    certificationImage: '',
    id: '',
  },
  doctorFeedback: [],
})

const currentPage = ref(1)
const itemsPerPage = 4
const selectedRating = ref(6)
const isEditPopupOpen = ref(false)
const editFeedback = ref({ message: '', rating: 0, feedbackID: '' })

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

interface Appointment {
  id: string
  dentistId: string
  appointmentDate: string
  patientName: string
  status: string
  serviceName: string
  // Add other relevant properties
}

const appointments = ref<Appointment[]>([])
const filteredAppointments = ref<Appointment[]>([])
watch(
  () => appointments.value,
  (newAppointments) => {
    filteredAppointments.value = newAppointments.filter(
      (appointment: any) => appointment.dentistId === doctor.value.doctorProfile.id,
    )
  },
)
const isLoadingAppointments = ref(true) // Add loading state for appointments

onMounted(async () => {
  try {
    const response = await doctorStore.getDoctorDetailForAdmin(doctorid)
    doctor.value = {
      ...response,
      doctorFeedback: (response.doctorFeedback || []).flatMap((feedback: any) => feedback.feedbacks),
    }
    const appointmentsResponse = await appointmentStore.getAppointments({})
    console.log('danh sách medical', appointmentsResponse)

    // Check if appointmentsResponse is an array
    if (Array.isArray(appointmentsResponse.data)) {
      appointments.value = appointmentsResponse.data as Appointment[] // Assign the response directly
      console.log('danh sách medical filter', appointments.value)
    } else {
      appointments.value = [] // Assign an empty array if not an array
      console.log('danh sách medical filterfilter', appointments.value)
    }
  } catch (error) {
    console.error('Error fetching doctor data:', error)
  } finally {
    isLoadingAppointments.value = false // Set loading state to false after fetching
  }
})

const isUserOnline = (patientID: string) => {
  return authStore.user?.id === patientID
}

const filterRating = (rating: number) => {
  selectedRating.value = rating
  currentPage.value = 1
}

const paginatedReviews = computed(() => {
  const filteredReviews =
    selectedRating.value === 6
      ? doctor.value.doctorFeedback
      : doctor.value.doctorFeedback.filter((review) => review.ratings === selectedRating.value)

  const onlineReviews = filteredReviews.filter((review) => isUserOnline(review.patientID))
  const offlineReviews = filteredReviews.filter((review) => !isUserOnline(review.patientID))
  const combinedReviews = [...onlineReviews, ...offlineReviews]

  const start = (currentPage.value - 1) * itemsPerPage
  return combinedReviews.slice(start, start + itemsPerPage)
})

const totalPages = computed(() => {
  const filteredReviews =
    selectedRating.value === 6
      ? doctor.value.doctorFeedback
      : doctor.value.doctorFeedback.filter((review) => review.ratings === selectedRating.value)

  const onlineReviews = filteredReviews.filter((review) => isUserOnline(review.patientID))
  const offlineReviews = filteredReviews.filter((review) => !isUserOnline(review.patientID))
  const combinedReviews = [...onlineReviews, ...offlineReviews]

  return Math.ceil(combinedReviews.length / itemsPerPage)
})

watch(
  () => appointments.value,
  (newAppointments) => {
    filteredAppointments.value = newAppointments.filter(
      (appointment: any) => appointment.dentistId === doctor.value.doctorProfile.id,
    )
  },
)

const openEditPopup = (review: any) => {
  editFeedback.value = { message: review.message, rating: review.ratings, feedbackID: review.feedbackID }
  isEditPopupOpen.value = true
}
watch(
  () => appointments.value,
  (newAppointments) => {
    filteredAppointments.value = newAppointments.filter(
      (appointment: any) => appointment.dentistId === doctor.value.doctorProfile.id,
    )
  },
)
const saveEditFeedback = async () => {
  try {
    await userService.updateFeedbackDetail({
      feedbackID: editFeedback.value.feedbackID,
      message: editFeedback.value.message,
      rating: editFeedback.value.rating,
    })

    const feedbackIndex = doctor.value.doctorFeedback.findIndex(
      (feedback) => feedback.feedbackID === editFeedback.value.feedbackID,
    )
    if (feedbackIndex !== -1) {
      doctor.value.doctorFeedback[feedbackIndex].message = editFeedback.value.message
      doctor.value.doctorFeedback[feedbackIndex].ratings = editFeedback.value.rating
      doctor.value.doctorFeedback[feedbackIndex].canFeedback = false
    }

    isEditPopupOpen.value = false
  } catch (error) {
    console.error('Error updating feedback:', error)
  }
}

const setRating = (rating: number) => {
  editFeedback.value.rating = rating
}

const paginatedAppointments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredAppointments.value.slice(start, start + itemsPerPage)
})

const totalPages2 = computed(() => {
  return Math.ceil(filteredAppointments.value.length / itemsPerPage)
})

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}
const nextPage2 = () => {
  if (currentPage.value < totalPages2.value) {
    currentPage.value++
  }
}

const prevPage2 = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.image-review {
  position: relative; /* Đảm bảo container này quản lý các phần tử con */
}

.hover\:zoom-image {
  transition:
    transform 0.3s ease,
    filter 0.3s ease; /* Hiệu ứng mượt */
  position: relative;
  z-index: 1;
  transform-origin: center center; /* Đảm bảo hình ảnh phóng to từ giữa */
}

.hover\:zoom-image:hover {
  transform: scale(4); /* Phóng to hình ảnh khi hover */
  z-index: 2; /* Đưa hình ảnh lên trên overlay */
}

/* Overlay styling */
.image-review .overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7); /* Màu nền mờ */
  z-index: 1;
  pointer-events: none; /* Không chặn thao tác chuột */
  transition:
    opacity 0.3s ease,
    filter 0.3s ease;
  filter: blur(50px); /* Không làm mờ mặc định */
  opacity: 0;
}

.image-review:hover .overlay {
  filter: blur(5px); /* Làm mờ nền */
  opacity: 1; /* Hiển thị overlay */
}
.text-sm.font-bold {
  font-weight: bold;
  margin-bottom: 0.5rem; /* Tăng khoảng cách giữa các nhóm thông tin */
}

.text-sm.font-normal {
  font-weight: normal;
}
</style>
