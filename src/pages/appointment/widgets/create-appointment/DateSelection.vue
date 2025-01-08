<script setup lang="ts">
import { defineProps, defineEmits, computed, ref } from 'vue'
import { useToast } from 'vuestic-ui'
import type { VaDatePicker } from 'vuestic-ui'

type DatePickerModelValue = Date | null

const props = defineProps<{
  selectedDate: string | null
}>()
const isOpen = ref(true)
const { init } = useToast()

const emit = defineEmits(['update:selectedDate'])

const isValidDate = (dateString: string | null): boolean => {
  if (!dateString) return false
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

const isPastDate = (dateString: string): boolean => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const selectedDate = new Date(dateString)
  selectedDate.setHours(0, 0, 0, 0)

  return selectedDate < today
}

const date = computed<DatePickerModelValue>({
  get: () => {
    if (!props.selectedDate) return null
    return new Date(props.selectedDate)
  },
  set: (value: DatePickerModelValue) => {
    if (!value) {
      emit('update:selectedDate', null)
      isOpen.value = false
      return
    }

    const dateStr = value.toISOString()

    if (!isValidDate(dateStr)) {
      init({
        title: 'Error',
        message: 'Invalid date format',
        color: 'danger',
      })
      return
    }

    if (isPastDate(dateStr)) {
      init({
        title: 'Error',
        message: 'You cannot select a date in the past',
        color: 'danger',
      })
      return
    }

    emit('update:selectedDate', dateStr)
    isOpen.value = false
  },
})

const getWeekends = (date: Date) => {
  return [0, 1, 5, 6].includes(date.getDay())
}

// format date to 'DD-MM-YYYY'
const formatDate = (date: Date) => {
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  return `${day < 10 ? '0' + day : day}-${month < 10 ? '0' + month : month}-${year}`
}

const toggleSection = () => {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div class="border dark:border-none rounded-lg">
    <button
      class="w-full flex justify-between items-center p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
      @click="toggleSection"
    >
      <div class="flex flex-col items-start">
        <p class="text-xl font-bold text-blue-900 dark:text-blue-100">
          {{ $t('booking.selectDate') }}
          <span v-if="selectedDate" class="text-sm font-normal text-gray-600 dark:text-gray-300">
            ({{ formatDate(new Date(selectedDate)) }})
          </span>
        </p>
      </div>
      <svg
        class="w-5 h-5 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div v-show="isOpen" class="transition-all duration-200">
      <div class="flex justify-center p-4">
        <div class="relative w-full sm:w-100">
          <VaDatePicker v-model="date" stateful highlight-weekend :weekends="getWeekends" class="w-full" />
        </div>
      </div>
    </div>
  </div>
</template>
