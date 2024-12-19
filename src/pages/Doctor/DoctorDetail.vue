<template>
  <VaCard class="min-h-screen bg-gradient-to-br from-indigo-50 to-white py-10 px-6 sm:px-10">
    <div class="max-w-4xl mx-auto space-y-10">
      <!-- Thông Tin Bác Sĩ -->
      <VaCard class="bg-white rounded-2xl shadow-xl p-8 flex flex-col">
        <div class="flex flex-col md:flex-row items-center md:items-start">
          <img
            :src="doctor.imageUrl || 'https://via.placeholder.com/150'"
            alt="Hồ sơ bác sĩ"
            class="h-28 w-28 md:h-36 md:w-36 rounded-full object-cover shadow-lg"
          />
          <div class="md:ml-6 mt-6 md:mt-0 text-center md:text-left flex-1">
            <h1 class="text-2xl font-bold text-gray-800">{{ doctor.firstName }} {{ doctor.lastName }}</h1>
            <div class="flex items-center justify-center md:justify-start mt-2">
              <span
                v-for="i in 5"
                :key="i"
                class="material-symbols-outlined text-2xl"
                :class="i <= Math.round(doctor.rating || 0) ? 'text-yellow-400' : 'text-gray-300'"
              >
                star
              </span>
              <span class="ml-2 text-gray-500 text-sm">({{ doctor.totalFeedback }} đánh giá)</span>
            </div>
            <p class="mt-4 text-sm text-gray-700"><strong>Email:</strong> {{ doctor.email }}</p>
            <p class="text-sm text-gray-700"><strong>Điện Thoại:</strong> {{ doctor.phoneNumber }}</p>
          </div>
        </div>
        <div class="flex justify-end mt-6">
          <button
            class="bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            @click="bookAppointment"
          >
            Đặt Lịch Ngay
          </button>
        </div>
      </VaCard>

      <!-- Thông Tin Chuyên Môn -->
      <VaCard class="bg-white rounded-2xl shadow-xl p-8">
        <h2 class="text-xl font-semibold text-gray-800 mb-6">Thông Tin Chuyên Môn</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <h3 class="text-sm text-gray-500">Học Vấn:</h3>
            <p class="font-medium">{{ doctor.doctorProfile.education }}</p>
            <p>{{ doctor.doctorProfile.college }}</p>
          </div>
          <div>
            <h3 class="text-sm text-gray-500">Số Năm Kinh Nghiệm:</h3>
            <p class="font-medium">{{ doctor.doctorProfile.yearOfExp }}</p>
          </div>
          <div>
            <h3 class="text-sm text-gray-500">Loại Hình Làm Việc:</h3>
            <p class="font-medium">
              {{ doctor.doctorProfile.workingType === 2 ? 'Toàn Thời Gian' : 'Bán Thời Gian' }}
            </p>
          </div>
          <div>
            <h3 class="text-sm text-gray-500">Chứng Chỉ:</h3>
            <p class="font-medium">{{ doctor.doctorProfile.certification }}</p>
          </div>
          <div class="col-span-full">
            <h3 class="text-sm text-gray-500">Về Tôi:</h3>
            <p>{{ doctor.doctorProfile.seftDescription }}</p>
          </div>
        </div>
      </VaCard>

      <!-- Phản Hồi Từ Bệnh Nhân -->
      <VaCard class="bg-white rounded-xl shadow-lg p-6">
        <!-- Tiêu đề -->
        <h2 class="text-2xl font-bold mb-4">Phản Hồi Từ Bệnh Nhân</h2>
        <VaCard class="">
          <div class="flex justify-center gap-2 mb-6">
            <button
              v-for="i in 6"
              :key="i"
              :class="{
                'bg-indigo-600 text-white shadow-md': selectedRating === i,
                'bg-gray-100 text-gray-700 hover:bg-gray-200': selectedRating !== i,
              }"
              class="px-4 py-2 rounded-lg transition-all duration-200"
              @click="filterRating(i)"
            >
              <span v-if="i === 6" class="text-sm font-semibold">Tất Cả</span>
              <span v-else class="flex items-center space-x-1 text-sm font-semibold">
                <span>{{ i }}</span>
                <span class="material-icons text-yellow-500">star</span>
              </span>
            </button>
          </div>
        </VaCard>
        <div class="space-y-6">
          <div
            v-for="review in paginatedReviews"
            :key="review.feedbackID"
            class="border-b border-gray-200 pb-6 last:border-0"
          >
            <div class="flex justify-between items-center">
              <div>
                <p class="text-sm">Dịch Vụ: {{ review.serviceName }}</p>
              </div>
              <span class="text-sm">{{ formatDate(review.createDate) }}</span>
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
        <!-- Bộ lọc đánh giá -->

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
      </VaCard>

      <button
        class="w-full sm:w-auto mt-6 bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-gray-300 transition"
        @click="$router.go(-1)"
      >
        Quay Về
      </button>
    </div>
  </VaCard>
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
        <button class="hover:underline" @click="isEditPopupOpen = false">Hủy</button>
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
import { VaCard } from 'vuestic-ui'

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
  console.log(
    'Danh sách người dùng trực tuyến:',
    onlineUsersStore.onlineUsers.some((user) => user === patientID),
  )
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
const selectedRating = ref(6) // State for selected rating filter

// Hàm lọc dựa trên số sao
const filterRating = (rating: number) => {
  selectedRating.value = rating
  currentPage.value = 1 // Reset to first page when filtering
}

// Phản hồi phân trang có tích hợp lọc rating
const paginatedReviews = computed(() => {
  // Lọc phản hồi dựa trên số sao
  const filteredReviews =
    selectedRating.value === 6
      ? doctor.value.doctorFeedback // Không lọc nếu selectedRating = 6
      : doctor.value.doctorFeedback.filter((review) => review.ratings === selectedRating.value)

  // Phân chia phản hồi thành online và offline
  const onlineReviews = filteredReviews.filter((review) => isUserOnline(review.patientID))
  const offlineReviews = filteredReviews.filter((review) => !isUserOnline(review.patientID))

  // Kết hợp phản hồi trực tuyến và ngoại tuyến
  const combinedReviews = [...onlineReviews, ...offlineReviews]

  // Lấy dữ liệu theo phân trang
  const start = (currentPage.value - 1) * itemsPerPage
  return combinedReviews.slice(start, start + itemsPerPage)
})

// Tính tổng số trang dựa trên bộ lọc hiện tại
const totalPages = computed(() => {
  // Lọc phản hồi dựa trên số sao
  const filteredReviews =
    selectedRating.value === 6
      ? doctor.value.doctorFeedback
      : doctor.value.doctorFeedback.filter((review) => review.ratings === selectedRating.value)

  // Phân chia phản hồi thành online và offline
  const onlineReviews = filteredReviews.filter((review) => isUserOnline(review.patientID))
  const offlineReviews = filteredReviews.filter((review) => !isUserOnline(review.patientID))

  // Kết hợp phản hồi trực tuyến và ngoại tuyến
  const combinedReviews = [...onlineReviews, ...offlineReviews]

  // Tính tổng số trang
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
