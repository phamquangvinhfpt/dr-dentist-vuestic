<script setup lang="ts">
import { computed, defineProps, defineEmits, ref } from 'vue'

const props = defineProps<{
  availableTimes: string[]
  selectedTime: string | null
  isDoctorSelected: boolean
}>()
const isOpen = ref(true)

const emit = defineEmits(['update:selectedTime'])

const displayedTimes = computed(() => {
  if (props.isDoctorSelected) {
    return props.availableTimes
  } else {
    const times = []
    for (let i = 8; i < 22; i++) {
      times.push(`${i < 10 ? '0' + i : i}:00`)
      times.push(`${i < 10 ? '0' + i : i}:30`)
    }
    return times
  }
})

const selectTime = (time: string) => {
  if (props.selectedTime === time) {
    emit('update:selectedTime', null)
  } else {
    emit('update:selectedTime', time)
    isOpen.value = false
  }
}

const toggleSection = () => {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div class="relative mb-3">
    <!-- Main Time Selector -->
    <button
      class="w-full flex justify-between items-center p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg border dark:border-gray-700"
      @click="toggleSection"
    >
      <div class="flex flex-col items-start">
        <p class="text-xl font-bold text-blue-900 dark:text-blue-100">
          Select time
          <span v-if="selectedTime" class="text-sm font-normal text-gray-600 dark:text-gray-300">
            ({{ selectedTime }})
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

    <!-- Dropdown Menu -->
    <div
      v-if="isOpen"
      class="absolute z-50 w-full mt-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700"
    >
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          v-for="time in displayedTimes"
          :key="time"
          class="rounded-lg px-4 py-2 font-medium transition-colors duration-200"
          :class="{
            'bg-emerald-600 text-white hover:bg-emerald-700': time === selectedTime,
            'bg-emerald-100 text-emerald-900 hover:bg-emerald-200 dark:bg-emerald-800 dark:text-emerald-100 dark:hover:bg-emerald-700':
              time !== selectedTime,
          }"
          @click="selectTime(time)"
        >
          {{ time }}
        </button>
      </div>
    </div>
  </div>
</template>
