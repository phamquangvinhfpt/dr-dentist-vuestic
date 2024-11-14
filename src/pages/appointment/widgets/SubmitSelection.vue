<script setup lang="ts">
import { defineProps, computed, onUnmounted } from 'vue'

const props = defineProps<{
  isVisible: boolean
  selectedService: {
    serviceName: string | null
    totalPrice: number
  }
  selectedDate: string | null
  selectedTime: string | null
  selectedPractitioner: {
    firstName: string | null
    lastName: string | null
  } | null
}>()
const emit = defineEmits<{
  submit: []
  'update:isVisible': [value: boolean]
}>()

const handleSubmit = () => {
  emit('submit')
}

const updateVisibility = (value: boolean) => {
  emit('update:isVisible', value)
}

const formattedDeposit = computed(() => {
  return new Intl.NumberFormat('vi-VN').format(props.selectedService.totalPrice * 0.3)
})

onUnmounted(() => {
  emit('update:isVisible', false)
})
</script>
<template>
  <VaModal
    ref="modal"
    :model-value="isVisible"
    size="large"
    close-button
    @ok="handleSubmit"
    @update:modelValue="updateVisibility"
  >
    <VaCard class="p-6 max-w-md mx-auto bg-white dark:bg-gray-800 container">
      <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Booking Confirmation</h3>
      <p class="text-gray-600 dark:text-gray-300 mb-6">Your appointment has been booked successfully.</p>

      <div class="space-y-4">
        <div class="flex justify-between">
          <span class="font-medium text-gray-700 dark:text-gray-300">Service:</span>
          <span class="text-gray-900 dark:text-white">{{ selectedService.serviceName }}</span>
        </div>
        <div class="flex justify-between">
          <span class="font-medium text-gray-700 dark:text-gray-300">Date:</span>
          <span class="text-gray-900 dark:text-white">{{ selectedDate }}</span>
        </div>
        <div class="flex justify-between">
          <span class="font-medium text-gray-700 dark:text-gray-300">Time:</span>
          <span class="text-gray-900 dark:text-white">{{ selectedTime }}</span>
        </div>
        <div v-if="selectedPractitioner">
          <div class="flex justify-between">
            <span class="font-medium text-gray-700 dark:text-gray-300">Doctor:</span>
            <span class="text-gray-900 dark:text-white"
              >{{ selectedPractitioner.firstName }} {{ selectedPractitioner.lastName }}</span
            >
          </div>
        </div>
        <div class="flex justify-between">
          <span class="font-medium text-gray-700 dark:text-gray-300">Deposit:</span>
          <span class="text-gray-900 dark:text-white">{{ formattedDeposit }}</span>
        </div>
      </div>
    </VaCard>
  </VaModal>
</template>
