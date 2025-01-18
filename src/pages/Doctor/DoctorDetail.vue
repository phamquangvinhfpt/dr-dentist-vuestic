<template>
  <VaCard class="min-h-screen bg-gradient-to-br from-blue-50 to-white py-10 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto space-y-8">
      <!-- Doctor Information -->
      <VaCard class="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <div class="flex flex-col sm:flex-row items-center sm:items-start">
          <img
            v-if="doctor.imageUrl"
            :src="getSrcAvatar(doctor.imageUrl)"
            :alt="`${doctor.firstName} ${doctor.lastName}`"
            class="h-32 w-32 sm:h-40 sm:w-40 rounded-full object-cover shadow-lg border-4 border-white"
          />
          <span v-else class="text-sm">No image available</span>
          <div class="sm:ml-8 mt-6 sm:mt-0 text-center sm:text-left flex-1">
            <h1 class="text-3xl font-bold va-h1">{{ doctor.firstName }} {{ doctor.lastName }}</h1>
            <div class="flex items-center justify-center sm:justify-start mt-2">
              <span v-for="i in 5" :key="i" class="text-yellow-400">
                <Star :class="i <= Math.round(doctor.rating || 0) ? 'fill-current' : 'stroke-current'" />
              </span>
              <span class="ml-2 text-sm font-semibold">({{ doctor.totalFeedback }} {{ t('doctor.rating') }})</span>
            </div>
            <div class="mt-4">
              <p class="font-bold">
                <Mail class="inline mr-2" /> {{ t('doctor.email') }}:
                <span class="font-normal">{{ doctor.email }}</span>
              </p>
              <p class="font-bold">
                <Phone class="inline mr-2" /> {{ t('doctor.phone') }}:
                <span class="font-normal">{{ doctor.phoneNumber }}</span>
              </p>
            </div>
          </div>
        </div>
      </VaCard>

      <!-- Professional Information -->
      <VaCard class="rounded-2xl shadow-xl p-6 sm:p-8">
        <h2 class="text-2xl font-semibold mb-6 va-h2">{{ t('doctor.Professional_Information') }}</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <h3 class="text-sm font-bold">{{ t('doctor.education') }}</h3>
            <p class="mt-1 font-normal">{{ doctor.doctorProfile?.education || 'Chưa có thông tin' }}</p>
            <p class="font-normal">{{ doctor.doctorProfile?.college || 'Chưa có thông tin' }}</p>
          </div>
          <div>
            <h3 class="text-sm font-bold">{{ t('doctor.experience') }}</h3>
            <p class="mt-1 font-normal">{{ doctor.doctorProfile?.yearOfExp || 'Chưa có thông tin' }}</p>
          </div>
          <div>
            <h3 class="text-sm font-bold">{{ t('doctor.Job_Type') }}</h3>
            <p class="mt-1 font-normal">
              {{
                doctor.doctorProfile?.workingType === 2
                  ? t('doctor.full_time')
                  : doctor.doctorProfile?.workingType === 1
                    ? t('doctor.part_time')
                    : 'Chưa có thông tin'
              }}
            </p>
          </div>
          <div>
            <h3 class="text-sm font-bold">{{ t('doctor.certification') }}</h3>
            <p class="mt-1 font-normal">{{ doctor.doctorProfile?.certification || 'Chưa có thông tin' }}</p>
          </div>
        </div>
        <div class="mt-6">
          <h3 class="text-sm font-bold">{{ t('doctor.seftDescription') }}</h3>
          <p class="mt-1 font-normal">{{ doctor.doctorProfile?.seftDescription || 'Chưa có thông tin' }}</p>
        </div>
      </VaCard>

      <!-- Patient Feedback -->
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
              <p v-if="isUserOnline(review.patientID)" style="font-weight: bold" class="text-sm">
                {{ t('doctor.my') }}
              </p>
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
              {{ t('doctor.edit') }}
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
        <h3 class="text-xl font-semibold mb-4">{{ t('doctor.Edit_Feedback') }}</h3>
        <textarea
          v-model="editFeedback.message"
          class="w-full p-3 border dark:bg-[#1F262F] border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows="4"
          placeholder="Nội dung phản hồi"
        ></textarea>
        <div class="mt-4">
          <label class="block text-sm font-medium">{{ t('doctor.Rating') }}:</label>
          <div class="flex items-center mt-1">
            <Star
              v-for="i in 5"
              :key="i"
              class="w-6 h-6 cursor-pointer"
              :class="i <= editFeedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300 stroke-current'"
              @click="editFeedback.rating = i"
            />
          </div>
        </div>
        <div class="mt-6 flex justify-end space-x-3">
          <VaButton
            class="px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
            @click="isEditPopupOpen = false"
          >
            {{ t('doctor.cancel') }}
          </VaButton>

          <VaButton
            class="px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            @click="saveEditFeedback"
          >
            {{ t('doctor.save') }}
          </VaButton>
        </div>
      </VaCard>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useDoctorProfileStore } from '@/stores/modules/doctor.module'
import { useAuthStore } from '@/stores/modules/auth.module'
import userService from '@/services/user.service'
import { Star, Mail, Phone, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { getSrcAvatar } from '@/services/utils'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const route = useRoute()
const doctorStore = useDoctorProfileStore()
const authStore = useAuthStore()

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

onMounted(async () => {
  try {
    const id = route.params.id as string
    const response = await doctorStore.getDoctorDetail(id)
    doctor.value = {
      ...response,
      doctorFeedback: (response.doctorFeedback || []).flatMap((feedback: any) => feedback.feedbacks),
    }
  } catch (error) {
    console.error('Error fetching doctor data:', error)
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

const openEditPopup = (review: any) => {
  editFeedback.value = { message: review.message, rating: review.ratings, feedbackID: review.feedbackID }
  isEditPopupOpen.value = true
}

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
.text-sm.font-bold {
  font-weight: bold;
  margin-bottom: 0.5rem; /* Tăng khoảng cách giữa các nhóm thông tin */
}

.text-sm.font-normal {
  font-weight: normal;
}
body {
  font-family: 'Inter', sans-serif;
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.4s ease,
    transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
