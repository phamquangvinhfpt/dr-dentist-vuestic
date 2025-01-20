<template>
  <VaModal v-model="isVisible" :blur="true" hide-default-actions size="medium" class="service-modal" animation="fade">
    <template #header>
      <div
        class="modal-header px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-primary/5"
      >
        <div class="flex items-center gap-4">
          <div class="p-2 rounded-full bg-primary/10">
            <VaIcon name="medical_services" size="large" color="primary" />
          </div>
          <h3 class="va-h3 text-2xl font-semibold mb-0 text-gray-800 dark:text-white">
            {{ t('service.serviceDetails') }}
          </h3>
        </div>
        <VaButton
          icon="close"
          preset="plain"
          color="gray"
          class="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          @click="closeModal"
        />
      </div>
    </template>

    <VaCard class="va-card--no-border">
      <VaCardContent class="p-6">
        <VaTabs v-model="activeTab" class="mb-6">
          <VaTab name="details" class="text-lg">{{ t('service.Detail') }}</VaTab>
          <VaTab name="reviews" class="text-lg">{{ t('service.rating') }}</VaTab>
        </VaTabs>

        <div v-if="activeTab === 'details'">
          <div v-if="isLoading" class="flex flex-col justify-center items-center py-12">
            <VaProgressCircle indeterminate size="large" color="primary" />
            <p class="text-gray-600 dark:text-gray-400 mt-4 text-lg">{{ t('service.loading_infor') }}</p>
          </div>

          <div
            v-else-if="!Array.isArray(serviceDetails.procedures) || serviceDetails.procedures.length === 0"
            class="flex flex-col items-center justify-center py-12 space-y-4"
          >
            <VaIcon name="info" size="large" color="gray" />
            <div class="text-gray-500 dark:text-gray-400 text-lg">{{ t('service.noService') }}</div>
          </div>

          <div v-else class="service-details space-y-6">
            <div class="grid gap-6">
              <div
                v-for="detail in serviceDetails.procedures"
                :key="detail.procedureID"
                class="procedure-item p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700"
              >
                <div class="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-4">
                      <div class="p-2 rounded-full bg-primary/10">
                        <VaIcon name="medical_services" color="primary" />
                      </div>
                      <h4 class="text-xl font-semibold text-gray-900 dark:text-white">
                        {{ detail.name }}
                      </h4>
                    </div>
                    <VaCard class="bg-gray-200 dark:bg-grey-600/50 p-4 rounded-lg mb-4">
                      <p class="text-base leading-relaxed">
                        {{ detail.description }}
                      </p>
                    </VaCard>
                  </div>
                  <div class="flex-shrink-0">
                    <VaChip color="active" class="price-chip text-lg font-semibold px-6 py-3" size="large">
                      {{ formatCurrency(detail.price) }}
                    </VaChip>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'reviews'" class="space-y-6">
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div class="grid md:grid-cols-2 gap-6">
              <div class="flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                <div class="text-center">
                  <div class="text-4xl font-bold text-primary mb-2">
                    {{
                      calculateAverageRating(filteredReviews) ? calculateAverageRating(filteredReviews).toFixed(1) : 0
                    }}
                  </div>
                  <div class="flex items-center justify-center gap-1 mb-2">
                    <span v-for="i in 5" :key="i" class="text-yellow-400 text-xl">
                      <Star
                        :class="
                          i <= Math.round(calculateAverageRating(filteredReviews)) ? 'fill-current' : 'stroke-current'
                        "
                      />
                    </span>
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ getTotalReviews(filteredReviews) }} {{ t('service.rating') }}
                  </div>
                </div>
              </div>

              <div class="space-y-3">
                <div v-for="rating in [5, 4, 3, 2, 1]" :key="rating" class="flex items-center gap-4">
                  <div class="flex items-center gap-1 w-20">
                    <span class="text-sm">{{ rating }}</span>
                    <Star class="w-4 h-4 text-yellow-400 fill-current" />
                  </div>
                  <div class="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-primary transition-all duration-500"
                      :style="{ width: Math.round(calculateRatingPercentage(rating) || 0) + '%' }"
                    ></div>
                  </div>
                  <span class="text-sm text-gray-500 w-16"
                    >{{ Math.round(calculateRatingPercentage(rating) || 0) }}%</span
                  >
                </div>
              </div>
            </div>
          </div>
          <div class="flex flex-col justify-center items-center gap-4">
            <span class="dark:text-gray-300 font-medium text-lg">{{ t('service.filter_rating') }}</span>
            <div class="flex flex-wrap gap-3">
              <VaChip
                v-for="star in [5, 4, 3, 2, 1]"
                :key="star"
                :color="activeFilter === star ? 'primary' : 'gray'"
                class="review-item text-xs md:text-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                size="large"
                @click="filterReviews(star)"
              >
                {{ star }} <span class="text-yellow-400">★</span>
              </VaChip>
            </div>
          </div>

          <div v-if="filteredReviews.length === 0" class="flex flex-col items-center justify-center py-12 space-y-4">
            <VaIcon name="star_border" size="large" color="gray" />
            <div class="text-gray-500 dark:text-gray-400 text-lg">{{ t('service.filter_noinfor') }}</div>
          </div>

          <div v-else class="space-y-8">
            <div v-for="reviewGroup in paginatedReviews" :key="reviewGroup.ratingType" class="review-group space-y-6">
              <div
                v-for="feedback in reviewGroup.feedbacks"
                :key="feedback.feedbackId"
                class="transform transition-all duration-300 hover:-translate-y-1"
              >
                <VaCard class="review-item border p-6 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md">
                  <div class="flex gap-6">
                    <img
                      v-if="feedback.patientAvatar"
                      loading="lazy"
                      :src="getSrcAvatar(feedback.patientAvatar)"
                      alt="Avatar"
                      class="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                    />
                    <img
                      v-else
                      loading="lazy"
                      src="https://png.pngtree.com/png-clipart/20230102/original/pngtree-business-man-avatar-png-image_8855195.png"
                      alt="Avatar"
                      class="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                    />
                    <div class="flex-1 space-y-3">
                      <h5 class="font-semibold text-gray-900 dark:text-white text-xl flex items-center gap-2">
                        {{ feedback.patientName }}
                        <span class="text-sm font-normal text-gray-500">({{ t('service.patient') }})</span>
                      </h5>
                      <p class="text-gray-600 dark:text-gray-600 text-base leading-relaxed">{{ feedback.message }}</p>
                      <div class="flex items-center gap-4 text-sm text-gray-500">
                        <span class="flex items-center gap-1">
                          <VaIcon name="star" color="warning" size="small" />
                          {{ feedback.ratings }}
                        </span>
                        <span class="flex items-center gap-1">
                          <VaIcon name="person" size="small" />
                          {{ feedback.doctorName }}
                        </span>
                      </div>
                    </div>
                  </div>
                </VaCard>
              </div>
            </div>

            <div class="pagination flex justify-center items-center gap-4 mt-8">
              <VaButton
                preset="secondary"
                size="large"
                icon="chevron_left"
                :disabled="currentPage === 1"
                class="hover:bg-gray-100 dark:hover:bg-gray-700"
                @click="changePage(currentPage - 1)"
              />
              <span class="text-lg font-medium">{{ currentPage }} / {{ totalPages }}</span>
              <VaButton
                preset="secondary"
                size="large"
                icon="chevron_right"
                :disabled="currentPage === totalPages"
                class="hover:bg-gray-100 dark:hover:bg-gray-700"
                @click="changePage(currentPage + 1)"
              />
            </div>
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <template #footer> </template>
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

const calculateAverageRating = (reviews) => {
  const totalRating = reviews.reduce(
    (sum, group) => sum + group.feedbacks.reduce((sum, feedback) => sum + feedback.ratings, 0),
    0,
  )
  const totalFeedbacks = reviews.reduce((sum, group) => sum + group.feedbacks.length, 0)
  return totalRating / totalFeedbacks
}

const getTotalReviews = (reviews) => {
  return reviews.reduce((sum, group) => sum + group.feedbacks.length, 0)
}

const calculateRatingPercentage = (rating) => {
  const totalFeedbacks = filteredReviews.value.reduce((sum, group) => sum + group.feedbacks.length, 0)
  const ratingFeedbacks = filteredReviews.value.reduce(
    (sum, group) => sum + group.feedbacks.filter((feedback) => feedback.ratings === rating).length,
    0,
  )
  return (ratingFeedbacks / totalFeedbacks) * 100
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
  max-width: 100vw !important;
  width: 100vw;
  height: 100vh;
  margin: 0;
}

.service-modal :deep(.va-modal__container) {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 95vw;
  height: 95vh;
  max-height: 95vh;
  border-radius: 1rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.service-modal :deep(.va-card) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.service-modal :deep(.va-card__content) {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.service-modal :deep(.va-tabs__container) {
  border-bottom: 2px solid var(--va-primary);
  position: sticky;
  top: 0;
  background: var(--va-background);
  z-index: 10;
}

.service-modal :deep(.va-tabs__item) {
  font-weight: 600;
  padding: 1rem 1.5rem;
}

.service-modal :deep(.va-tabs__item--active) {
  color: var(--va-primary);
  border-bottom: 2px solid var(--va-primary);
}

.review-item {
  transition: all 0.3s ease;
}

.price-chip {
  background: linear-gradient(135deg, var(--va-success) 0%, var(--va-primary) 100%);
  color: white;
}

/* Scrollbar styling */
.service-modal :deep(.va-card__content::-webkit-scrollbar) {
  width: 8px;
}

.service-modal :deep(.va-card__content::-webkit-scrollbar-track) {
  background: transparent;
}

.service-modal :deep(.va-card__content::-webkit-scrollbar-thumb) {
  background-color: var(--va-primary);
  border-radius: 4px;
}

/* For Firefox */
.service-modal :deep(.va-card__content) {
  scrollbar-width: thin;
  scrollbar-color: var(--va-primary) transparent;
}

@media (max-width: 640px) {
  .service-modal :deep(.va-modal__container) {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  }
}
</style>
