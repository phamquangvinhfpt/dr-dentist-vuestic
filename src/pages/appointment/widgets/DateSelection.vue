<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

defineProps<{
  selectedDate: string | null
}>()

const emit = defineEmits(['update:selectedDate'])
</script>

<template>
  <div>
    <p class="text-xl font-bold text-blue-900 dark:text-blue-100 mb-4">Select a date</p>
    <div class="relative w-full sm:w-56">
      <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg class="h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
            clip-rule="evenodd"
          ></path>
        </svg>
      </div>
      <input
        :value="selectedDate"
        type="date"
        class="block w-full rounded-lg border border-emerald-300 bg-emerald-50 p-2.5 pl-10 text-emerald-800 outline-none ring-opacity-30 placeholder:text-emerald-800 focus:ring focus:ring-emerald-300 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        placeholder="Select date"
        @input="emit('update:selectedDate', ($event.target as HTMLInputElement).value)"
      />
    </div>
  </div>
</template>
