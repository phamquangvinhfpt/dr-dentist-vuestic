<template>
  <VaModal v-model="isVisible" :blur="true" hide-default-actions size="large" class="service-modal" animation="scale">
    <template #header>
      <div class="modal-header px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
        <div class="flex items-center gap-3">
          <VaImage src="http://www.w3.org/2000/svg" alt="Chi tiết dịch vụ" class="w-8 h-8" />
          <h3 class="va-h3 text-2xl font-semibold mb-0">Chi Tiết Dịch Vụ</h3>
        </div>
      </div>
    </template>

    <VaCard class="va-card--no-border">
      <VaCardContent class="p-6">
        <!-- Loading -->
        <div v-if="isLoading" class="flex justify-center items-center py-12">
          <VaProgressCircle indeterminate size="large" class="text-blue-500" />
          <p class="text-gray-600 dark:text-gray-400 mt-4">Đang tải thông tin, vui lòng chờ...</p>
        </div>

        <!-- Không có dữ liệu -->
        <div v-else-if="!serviceDetails.length" class="text-center py-12">
          <img src="/icons/no-data.svg" alt="No data" class="w-16 h-16 mx-auto mb-4" />
          <div class="text-gray-500 dark:text-gray-400">Không có thông tin chi tiết để hiển thị.</div>
        </div>

        <!-- Danh sách chi tiết -->
        <div v-else class="service-details">
          <div class="space-y-4">
            <div
              v-for="detail in serviceDetails"
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
      </VaCardContent>
    </VaCard>

    <template #footer>
      <div class="modal-footer px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <VaButton size="large" class="w-full md:w-auto" color="primary" @click="closeModal"> Đóng </VaButton>
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
</style>
