<template>
  <VaModal v-model="isVisible" :blur="true" hide-default-actions size="large" class="service-modal">
    <template #header>
      <div class="modal-header px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="va-h3 text-2xl font-semibold mb-0">Chi Tiết Dịch Vụ</h3>
      </div>
    </template>

    <VaCard class="va-card--no-border">
      <VaCardContent class="p-6">
        <div v-if="isLoading" class="flex justify-center items-center py-12">
          <VaProgressCircle indeterminate size="large" />
        </div>
        <div v-else-if="!serviceDetails.length" class="text-center py-12">
          <div class="text-gray-500 dark:text-gray-400">Không có thông tin chi tiết để hiển thị.</div>
        </div>
        <div v-else class="service-details">
          <div class="space-y-4">
            <div
              v-for="detail in serviceDetails"
              :key="detail.procedureID"
              class="procedure-item p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
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
      </VaCardContent>
    </VaCard>

    <template #footer>
      <div class="modal-footer px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <VaButton size="large" class="w-full md:w-auto" @click="closeModal"> Đóng </VaButton>
      </div>
    </template>
  </VaModal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { VaModal, VaCard, VaCardContent, VaChip, VaButton, VaProgressCircle } from 'vuestic-ui'

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
})

const emit = defineEmits(['close'])

const isVisible = ref(props.isOpen)

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
}

:deep(.va-modal__dialog) {
  margin: 0;
}
</style>
