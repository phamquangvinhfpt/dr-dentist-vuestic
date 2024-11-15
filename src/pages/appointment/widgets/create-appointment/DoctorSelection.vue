<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

defineProps<{
  practitioners: any[]
  selectedPractitioner: any | null
}>()

const emit = defineEmits(['update:selectedPractitioner', 'practitionerSelected'])

const handleSelect = (practitioner: any) => {
  emit('practitionerSelected', practitioner)
}
</script>

<template>
  <div>
    <p class="text-xl font-bold text-blue-900 dark:text-blue-100 mb-4">Select a practitioner</p>
    <div class="h-[234px] overflow-y-auto scroll">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div v-for="practitioner in practitioners" :key="practitioner.id" class="relative">
          <input
            :id="`practitioner_${practitioner.id}`"
            :value="practitioner"
            type="radio"
            name="practitioner"
            class="peer sr-only"
            :checked="selectedPractitioner === practitioner"
            @change="handleSelect(practitioner)"
          />
          <label
            :for="`practitioner_${practitioner.id}`"
            class="flex h-full cursor-pointer flex-col rounded-lg p-4 peer-checked:bg-emerald-600 peer-checked:text-white dark:bg-gray-700 dark:peer-checked:bg-emerald-700"
          >
            <img
              :src="
                practitioner.imageUrl ||
                'https://plus.unsplash.com/premium_photo-1661718954553-f775043016d5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
              "
              alt="Practitioner Image"
              class="w-full h-32 object-cover rounded-lg mb-2"
            />
            <span class="font-medium">{{ practitioner.firstName }} {{ practitioner.lastName }}</span>
            <span class="text-xs uppercase">{{ practitioner.doctorProfile.education }}</span>
          </label>
          <span
            class="absolute right-4 top-4 box-content block h-3 w-3 rounded-full border-8 border-gray-300 bg-white peer-checked:border-emerald-400 dark:border-gray-600 dark:peer-checked:border-emerald-400"
          ></span>
        </div>
      </div>
    </div>
  </div>
</template>
