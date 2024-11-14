<template>
  <div
    class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
    @click="navigateToDetail"
  >
    <div class="relative">
      <img
        :src="doctor.image || '/default-doctor.png'"
        :alt="doctor.name"
        class="w-full h-48 object-cover object-center"
      />
      <div
        v-if="doctor.rating"
        class="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-sm font-medium text-gray-700"
      >
        <div class="flex items-center">
          <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            />
          </svg>
          <span class="ml-1">{{ doctor.rating }}</span>
        </div>
      </div>
    </div>
    <div class="p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-2">{{ doctor.name }}</h2>
      <p class="text-gray-600 mb-2">{{ doctor.specialty }}</p>
      <div class="flex items-center mb-2">
        <span class="text-gray-600">Experience:</span>
        <span class="ml-2 font-medium">{{ doctor.experience }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useDoctorProfileStore } from '@stores/modules/doctor.module'

const router = useRouter()
const doctorStore = useDoctorProfileStore()

interface Doctor {
  id: string | number
  name: string
  specialty: string
  experience: string
  image?: string
  rating?: number
}

const props = defineProps<{
  doctor: Doctor
}>()

const navigateToDetail = () => {
  doctorStore.doctorId = props.doctor.id.toString()
  router.push({
    name: 'doctor-detail',
    params: { id: props.doctor.id },
  })
}
</script>
