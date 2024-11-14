<script setup lang="ts">
import { computed, defineProps, defineEmits } from 'vue'
import { VaDropdown, VaDropdownContent } from 'vuestic-ui'

const props = defineProps<{
  availableTimes: string[]
  selectedTime: string | null
  isDoctorSelected: boolean
}>()

const emit = defineEmits(['update:selectedTime'])

const displayedTimes = computed(() => {
  if (props.isDoctorSelected) {
    return props.availableTimes
  } else {
    const times = []
    for (let i = 8; i < 17; i++) {
      times.push(`${i < 10 ? '0' + i : i}:00:00`)
      times.push(`${i < 10 ? '0' + i : i}:30:00`)
    }
    times.push('17:00')
    return times
  }
})

const selectTime = (time: string) => {
  emit('update:selectedTime', time)
}

const clearSelectedTime = () => {
  emit('update:selectedTime', null)
}
</script>

<template>
  <div>
    <VaDropdown :auto-placement="false" placement="right-center">
      <template #anchor>
        <p class="text-xl font-bold text-blue-900 dark:text-blue-100 mb-4">Select a time</p>
        <span class="material-symbols-outlined"> chevron_right </span>
      </template>
      <VaDropdownContent>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 lg:max-w-xl">
          <button
            v-for="time in displayedTimes"
            :key="time"
            class="rounded-lg px-4 py-2 font-medium text-emerald-900 active:scale-95 dark:text-emerald-100"
            :class="{
              'bg-emerald-600 text-white': time === selectedTime,
              'bg-emerald-100 dark:bg-emerald-800': time !== selectedTime,
            }"
            @click="selectTime(time)"
          >
            {{ time }}
          </button>
        </div>
      </VaDropdownContent>
    </VaDropdown>

    <!-- Display selected time as a separate button -->
    <div v-if="selectedTime" class="mt-4">
      <button
        class="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
        @click="clearSelectedTime"
      >
        <span>Selected: {{ selectedTime }}</span>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>
