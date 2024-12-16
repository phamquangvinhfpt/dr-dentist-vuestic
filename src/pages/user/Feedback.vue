<template>
  <div class="min-h-screen bg-blue-100 flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full relative">
      <!-- Nút Đóng -->
      <button
        class="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-500"
        @click="$emit('close')"
      >
        ×
      </button>

      <!-- Nội Dung Phản Hồi -->
      <div class="text-center mb-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-3">Chúng tôi rất trân trọng phản hồi của bạn.</h2>
        <p class="text-gray-600 mb-2">Chúng tôi luôn tìm cách cải thiện trải nghiệm của bạn.</p>
        <p class="text-gray-600">Xin hãy dành chút thời gian để đánh giá và cho chúng tôi biết ý kiến của bạn.</p>
      </div>

      <form class="space-y-6" @submit.prevent="submitFeedback">
        <!-- Đánh Giá Sao -->
        <div class="flex justify-center space-x-2">
          <template v-for="i in 5" :key="i">
            <button
              type="button"
              class="text-3xl focus:outline-none transition-colors duration-200"
              :class="i <= rating ? 'text-yellow-500' : 'text-gray-300'"
              @click="rating = i"
            >
              ☆
            </button>
          </template>
        </div>

        <!-- Khu Vực Nhập Phản Hồi -->
        <div>
          <textarea
            v-model="comment"
            rows="4"
            placeholder="Chúng tôi có thể làm gì để cải thiện trải nghiệm của bạn?"
            class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-300 resize-none"
          ></textarea>
        </div>

        <!-- Nút Gửi -->
        <button
          type="submit"
          class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-500 transition-colors duration-200 font-medium"
        >
          Gửi Phản Hồi Của Tôi
        </button>
      </form>
    </div>

    <!-- Modal Xác Nhận -->
    <div v-if="showConfirmation" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
        <h3 class="text-xl font-semibold text-gray-800 mb-2">Cảm ơn bạn!</h3>
        <p class="text-gray-600 mb-4">Phản hồi của bạn đã được gửi thành công.</p>
        <button
          class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-500 transition-colors duration-200"
          @click="showConfirmation = false"
        >
          Đóng
        </button>
      </div>
    </div>
  </div>
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

  const appointmentID = route.params.appointmentID

  try {
    await userProfileStore.updateTreatmentPlanDetail({
      appointmentID: appointmentID as string,
      message: comment.value,
      rating: rating.value,
    })

    rating.value = 0
    comment.value = ''
    showConfirmation.value = true
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
</style>
