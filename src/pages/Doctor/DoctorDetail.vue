<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-white py-10 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto space-y-8">
      <!-- Doctor Information -->
      <div class="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <div class="flex flex-col sm:flex-row items-center sm:items-start">
          <img
            v-if="doctor.imageUrl"
            :src="doctor.imageUrl"
            :alt="`${doctor.firstName} ${doctor.lastName}`"
            class="h-32 w-32 sm:h-40 sm:w-40 rounded-full object-cover shadow-lg border-4 border-white"
          />
          <span v-else class="text-gray-500 text-sm">No image available</span>
          <div class="sm:ml-8 mt-6 sm:mt-0 text-center sm:text-left flex-1">
            <h1 class="text-3xl font-bold text-gray-900">{{ doctor.firstName }} {{ doctor.lastName }}</h1>
            <div class="flex items-center justify-center sm:justify-start mt-2">
              <span v-for="i in 5" :key="i" class="text-yellow-400">
                <Star :class="i <= Math.round(doctor.rating || 0) ? 'fill-current' : 'stroke-current'" />
              </span>
              <span class="ml-2 text-gray-600 text-sm">({{ doctor.totalFeedback }} đánh giá)</span>
            </div>
            <p class="mt-4 text-gray-600"><Mail class="inline mr-2" /> {{ doctor.email }}</p>
            <p class="text-gray-600"><Phone class="inline mr-2" /> {{ doctor.phoneNumber }}</p>
          </div>
        </div>
      </div>

      <!-- Professional Information -->
      <div class="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-6">Thông Tin Chuyên Môn</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <h3 class="text-sm font-medium text-gray-500">Học Vấn:</h3>
            <p class="mt-1 text-gray-900">{{ doctor.doctorProfile?.education || 'Chưa có thông tin' }}</p>
            <p class="text-gray-600">{{ doctor.doctorProfile?.college || 'Chưa có thông tin' }}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-500">Số Năm Kinh Nghiệm:</h3>
            <p class="mt-1 text-gray-900">{{ doctor.doctorProfile?.yearOfExp || 'Chưa có thông tin' }}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-500">Loại Hình Làm Việc:</h3>
            <p class="mt-1 text-gray-900">
              {{ doctor.doctorProfile?.workingType === 2 ? 'Toàn Thời Gian' : 'Bán Thời Gian' || 'Chưa có thông tin' }}
            </p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-500">Chứng Chỉ:</h3>
            <p class="mt-1 text-gray-900">{{ doctor.doctorProfile?.certification || 'Chưa có thông tin' }}</p>
          </div>
        </div>
        <div class="mt-6">
          <h3 class="text-sm font-medium text-gray-500">Về Tôi:</h3>
          <p class="mt-1 text-gray-900">{{ doctor.doctorProfile?.seftDescription || 'Chưa có thông tin' }}</p>
        </div>
      </div>

      <!-- Patient Feedback -->
      <div class="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-6">Phản Hồi Từ Bệnh Nhân</h2>
        <div class="flex flex-wrap justify-center gap-2 mb-6">
          <button
            v-for="i in 6"
            :key="i"
            :class="{
              'bg-blue-600 text-white': selectedRating === i,
              'bg-gray-100 text-gray-700 hover:bg-gray-200': selectedRating !== i,
            }"
            class="px-4 py-2 rounded-full transition-all duration-200 text-sm font-medium"
            @click="filterRating(i)"
          >
            <span v-if="i === 6">Tất Cả</span>
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
            <div class="flex justify-between items-center">
              <p class="text-sm text-gray-600">Dịch Vụ: {{ review.serviceName }}</p>
              <span class="text-sm text-gray-500">{{ formatDate(review.createDate) }}</span>
            </div>
            <div class="flex items-center mt-2">
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
            <p class="mt-3 text-gray-700">{{ review.message }}</p>
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
          <button
            :disabled="currentPage === 1"
            class="px-4 py-2 bg-gray-100 text-gray-800 font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            @click="prevPage"
          >
            <ChevronLeft class="w-5 h-5" />
          </button>
          <button
            :disabled="currentPage >= totalPages"
            class="px-4 py-2 bg-gray-100 text-gray-800 font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            @click="nextPage"
          >
            <ChevronRight class="w-5 h-5" />
          </button>
        </div>
      </div>

      <button
        class="w-full sm:w-auto mt-6 bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-gray-300 transition-colors duration-200"
        @click="$router.go(-1)"
      >
        Quay Về
      </button>
    </div>
  </div>

  <!-- Edit Feedback Popup -->
  <Transition name="fade">
    <div v-if="isEditPopupOpen" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h3 class="text-xl font-semibold text-gray-900 mb-4">Chỉnh Sửa Phản Hồi</h3>
        <textarea
          v-model="editFeedback.message"
          class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows="4"
          placeholder="Nội dung phản hồi"
        ></textarea>
        <div class="mt-4">
          <label class="block text-sm font-medium text-gray-700">Đánh Giá:</label>
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
          <button
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
            @click="isEditPopupOpen = false"
          >
            Hủy
          </button>
          <button
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            @click="saveEditFeedback"
          >
            Lưu
          </button>
        </div>
      </div>
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
</style>
