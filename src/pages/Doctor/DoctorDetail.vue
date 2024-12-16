<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 to-white py-10 px-6 sm:px-10">
    <div class="max-w-4xl mx-auto space-y-10">
      <!-- Thông Tin Bác Sĩ -->
      <div class="bg-white rounded-2xl shadow-lg p-8 flex items-start">
        <img
          :src="
            doctor.imageUrl ||
            'https://plus.unsplash.com/premium_photo-1664475543697-229156438e1e?q=80&w=1972&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
          "
          alt="Hồ sơ bác sĩ"
          class="w-32 h-32 rounded-lg object-cover shadow-md"
        />
        <div class="ml-6 flex-1">
          <div class="flex items-center justify-between">
            <h1 class="text-3xl font-bold text-gray-900">{{ doctor.firstName }} {{ doctor.lastName }}</h1>
          </div>
          <div class="mt-3 flex items-center">
            <div class="flex items-center">
              <span v-for="i in 5" :key="i" class="text-xl">
                <span
                  class="material-symbols-outlined"
                  :class="i <= Math.round(doctor.rating || 0) ? 'text-yellow-400' : 'text-gray-300'"
                >
                  star
                </span>
              </span>
            </div>
            <span class="ml-3 text-sm text-gray-500">({{ doctor.totalFeedback }} đánh giá)</span>
          </div>
          <div class="mt-5 space-y-2">
            <p class="flex items-center text-gray-700">
              <MailIcon class="h-5 w-5 mr-2 text-indigo-600" /> {{ doctor.email }}
            </p>
            <p class="flex items-center text-gray-700">
              <PhoneIcon class="h-5 w-5 mr-2 text-indigo-600" /> {{ doctor.phoneNumber }}
            </p>
          </div>
          <button
            class="mt-6 w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transition"
            @click="bookAppointment"
          >
            Đặt Lịch Ngay
          </button>
        </div>
      </div>

      <!-- Thông Tin Chuyên Môn -->
      <div class="bg-white rounded-2xl shadow-lg p-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Thông Tin Chuyên Môn</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <h3 class="text-sm text-gray-500">Học Vấn:</h3>
            <p class="text-gray-800 font-medium">{{ doctor.doctorProfile.education }}</p>
            <p class="text-gray-800">{{ doctor.doctorProfile.college }}</p>
          </div>
          <div>
            <h3 class="text-sm text-gray-500">Số Năm Kinh Nghiệm:</h3>
            <p class="text-gray-800 font-medium">{{ doctor.doctorProfile.yearOfExp }}</p>
          </div>
          <div>
            <h3 class="text-sm text-gray-500">Loại Hình Làm Việc:</h3>
            <p class="text-gray-800 font-medium">
              {{ doctor.doctorProfile.workingType === 2 ? 'Toàn Thời Gian' : 'Bán Thời Gian' }}
            </p>
          </div>
          <div>
            <h3 class="text-sm text-gray-500">Chứng Chỉ:</h3>
            <p class="text-gray-800 font-medium">{{ doctor.doctorProfile.certification }}</p>
          </div>
          <div class="col-span-full">
            <h3 class="text-sm text-gray-500">Về Tôi:</h3>
            <p class="text-gray-800">{{ doctor.doctorProfile.seftDescription }}</p>
          </div>
        </div>
      </div>

      <!-- Phản Hồi Từ Bệnh Nhân -->
      <div class="bg-white rounded-2xl shadow-lg p-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Phản Hồi Từ Bệnh Nhân</h2>
        <div class="space-y-6">
          <div
            v-for="review in paginatedReviews"
            :key="review.feedbackID"
            class="border-b border-gray-200 pb-6 last:border-0"
          >
            <div class="flex justify-between items-center">
              <div>
                <h3 class="text-lg font-semibold text-gray-800">{{ review.patientName }}</h3>
                <p class="text-sm text-gray-500">Dịch Vụ: {{ review.serviceName }}</p>
              </div>
              <span class="text-sm text-gray-500">{{ formatDate(review.createDate) }}</span>
            </div>
            <div class="flex items-center mt-2">
              <span v-for="i in 5" :key="i" class="text-xl">
                <span
                  class="material-symbols-outlined cursor-pointer"
                  :class="i <= Math.round(review.ratings || 0) ? 'text-yellow-400' : 'text-gray-300'"
                  @click="setRating(i)"
                >
                  star
                </span>
              </span>
            </div>
            <p class="mt-3 text-gray-600">{{ review.message }}</p>
            <button
              v-if="review.canFeedback && isUserOnline(review.patientID)"
              class="mt-2 text-indigo-600 hover:underline"
              @click="openEditPopup(review)"
            >
              Chỉnh Sửa
            </button>
          </div>
        </div>
        <div class="flex justify-between mt-8">
          <button
            :disabled="currentPage === 1"
            class="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 disabled:bg-gray-100"
            @click="prevPage"
          >
            Trước
          </button>
          <button
            :disabled="currentPage >= totalPages"
            class="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 disabled:bg-gray-100"
            @click="nextPage"
          >
            Sau
          </button>
        </div>
      </div>

      <button
        class="w-full sm:w-auto mt-6 bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-gray-300 transition"
        @click="$router.go(-1)"
      >
        Quay Về
      </button>
    </div>
  </div>
  <!-- Popup for editing feedback -->
  <div v-if="isEditPopupOpen" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Chỉnh Sửa Phản Hồi</h3>
      <input
        v-model="editFeedback.message"
        class="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder="Nội dung phản hồi"
      />
      <div class="mt-4">
        <label class="block text-sm text-gray-600">Đánh Giá:</label>
        <div class="flex items-center">
          <span v-for="i in 5" :key="i" class="text-xl cursor-pointer" @click="editFeedback.rating = i">
            <span
              class="material-symbols-outlined"
              :class="i <= editFeedback.rating ? 'text-yellow-400' : 'text-gray-300'"
            >
              star
            </span>
          </span>
        </div>
      </div>
      <div class="mt-6 flex justify-between">
        <button
          class="bg-indigo-600 text-white py-2 px-4 rounded-lg shadow hover:bg-indigo-700 transition"
          @click="saveEditFeedback"
        >
          Lưu
        </button>
        <button class="text-gray-500 hover:underline" @click="isEditPopupOpen = false">Hủy</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useDoctorProfileStore } from '@/stores/modules/doctor.module'
import { useOnlineUsersStore } from '@/stores/online-users-store'
import userService from '@/services/user.service'

// Lấy thông tin route và store
const route = useRoute()
const doctorStore = useDoctorProfileStore()
const onlineUsersStore = useOnlineUsersStore()

// Define the Doctor type if not already defined
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

// Define the Feedback type if not already defined
interface Feedback {
  feedbacks: {
    message: string
    ratings: number
    patientID: string // Add other properties as needed
  }[]
}

// Update the doctor reactive variable
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

// Biến cho phân trang
const currentPage = ref(1)
const itemsPerPage = 4

// Function to check if user is online
const isUserOnline = (patientID: string) => {
  return onlineUsersStore.onlineUsers.some((user) => user === patientID)
}

// New state for edit popup
const isEditPopupOpen = ref(false)
const editFeedback = ref({ message: '', rating: 0, feedbackID: '' })

// Hàm định dạng ngày
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  } as const
  return new Date(dateString).toLocaleDateString(undefined, options)
}

// Lấy dữ liệu bác sĩ từ API khi component mounted
onMounted(async () => {
  try {
    const id = route.params.id as string // Lấy ID từ URL
    const response = await doctorStore.getDoctorDetail(id) // Gọi API từ store

    // Mapping dữ liệu vào biến doctor
    doctor.value = {
      ...response,
      imageUrl: response.imageUrl || '',
      firstName: response.firstName || '',
      lastName: response.lastName || '',
      email: response.email || '',
      phoneNumber: response.phoneNumber || '',
      doctorFeedback: response.doctorFeedback.flatMap((feedback: Feedback) => feedback.feedbacks),
    }
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu bác sĩ:', error)
  }
})

// Tính toán các đánh giá phân trang
const paginatedReviews = computed(() => {
  const onlineReviews = doctor.value.doctorFeedback.filter((review) => isUserOnline(review.patientID))
  const offlineReviews = doctor.value.doctorFeedback.filter((review) => !isUserOnline(review.patientID))

  // Kết hợp các phản hồi trực tuyến và ngoại tuyến
  const combinedReviews = [...onlineReviews, ...offlineReviews]

  const start = (currentPage.value - 1) * itemsPerPage
  return combinedReviews.slice(start, start + itemsPerPage)
})

// Tính tổng số trang
const totalPages = computed(() => {
  const onlineReviews = doctor.value.doctorFeedback.filter((review) => isUserOnline(review.patientID))
  const offlineReviews = doctor.value.doctorFeedback.filter((review) => !isUserOnline(review.patientID))

  // Kết hợp các phản hồi trực tuyến và ngoại tuyến
  const combinedReviews = [...onlineReviews, ...offlineReviews]

  return Math.ceil(combinedReviews.length / itemsPerPage)
})

// Hàm chuyển trang
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

// Define the Review type if not already defined
interface Review {
  message: string
  ratings: number
  feedbackID: string
  // Add other properties as needed
}

// Function to open edit popup
const openEditPopup = (review: Review) => {
  editFeedback.value = { message: review.message, rating: review.ratings, feedbackID: review.feedbackID }
  isEditPopupOpen.value = true
}

// Function to save edited feedback
const saveEditFeedback = async () => {
  try {
    await userService.updateFeedbackDetail({
      feedbackID: editFeedback.value.feedbackID,
      message: editFeedback.value.message,
      rating: editFeedback.value.rating, // Update the rating as well
    })

    // Update the local doctor feedback
    const feedbackIndex = doctor.value.doctorFeedback.findIndex(
      (feedback) => feedback.feedbackID === editFeedback.value.feedbackID,
    )
    if (feedbackIndex !== -1) {
      doctor.value.doctorFeedback[feedbackIndex].message = editFeedback.value.message
      doctor.value.doctorFeedback[feedbackIndex].ratings = editFeedback.value.rating
      // Update canFeedback to false after successful edit
      doctor.value.doctorFeedback[feedbackIndex].canFeedback = false // Add this line
    }

    // Close the edit popup
    isEditPopupOpen.value = false
  } catch (error) {
    console.error('Error updating feedback:', error)
  }
}

// Function to set rating in the edit popup
const setRating = (rating: number) => {
  editFeedback.value.rating = rating
}

// Function to book an appointment
const bookAppointment = () => {
  // Logic to book an appointment
  console.log('Booking appointment for:', doctor.value.firstName, doctor.value.lastName)
  // You can add your appointment logic here, such as navigating to an appointment page or calling an API
}
</script>

<style>
.material-symbols-outlined {
  font-variation-settings:
    'FILL' 1,
    'wght' 400,
    'GRAD' 0,
    'opsz' 48;
}
</style>
