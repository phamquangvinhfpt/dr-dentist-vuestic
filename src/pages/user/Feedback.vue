<template>
  <VaCard class="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center p-4">
    <VaCard class="bg-white rounded-3xl shadow-xl p-8 max-w-lg w-full relative">
      <!-- Nút Đóng -->
      <button
        class="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-stone-500 text-white hover:bg-red-400"
        @click="$emit('close')"
      >
        ×
      </button>

      <!-- Nội Dung Phản Hồi -->
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold 0 mb-2">Chúng tôi trân trọng ý kiến của bạn</h2>
        <p class="">Cải thiện trải nghiệm của bạn là ưu tiên hàng đầu của chúng tôi.</p>
      </div>

      <form class="space-y-6" @submit.prevent="submitFeedback">
        <!-- Đánh Giá Sao -->
        <div class="flex justify-center space-x-1">
          <template v-for="i in 5" :key="i">
            <button
              type="button"
              class="text-3xl focus:outline-none transition-all duration-200"
              :class="i <= rating ? 'text-yellow-500 scale-110' : 'text-gray-300'"
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
            rows="4"
            placeholder="Nhập phản hồi của bạn tại đây..."
            class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 resize-none transition-shadow duration-200"
          ></VaTextarea>
        </div>

        <!-- Nút Gửi -->
        <button
          type="submit"
          class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-200 font-medium"
          :class="{ 'opacity-50 pointer-events-none': isSubmitting }"
        >
          <span v-if="isSubmitting" class="animate-pulse">Đang gửi...</span>
          <span v-else>Gửi Phản Hồi Của Tôi</span>
        </button>
      </form>
    </VaCard>

    <!-- Modal Xác Nhận -->
    <div v-if="showConfirmation" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-lg p-6 max-w-sm w-full text-center space-y-4">
        <h3 class="text-xl font-semibold text-gray-800">Cảm ơn bạn!</h3>
        <p class="text-gray-600">Phản hồi của bạn đã được gửi thành công.</p>
        <button
          class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-500 transition-colors duration-200"
          @click="showConfirmation = false"
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

const route = useRoute()
const router = useRouter()
const userProfileStore = useUserProfileStore()
const appointmentStore = useAppointmentStore()

const rating = ref(0)
const comment = ref('')
const showConfirmation = ref(false)
const canFeedback = ref(false)
const isSubmitting = ref(false)
onMounted(async () => {
  const appointmentId = route.params.appointmentID as string
  try {
    const appointment = await appointmentStore.getAppointmentById(appointmentId)
    canFeedback.value = appointment.canFeedback
    if (!canFeedback.value) {
      router.push({ name: 'feedback-list' }) // Adjust the route name as necessary
    }
  } catch (error) {
    console.error('Error fetching appointment:', error)
    alert('Đã xảy ra lỗi khi tải thông tin cuộc hẹn.')
  }
})

const submitFeedback = async () => {
  if (rating.value === 0) {
    alert('Vui lòng chọn một đánh giá')
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
    alert('Đã xảy ra lỗi khi gửi phản hồi.')
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
button:hover {
  transform: scale(1.05);
}

button:focus {
  outline: none;
}
</style>
