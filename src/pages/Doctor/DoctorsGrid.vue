<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-3">
    <!-- Thẻ bác sĩ -->
    <div
      v-for="doctor in doctors"
      :key="doctor.id"
      class="rounded-lg shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
      @click="navigateToDetail(doctor.id)"
    >
      <!-- Ảnh bác sĩ -->
      <div class="relative w-full h-48">
        <img
          :src="
            getSrcAvatar(doctor.image) ||
            'https://plus.unsplash.com/premium_photo-1664475543697-229156438e1e?q=80&w=1972&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
          "
          :alt="doctor.name"
          class="w-full h-full object-cover"
        />
        <!-- Badge Đánh giá -->
        <div class="absolute top-2 right-2 bg-yellow-400 text-white text-xs font-medium px-2 py-1 rounded-lg shadow-md">
          <VaIcon name="star" class="mr-1" /> {{ doctor.rating.toFixed(1) }}
        </div>
      </div>

      <!-- Thông tin bác sĩ -->
      <div class="p-4 flex flex-col items-center text-center">
        <!-- Tên bác sĩ -->
        <h3 class="text-lg font-bold">{{ doctor.name }}</h3>
        <!-- Chuyên khoa -->
        <p class="text-sm">{{ doctor.specialty }}</p>

        <!-- Kinh nghiệm -->
        <div class="flex items-center text-indigo-600 mt-2">
          <VaIcon name="schedule" class="mr-1" />
          <span>{{ doctor.experience }} kinh nghiệm</span>
        </div>

        <!-- Đánh giá (Sao) -->
        <div class="flex items-center justify-center mt-2">
          <VaIcon
            v-for="n in 5"
            :key="n"
            name="star"
            :class="n <= Math.round(doctor.rating) ? 'text-yellow-400' : 'text-gray-300'"
          />
        </div>

        <!-- Nút Chi tiết -->
        <button
          class="mt-4 w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition"
        >
          Chi tiết
          <VaIcon name="keyboard_arrow_right" class="ml-1" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useDoctorProfileStore } from '@stores/modules/doctor.module'
import type { Doctor } from './types'
import { getSrcAvatar } from '@/services/utils'

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

<style scoped>
/* Hiệu ứng hover nâng cao */
button {
  transition: transform 0.2s ease-in-out;
}

button:hover {
  transform: scale(1.05);
}
.relative.w-full.h-48 img {
  height: 200px; /* Giảm chiều cao của ảnh bác sĩ */
  object-fit: cover;
}

/* Thẻ bác sĩ nhỏ lại */

/* Giảm kích thước chữ */
.text-lg {
  font-size: 1.125rem; /* Giảm kích thước font chữ */
}

/* Giảm kích thước chữ cho chuyên khoa và kinh nghiệm */
.text-sm {
  font-size: 0.875rem;
}

/* Giảm kích thước của các nút */
button {
  font-size: 0.875rem; /* Giảm kích thước font chữ của nút */
  padding: 0.75rem 1.25rem; /* Giảm padding */
  width: auto; /* Đảm bảo chiều rộng của nút tự động điều chỉnh */
}

/* Giảm kích thước các biểu tượng sao */
.va-icon {
  width: 1rem;
  height: 1rem;
}
</style>
