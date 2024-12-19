<script setup lang="ts">
import { defineEmits, onMounted, ref } from 'vue'
import { Doctor } from '../../types'
import { useDoctorProfileStore } from '@/stores/modules/doctor.module'
import { getErrorMessage, getSrcAvatar } from '@/services/utils'
import { useToast } from 'vuestic-ui/web-components'

const { init } = useToast()
const storeDoctor = useDoctorProfileStore()
const loading = ref(false)
const doctors = ref<Doctor[]>([])
const selectedPractitioner = ref<Doctor | null>(null)
const selectedDoctorId = ref<string | null>(null)
const isOpen = ref(true)

const props = defineProps<{
  service: any
  date: any
  time: any
}>()

const getAvailableDoctors = () => {
  const date = props.date.split('T')[0]
  const [hours, minutes, seconds] = props.time.split(':')
  let newMinutes = parseInt(minutes) + 30
  let newHours = parseInt(hours)

  if (newMinutes >= 60) {
    newHours += 1
    newMinutes -= 60
  }
  const endTime = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}:${seconds}`

  const request = {
    serviceID: props.service.serviceID,
    date: date,
    startTime: props.time,
    endTime: endTime,
  }
  loading.value = true
  storeDoctor
    .getAvailableDoctors(request)
    .then((response) => {
      doctors.value = response
      console.log(response)
    })
    .catch((error) => {
      const message = getErrorMessage(error)
      init({
        title: 'error',
        message: message,
        color: 'danger',
      })
    })
    .finally(() => {
      loading.value = false
    })
}

const emit = defineEmits(['update:selectedPractitioner'])

const handleSelect = (practitioner: any) => {
  emit('update:selectedPractitioner', practitioner)
  selectedPractitioner.value = practitioner
  selectedDoctorId.value = practitioner.id
  isOpen.value = false
}

const toggleSection = () => {
  isOpen.value = !isOpen.value
}

onMounted(() => {
  getAvailableDoctors()
})
</script>

<template>
  <div class="flex flex-col mb-3">
    <!-- Accordion header -->
    <div class="border dark:border-none rounded-lg overflow-hidden">
      <button
        class="w-full flex justify-between items-center p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
        @click="toggleSection"
      >
        <p class="text-xl font-bold text-blue-900 dark:text-blue-100">
          Select a doctor
          <span v-if="selectedPractitioner" class="text-sm font-normal text-gray-600 dark:text-gray-300">
            ({{ selectedPractitioner.firstName }} {{ selectedPractitioner.lastName }})
          </span>
        </p>
        <svg
          class="w-5 h-5 transition-transform duration-200"
          :class="{ 'rotate-180': isOpen }"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Accordion content -->
      <div v-show="isOpen" class="transition-all duration-200">
        <div class="p-4 border-t border-gray-200 dark:border-gray-700">
          <div class="h-[440px] md:h-[300px] lg:h-[325px] overflow-y-auto pr-4 scroll">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="practitioner in doctors" :key="practitioner.id" class="relative">
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
                      getSrcAvatar(practitioner.imageUrl) ||
                      'https://plus.unsplash.com/premium_photo-1661718954553-f775043016d5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                    "
                    alt="Practitioner Image"
                    class="items-center h-12 w-12 md:h-32 md:w-32 !rounded-full object-cover object-center mx-auto"
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
      </div>
    </div>
  </div>
</template>
