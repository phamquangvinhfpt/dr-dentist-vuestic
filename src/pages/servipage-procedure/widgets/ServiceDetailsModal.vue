<template>
  <VaModal v-model="isVisible" :blur="true" hide-default-actions size="medium" class="service-modal" animation="scale">
    <template #header>
      <div class="modal-header px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
        <div class="flex items-center gap-3">
          <VaImage src="http://www.w3.org/2000/svg" alt="Chi tiết dịch vụ" class="w-8 h-8" />
          <h3 class="va-h3 text-2xl font-semibold mb-0">{{ t('service.detail_service') }}</h3>
        </div>
      </div>
    </template>

    <VaCard class="va-card--no-border">
      <VaCardContent class="p-6">
        <VaTabs v-model="activeTab">
          <VaTab name="details">{{ t('service.Detail') }}</VaTab>
          <VaTab name="reviews">{{ t('service.rating') }}</VaTab>
        </VaTabs>

        <div v-if="activeTab === 'details'">
          <!-- Danh sách chi tiết -->
          <div v-if="isLoading" class="flex justify-center items-center py-12">
            <VaProgressCircle indeterminate size="large" class="text-blue-500" />
            <p class="text-gray-600 dark:text-gray-400 mt-4">{{ t('service.loading_infor') }}</p>
          </div>

          <div
            v-else-if="!Array.isArray(serviceDetails.procedures) || serviceDetails.procedures.length === 0"
            class="text-center py-12"
          >
            <div class="text-gray-500 dark:text-gray-400">{{ t('service.noService') }}</div>
          </div>

          <div v-else class="service-details">
            <div class="space-y-4">
              <div
                v-for="detail in serviceDetails.procedures"
                :key="detail.procedureID"
                class="procedure-item p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div class="flex-1">
                    <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {{ detail.name }}
                    </h4>
                    <p class="text-gray-600 dark:text-gray-300 text-sm">
                      {{ detail.description }}
                    </p>
                  </div>
                  <div class="flex-shrink-0">
                    <VaChip color="primary" class="price-chip text-base font-semibold whitespace-nowrap" size="large">
                      {{ formatCurrency(detail.price) }}
                    </VaChip>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'reviews'">
          <span class="text-gray-700 dark:text-gray-300 font-medium">{{ t('service.filter_rating') }}</span> <br />
          <VaChip
            v-for="star in [5, 4, 3, 2, 1]"
            :key="star"
            :color="activeFilter === star ? 'primary' : 'secondary'"
            class="cursor-pointer"
            @click="filterReviews(star)"
          >
            {{ star }} ★
          </VaChip>

          <div v-if="filteredReviews.length === 0" class="text-gray-500 dark:text-gray-400">
            {{ t('service.filter_noinfor') }}
          </div>
          <div v-else>
            <div v-for="reviewGroup in paginatedReviews" :key="reviewGroup.ratingType" class="review-group space-y-4">
              <div class="flex items-center justify-center sm:justify-start mt-2">
                <span v-for="i in 5" :key="i" class="text-yellow-400">
                  <Star :class="i <= Math.round(reviewGroup.ratingType || 0) ? 'fill-current' : 'stroke-current'" />
                </span>
                <span class="ml-2 text-sm font-semibold"
                  >({{ reviewGroup.totalFeedback }} {{ t('service.rating') }})</span
                >
              </div>
              <div v-for="feedback in reviewGroup.feedbacks" :key="feedback.feedbackId">
                <VaCard class="review-item flex items-start gap-4 w-full h-full">
                  <img
                    v-if="feedback.patientAvatar"
                    loading="lazy"
                    :src="getSrcAvatar(feedback.patientAvatar)"
                    alt=" Avatar"
                    class="w-16 h-16 rounded-full"
                  />
                  <img
                    v-else
                    loading="lazy"
                    src="https://png.pngtree.com/png-clipart/20230102/original/pngtree-business-man-avatar-png-image_8855195.png"
                    alt="Avatar"
                    class="w-16 h-16 rounded-full"
                  />
                  <div class="flex-1 flex flex-col">
                    <h5 class="font-semibold text-gray-900 dark:text-white text-xl">
                      {{ feedback.patientName }} ({{ t('service.patient') }})
                    </h5>
                    <p class="text-gray-600 dark:text-gray-300 text-base mb-2">{{ feedback.message }}</p>
                    <div class="text-sm text-gray-500">
                      {{ t('service.rating') }}: {{ feedback.ratings }} ★ | {{ t('service.doctor') }}:
                      {{ feedback.doctorName }}
                    </div>
                  </div>
                </VaCard>
              </div>
            </div>

            <!-- Điều hướng phân trang -->
            <div class="pagination flex justify-center items-center mt-4">
              <VaButton size="small" :disabled="currentPage === 1" @click="changePage(currentPage - 1)"> ← </VaButton>
              <span class="mx-4">{{ currentPage }} / {{ totalPages }}</span>
              <VaButton size="small" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">
                →
              </VaButton>
            </div>
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <template #footer>
      <div class="modal-footer px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <VaButton class="w-full md:w-auto" color="primary" @click="closeModal"> {{ t('doctor.close') }} </VaButton>
      </div>
    </template>
  </VaModal>
</template>

<script setup>
import { VaModal, VaCard, VaCardContent, VaChip, VaButton, VaProgressCircle, VaTabs, VaTab } from 'vuestic-ui'
import { ref, computed, watch } from 'vue'
import { Star } from 'lucide-vue-next'
import { getSrcAvatar } from '@/services/utils'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const currentPage = ref(1)
const itemsPerPage = 5
const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  serviceDetails: {
    type: Array,
    required: true,
  },
  isLoading: {
    type: Boolean,
    required: true,
  },
  reviews: {
    type: Array,
    default: () => [],
  },
})
const totalPages = computed(() => {
  const totalFeedbacks = filteredReviews.value.reduce((sum, group) => sum + group.feedbacks.length, 0)
  return Math.ceil(totalFeedbacks / itemsPerPage)
})
const emit = defineEmits(['close'])
const paginatedReviews = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  let count = 0

  return filteredReviews.value
    .map((group) => {
      const feedbacks = group.feedbacks.filter(() => {
        if (count >= start && count < end) {
          count++
          return true
        }
        count++
        return false
      })
      return { ...group, feedbacks }
    })
    .filter((group) => group.feedbacks.length > 0)
})
const changePage = (page) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page
  }
}
const isVisible = ref(props.isOpen)
const activeTab = ref('details')
// Log serviceDetails to the console
const activeFilter = ref(null)
const filteredReviews = computed(() => {
  if (!props.reviews || props.reviews.length === 0) return []

  return activeFilter.value
    ? props.reviews
        .map((group) => ({
          ...group,
          feedbacks: group.feedbacks.filter((feedback) => feedback.ratings === activeFilter.value),
        }))
        .filter((group) => group.feedbacks.length > 0)
    : props.reviews
})

console.log('filteredReviews', props.reviews)
const filterReviews = (rating) => {
  activeFilter.value = activeFilter.value === rating ? null : rating
}

watch(
  () => props.isOpen,
  (newValue) => {
    isVisible.value = newValue
  },
)

watch(isVisible, (newValue) => {
  if (!newValue) {
    emit('close')
  }
})

const closeModal = () => {
  isVisible.value = false
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value)
}
</script>

<style scoped>
.service-modal {
  max-width: 800px;
  margin: 2rem;
  border-radius: 16px;
}

.service-details {
  max-height: calc(80vh - 200px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--va-primary) transparent;
}

.service-details::-webkit-scrollbar {
  width: 6px;
}

.service-details::-webkit-scrollbar-track {
  background: transparent;
}

.service-details::-webkit-scrollbar-thumb {
  background-color: var(--va-primary);
  border-radius: 3px;
}

.procedure-item {
  border: 1px solid var(--va-background-element);
}

.price-chip {
  min-width: 120px;
  justify-content: center;
}

@media (max-width: 640px) {
  .service-modal {
    margin: 1rem;
  }

  .service-details {
    max-height: calc(80vh - 160px);
  }
}

:deep(.va-modal__container) {
  max-height: 90vh;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(.va-modal__dialog) {
  display: flex;
  justify-content: center;
  align-items: center;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  position: fixed;
}

.service-modal {
  max-width: 900px;
  margin: 2rem auto;
  border-radius: 16px;
  overflow: hidden;
}

.service-details {
  max-height: calc(80vh - 240px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--va-primary) transparent;
}

.service-details::-webkit-scrollbar {
  width: 8px;
}

.service-details::-webkit-scrollbar-track {
  background: transparent;
}

.service-details::-webkit-scrollbar-thumb {
  background-color: var(--va-primary);
  border-radius: 4px;
}

.procedure-item {
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.procedure-item:hover {
  transform: translateY(-4px);
}

.price-chip {
  min-width: 120px;
  justify-content: center;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
}

:deep(.va-modal__container) {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Thêm các kiểu CSS cần thiết cho phần đánh giá */
.reviews-section {
  margin-top: 20px;
}

.review-item {
  border-bottom: 1px solid #e5e7eb;
  padding: 10px 0;
}
.reviews-section {
  margin-top: 20px;
  height: auto;
  width: 800px;
}

.review-item {
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.review-item:hover {
  transform: translateY(-4px);
}

.filter-section .va-chip {
  cursor: pointer;
  border-radius: 16px;
}

.filter-section .va-chip:hover {
  background-color: var(--va-primary-light);
}
.pagination span {
  font-size: 16px;
  color: var(--va-gray-dark);
}

.pagination .va-button {
  margin: 0 8px;
}
.review-item {
  display: flex;
  width: 100%; /* Đầy chiều ngang container */
  max-width: 100%; /* Tránh bị co cụm */
  padding: 16px;
  margin-bottom: 16px;
  background-color: #fff;
  border-radius: 8px; /* Bo góc */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Đổ bóng */
}
</style>
