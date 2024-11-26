<template>
  <VaCard class="flex flex-col">
    <!-- Title của card -->
    <VaCardTitle class="flex items-start justify-between">
      <h1 class="card-title text-secondary font-bold uppercase">{{ t('dashboard.service_report') }}</h1>
      <div class="flex gap-2">
        <VaSelect
          v-model="selectedYear"
          preset="small"
          :options="yearsOptions"
          class="w-24"
          @update:modelValue="fetchDataByYear"
        />
        <!-- Nút Export -->
        <VaButton class="h-2" size="small" preset="primary" @click="exportAsCSV">{{ t('dashboard.export') }}</VaButton>
      </div>
    </VaCardTitle>

    <!-- Nội dung của card -->
    <VaCardContent class="flex flex-col-reverse md:flex-row md:items-center justify-between gap-5 h-full">
      <!-- Phần biểu đồ -->
      <VaInnerLoading :loading="!dataReady">
        <div class="flex justify-center w-full h-[400px] overflow-hidden relative">
          <Bar :data="barChartData" class="h-40" type="bar" :options="options" />
        </div>
      </VaInnerLoading>
    </VaCardContent>
  </VaCard>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { VaCard } from 'vuestic-ui'
import { Chart, ChartOptions, registerables } from 'chart.js'
import { useI18n } from 'vue-i18n'
import { downloadAsCSV } from '../../../../services/toCSV'
import { Bar } from 'vue-chartjs'
import { TBarChartData } from '@/data/types'
import { useDashboardStore } from '@/stores/modules/dashboard.module'

Chart.register(...registerables)
const { t } = useI18n()
const dashboardStore = useDashboardStore()

type ServiceData = {
  serviceId: string
  serviceName: string
  totalRevenue: number
  totalRating: number
}

// Hàm chuyển đổi dữ liệu API thành dữ liệu biểu đồ
function convertToBarChartData(services: ServiceData[]): TBarChartData {
  const labels = services.map((service) => service.serviceName)
  const revenueData = services.map((service) => service.totalRevenue)
  const ratingsData = services.map((service) => service.totalRating)

  return {
    labels,
    datasets: [
      {
        label: 'Revenue',
        data: revenueData,
      },
      {
        label: 'Ratings',
        data: ratingsData,
      },
    ],
  }
}

// Khởi tạo dữ liệu biểu đồ
const barChartData = ref<TBarChartData>({
  labels: [],
  datasets: [],
})

// Danh sách các năm
const currentYear = new Date().getFullYear()
const yearsOptions = Array.from({ length: 5 }, (_, i) => `${currentYear - i}`)

// Năm được chọn
const selectedYear = ref(yearsOptions[0])

// Tùy chọn biểu đồ
const options = ref<ChartOptions<'bar'>>({
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
    },
  },
  scales: {
    x: {
      display: true,
      grid: {
        display: true,
      },
      stacked: true,
      ticks: {
        maxRotation: 45,
        callback: function (value: string | number) {
          const label: string = this.getLabelForValue(Number(value)) // Ép kiểu rõ ràng
          const words: string[] = label.split(' ') // Định nghĩa kiểu cho mảng

          const groupedWords = words.reduce<string[]>((acc, word, index) => {
            if (index % 2 === 0) {
              acc.push(word)
            } else {
              acc[acc.length - 1] += ' ' + word
            }
            return acc
          }, []) // Đảm bảo giá trị ban đầu là mảng chuỗi
          return groupedWords
        },
      },
    },
    y: {
      display: true,
      grid: {
        display: true,
      },
      ticks: {
        display: true,
      },
    },
  },
  interaction: {
    intersect: false,
    mode: 'index',
  },
})

const dataReady = ref(false)

// Hàm fetch dữ liệu theo năm
const fetchDataByYear = (year: string) => {
  const startYear = `${year}-01-01`
  const endYear = `${year}-12-31`

  dashboardStore.getRevenueServices({ start: startYear, end: endYear }).then((data) => {
    barChartData.value = convertToBarChartData(data)
    dataReady.value = true
  })
}

// Gọi dữ liệu lần đầu tiên với năm hiện tại
fetchDataByYear(selectedYear.value)

// Dữ liệu xuất CSV
const dataMonthlyEarnings = ref([])

const exportAsCSV = () => {
  downloadAsCSV(dataMonthlyEarnings.value, 'revenue-report')
}
</script>
