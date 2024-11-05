<script setup lang="ts">
import { useDoctorProfileStore } from '@/stores/modules/doctor.module'
import { onBeforeMount, onMounted, ref } from 'vue'
import { VaCarousel, VaInnerLoading, VaButton, VaInput, VaDateInput, VaCardContent } from 'vuestic-ui'
import { Doctors } from './types'
import router from '@/router'

const loading = ref(true)
const currentSlide = ref(0)
const showContent = ref(true)
const animationKey = ref(0)
const isLargeScreen = ref(window.innerWidth >= 1024)
const appointmentDate = ref(new Date())
const doctorStore = useDoctorProfileStore()
const doctors = ref<Doctors[]>([])

const INTERVAL_TIME = 3000
const items = ['images/slider/slider-6-1.jpg', 'images/slider/slider-6-2.jpg']

const startContentAnimation = () => {
  setInterval(() => {
    showContent.value = false
    animationKey.value++
    setTimeout(() => {
      showContent.value = true
    }, 500)
  }, INTERVAL_TIME)
}

const handleGetDoctors = async () => {
  loading.value = true
  try {
    const response = await doctorStore.getTopDoctors()
    doctors.value = response.data
    console.log(doctors.value)
  } catch (error) {
    console.error(error)
  }
  loading.value = false
}

const options = [
  { label: 'Dr. John Smith', value: 'john-smith' },
  { label: 'Dr. Emily Johnson', value: 'emily-johnson' },
  { label: 'Dr. Michael Lee', value: 'michael-lee' },
]

// value
const value = ref('')

// fake doctors
// const fakedoctors = ref([
//   {
//     name: 'Dr. John Smith',
//     image:
//       'https://plus.unsplash.com/premium_photo-1664475543697-229156438e1e?q=80&w=1972&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
//     description:
//       'Dr. John Smith is a highly experienced dentist with a passion for providing quality care to his patients. He specializes in cosmetic dentistry and has helped many patients achieve their dream smiles.',
//   },
//   {
//     name: 'Dr. Emily Johnson',
//     image:
//       'https://plus.unsplash.com/premium_photo-1664475543697-229156438e1e?q=80&w=1972&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
//     description:
//       'Dr. Emily Johnson is a dedicated dentist who is committed to providing the best care to her patients. She specializes in pediatric dentistry and ensures children feel comfortable and safe during their visits.',
//   },
//   {
//     name: 'Dr. Michael Lee',
//     image:
//       'https://plus.unsplash.com/premium_photo-1664475543697-229156438e1e?q=80&w=1972&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
//     description:
//       'Dr. Michael Lee is a skilled dentist who is dedicated to providing comprehensive care to his patients. He specializes in restorative dentistry and ensures patients receive the best treatments for their needs.',
//   },
//   {
//     name: 'Dr. Sarah Brown',
//     image:
//       'https://plus.unsplash.com/premium_photo-1664475543697-229156438e1e?q=80&w=1972&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
//     description:
//       'Dr. Sarah Brown is a caring dentist who is dedicated to providing personalized care to her patients. She specializes in preventive dentistry and helps patients maintain healthy smiles for life.',
//   },
// ])

onMounted(() => {
  const handleResize = () => {
    isLargeScreen.value = window.innerWidth >= 768
  }
  handleResize()
  window.addEventListener('resize', handleResize)
})

onMounted(() => {
  loading.value = false
  startContentAnimation()
})

onBeforeMount(() => {
  handleGetDoctors()
  // if (!isPatientOrGuest.value) {
  //   router.push({ name: 'dashboard' })
  // }
})

window.addEventListener('resize', () => {
  isLargeScreen.value = window.innerWidth >= 1024
})
</script>

<template>
  <VaInnerLoading :loading="loading">
    <div class="relative">
      <div class="relative w-full">
        <!-- Carousel phần giữ nguyên -->
        <VaCarousel
          v-model="currentSlide"
          :items="items"
          :ratio="16 / 8"
          stateful
          autoscroll
          :autoscroll-interval="INTERVAL_TIME"
          :arrows="false"
          effect="transition"
          :indicators="false"
          :class="['mt-3', isLargeScreen ? '' : 'hidden']"
        >
        </VaCarousel>

        <!-- Dark overlay -->
        <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60"></div>

        <!-- Content container -->
        <div class="absolute inset-0 flex items-center justify-center overflow-hidden">
          <Transition
            enter-active-class="transition-all duration-1000 ease-out"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition-all duration-1000 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <div v-show="showContent" :key="animationKey" class="text-center">
              <div class="slide-down">
                <h3 class="text-white text-base md:text-5xl lg:text-6xl font-bold lg:mb-8 drop-shadow-lg">
                  We Provide Oral Health Services to <br />
                  Adults and Children
                </h3>
              </div>
              <div class="slide-up">
                <VaButton class="lg:px-8 lg:py-4 text-sm font-semibold shadow-lg hover:shadow-xl" color="primary">
                  Get Appointment
                </VaButton>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Services section -->
      <div :class="[isLargeScreen ? 'container mx-auto p-4' : '']">
        <div v-if="!isLargeScreen" class="flex justify-between items-center mt-4 m-3">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Our Category</h2>
          <a href="#" class="text-blue-800 dark:text-blue-300 hover:text-blue-600 dark:hover:text-blue-400">See All</a>
        </div>
        <div class="grid grid-cols-3 gap-4 lg:gap-8 mt-8 lg:-mt-16 place-content-center lg:relative lg:px-4 z-10 m-3">
          <!-- Service 1-->
          <a href="#" class="group block">
            <div
              class="service-card dark:bg-gray-800 bg-white rounded-lg shadow p-6 flex flex-col border-2 border-solid dark:border-gray-700 transition-all duration-300 hover:bg-sky-500 dark:hover:bg-sky-600 hover:border-sky-500 dark:hover:border-sky-600"
            >
              <div class="flex justify-center mb-6">
                <div
                  class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sky-100 dark:bg-sky-900 text-sky-600 dark:text-sky-300 group-hover:bg-white dark:group-hover:bg-white group-hover:text-sky-500 dark:group-hover:text-sky-500 transition-colors duration-300"
                >
                  <span class="material-symbols-outlined text-basic lg:text-3xl">dentistry</span>
                </div>
              </div>
              <h3
                class="text-sm lg:text-xl font-semibold mb-4 text-center text-blue-800 dark:text-blue-300 group-hover:text-white transition-colors duration-300"
              >
                Tooth Extraction
              </h3>
              <p
                :class="[
                  'text-gray-600 dark:text-gray-300 text-center flex-grow group-hover:text-white transition-colors duration-300',
                  isLargeScreen ? '' : 'hidden',
                ]"
              >
                Our experienced dentists provide safe and gentle tooth extraction services to relieve pain and prevent
                further complications. We prioritize your comfort throughout the process.
              </p>
            </div>
          </a>

          <!-- Service 2 -->
          <a href="#" class="group block">
            <div
              class="service-card dark:bg-gray-800 bg-white rounded-lg shadow p-6 flex flex-col border-2 border-solid dark:border-gray-700 transition-all duration-300 hover:bg-sky-500 dark:hover:bg-sky-600 hover:border-sky-500 dark:hover:border-sky-600"
            >
              <div class="flex justify-center mb-6">
                <div
                  class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sky-100 dark:bg-sky-900 text-sky-600 dark:text-sky-300 group-hover:bg-white dark:group-hover:bg-white group-hover:text-sky-500 dark:group-hover:text-sky-500 transition-colors duration-300"
                >
                  <span class="material-symbols-outlined text-sm lg:text-3xl">emergency_dental</span>
                </div>
              </div>
              <h3
                class="text-sm lg:text-xl font-semibold mb-4 text-center text-blue-800 dark:text-blue-300 group-hover:text-white transition-colors duration-300"
              >
                Cavity Fillings
              </h3>
              <p
                :class="[
                  'text-gray-600 dark:text-gray-300 text-center flex-grow group-hover:text-white transition-colors duration-300',
                  isLargeScreen ? '' : 'hidden',
                ]"
              >
                We use the latest materials and techniques to fill cavities, restoring the health and appearance of your
                teeth while preventing future decay.
              </p>
            </div>
          </a>

          <!-- Service 3 -->
          <a href="#" class="group block">
            <div
              class="service-card dark:bg-gray-800 bg-white rounded-lg shadow p-6 flex flex-col border-2 border-solid dark:border-gray-700 transition-all duration-300 hover:bg-sky-500 dark:hover:bg-sky-600 hover:border-sky-500 dark:hover:border-sky-600"
            >
              <div class="flex justify-center mb-6">
                <div
                  class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sky-100 dark:bg-sky-900 text-sky-600 dark:text-sky-300 group-hover:bg-white dark:group-hover:bg-white group-hover:text-sky-500 dark:group-hover:text-sky-500 transition-colors duration-300"
                >
                  <span class="material-symbols-outlined text-3xl">medication</span>
                </div>
              </div>
              <h3
                class="text-sm lg:text-xl font-semibold mb-4 text-center text-blue-800 dark:text-blue-300 group-hover:text-white transition-colors duration-300"
              >
                Fracture Repairs
              </h3>
              <p
                :class="[
                  'text-gray-600 dark:text-gray-300 text-center flex-grow group-hover:text-white transition-colors duration-300',
                  isLargeScreen ? '' : 'hidden',
                ]"
              >
                Whether it's a chipped or cracked tooth, our dentists can restore your smile with expert fracture repair
                treatments, ensuring long-lasting results.
              </p>
            </div>
          </a>
        </div>
      </div>

      <!-- Doctors section-->
      <div :class="[isLargeScreen ? 'w-full max-w-4xl md:max-w-7xl mx-auto mb-6' : '']">
        <div v-if="!isLargeScreen" class="flex justify-between items-center mt-4 m-3">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Top Doctors</h2>
          <a href="#" class="text-blue-800 dark:text-blue-300 hover:text-blue-600 dark:hover:text-blue-400">See All</a>
        </div>
        <VaCardContent>
          <div class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              v-for="(doctor, index) in doctors"
              :key="index"
              class="doctor-card bg-white dark:bg-gray-800 rounded-lg shadow border-2 border-solid dark:border-gray-700 flex flex-col min-w-[150px] md:min-w-[200px] lg:min-w-[250px] relative"
              :class="[
                'animate__animated',
                isLargeScreen ? 'animate__fadeIn' : index === 0 ? 'animate__fadeInLeft' : 'animate__fadeInRight',
              ]"
            >
              <!-- Main content with padding except bottom -->
              <div class="p-6 pb-16">
                <!-- Added pb-16 to make space for buttons -->
                <div class="flex justify-center">
                  <img
                    :src="
                      doctor.imageUrl
                        ? doctor.imageUrl
                        : 'https://plus.unsplash.com/premium_photo-1664475543697-229156438e1e?q=80&w=1972&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                    "
                    :alt="`${doctor.firstName} ${doctor.lastName}`"
                    class="w-24 h-24 rounded-full object-cover"
                  />
                </div>

                <div class="flex flex-col flex-grow">
                  <div class="min-h-[3rem] flex items-center justify-center">
                    <h3 class="text-sm lg:text-xl font-semibold text-center">
                      {{ doctor.firstName }} {{ doctor.lastName }}
                    </h3>
                  </div>

                  <div class="min-h-[3rem] flex items-center justify-center">
                    <p class="text-gray-600 dark:text-gray-300 text-center text-sm font-semibold">
                      {{ doctor.doctorProfile.education }}
                    </p>
                  </div>

                  <div v-if="isLargeScreen" class="flex">
                    <p
                      class="selection:bg-fuchsia-300 selection:text-fuchsia-900 text-gray-600 dark:text-gray-300 text-center text-sm"
                    >
                      {{ doctor.doctorProfile.seftDescription }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Buttons container with absolute positioning -->
              <div class="absolute bottom-0 left-0 right-0 flex">
                <button
                  class="flex-1 py-3 bg-blue-500 text-white rounded-bl-lg hover:bg-blue-600 transition-colors duration-300 text-sm"
                  @click="router.push({ name: 'doctor-profile', params: { id: doctor.id } })"
                >
                  View Profile
                </button>

                <button
                  class="flex-1 py-3 bg-green-500 text-white rounded-br-lg hover:bg-green-600 transition-colors duration-300 text-sm"
                >
                  <div class="flex items-center justify-center gap-1">
                    <span>{{ doctor.rating }}</span>
                    <span class="material-symbols-outlined text-yellow-300">star</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
          <div v-if="!isLargeScreen" class="flex justify-between mt-4"></div>
        </VaCardContent>
      </div>
      <!-- About section -->
      <div :class="[isLargeScreen ? 'container mx-auto p-4' : '']">
        <div
          class="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8 mt-8 lg:mt-16 place-content-center lg:relative lg:px-4 z-10"
        >
          <div class="lg:col-span-2 px-4 mb-8 lg:mb-0">
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div class="mb-6">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Welcome to Our Dental Clinic</h2>
                <p class="text-gray-700 dark:text-gray-300">
                  At our dental clinic, we provide comprehensive and personalized care for all your dental needs. From
                  routine cleanings to advanced surgeries, we ensure your oral health is in the best hands.
                </p>
              </div>
              <div class="mb-6">
                <div class="flex items-center mb-4">
                  <div class="text-blue-500">
                    <span
                      class="material-icons rounded-full bg-sky-100 dark:bg-sky-900 text-sky-600 dark:text-sky-300 p-2"
                      >medical_services</span
                    >
                  </div>
                  <div class="ml-4">
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Special Surgeries</h3>
                    <p class="text-gray-700 dark:text-gray-300">
                      Our clinic offers specialized surgical procedures to address complex dental issues, all performed
                      by highly skilled professionals using state-of-the-art technology.
                    </p>
                  </div>
                </div>
                <div class="flex items-center">
                  <div class="text-blue-500">
                    <span
                      class="material-icons rounded-full bg-sky-100 dark:bg-sky-900 text-sky-600 dark:text-sky-300 p-2"
                      >healing</span
                    >
                  </div>
                  <div class="ml-4">
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Top-Quality Treatments</h3>
                    <p class="text-gray-700 dark:text-gray-300">
                      From preventive care to restorative treatments, we offer top-quality services that ensure your
                      teeth remain healthy and your smile bright.
                    </p>
                  </div>
                </div>
              </div>
              <p class="text-gray-700 dark:text-gray-300">
                Experience the best in dental care, where reliability and quality are at the heart of everything we do.
              </p>
            </div>
          </div>
          <div class="px-4">
            <form action="#" class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div class="mb-6">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">Schedule an Appointment</h3>
              </div>
              <div>
                <div class="mb-4">
                  <VaInput label="Name" placeholder="Enter your name">
                    <template #prependInner>
                      <VaIcon name="person" color="secondary" />
                    </template>
                  </VaInput>
                </div>
                <div class="mb-4">
                  <VaInput label="Phone" placeholder="Enter your phone">
                    <template #prependInner>
                      <VaIcon name="phone" color="secondary" />
                    </template>
                  </VaInput>
                </div>
                <div class="mb-4">
                  <VaDateInput
                    v-model="appointmentDate"
                    label="Date"
                    class="w-full"
                    placeholder="Enter Date"
                    manual-input
                  >
                    <template #prependInner>
                      <VaIcon name="date_range" color="secondary" />
                    </template>
                  </VaDateInput>
                </div>
                <div class="mb-4">
                  <VaSelect
                    v-model="value"
                    class="mb-6"
                    label="Select Doctor"
                    :options="options"
                    :text-by="'label'"
                    :value-by="'value'"
                  />
                </div>
                <div>
                  <button type="submit" class="w-full p-3 bg-blue-500 text-white rounded-lg">
                    Request Appointment
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div :class="[isLargeScreen ? 'container mx-auto p-4' : '']">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-16 p-4">
          <Transition name="fade" mode="out-in">
            <div
              v-if="true"
              class="fun-fact-one__single text-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
            >
              <i class="material-icons text-blue-500 text-5xl">medical_services</i>
              <h3 class="fun-fact-one__title text-2xl font-bold text-gray-900 dark:text-white">500k</h3>
              <p class="fun-fact-one__text text-gray-600 dark:text-gray-300">Satisfied Patients</p>
            </div>
          </Transition>
          <Transition name="fade" mode="out-in">
            <div
              v-if="true"
              class="fun-fact-one__single text-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
            >
              <i class="material-icons text-blue-500 text-5xl">stethoscope</i>
              <h3 class="fun-fact-one__title text-2xl font-bold text-gray-900 dark:text-white">230+</h3>
              <p class="fun-fact-one__text text-gray-600 dark:text-gray-300">Regular Doctors</p>
            </div>
          </Transition>
          <Transition name="fade" mode="out-in">
            <div
              v-if="true"
              class="fun-fact-one__single text-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
            >
              <i class="material-icons text-blue-500 text-5xl">local_hospital</i>
              <h3 class="fun-fact-one__title text-2xl font-bold text-gray-900 dark:text-white">25+</h3>
              <p class="fun-fact-one__text text-gray-600 dark:text-gray-300">Departments</p>
            </div>
          </Transition>
          <Transition name="fade" mode="out-in">
            <div
              v-if="true"
              class="fun-fact-one__single text-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
            >
              <i class="material-icons text-blue-500 text-5xl">favorite</i>
              <h3 class="fun-fact-one__title text-2xl font-bold text-gray-900 dark:text-white">98.5%</h3>
              <p class="fun-fact-one__text text-gray-600 dark:text-gray-300">Success Surgeries</p>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </VaInnerLoading>
</template>

<style scoped>
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-down {
  animation: slideDown 1s ease forwards;
  opacity: 0;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-100px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-up {
  animation: slideUp 1s ease forwards;
  opacity: 0;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(100px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.absolute {
  z-index: 10;
}

.slide-down {
  animation-delay: 200ms;
}

.slide-up {
  animation-delay: 400ms;
}

/* Thêm styles cho service cards */
.service-card {
  height: 100%;
  transition: transform 0.3s ease;
}

.service-card:hover {
  transform: translateY(-5px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.fun-fact-one__single {
  transition: transform 0.3s ease;
}

.fun-fact-one__single:hover {
  transform: translateY(-5px);
}

@media (min-width: 1024px) {
  .fun-fact-one__single {
    transition: transform 0.3s ease;
  }

  .fun-fact-one__single:hover {
    transform: translateY(-5px);
  }
}

@media (min-width: 1024px) {
  .service-card {
    height: 100%;
    transition: transform 0.3s ease;
  }

  .service-card:hover {
    transform: translateY(-5px);
  }
}

/* Thêm styles cho doctor cards */
.doctor-card {
  height: 100%;
  transition: transform 0.3s ease;
}

.doctor-card:hover {
  transform: translateY(-5px);
}
</style>
