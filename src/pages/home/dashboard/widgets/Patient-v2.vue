<script setup lang="ts">
import { useDoctorProfileStore } from '@/stores/modules/doctor.module'
import { onBeforeMount, onMounted, ref } from 'vue'
import { VaCarousel, VaInnerLoading, VaButton, VaCardContent, VaCardTitle, useToast } from 'vuestic-ui'
import { Doctors } from './types'
import { useRouter } from 'vue-router'
import { getErrorMessage } from '@/services/utils'

const loading = ref(true)
const currentSlide = ref(0)
const showContent = ref(true)
const animationKey = ref(0)
const isLargeScreen = ref(window.innerWidth >= 1024)
const doctorStore = useDoctorProfileStore()
const doctors = ref<Doctors[]>([])
const router = useRouter()
const { init } = useToast()

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
  doctorStore
    .getTopDoctors()
    .then(() => {
      doctors.value = doctorStore.doctors
    })
    .catch((error) => {
      const message = getErrorMessage(error)
      init({
        title: 'Error',
        message: message,
        color: 'danger',
      })
    })
    .finally(() => {
      loading.value = false
    })
}

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
})

window.addEventListener('resize', () => {
  isLargeScreen.value = window.innerWidth >= 1024
})
</script>

<template>
  <VaInnerLoading :loading="loading">
    <div class="relative">
      <div class="relative w-full">
        <!-- Carousel -->
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
                <VaButton
                  class="bg-transparent lg:px-4 lg:py-4 text-sm font-semibold shadow-lg hover:shadow-xl md:float-right"
                  color="info"
                >
                  Get Started
                  <svg
                    class="ml-2 w-4 h-4 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </VaButton>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Services section -->
      <div v-if="!isLargeScreen" :class="[isLargeScreen ? 'container mx-auto p-4' : '']">
        <div v-if="!isLargeScreen" class="flex justify-between items-center mt-4 m-3">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Our Category</h2>
          <a href="#" class="text-blue-800 dark:text-blue-300 hover:text-blue-600 dark:hover:text-blue-400">See All</a>
        </div>
        <div class="grid grid-cols-3 gap-4 lg:gap-16 mt-8 lg:-mt-16 place-content-center lg:relative lg:px-4 z-10 m-3">
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

      <div
        v-if="isLargeScreen"
        id="services"
        class="px-4 py-10 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24"
      >
        <h5 class="mt-5 mb-5 text-3xl md:text-5xl font-bold text-center text-sky-700 hover:cursor-pointer">
          OUR SERVICES
        </h5>
        <div class="grid row-gap-8 sm:row-gap-0 sm:grid-cols-2 lg:grid-cols-3">
          <div class="p-8">
            <div class="max-w-md text-center">
              <div
                class="flex items-center justify-center w-40 h-40 mx-auto mb-10 transition-colors duration-200 ease-in-out bg-teal-100 rounded-full hover:bg-teal-300 sm:w-40 sm:h-40 hover:scale-110"
              >
                <img lazy src="/services/general_dentistry.ico" />
              </div>
              <h1 class="mb-2 text-2xl font-semibold leading-5">GENERAL DENTISTRY</h1>
            </div>
          </div>
          <div class="p-8">
            <div class="max-w-md text-center">
              <div
                class="flex items-center justify-center w-40 h-40 mx-auto mb-10 transition-colors duration-200 ease-in-out bg-teal-100 rounded-full hover:bg-teal-300 sm:w-40 sm:h-40 hover:scale-110"
              >
                <img lazy src="/services/cosmetic_dentistry.ico" />
              </div>
              <h1 class="mb-2 text-2xl font-semibold leading-5">COSMETICS SURGERY</h1>
            </div>
          </div>
          <div class="p-8">
            <div class="max-w-md text-center">
              <div
                class="flex items-center justify-center w-40 h-40 mx-auto mb-10 transition-colors duration-200 ease-in-out bg-teal-100 rounded-full hover:bg-teal-300 sm:w-40 sm:h-40 hover:scale-110"
              >
                <img lazy src="/services/oral_surgery.ico" />
              </div>
              <h1 class="mb-2 text-2xl font-semibold leading-5">ORAL SURGERY</h1>
            </div>
          </div>
          <div class="p-8">
            <div class="max-w-md text-center">
              <div
                class="flex items-center justify-center w-40 h-40 mx-auto mb-10 transition-colors duration-200 ease-in-out bg-teal-100 rounded-full hover:bg-teal-300 sm:w-40 sm:h-40 hover:scale-110"
              >
                <img lazy src="/services/orthodontics.ico" />
              </div>
              <h1 class="mb-2 text-2xl font-semibold leading-5">ORTHODONTICS</h1>
            </div>
          </div>
          <div class="p-8">
            <div class="max-w-md text-center">
              <div
                class="flex items-center justify-center w-40 h-40 mx-auto mb-10 transition-colors duration-200 ease-in-out bg-teal-100 rounded-full hover:bg-teal-300 sm:w-40 sm:h-40 hover:scale-110"
              >
                <img lazy src="/services/pediatric_dentistry.ico" />
              </div>
              <h1 class="mb-2 text-2xl font-semibold leading-5">PEDIATRIC DENTISTRY</h1>
            </div>
          </div>
          <div class="p-8">
            <div class="max-w-md text-center">
              <div
                class="flex items-center justify-center w-40 h-40 mx-auto mb-10 transition-colors duration-200 ease-in-out bg-teal-100 rounded-full hover:bg-teal-300 sm:w-40 sm:h-40 hover:scale-110"
              >
                <img lazy src="/services/prosthodontics.ico" />
              </div>
              <h1 class="mb-2 text-2xl font-semibold leading-5">PROSTHODONTICS</h1>
            </div>
          </div>
        </div>
      </div>
      <!-- ====== Services Section End -->

      <!-- Doctors section-->
      <div :class="[isLargeScreen ? 'w-full max-w-4xl md:max-w-screen-xl mx-auto mt-16 mb-6' : '']">
        <div v-if="!isLargeScreen" class="flex justify-between items-center mt-4 m-3">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Top Doctors</h2>
          <a href="#" class="text-blue-800 dark:text-blue-300 hover:text-blue-600 dark:hover:text-blue-400">See All</a>
        </div>
        <VaCardTitle
          v-else
          class="flex justify-center text-center text-9xl mb-2 font-semibold text-gray-900 dark:text-white hover:text-blue-800 dark:hover:text-blue-300 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300"
        >
          <h5 class="mt-5 mb-5 text-3xl md:text-5xl font-bold text-center text-sky-700 hover:cursor-pointer">
            TOP DOCTORS
          </h5>
        </VaCardTitle>
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
                    lazy
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
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div class="mb-6">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">Patient Testimonials</h3>
              </div>
              <div class="space-y-4">
                <div class="flex items-center">
                  <img
                    lazy
                    src="https://images.unsplash.com/photo-1482849297070-f4fae2173efe?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Patient 1"
                    class="w-16 h-16 rounded-full object-cover"
                  />
                  <div class="ml-4">
                    <h4 class="text-lg font-semibold text-gray-900 dark:text-white">Jane Doe</h4>
                    <p class="text-gray-700 dark:text-gray-300">
                      "The best dental care I have ever experienced! Professional, courteous, and friendly staff made me
                      feel like family... would highly recommend to anyone!!!"
                    </p>
                  </div>
                </div>
                <div class="flex items-center">
                  <img
                    lazy
                    src="https://images.unsplash.com/photo-1570045006801-08ec03621a42?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Patient 2"
                    class="w-16 h-16 rounded-full object-cover"
                  />
                  <div class="ml-4">
                    <h4 class="text-lg font-semibold text-gray-900 dark:text-white">John Smith</h4>
                    <p class="text-gray-700 dark:text-gray-300">
                      "Great attention and service. You know you are in good hands when you learn things about your bone
                      structure that you had no clue about. Keen eye on detail!"
                    </p>
                  </div>
                </div>
                <!-- Add more testimonials as needed -->
              </div>
              <div class="flex justify-center">
                <div
                  class="w-56 px-4 py-4 mt-10 text-center transition ease-in-out delay-150 bg-white hover:-translate-y-1 hover:scale-110 hover:bg-sky-500 hover:text-white text-sky-700 rounded-md duration-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 dark:hover:text-white"
                >
                  <button>View More</button>
                </div>
              </div>
            </div>
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

      <!--- Start of Frequently Asked Questions -->
      <section>
        <div class="z-20 w-full bg-gradient-to-br from-teal-500 to-sky-700 dark:from-teal-700 dark:to-sky-900">
          <div class="max-w-4xl px-4 py-10 mx-auto sm:px-6 lg:px-8 faqs">
            <h5 class="mb-10 text-3xl md:text-5xl font-bold text-center text-white">FREQUENTLY ASKED QUESTIONS</h5>

            <blockquote
              class="p-8 transition-colors duration-200 ease-in-out bg-white rounded shadow-lg hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <div class="flex items-center">
                <div class="ml-4 text-sm">
                  <p class="font-medium text-gray-900 dark:text-gray-100">
                    Do I need to arrive early for my first appointment?
                  </p>
                </div>
              </div>

              <p class="mt-4 text-gray-500 dark:text-gray-300">
                <span class="text-xl">&ldquo;</span>
                Yes, at least 15 minutes early to fill out essential paperwork and give the staff time to get you all
                set up.
                <span class="text-xl">&rdquo;</span>
              </p>
            </blockquote>

            <blockquote
              class="p-8 mt-4 transition-colors duration-200 ease-in-out bg-white rounded shadow-lg hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <div class="flex items-center">
                <div class="ml-4 text-sm">
                  <p class="font-medium text-gray-900 dark:text-gray-100">What are early signs of dental trouble?</p>
                </div>
              </div>
              <p class="mt-4 text-gray-500 dark:text-gray-300">
                <span class="text-xl">&ldquo;</span>
                The possible early signs of dental trouble are: Toothache; Sensitive Teeth; Bleeding or Sore Gums; Bad
                Breath; Cavities; Jaw Pain; Mouth Sores; Dry Mouth; Broken, Cracked, Chipped, Lost.
                <span class="text-xl">&rdquo;</span>
              </p>
            </blockquote>

            <blockquote
              class="p-8 mt-4 transition-colors duration-200 ease-in-out bg-white rounded shadow-lg hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <div class="flex items-center">
                <div class="ml-4 text-sm">
                  <p class="font-medium text-gray-900 dark:text-gray-100">What are early signs of dental trouble?</p>
                </div>
              </div>
              <p class="mt-4 text-gray-500 dark:text-gray-300">
                <span class="text-xl">&ldquo;</span>
                The possible early signs of dental trouble are: Toothache; Sensitive Teeth; Bleeding or Sore Gums; Bad
                Breath; Cavities; Jaw Pain; Mouth Sores; Dry Mouth; Broken, Cracked, Chipped, Lost.
                <span class="text-xl">&rdquo;</span>
              </p>
            </blockquote>

            <div class="flex justify-center">
              <div
                class="w-56 px-4 py-4 mt-10 text-center transition ease-in-out delay-150 bg-white hover:-translate-y-1 hover:scale-110 hover:bg-sky-500 hover:text-white text-sky-700 rounded-md duration-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 dark:hover:text-white"
              >
                <button @click="router.push({ name: 'faq' })">View More</button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <!-- End of Frequently Asked Questions -->

      <!-- Start of Instructions -->
      <div class="sm:px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20">
        <div class="max-w-xl mb-10 md:mx-auto sm:text-center lg:max-w-2xl md:mb-12">
          <div class="text-center">
            <p
              class="inline-block px-3 py-px mb-4 text-sm font-semibold tracking-wider uppercase rounded-full text-sky-700 bg-teal-accent-400"
            >
              LFI DENTAL CLINIC
            </p>
          </div>
          <h2
            class="max-w-lg mb-6 font-sans text-3xl font-bold leading-none tracking-tight text-center text-teal-500 sm:text-4xl md:mx-auto"
          >
            <span class="relative inline-block">
              <svg
                viewBox="0 0 52 24"
                fill="currentColor"
                class="absolute top-0 left-0 z-0 hidden w-32 -mt-8 -ml-20 text-blue-gray-100 lg:w-32 lg:-ml-28 lg:-mt-10 sm:block"
              >
                <defs>
                  <pattern id="f51618fb-0edb-4bcb-b35a-ffc770941286" x="0" y="0" width=".135" height=".30">
                    <circle cx="1" cy="1" r=".7"></circle>
                  </pattern>
                </defs>
                <rect fill="url(#f51618fb-0edb-4bcb-b35a-ffc770941286)" width="52" height="24"></rect>
              </svg>
              <span class="relative text-sky-700">HOW</span>
            </span>
            TO SET AN APPOINTMENT
          </h2>
          <p class="text-base text-center teal-5 md:text-lg">
            Set your appointment now through these three (3) easy steps.
          </p>
        </div>
        <div class="grid gap-8 row-gap-0 lg:grid-cols-3 px-6">
          <div class="relative text-center">
            <div
              class="flex items-center justify-center w-16 h-16 mx-auto mb-4 transition-colors duration-200 ease-in-out bg-gray-300 rounded-full hover:bg-teal-300 sm:w-20 sm:h-20 hover:scale-110 hover:rounded-full"
            >
              <div
                class="inline-flex items-center font-semibold transition-colors duration-200 ease-in-out text-deep-purple-accent-400 hover:text-teal-500 hover:scale-110"
              >
                <h1 class="text-6xl text-blue-500">1</h1>
              </div>
            </div>
            <h6 class="mb-2 text-2xl font-extrabold">Choose a date.</h6>
            <p class="max-w-md mb-3 text-sm text-sky-700 sm:mx-auto">
              Go the
              <span class="border-b border-sky-700">Set an Appointment</span>
              page. Choose and select your preferred date and time. Then, specify the needed service.
            </p>
            <span
              class="inline-flex items-center font-semibold transition-colors duration-200 ease-in-out text-deep-purple-accent-400 hover:text-teal-500 hover:scale-110 hover:cursor-pointer"
              >View our Schedules
            </span>
            <div class="top-0 right-0 flex items-center justify-center h-24 lg:-mr-8 lg:absolute">
              <svg
                class="w-8 text-teal-500 transform rotate-90 lg:rotate-0"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                viewBox="0 0 24 24"
              >
                <line fill="none" stroke-miterlimit="10" x1="2" y1="12" x2="22" y2="12"></line>
                <polyline fill="none" stroke-miterlimit="10" points="15,5 22,12 15,19 "></polyline>
              </svg>
            </div>
          </div>
          <div class="relative text-center">
            <div
              class="flex items-center justify-center w-16 h-16 mx-auto mb-4 transition-colors duration-200 ease-in-out bg-gray-300 rounded-full hover:bg-teal-300 sm:w-20 sm:h-20 hover:scale-110 hover:rounded-full"
            >
              <div
                class="inline-flex items-center font-semibold transition-colors duration-200 ease-in-out text-deep-purple-accent-400 hover:text-teal-500 hover:scale-110"
              >
                <h1 class="text-6xl text-blue-500">2</h1>
              </div>
            </div>
            <h6 class="mb-2 text-2xl font-extrabold">Create your Account.</h6>
            <p class="max-w-md mb-3 text-sm text-sky-700 sm:mx-auto min-h-10">
              Create an account or
              <span class="border-b border-sky-700">Sign in</span>
              with an existing account.
            </p>
            <div
              class="inline-flex items-center font-semibold transition-colors duration-200 ease-in-out text-deep-purple-accent-400 hover:text-teal-500 hover:scale-110 hover:cursor-pointer"
              @click="router.push({ name: 'login' })"
            >
              Login or Sign up
            </div>
            <div class="top-0 right-0 flex items-center justify-center h-24 lg:-mr-8 lg:absolute">
              <svg
                class="w-8 text-teal-500 transform rotate-90 lg:rotate-0"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                viewBox="0 0 24 24"
              >
                <line fill="none" stroke-miterlimit="10" x1="2" y1="12" x2="22" y2="12"></line>
                <polyline fill="none" stroke-miterlimit="10" points="15,5 22,12 15,19 "></polyline>
              </svg>
            </div>
          </div>
          <div class="relative text-center">
            <div
              class="flex items-center justify-center w-16 h-16 mx-auto mb-4 transition-colors duration-200 ease-in-out bg-gray-300 rounded-full hover:bg-teal-300 sm:w-20 sm:h-20 hover:scale-110 hover:rounded-full"
            >
              <div
                class="inline-flex items-center font-semibold transition-colors duration-200 ease-in-out text-deep-purple-accent-400 hover:text-teal-500 hover:scale-110"
              >
                <h1 class="text-6xl text-blue-500">3</h1>
              </div>
            </div>
            <h6 class="mb-2 text-2xl font-extrabold">Done.</h6>
            <p class="max-w-md mb-3 text-sm text-sky-700 sm:mx-auto min-h-10">
              View your scheduled appointments in the
              <span class="border-b border-sky-700"> My Appointments </span>
              page.
            </p>
            <div
              class="inline-flex items-center font-semibold transition-colors duration-200 ease-in-out text-deep-purple-accent-400 hover:text-teal-500 hover:scale-110 hover:cursor-pointer"
            >
              See your Appointments
            </div>
          </div>
        </div>
      </div>
      <!--- End of Instructions -->
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
