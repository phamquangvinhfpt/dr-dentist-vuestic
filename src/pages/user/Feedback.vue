<template>
  <VaCard
    class="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center p-6"
  >
    <VaCard
      class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-lg w-full relative hover:shadow-xl transition-all duration-300"
    >
      <!-- Nút Đóng với animation và hiệu ứng hover mới -->
      <VaButton
        class="absolute right-4 top-4 w-10 h-10 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-all duration-300 transform hover:scale-110 hover:rotate-90 shadow-lg"
        @click="goHome"
      >
        ×
      </VaButton>

      <!-- Nội Dung Phản Hồi với animation và styling mới -->
      <div class="text-center mb-8 animate-fadeIn">
        <h2
          class="text-3xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
        >
          {{ t('vuestic.feedback_mess') }}
        </h2>
        <p class="animate-slideUp">{{ t('vuestic.feedback_type') }}</p>
      </div>

      <VaForm class="space-y-6" @submit.prevent="submitFeedback">
        <!-- Đánh Giá Sao với hiệu ứng mới -->
        <div class="flex justify-center space-x-3 py-4">
          <template v-for="i in 5" :key="i">
            <button
              type="button"
              class="text-4xl focus:outline-none transition-all duration-300 transform hover:scale-125 relative group"
              :class="i <= rating ? 'text-yellow-400' : 'text-gray-300'"
              @click="rating = i"
            >
              <span
                class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                {{ i }}/5
              </span>
              ★
            </button>
          </template>
        </div>
        <p v-if="rating === 0" class="text-sm text-red-500 text-center animate-pulse">
          {{ t('vuestic.feedback_rating') }}
        </p>

        <!-- Khu Vực Nhập Phản Hồi với styling mới -->
        <div class="relative">
          <VaTextarea
            v-model="comment"
            rows="5"
            :placeholder="t('vuestic.feedback_placeholder')"
            class="w-full p-4 rounded-xl border-black-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 resize-none transition-all duration-300 bg-white/80"
          ></VaTextarea>
          <p v-if="!comment" class="text-sm text-red-500 text-center mt-2 animate-pulse">
            {{ t('vuestic.feedback_placeholder_error') }}
          </p>
        </div>

        <!-- Nút Gửi với hiệu ứng gradient và animation mới -->
        <button
          type="submit"
          class="w-full bg-[#3860F4] hover:bg-[#2D4CC8] text-white py-3 px-6 rounded-lg shadow-lg transition-all duration-300 font-medium text-base flex items-center justify-center gap-2"
          :class="{ 'opacity-50 pointer-events-none': isSubmitting }"
        >
          <span v-if="isSubmitting" class="inline-flex items-center">
            <svg
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {{ t('vuestic.feedback_submiting') }}
          </span>
          <template v-else>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M22 2L11 13"></path>
              <path d="M22 2L15 22L11 13L2 9L22 2z"></path>
            </svg>
            <span>{{ t('vuestic.feedback_submit') }}</span>
          </template>
        </button>
      </VaForm>
    </VaCard>

    <!-- Modal Xác Nhận Thoát với animation mới -->
    <div
      v-if="showExitConfirmation"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
    >
      <VaCard class="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full text-center space-y-6 animate-scaleUp">
        <h3 class="text-xl font-semibold">Bạn chưa đánh giá</h3>
        <p>Bạn có chắc chắn muốn rời đi mà không gửi phản hồi?</p>
        <div class="flex justify-between gap-4">
          <button
            class="flex-1 bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 hover:shadow-lg transition-all duration-300 font-medium transform hover:scale-105"
            @click="cancelExit"
          >
            Không
          </button>
          <button
            class="flex-1 bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 hover:shadow-lg transition-all duration-300 font-medium transform hover:scale-105"
            @click="confirmExit"
          >
            Có
          </button>
        </div>
      </VaCard>
    </div>

    <!-- Modal Xác Nhận Thành Công với animation mới -->
    <div
      v-if="showConfirmation"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
    >
      <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center space-y-6 animate-scaleUp">
        <div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h3 class="text-2xl font-semibold text-gray-800">{{ t('vuestic.feedback_success') }}</h3>
        <p class="text-gray-600">{{ t('vuestic.feedback_success1') }}</p>
        <button
          class="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-medium transform hover:translate-y-[-2px]"
          @click="Home"
        >
          {{ t('vuestic.feedback_close') }}
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
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
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
    toast(t('vuestic.feedback_rating'))
    return
  }

  if (!comment.value.trim()) {
    toast(t('vuestic.feedback_placeholder_error'))
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
.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}

.animate-scaleUp {
  animation: scaleUp 0.3s ease-out;
}

.animate-slideUp {
  animation: slideUp 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scaleUp {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Hiệu ứng hover cho các phần tử tương tác */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
</style>
