<template>
  <div class="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
    <button
      class="mb-4 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
      @click="$router.back()"
    >
      ← Back
    </button>

    <div v-if="doctor" class="max-w-4xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
      <div class="md:flex">
        <div class="md:flex-shrink-0">
          <img
            class="h-48 w-full object-cover md:w-48"
            :src="doctor.imageUrl || '/placeholder.svg?height=192&width=192'"
            :alt="doctor.firstName + ' ' + doctor.lastName"
          />
        </div>
        <div class="p-8">
          <div class="uppercase tracking-wide text-sm text-indigo-500 font-semibold">{{ doctor.role }}</div>
          <h1 class="mt-2 text-3xl leading-8 font-bold tracking-tight text-gray-900 sm:text-4xl">
            Dr. {{ doctor.firstName }} {{ doctor.lastName }}
          </h1>
          <p class="mt-2 text-gray-500">
            {{ doctor.job }}
          </p>
        </div>
      </div>

      <div class="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl class="sm:divide-y sm:divide-gray-200">
          <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Email</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ doctor.email }}</dd>
          </div>
          <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Phone Number</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ doctor.phoneNumber }}</dd>
          </div>
          <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Address</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ doctor.address }}</dd>
          </div>
          <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Gender</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ doctor.gender ? 'Male' : 'Female' }}</dd>
          </div>
          <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Birth Date</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ formatDate(doctor.birthDate) }}</dd>
          </div>
        </dl>
      </div>

      <div class="px-4 py-5 sm:px-6">
        <h2 class="text-lg leading-6 font-medium text-gray-900">Doctor Profile</h2>
      </div>
      <div v-if="doctor.doctorProfile" class="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl class="sm:divide-y sm:divide-gray-200">
          <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Education</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ doctor.doctorProfile?.education }}</dd>
          </div>
          <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">College</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ doctor.doctorProfile?.college }}</dd>
          </div>
          <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Certification</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ doctor.doctorProfile?.certification }}</dd>
          </div>
          <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Years of Experience</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ doctor.doctorProfile?.yearOfExp }}</dd>
          </div>
          <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Self Description</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {{ doctor.doctorProfile?.seftDescription }}
            </dd>
          </div>
        </dl>
      </div>

      <div v-if="doctor.medicalHistory?.medicalName?.length" class="px-4 py-5 sm:px-6">
        <h2 class="text-lg leading-6 font-medium text-gray-900">Medical History</h2>
        <ul class="mt-2 list-disc list-inside text-sm text-gray-600">
          <li v-for="(item, index) in doctor.medicalHistory.medicalName" :key="index">
            {{ item }}
          </li>
        </ul>
        <p v-if="doctor.medicalHistory.note" class="mt-2 text-sm text-gray-600">
          <strong>Note:</strong> {{ doctor.medicalHistory.note }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDoctorProfileStore } from '@/stores/modules/doctor.module'

const route = useRoute()
const doctorStore = useDoctorProfileStore()
const doctor = ref<{
  imageUrl?: string
  firstName?: string
  lastName?: string
  [key: string]: any
}>({})

// Format date function
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  } as const
  return new Date(dateString).toLocaleDateString(undefined, options)
}

// Fetch doctor data using the store
onMounted(async () => {
  try {
    const id = route.params.id as string
    const response = await doctorStore.getDoctorDetail(id)
    doctor.value = response
  } catch (error) {
    console.error('Error fetching doctor data:', error)
  }
})
</script>
