<template>
  <VaCard class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-5xl mx-auto space-y-8">
      <!-- Doctor Information -->
      <VaCard class="bg-white rounded-3xl shadow-2xl p-8 transform hover:scale-[1.02] transition-all duration-300">
        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-8">
          <div class="relative">
            <img
              v-if="doctor.imageUrl"
              :src="getSrcAvatar(doctor.imageUrl)"
              :alt="`${doctor.firstName} ${doctor.lastName}`"
              class="h-40 w-40 sm:h-48 sm:w-48 rounded-2xl object-cover shadow-xl border-4 border-white hover:border-blue-100 transition-all duration-300"
            />
            <div v-else class="h-40 w-40 sm:h-48 sm:w-48 rounded-2xl flex items-center justify-center">
              <span class="text-gray-400">No image available</span>
            </div>
          </div>
          <div class="flex-1 text-center sm:text-left space-y-6">
            <div>
              <h1 class="text-4xl font-bold mb-2">Dr. {{ doctor.firstName }} {{ doctor.lastName }}</h1>
              <div class="flex items-center justify-center sm:justify-start gap-2">
                <span v-for="i in 5" :key="i" class="text-yellow-400 transform hover:scale-110 transition-transform">
                  <Star :class="i <= Math.round(doctor.rating || 0) ? 'fill-current' : 'stroke-current'" />
                </span>
                <span class="ml-2 text-sm font-semibold">({{ doctor.totalFeedback }} {{ t('doctor.rating') }})</span>
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <VaCard
                class="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors"
                @click="copy(doctor.email)"
              >
                <Mail class="w-5 h-5 text-blue-600" />
                <VaCard>
                  <p class="text-sm">{{ t('doctor.email') }}</p>
                  <p class="font-medium">{{ doctor.email }}</p>
                </VaCard>
                <button class="absolute right-3 top-3" @click.stop="copy(doctor.email)">
                  <Clipboard class="w-5 h-5 text-blue-600" />
                </button>
              </VaCard>

              <VaCard
                class="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors"
                @click="copy(doctor.phoneNumber)"
              >
                <Phone class="w-5 h-5 text-blue-600" />
                <div>
                  <p class="text-sm">{{ t('doctor.phone') }}</p>
                  <p class="font-medium">{{ doctor.phoneNumber }}</p>
                </div>
                <button class="absolute right-3 top-3" @click.stop="copy(doctor.phoneNumber)">
                  <Clipboard class="w-5 h-5 text-blue-600" />
                </button>
              </VaCard>
            </div>
          </div>
        </div>
      </VaCard>

      <!-- Professional Information -->
      <VaCard class="rounded-3xl shadow-xl p-8 transform hover:scale-[1.01] transition-all duration-300">
        <h2 class="text-2xl font-bold mb-8 flex items-center gap-2">
          <span class="w-1.5 h-8 bg-blue-600 rounded-full"></span>
          {{ t('doctor.Professional_Information') }}
        </h2>
        <VaCard class="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <VaCard class="space-y-2 p-4 rounded-xl hover:bg-blue-50 transition-colors">
            <h3 class="text-lg font-semibold">{{ t('doctor.education') }}</h3>
            <p class="">{{ doctor.doctorProfile?.education || 'Chưa có thông tin' }}</p>
            <p class="">{{ doctor.doctorProfile?.college || 'Chưa có thông tin' }}</p>
          </VaCard>
          <VaCard class="space-y-2 p-4 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors">
            <h3 class="text-lg font-semibold">{{ t('doctor.experience') }}</h3>
            <p class="">{{ doctor.doctorProfile?.yearOfExp || 'Chưa có thông tin' }}</p>
          </VaCard>
          <VaCard class="space-y-2 p-4 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors">
            <h3 class="text-lg font-semibold">{{ t('doctor.Job_Type') }}</h3>
            <p class="">
              {{
                doctor.doctorProfile?.workingType === 2
                  ? t('doctor.full_time')
                  : doctor.doctorProfile?.workingType === 1
                    ? t('doctor.part_time')
                    : 'Chưa có thông tin'
              }}
            </p>
          </VaCard>
          <VaCard class="space-y-2 p-4 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors">
            <h3 class="text-lg font-semibold">{{ t('doctor.certification') }}</h3>
            <p class="">{{ doctor.doctorProfile?.certification || 'Chưa có thông tin' }}</p>
          </VaCard>
        </VaCard>
        <VaCard class="mt-8 p-4 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors">
          <h3 class="text-lg font-semibold mb-2">{{ t('doctor.seftDescription') }}</h3>
          <p class="">{{ doctor.doctorProfile?.seftDescription || 'Chưa có thông tin' }}</p>
        </VaCard>
      </VaCard>

      <!-- Patient Feedback -->
      <VaCard class="rounded-3xl shadow-xl p-8 transform hover:scale-[1.01] transition-all duration-300">
        <h2 class="text-2xl font-bold mb-8 flex items-center gap-2">
          <span class="w-1.5 h-8 bg-blue-600 rounded-full"></span>
          {{ t('doctor.Patient_Feedback') }}
        </h2>
        <VaCard class="flex flex-wrap justify-center gap-3 mb-8">
          <button
            v-for="i in 6"
            :key="i"
            :class="{
              'bg-blue-600 text-white ring-2 ring-blue-300': selectedRating === i,
              'bg-gray-50 text-gray-700 hover:bg-blue-50': selectedRating !== i,
            }"
            class="px-6 py-2.5 rounded-xl transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-md"
            @click="filterRating(i)"
          >
            <span v-if="i === 6">{{ t('doctor.all') }}</span>
            <span v-else class="flex items-center gap-2">
              <span>{{ i }}</span>
              <Star class="w-4 h-4" :class="i <= selectedRating ? 'fill-current' : 'stroke-current'" />
            </span>
          </button>
        </VaCard>
        <VaCard class="space-y-8">
          <VaCard
            v-for="review in paginatedReviews"
            :key="review.feedbackID"
            class="p-6 rounded-2xl bg-gray-50 hover:bg-blue-50 transition-all duration-300"
          >
            <VaCard class="flex items-center gap-4 mb-4">
              <img
                v-if="review.patientAvatar"
                :src="getSrcAvatar(review.patientAvatar)"
                alt="Avatar"
                class="h-12 w-12 rounded-xl object-cover shadow-md"
              />
              <img
                v-else
                src="https://png.pngtree.com/png-clipart/20230102/original/pngtree-business-man-avatar-png-image_8855195.png"
                alt="Avatar"
                class="h-12 w-12 rounded-xl object-cover shadow-md"
              />
              <VaCard>
                <p class="font-semibold">
                  {{ isUserOnline(review.patientID) ? t('doctor.my') : review.patientName }}
                </p>
                <p class="text-sm text-gray-500">{{ formatDate(review.createDate) }}</p>
              </VaCard>
            </VaCard>
            <div class="space-y-3">
              <p class="text-sm">
                {{ t('doctor.service') }}: <span class="font-medium">{{ review.serviceName }}</span>
              </p>
              <div class="flex items-center gap-2">
                <p class="font-medium">{{ review.ratings }}</p>
                <div class="flex gap-1">
                  <Star
                    v-for="i in 5"
                    :key="i"
                    class="w-5 h-5"
                    :class="
                      i <= Math.round(review.ratings || 0)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300 stroke-current'
                    "
                  />
                </div>
              </div>
              <p class="">{{ review.message }}</p>
              <button
                v-if="review.canFeedback && isUserOnline(review.patientID)"
                class="mt-4 px-4 py-2 text-sm font-medium 0 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                @click="openEditPopup(review)"
              >
                {{ t('doctor.edit') }}
              </button>
            </div>
          </VaCard>
        </VaCard>
        <div class="flex justify-between mt-8">
          <VaButton
            :disabled="currentPage === 1"
            class="px-4 py-2 rounded-xl bg-gray-50 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm hover:shadow-md"
            @click="prevPage"
          >
            <ChevronLeft class="w-5 h-5" />
          </VaButton>
          <VaButton
            :disabled="currentPage >= totalPages"
            class="px-4 py-2 rounded-xl bg-gray-50 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm hover:shadow-md"
            @click="nextPage"
          >
            <ChevronRight class="w-5 h-5" />
          </VaButton>
        </div>
      </VaCard>

      <VaButton
        class="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
        @click="$router.go(-1)"
      >
        {{ t('doctor.back') }}
      </VaButton>
    </div>
  </VaCard>

  <!-- Edit Feedback Popup -->
  <Transition name="fade">
    <div
      v-if="isEditPopupOpen"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm z-50"
    >
      <VaCard
        class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full transform scale-100 hover:scale-[1.02] transition-all duration-300"
      >
        <h3 class="text-2xl font-bold mb-6">{{ t('doctor.Edit_Feedback') }}</h3>
        <textarea
          v-model="editFeedback.message"
          class="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-300"
          rows="4"
          placeholder="Nội dung phản hồi"
        ></textarea>
        <div class="mt-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('doctor.Rating') }}:</label>
          <div class="flex items-center gap-2">
            <Star
              v-for="i in 5"
              :key="i"
              class="w-8 h-8 cursor-pointer transform hover:scale-110 transition-transform"
              :class="i <= editFeedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300 stroke-current'"
              @click="setRating(i)"
            />
          </div>
        </div>
        <div class="mt-8 flex justify-end gap-4">
          <VaButton
            class="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300"
            @click="isEditPopupOpen = false"
          >
            {{ t('doctor.cancel') }}
          </VaButton>
          <VaButton
            class="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300"
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
import { useToast } from 'vuestic-ui'
const { init: toast } = useToast()

const { t } = useI18n()
const route = useRoute()
const doctorStore = useDoctorProfileStore()
const authStore = useAuthStore()
const copy = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text)
    toast(`Copied: ${text}`)
    console.log(`Copied to clipboard: ${text}`)
  } catch (err) {
    console.error('Failed to copy text: ', err)
  }
}

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
