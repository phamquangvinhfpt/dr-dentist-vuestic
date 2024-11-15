<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue'

const props = defineProps<{
  selectedDate: string | null
}>()

const emit = defineEmits(['update:selectedDate'])

const date = computed({
  get: () => props.selectedDate,
  set: (value) => emit('update:selectedDate', value),
})

const getWeekends = (date: Date | null) => {
  if (!date) return false
  return [0, 1, 5, 6].includes(date.getDay())
}
</script>

<template>
  <div>
    <p class="text-xl font-bold text-blue-900 dark:text-blue-100 mb-4">Select a date</p>
    <div class="relative w-full sm:w-56">
      <VaDatePicker v-model="date" stateful highlight-weekend :weekends="getWeekends" class="w-full" />
    </div>
  </div>
</template>
