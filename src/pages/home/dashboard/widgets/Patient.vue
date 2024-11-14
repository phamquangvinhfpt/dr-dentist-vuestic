<script lang="ts" setup>
import { useAuthStore } from '@/stores/modules/auth.module'
import { ref } from 'vue'
import {
  VaAvatar,
  VaButton,
  VaCard,
  VaCardTitle,
  VaCardContent,
  VaIcon,
  VaProgressBar,
  VaChip,
  VaInnerLoading,
} from 'vuestic-ui'

const isSidebarOpen = ref(false)

const user_store = useAuthStore()
const user = user_store.user

const healthStats = [
  {
    icon: 'ecg_heart',
    title: 'Sức Khỏe Răng',
    value: 'Tốt',
    description: 'Không có vấn đề nghiêm trọng',
    color: 'danger',
  },
  {
    icon: 'free_cancellation',
    title: 'Lịch Hẹn',
    value: '3 lần',
    description: 'Sắp tới',
    color: 'info',
  },
  {
    icon: 'stethoscope',
    title: 'Điều Trị',
    value: '2 dịch vụ',
    description: 'Đã thực hiện',
    color: 'success',
  },
  {
    icon: 'credit_card',
    title: 'Chi Phí',
    value: '5,200,000đ',
    description: 'Tổng chi phí năm',
    color: 'secondary',
  },
]

const services = [
  {
    icon: 'dentistry',
    iconColor: 'info',
    name: 'Khám Răng Định Kỳ',
    price: '500,000đ',
    description: 'Kiểm tra toàn diện tình trạng răng miệng',
  },
  {
    icon: 'biotech',
    iconColor: 'success',
    name: 'Chụp X-quang Răng',
    price: '350,000đ',
    description: 'Chẩn đoán chi tiết cấu trúc răng và hàm',
  },
  {
    icon: 'health_and_safety',
    iconColor: 'secondary',
    name: 'Trám Răng Thẩm Mỹ',
    price: '800,000đ',
    description: 'Phục hồi và làm đẹp răng bị sâu',
  },
  {
    icon: 'oral_disease',
    iconColor: 'warning',
    name: 'Tẩy Trắng Răng',
    price: '1,500,000đ',
    description: 'Làm trắng răng hiện đại, an toàn',
  },
]

const treatments = [
  {
    name: 'Trám răng số 6',
    progress: 75,
    status: 'Đang điều trị',
    color: 'info',
  },
  {
    name: 'Cạo vôi răng',
    progress: 100,
    status: 'Hoàn thành',
    color: 'success',
  },
  {
    name: 'Niềng răng',
    progress: 25,
    status: 'Bắt đầu',
    color: 'danger',
  },
]

const medicalRecords = [
  {
    label: 'Nhóm Máu',
    value: 'A+',
    icon: 'bloodtype',
    iconColor: 'danger',
  },
  {
    label: 'Dị Ứng',
    value: 'Không',
    icon: 'health_and_safety',
    iconColor: 'success',
  },
  {
    label: 'Tiền Sử',
    value: 'Răng nhạy cảm',
    icon: 'stethoscope',
    iconColor: 'info',
  },
]

const upcomingAppointments = [
  {
    title: 'Kiểm tra răng định kỳ',
    doctor: 'Bác sĩ Trần Văn B',
    date: '15/12/2024',
    time: '10:00 AM',
  },
  {
    title: 'Điều trị răng sâu',
    doctor: 'Bác sĩ Nguyễn Văn C',
    date: '22/12/2024',
    time: '2:30 PM',
  },
  {
    title: 'Điều trị răng sâu',
    doctor: 'Bác sĩ Nguyễn Văn C',
    date: '22/12/2024',
    time: '2:30 PM',
  },
]

const quickActions = [
  {
    icon: 'add_circle',
    title: 'Đặt Lịch Mới',
    color: 'info',
  },
  {
    icon: 'medical_services',
    title: 'Kết Quả Khám',
    color: 'success',
  },
  {
    icon: 'credit_card',
    title: 'Thanh Toán',
    color: 'warning',
  },
]
</script>

<template>
  <VaInnerLoading>
    <VaCard>
      <!-- bg-gray-50 -->
      <div class="min-h-screen p-4 md:p-6">
        <div class="grid grid-cols-12 gap-4 md:gap-6">
          <!-- Mobile Header -->
          <VaCard class="col-span-12 lg:hidden">
            <VaCardContent class="flex justify-between items-center">
              <h2 class="text-xl font-bold text-blue-600">Dental Care</h2>
              <VaButton icon="menu" preset="secondary" flat @click="isSidebarOpen = !isSidebarOpen" />
            </VaCardContent>
          </VaCard>

          <!-- Main Content Area -->
          <div class="col-span-12 lg:col-span-full space-y-6">
            <!-- Header -->
            <VaCard class="shadow-md">
              <VaCardContent
                class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0"
              >
                <div class="flex items-center space-x-4">
                  <VaAvatar
                    :color="'#692BEB'"
                    :src="user?.avatarUrl"
                    :fallback-text="user?.fullName.charAt(0).toUpperCase()"
                    size="large"
                  />
                  <div class="flex flex-col">
                    <h2 class="text-lg font-semibold">{{ user?.fullName }}</h2>
                    <p class="text-gray-600 text-sm">{{ user?.emailaddress }}</p>
                  </div>
                </div>
                <div class="flex items-center space-x-6">
                  <VaButton preset="primary" icon="calendar_today"> Đặt lịch hẹn </VaButton>
                  <VaButton preset="secondary" icon="medical_services"> Kết quả khám </VaButton>
                </div>
              </VaCardContent>
            </VaCard>

            <!-- Health Stats -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <VaCard v-for="(stat, index) in healthStats" :key="index" class="shadow-xl">
                <VaCardContent class="flex items-center">
                  <VaIcon :name="stat.icon" :color="stat.color" size="large" class="material-symbols-outlined" />
                  <div class="ml-4">
                    <p class="text-gray-600 text-sm">{{ stat.title }}</p>
                    <p class="font-bold" :class="`text-${stat.color}`">{{ stat.value }}</p>
                    <p class="text-xs text-gray-500">{{ stat.description }}</p>
                  </div>
                </VaCardContent>
              </VaCard>
            </div>

            <!-- Upcoming Appointments -->
            <VaCard class="shadow-xl">
              <VaCardTitle>Lịch Hẹn Sắp Tới</VaCardTitle>
              <VaCardContent>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <VaCard v-for="(appointment, index) in upcomingAppointments" :key="index" class="bg-blue-50" flat>
                    <VaCardContent class="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <div class="mb-3 sm:mb-0">
                        <p class="font-semibold">{{ appointment.title }}</p>
                        <p class="text-gray-600">{{ appointment.doctor }}</p>
                      </div>
                      <div class="text-right">
                        <p class="font-bold text-blue-600">{{ appointment.date }}</p>
                        <p class="text-gray-600">{{ appointment.time }}</p>
                      </div>
                    </VaCardContent>
                  </VaCard>
                </div>
              </VaCardContent>
            </VaCard>

            <!-- Quick Actions -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 shadow-xl">
              <VaCard
                v-for="(action, index) in quickActions"
                :key="index"
                class="hover:shadow-lg transition-shadow cursor-pointer"
              >
                <VaCardContent class="flex flex-col items-center text-center p-6">
                  <VaIcon :name="action.icon" :color="action.color" size="large" class="mb-3" />
                  <p class="font-semibold">{{ action.title }}</p>
                </VaCardContent>
              </VaCard>
            </div>

            <!-- Services Section -->
            <VaCard class="shadow-xl">
              <VaCardContent>
                <div class="flex justify-between items-center mb-4">
                  <h3 class="text-lg font-semibold flex items-center">
                    <VaIcon name="add_circle" color="primary" class="mr-3 w-3 h-3" />
                    Dịch Vụ Nha Khoa
                  </h3>
                  <VaButton preset="primary" flat>Xem tất cả</VaButton>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <VaCard
                    v-for="(service, index) in services"
                    :key="index"
                    class="hover:shadow-md transition-shadow cursor-pointer"
                    flat
                    :bordered="true"
                  >
                    <VaCardContent>
                      <div class="flex items-center mb-3">
                        <VaIcon :name="service.icon" :color="service.iconColor" class="material-symbols-outlined" />
                        <h4 class="ml-3 font-semibold">{{ service.name }}</h4>
                      </div>
                      <p class="text-sm text-gray-600 mb-2">{{ service.description }}</p>
                      <div class="flex justify-between items-center">
                        <VaChip :color="service.iconColor">{{ service.price }}</VaChip>
                        <VaButton preset="primary" flat size="small">Đặt ngay</VaButton>
                      </div>
                    </VaCardContent>
                  </VaCard>
                </div>
              </VaCardContent>
            </VaCard>

            <!-- Treatment Progress & Medical Profile -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 shadow-xl">
              <!-- Treatment Progress -->
              <VaCard>
                <VaCardTitle class="flex items-center">
                  <VaIcon name="monitoring" color="secondary" class="mr-3 material-symbols-outlined" />
                  Tiến Trình Điều Trị
                </VaCardTitle>
                <VaCardContent class="space-y-4">
                  <div v-for="(treatment, index) in treatments" :key="index">
                    <div class="flex justify-between mb-2">
                      <span class="font-semibold">{{ treatment.name }}</span>
                      <VaChip :color="treatment.color">{{ treatment.status }}</VaChip>
                    </div>
                    <VaProgressBar
                      :model-value="treatment.progress"
                      :color="treatment.color"
                      size="1.5rem"
                      content-inside
                      show-percent
                    />
                  </div>
                </VaCardContent>
              </VaCard>

              <!-- Medical Profile -->
              <VaCard>
                <VaCardTitle class="flex items-center">
                  <VaIcon name="contract" color="success" class="mr-3 material-symbols-outlined" />
                  Hồ Sơ Y Tế
                </VaCardTitle>
                <VaCardContent>
                  <div class="space-y-3">
                    <VaCard
                      v-for="(record, index) in medicalRecords"
                      :key="index"
                      class="flex justify-between items-center p-3 rounded-lg bg-gray-50"
                    >
                      <div class="flex items-center">
                        <VaIcon :name="record.icon" :color="record.iconColor" class="material-symbols-outlined" />
                        <span class="ml-3 text-gray-50">{{ record.label }}</span>
                      </div>
                      <VaChip :color="record.iconColor">{{ record.value }}</VaChip>
                    </VaCard>
                  </div>
                </VaCardContent>
              </VaCard>
            </div>
          </div>
        </div>
      </div>
    </VaCard>
  </VaInnerLoading>
</template>
