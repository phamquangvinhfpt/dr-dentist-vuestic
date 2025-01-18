<script setup lang="ts">
import { useDoctorProfileStore } from '@/stores/modules/doctor.module'
import { computed, onBeforeMount, onMounted, onUnmounted, ref } from 'vue'
import { VaCarousel, VaInnerLoading, VaButton, VaCardContent, VaCardTitle, useToast, VaCardActions } from 'vuestic-ui'
import { Doctors, TypeService } from './types'
import { useRouter } from 'vue-router'
import { avatarColor, getErrorMessage, getSrcAvatar } from '@/services/utils'
import Contact from '../../landingpage/Contact.vue'
import { useServiceStore } from '@/stores/modules/service.module'
import { useDashboardStore } from '@/stores/modules/dashboard.module'
import { useI18n } from 'vue-i18n'

const serviceStore = useServiceStore()
const { t } = useI18n()
const loading = ref(true)
const currentSlide = ref(0)
const showContent = ref(true)
const animationKey = ref(0)
const isLargeScreen = ref(window.innerWidth >= 1024)
const doctorStore = useDoctorProfileStore()
const doctors = ref<Doctors[]>([])
const router = useRouter()
const { init } = useToast()
const serviceType = ref<TypeService[]>()
const dashboard = useDashboardStore()
const satisfiedData = computed(() => dashboard.satisfiedData)
const regularDoctorData = computed(() => dashboard.regularDoctorData)
const totalServiceData = computed(() => dashboard.totalServiceData)
const appointmentDoneData = computed(() => dashboard.appointmentDoneData)
const feedBackData = computed(() => dashboard.feedbackData)
const INTERVAL_TIME = 3000
const items = ['images/slider/slider-6-1.jpg', 'images/slider/slider-6-2.jpg']

const startContentAnimation = () => {
  let animationFrame: number
  let timeoutId: NodeJS.Timeout

  const animate = () => {
    showContent.value = false
    animationKey.value++

    timeoutId = setTimeout(() => {
      showContent.value = true

      // Schedule next animation cycle
      timeoutId = setTimeout(() => {
        currentSlide.value = (currentSlide.value + 1) % items.length
        animationFrame = requestAnimationFrame(animate)
      }, INTERVAL_TIME)
    }, 500)
  }

  // Start the initial animation
  animationFrame = requestAnimationFrame(animate)

  // Cleanup function
  return () => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame)
    }
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  }
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

const faqs = ref([
  {
    question: t('dashboard.dental_faq.first_appointment.question'),
    answer: t('dashboard.dental_faq.first_appointment.answer'),
  },
  {
    question: t('dashboard.dental_faq.dental_trouble_signs.question'),
    answer: t('dashboard.dental_faq.dental_trouble_signs.answer'),
  },
  {
    question: t('dashboard.dental_faq.visit_frequency.question'),
    answer: t('dashboard.dental_faq.visit_frequency.answer'),
  },
])

const handleGetServiceType = async () => {
  const request = {}
  serviceStore
    .getServiceType(request)
    .then((res) => {
      serviceType.value = res.data
    })
    .catch((error) => {
      const message = getErrorMessage(error)
      init({
        title: 'Error',
        message: message,
        color: 'danger',
      })
    })
}

onMounted(() => {
  const handleResize = () => {
    isLargeScreen.value = window.innerWidth >= 768
  }
  handleResize()
  window.addEventListener('resize', handleResize, { passive: true })
  window.addEventListener('touchstart', () => {}, { passive: true })
})

onMounted(() => {
  loading.value = false
  const cleanup = startContentAnimation()
  handleGetServiceType()
  dashboard.getSatisfied()
  dashboard.getRegularDoctor()
  dashboard.getTotalService()
  dashboard.getAppointmentDone()
  dashboard.getPatientTestimonials()

  onUnmounted(() => {
    cleanup()
  })
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
            enter-active-class="transition-specific duration-1000 ease-out"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition-specific duration-1000 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <div v-show="showContent" :key="animationKey" class="text-center">
              <div class="slide-down">
                <h3 class="text-white text-base md:text-5xl lg:text-6xl font-bold lg:mb-8 drop-shadow-lg">
                  {{ t('dashboard.slogan.slogan_1') }} <br />
                  {{ t('dashboard.slogan.slogan_2') }}
                </h3>
              </div>
              <div class="slide-up">
                <VaButton
                  class="bg-transparent lg:px-4 lg:py-4 text-sm font-semibold shadow-lg hover:shadow-xl md:float-right"
                  color="info"
                  @click="router.push({ name: 'create-appointment' })"
                >
                  {{ t('dashboard.trigger') }}
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
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ t('dashboard.services') }}</h2>
          <a
            href="#"
            class="text-blue-800 dark:text-blue-300 hover:text-blue-600 dark:hover:text-blue-400"
            @click="router.push({ name: 'services' })"
            >{{ t('dashboard.see_all') }}</a
          >
        </div>
        <div class="grid grid-cols-3 gap-4 lg:gap-16 mt-8 lg:-mt-16 place-content-center lg:relative lg:px-4 z-10 m-3">
          <!-- Service 1-->
          <a href="#" class="group block">
            <div
              class="service-card dark:bg-gray-800 bg-white rounded-lg shadow p-6 flex flex-col border-2 border-solid dark:border-gray-700 transition-specific duration-300 hover:bg-sky-500 dark:hover:bg-sky-600 hover:border-sky-500 dark:hover:border-sky-600"
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
                Chỉnh Nha
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
              class="service-card dark:bg-gray-800 bg-white rounded-lg shadow p-6 flex flex-col border-2 border-solid dark:border-gray-700 transition-specific duration-300 hover:bg-sky-500 dark:hover:bg-sky-600 hover:border-sky-500 dark:hover:border-sky-600"
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
                Thẩm Mỹ
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
              class="service-card dark:bg-gray-800 bg-white rounded-lg shadow p-6 flex flex-col border-2 border-solid dark:border-gray-700 transition-specific duration-300 hover:bg-sky-500 dark:hover:bg-sky-600 hover:border-sky-500 dark:hover:border-sky-600"
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
                Phục Hình
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
        <h5
          class="uppercase mt-5 mb-5 text-3xl md:text-5xl font-bold text-center text-sky-700 hover:cursor-pointer"
          @click="router.push({ name: 'services' })"
        >
          {{ t('dashboard.services') }}
        </h5>
        <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <VaCard v-for="(type, index) in serviceType" :key="index" class="bg-white dark:bg-gray-800 rounded-lg shadow">
            <VaCardTitle>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">{{ type.typeName }}</h3>
            </VaCardTitle>
            <VaCardContent>
              <p class="text-gray-600 dark:text-gray-300">{{ type.typeDescription }}</p>
            </VaCardContent>
            <VaCardActions align="center">
              <VaButton
                preset="secondary"
                icon=""
                size="small"
                @click="router.push({ name: 'services', params: { id: type.id } })"
              >
                {{ t('dashboard.view_details') }}
              </VaButton>
            </VaCardActions>
          </VaCard>
        </div>
      </div>
      <!-- ====== Services Section End -->

      <!-- Doctors section-->
      <div :class="[isLargeScreen ? 'w-full max-w-4xl md:max-w-screen-xl mx-auto mt-16 mb-6' : '']">
        <div v-if="!isLargeScreen" class="flex justify-between items-center mt-4 m-3">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ t('dashboard.top_doctors') }}</h2>
          <a
            href="/find-doctors"
            class="text-blue-800 dark:text-blue-300 hover:text-blue-600 dark:hover:text-blue-400"
            >{{ t('dashboard.see_all') }}</a
          >
        </div>
        <VaCardTitle
          v-else
          class="flex justify-center text-center text-9xl mb-2 font-semibold text-gray-900 dark:text-white hover:text-blue-800 dark:hover:text-blue-300 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300"
        >
          <h5
            class="uppercase mt-5 mb-5 text-3xl md:text-5xl font-bold text-center text-sky-700 hover:cursor-pointer"
            @click="router.push({ name: 'find-doctors' })"
          >
            {{ t('dashboard.top_doctors') }}
          </h5>
        </VaCardTitle>
        <VaCardContent>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              v-for="(doctor, index) in doctors"
              :key="doctor.id"
              class="doctor-card bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl shadow-lg border-0 flex flex-col min-w-[200px] relative transform transition-transform duration-500 hover:scale-105"
              :class="[
                'animate__animated',
                isLargeScreen ? 'animate__fadeIn' : index === 0 ? 'animate__fadeInLeft' : 'animate__fadeInRight',
              ]"
            >
              <!-- Avatar và thông tin -->
              <div class="relative overflow-hidden rounded-t-2xl md:rounded-t-3xl">
                <img
                  loading="lazy"
                  :src="doctor.imageUrl ? getSrcAvatar(doctor.imageUrl) : 'https://via.placeholder.com/200x200'"
                  :alt="`${doctor.firstName} ${doctor.lastName}`"
                  class="w-full h-52 md:h-64 object-cover transition-specific duration-500 hover:scale-110"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                  <h3 class="text-xl font-bold text-white">{{ doctor.firstName }} {{ doctor.lastName }}</h3>
                </div>
              </div>

              <!-- Nội dung chính -->
              <div class="flex flex-col flex-grow bg-white dark:bg-gray-900 p-5 rounded-b-3xl">
                <p class="text-gray-600 dark:text-gray-300 text-center text-sm font-semibold mb-3">
                  {{ doctor.doctorProfile.education }}
                </p>
                <p
                  v-if="isLargeScreen"
                  class="selection:bg-fuchsia-300 selection:text-fuchsia-900 text-gray-600 dark:text-gray-300 text-center text-sm mb-4"
                >
                  {{ doctor.doctorProfile.seftDescription }}
                </p>

                <!-- Nút tùy chỉnh -->
                <div class="flex justify-between mt-auto space-x-2">
                  <!-- Nút View Profile -->
                  <button
                    class="flex-1 py-3 bg-gradient-to-br from-blue-500 to-green-400 text-white rounded-full shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-green-500 transition-specific duration-300 text-sm font-medium flex items-center justify-center gap-2"
                    @click="router.push({ name: 'doctor-detail', params: { id: doctor.id } })"
                  >
                    <span class="material-symbols-outlined text-white text-sm">visibility</span>
                    {{ doctor.doctorProfile.education }}
                  </button>

                  <!-- Nút Đánh giá -->
                  <button
                    class="flex-1 py-3 bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-full shadow-lg hover:shadow-xl hover:from-yellow-500 hover:to-orange-600 transition-specific duration-300 text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <span>{{ doctor.rating }}</span>
                    <span class="material-symbols-outlined text-yellow-300">star</span>
                  </button>
                </div>
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
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('dashboard.intro.welcome') }}</h2>
                <p class="text-gray-700 dark:text-gray-300">
                  {{ t('dashboard.intro.introducion') }}
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
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                      {{ t('dashboard.intro.special_surgeries') }}
                    </h3>
                    <p class="text-gray-700 dark:text-gray-300">
                      {{ t('dashboard.intro.special_surgeries_description') }}
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
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                      {{ t('dashboard.intro.top_quality_treatment') }}
                    </h3>
                    <p class="text-gray-700 dark:text-gray-300">
                      {{ t('dashboard.intro.top_quality_treatment_description') }}
                    </p>
                  </div>
                </div>
              </div>
              <p class="text-gray-700 dark:text-gray-300">
                {{ t('dashboard.intro.ending') }}
              </p>
            </div>
          </div>
          <div class="px-4">
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div class="mb-6">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                  {{ t('dashboard.patients_testimonials') }}
                </h3>
              </div>
              <div v-for="feedback in feedBackData" :key="feedback">
                <div class="flex items-center space-y-4">
                  <VaAvatar
                    :src="getSrcAvatar(feedback.patientAvatar)"
                    class="w-14 h-14 font-bold"
                    :fallback-text="feedback.patientName.charAt(0)?.toUpperCase()"
                    :color="avatarColor(feedback.patientName)"
                  />
                  <div class="ml-4">
                    <h4 class="text-lg font-semibold text-gray-900 dark:text-white">{{ feedback.patientName }}</h4>
                    <p class="text-gray-700 dark:text-gray-300 overflow-auto max-w-[14rem] md:max-w-md break-words">
                      {{ feedback.message }}
                    </p>
                  </div>
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
              <h3 class="fun-fact-one__title text-2xl font-bold text-gray-900 dark:text-white">{{ satisfiedData }}</h3>
              <p class="fun-fact-one__text text-gray-600 dark:text-gray-300">{{ t('dashboard.satisfied_patients') }}</p>
            </div>
          </Transition>
          <Transition name="fade" mode="out-in">
            <div
              v-if="true"
              class="fun-fact-one__single text-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
            >
              <i class="material-symbols-outlined text-blue-500 text-5xl">stethoscope</i>
              <h3 class="fun-fact-one__title text-2xl font-bold text-gray-900 dark:text-white">
                {{ regularDoctorData }}
              </h3>
              <p class="fun-fact-one__text text-gray-600 dark:text-gray-300">
                {{ t('dashboard.regular_doctors') }}
              </p>
            </div>
          </Transition>
          <Transition name="fade" mode="out-in">
            <div
              v-if="true"
              class="fun-fact-one__single text-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
            >
              <i class="material-icons text-blue-500 text-5xl">local_hospital</i>
              <h3 class="fun-fact-one__title text-2xl font-bold text-gray-900 dark:text-white">
                {{ totalServiceData }}
              </h3>
              <p class="fun-fact-one__text text-gray-600 dark:text-gray-300">{{ t('dashboard.services') }}</p>
            </div>
          </Transition>
          <Transition name="fade" mode="out-in">
            <div
              v-if="true"
              class="fun-fact-one__single text-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
            >
              <i class="material-icons text-blue-500 text-5xl">favorite</i>
              <h3 class="fun-fact-one__title text-2xl font-bold text-gray-900 dark:text-white">
                {{ appointmentDoneData }}
              </h3>
              <p class="fun-fact-one__text text-gray-600 dark:text-gray-300">{{ t('dashboard.success_surgeries') }}</p>
            </div>
          </Transition>
        </div>
      </div>

      <!--- Start of Frequently Asked Questions -->
      <section>
        <div class="z-20 w-full bg-gradient-to-br from-teal-500 to-sky-700 dark:from-teal-700 dark:to-sky-900">
          <div class="max-w-6xl px-4 py-10 mx-auto sm:px-6 lg:px-8 faqs">
            <h5 class="mb-10 text-3xl md:text-5xl font-bold text-center text-white">{{ t('dashboard.faq') }}</h5>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div class="space-y-6">
                <blockquote
                  v-for="(faq, index) in faqs"
                  :key="index"
                  class="p-8 transition-colors duration-200 ease-in-out bg-white rounded shadow-lg hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  <div class="flex items-center">
                    <div class="ml-4 text-sm">
                      <p class="font-medium text-gray-900 dark:text-gray-100">
                        {{ faq.question }}
                      </p>
                    </div>
                  </div>

                  <p class="mt-4 text-gray-500 dark:text-gray-300">
                    <span class="text-xl">&ldquo;</span>
                    {{ faq.answer }}
                    <span class="text-xl">&rdquo;</span>
                  </p>
                </blockquote>
              </div>
              <!-- ContactInfo Column -->
              <div class="mt-12 lg:mt-0">
                <Contact />
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
              {{ t('dashboard.guide.logo') }}
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
              <span class="relative text-sky-700">{{ t('dashboard.guide.title.first') }}</span>
            </span>
            {{ t('dashboard.guide.title.second') }}
          </h2>
          <p class="text-base text-center teal-5 md:text-lg">
            {{ t('dashboard.guide.step.title') }}
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
            <h6 class="mb-2 text-2xl font-extrabold">{{ t('dashboard.guide.step.first.title') }}</h6>
            <p class="max-w-md mb-3 text-sm text-sky-700 sm:mx-auto min-h-10">
              {{ t('dashboard.guide.step.first.description') }}
              <span class="border-b border-sky-700 hover:cursor-pointer" @click="router.push({ name: 'signup' })">{{
                t('dashboard.guide.step.first.link')
              }}</span>
              {{ t('dashboard.guide.step.first.description2') }}
            </p>
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
            <h6 class="mb-2 text-2xl font-extrabold">{{ t('dashboard.guide.step.second.title') }}</h6>
            <p class="max-w-md mb-3 text-sm text-sky-700 sm:mx-auto">
              {{ t('dashboard.guide.step.second.description') }}
              <span
                class="border-b border-sky-700 hover:cursor-pointer"
                @click="router.push({ name: 'create-appointment' })"
                >{{ t('dashboard.guide.step.second.link') }}</span
              >
              {{ t('dashboard.guide.step.second.description2') }}
            </p>
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
            <h6 class="mb-2 text-2xl font-extrabold">{{ t('dashboard.guide.step.final.title') }}</h6>
            <p class="max-w-md mb-3 text-sm text-sky-700 sm:mx-auto min-h-10">
              {{ t('dashboard.guide.step.final.description') }}
              <span class="border-b border-sky-700 hover:cursor-pointer" @click="router.push({ name: 'appointment' })">
                {{ t('dashboard.guide.step.final.link') }}</span
              >
              {{ t('dashboard.guide.step.final.description2') }}
            </p>
          </div>
        </div>
      </div>
      <!--- End of Instructions -->
    </div>
  </VaInnerLoading>
</template>

<style scoped>
.transition-specific {
  transition-property: opacity, transform;
  transition-duration: 1s;
  transition-timing-function: ease;
}

.slide-down {
  animation: slideDown 1s ease forwards;
  opacity: 0;
  will-change: opacity, transform;
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
  will-change: opacity, transform;
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
  transition: transform 0.3s ease;
}

.doctor-card:hover {
  transform: translateY(-5px);
}
</style>
