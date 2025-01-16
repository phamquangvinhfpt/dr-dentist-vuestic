<template>
  <VaCard
    class="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-300 to-pink-200 flex items-center justify-center p-6"
  >
    <VaCard class="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full relative">
      <!-- Nút Đóng -->
      <VaButton
        style="background-color: red !important; color: white !important"
        class="absolute right-4 top-4 w-10 h-10 flex items-center justify-center rounded-full bg-gray-300 text-gray-700 hover:bg-red-400 hover:text-white transition-transform duration-200 transform hover:scale-110 shadow-md"
        @click="goHome"
      >
        ×
      </VaButton>

      <!-- Nội Dung Phản Hồi -->
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold mb-3">Chúng tôi trân trọng ý kiến của bạn</h2>
        <p class="">Cải thiện trải nghiệm của bạn là ưu tiên hàng đầu của chúng tôi.</p>
      </div>

      <VaForm class="space-y-6" @submit.prevent="submitFeedback">
        <!-- Đánh Giá Sao -->
        <div class="flex justify-center space-x-2">
          <template v-for="i in 5" :key="i">
            <button
              type="button"
              class="text-4xl focus:outline-none transition-all duration-300 transform hover:scale-125"
              :class="i <= rating ? 'text-yellow-400' : 'text-gray-300'"
              @click="rating = i"
            >
              ★
            </button>
          </template>
        </div>
        <p v-if="rating === 0" class="text-sm text-red-500 text-center">Vui lòng chọn số sao</p>

        <!-- Khu Vực Nhập Phản Hồi -->
        <div>
          <VaTextarea
            v-model="comment"
            rows="5"
            placeholder="Nhập phản hồi của bạn tại đây..."
            class="w-full p-4 rounded-xl focus:ring-4 focus:ring-blue-400 resize-none transition-shadow duration-300"
          ></VaTextarea>
          <p v-if="!comment" class="text-sm text-red-500 text-center">Vui lòng nhập nội dung phản hồi</p>
        </div>

        <!-- Nút Gửi -->
        <button
          type="submit"
          class="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-4 rounded-xl shadow-md hover:shadow-lg focus:ring-4 focus:ring-purple-300 transition-all duration-300 font-semibold text-lg"
          :class="{ 'opacity-50 pointer-events-none': isSubmitting }"
        >
          <span v-if="isSubmitting" class="animate-pulse">Đang gửi...</span>
          <span v-else>Gửi Phản Hồi Của Tôi</span>
        </button>
      </VaForm>
    </VaCard>
    <div v-if="showExitConfirmation" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <VaCard class="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full text-center space-y-6">
        <h3 class="text-xl font-semibold">Bạn chưa đánh giá</h3>
        <p class="">Bạn có chắc chắn muốn rời đi mà không gửi phản hồi?</p>
        <div class="flex justify-between">
          <button
            class="bg-red-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
            @click="cancelExit"
          >
            Không
          </button>
          <button
            class="bg-green-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
            @click="confirmExit"
          >
            Có
          </button>
        </div>
      </VaCard>
    </div>
    <!-- Modal Xác Nhận -->
    <div v-if="showConfirmation" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center space-y-6">
        <h3 class="text-2xl font-semibold text-gray-800">Cảm ơn bạn!</h3>
        <p class="text-gray-600">Phản hồi của bạn đã được gửi thành công.</p>
        <button
          class="bg-gradient-to-r from-green-500 to-teal-400 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
          @click="Home"
        >
          Đóng
        </button>
      </div>
    </div>
  </VaCard>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserProfileStore } from '@/stores/modules/user.module'
import { useAppointmentStore } from '@/stores/modules/appointment.module'
import { useToast, VaButton, VaCard, VaForm } from 'vuestic-ui'

const route = useRoute()
const router = useRouter()
const userProfileStore = useUserProfileStore()
const appointmentStore = useAppointmentStore()
const { init: toast } = useToast()

const rating = ref(0)
const comment = ref('')
const showConfirmation = ref(false)
const canFeedback = ref(false)
const isSubmitting = ref(false)
onMounted(async () => {
  const appointmentId = route.params.appointmentID as string
  try {
    const appointment = await appointmentStore.getAppointmentById(appointmentId)
    console.log('appoiment', appointment)
    canFeedback.value = appointment.canFeedback
  } catch (error) {
    console.error('Error fetching appointment:', error)
    toast('Đã xảy ra lỗi khi lấy thông tin điều trị !')
  }
})
const Home = () => {
  router.push({ name: 'dashboard' }) // Điều hướng về trang Home
}
const showExitConfirmation = ref(false)

const goHome = () => {
  if (rating.value > 0 || comment.value) {
    showExitConfirmation.value = true
  } else {
    router.push({ name: 'dashboard' })
  }
}

const cancelExit = () => {
  showExitConfirmation.value = false
}

const confirmExit = () => {
  router.push({ name: 'dashboard' })
}
const submitFeedback = async () => {
  if (rating.value === 0) {
    toast('Vui lòng chọn một đánh giá!')
    return
  }

  if (!comment.value.trim()) {
    toast('Vui lòng nhập nội dung phản hồi!')
    return
  }
  isSubmitting.value = true
  const appointmentID = route.params.appointmentID

  try {
    await userProfileStore.updateTreatmentPlanDetail({
      appointmentID: appointmentID as string,
      message: comment.value,
      rating: rating.value,
    })
    setTimeout(() => {
      rating.value = 0
      comment.value = ''
      showConfirmation.value = true
      isSubmitting.value = false
    }, 1000)
  } catch (error) {
    console.error('Error submitting feedback:', error)
    toast('Đã xảy ra lỗi khi gửi phản hồi. Vui lòng thử lại.')
    isSubmitting.value = false // Đặt lại trạng thái để hiển thị lại nút
  }
}
</script>

<style scoped>
/* Tùy chọn: Thêm hiệu ứng chuyển động mượt mà cho các phần tử tương tác */
.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
/* Tăng hiệu ứng giao diện */

button:focus {
  outline: none;
}
button:hover {
  transform: scale(1.115);
}

button:focus {
  outline: none;
}

/* Gradient nền */
.bg-gradient-to-br {
  background: linear-gradient(to bottom right, #6dd5ed, #2193b0);
}
.btn-red {
  background-color: red;
  color: white;
}

.btn-red:hover {
  background-color: #ff4d4d; /* Màu đỏ nhạt hơn khi hover */
  color: white;
}
</style>
