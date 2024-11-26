<template>
  <div class="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Doctor Ratings</h1>

      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>

      <div v-else-if="error" class="text-red-600 text-center py-12">
        <p>{{ error }}</p>
      </div>
      <div v-else>
        <div
          v-for="doctor in doctors"
          :key="doctor.id"
          class="bg-white shadow rounded-lg p-6 mb-4 transition-transform transform hover:scale-105"
        >
          <h2 class="text-xl font-semibold">{{ doctor.name }}</h2>
          <p class="text-gray-600">Specialty: {{ doctor.specialty }}</p>
          <p class="text-gray-600">
            Rating:
            <span v-for="star in 5" :key="star" class="text-yellow-500">
              <i class="fas" :class="getStarClass(doctor.rating, star)"></i>
            </span>
          </p>
          <button
            class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            @click="rateDoctor(doctor.id)"
          >
            Rate Doctor
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDoctorProfileStore } from '@/stores/modules/doctor.module'

// Define the Doctor interface
interface Doctor {
  id: string
  name: string
  specialty: string
  rating: number
}

const doctors = ref<Doctor[]>([])
const doctorStore = useDoctorProfileStore()
const isLoading = ref(false)
const error = ref('')

async function fetchDoctors() {
  isLoading.value = true
  error.value = ''
  try {
    const response = await doctorStore.getDoctors({ isActive: true })
    doctors.value = response.data || []
  } catch (err) {
    error.value = 'Failed to load doctors'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

function rateDoctor(doctorId: string) {
  // Implement the logic to rate the doctor
  console.log(`Rate doctor with ID: ${doctorId}`)
  // You can navigate to a rating form or open a modal here
}

function getStarClass(rating: number, star: number) {
  return rating >= star ? 'fa-star' : 'fa-star-half-alt'
}

onMounted(() => {
  fetchDoctors()
})
</script>

<style scoped>
/* Add any additional styles here */
.bg-white {
  transition: transform 0.2s;
}
</style>
