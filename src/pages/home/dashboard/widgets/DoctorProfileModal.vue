<script setup lang="ts">
import { computed, ref } from 'vue'
import { Doctors } from './types'

const props = defineProps<{
  doctor: Doctors | null
}>()

const fullName = computed(() => {
  if (props.doctor) {
    return `${props.doctor.firstName} ${props.doctor.lastName}`
  }
  return ''
})

// Mock data for feedback
const feedback = ref([
  { id: 1, user: 'John Doe', rating: 5, comment: 'Excellent doctor! Very knowledgeable and caring.' },
  { id: 2, user: 'Jane Smith', rating: 4, comment: 'Great experience overall. Highly recommended.' },
  {
    id: 3,
    user: 'Mike Johnson',
    rating: 5,
    comment: 'Dr. ' + fullName.value + ' is amazing! Helped me recover quickly.',
  },
])

const renderStars = (rating: number) => {
  const stars = []
  for (let i = 0; i < rating; i++) {
    stars.push('⭐')
  }
  return stars.join(' ')
}
</script>

<template>
  <div class="bg-gray-100 p-6 rounded-lg w-full">
    <div class="flex justify-between items-start mb-6">
      <h2 class="text-3xl font-bold text-gray-800">{{ fullName }}</h2>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="md:col-span-1">
        <img
          :src="doctor?.imageUrl || 'https://via.placeholder.com/150'"
          :alt="fullName"
          class="w-full h-auto rounded-lg shadow-md"
        />
        <div class="mt-4 flex items-center justify-center">
          <VaRating v-model="doctor!.rating" color="warning" readonly />
          <span class="ml-2 text-gray-600">{{ doctor?.rating }}/5</span>
        </div>
      </div>

      <div class="md:col-span-2">
        <div class="space-y-4">
          <div>
            <h3 class="text-lg font-semibold text-gray-700">Contact Information</h3>
            <p class="text-gray-600"><VaIcon name="mdi-email" /> {{ doctor?.email }}</p>
            <p class="text-gray-600"><VaIcon name="mdi-phone" /> {{ doctor?.phoneNumber }}</p>
          </div>

          <div>
            <h3 class="text-lg font-semibold text-gray-700">Professional Details</h3>
            <p class="text-gray-600"><strong>Education:</strong> {{ doctor?.doctorProfile.education }}</p>
            <p class="text-gray-600"><strong>College:</strong> {{ doctor?.doctorProfile.college }}</p>
            <p class="text-gray-600"><strong>Certification:</strong> {{ doctor?.doctorProfile.certification }}</p>
            <p class="text-gray-600"><strong>Years of Experience:</strong> {{ doctor?.doctorProfile.yearOfExp }}</p>
          </div>

          <div>
            <h3 class="text-lg font-semibold text-gray-700">About</h3>
            <p class="text-gray-600">{{ doctor?.doctorProfile.seftDescription }}</p>
          </div>
        </div>
      </div>
    </div>
    <!-- New Feedback Section -->
    <div class="mt-8">
      <h3 class="text-2xl font-semibold text-gray-800 mb-4">Patient Feedback</h3>
      <div class="space-y-4">
        <div v-for="item in feedback" :key="item.id" class="bg-white p-4 rounded-lg shadow">
          <div class="flex items-center justify-between mb-2">
            <span class="font-semibold text-gray-700">{{ item.user }}</span>
            <div class="flex">
              {{ renderStars(item.rating) }}
            </div>
          </div>
          <p class="text-gray-600">{{ item.comment }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
