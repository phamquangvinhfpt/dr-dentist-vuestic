<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    <div
      v-for="doctor in doctors"
      :key="doctor.id"
      class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      @click="navigateToDetail(doctor.id)"
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
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useDoctorProfileStore } from '@stores/modules/doctor.module'
import type { Doctor } from './types'

const router = useRouter()
const doctorStore = useDoctorProfileStore()

defineProps<{
  doctors: Doctor[]
}>()

const navigateToDetail = (id: string | number) => {
  doctorStore.doctorId = id.toString()
  router.push({
    name: 'doctor-detail',
    params: { id },
  })
}
</script>
