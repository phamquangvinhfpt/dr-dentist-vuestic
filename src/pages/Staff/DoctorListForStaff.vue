<template>
  <div class="min-h-screen bg-gray-100 py-8 px-4">
    <div class="">
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-600">{{ error }}</p>
        <button class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700" @click="fetchDoctors">
          Try Again
        </button>
      </div>
      <div v-else>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="doctor in doctors" :key="doctor.id" class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-4">
                <img
                  :src="doctor.image || '/default-avatar.png'"
                  alt="Doctor"
                  class="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 class="text-lg font-semibold">{{ doctor.name }}</h3>
                  <p class="text-gray-600">{{ doctor.specialty }}</p>
                  <p class="text-sm text-gray-500">{{ doctor.experience }}</p>
                </div>
              </div>
            </div>
            <div class="flex justify-end space-x-2">
              <RouterLink
                :to="{ name: 'doctor-calendar', query: { doctorId: doctor.id } }"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                View Calendar
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDoctorProfileStore } from '@stores/modules/doctor.module'

const doctorStore = useDoctorProfileStore()
const doctors = ref([])
const loading = ref(true)
const error = ref(null)

async function fetchDoctors() {
  loading.value = true
  error.value = null
  try {
    const response = await doctorStore.getDoctors({ isActive: true })

    if (!response) {
      throw new Error('No response received from server')
    }

    const doctorData = Array.isArray(response) ? response : response.data

    if (!doctorData || !Array.isArray(doctorData)) {
      throw new Error(`Invalid response format: ${JSON.stringify(response)}`)
    }

    doctors.value = doctorData.map((doc) => ({
      id: doc.id,
      name: `${doc.firstName} ${doc.lastName}`,
      specialty: doc.doctorProfile?.specialty || 'General Practice',
      experience: `${doc.doctorProfile?.yearOfExp || 0} years`,
      image: doc.imageUrl,
      rating: doc.doctorProfile?.rating || null,
    }))
  } catch (e) {
    console.error('Fetch error details:', e)
    error.value = `Failed to load doctors: ${e.message}`
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDoctors()
})
</script>
