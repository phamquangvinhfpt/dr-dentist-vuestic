<template>
  <VaCard>
    <VaCardTitle class="pb-0!">
      <h1 class="card-title text-secondary font-bold uppercase">Booking Analysis This Month</h1>
    </VaCardTitle>
    <VaCardContent class="flex flex-col gap-1">
      <section class="flex w-full gap-8 items-center justify-between">
        <div class="w-1/2">
          <div class="text-xl font-bold mb-2">{{ totalCompleted }}</div>
          <p class="text-xs text-success whitespace-nowrap">
            <VaIcon name="arrow_outward" />
            {{ changePercentage.toFixed(2) }}%
            <span class="text-secondary"> last month</span>
          </p>
        </div>
        <div class="my-4 gap-2 flex flex-col">
          <div class="flex items-center">
            <span class="inline-block w-2 h-2 mr-2" :style="{ backgroundColor: completedBackground }"></span>
            <span class="text-secondary">Completed</span>
          </div>
          <div class="flex items-center">
            <span class="inline-block w-2 h-2 mr-2" :style="{ backgroundColor: cancelledBackground }"></span>
            <span class="text-secondary">Cancelled</span>
          </div>
          <div class="flex items-center">
            <span class="inline-block w-2 h-2 mr-2" :style="{ backgroundColor: failedBackground }"></span>
            <span class="text-secondary">Failed</span>
          </div>
        </div>
        <div class="w-1/2 flex items-center justify-center h-full lg:pl-16 pl-2 -mr-1"></div>
      </section>
      <div class="w-full flex items-center justify-center h-full">
        <VaChart
          v-if="dataReady"
          :data="chartData"
          class="chart chart--donut h-[230px] w-[230px]"
          type="doughnut"
          :options="options"
        />
      </div>
    </VaCardContent>
  </VaCard>
</template>

<script setup lang="ts">
import { VaCard } from 'vuestic-ui'
import VaChart from '../../../../components/va-charts/VaChart.vue'
import { completedBackground, cancelledBackground, failedBackground } from '../../../../data/charts/doughnutChartData'
import { doughnutConfig } from '../../../../components/va-charts/vaChartConfigs'
import { ChartOptions } from 'chart.js'
import { externalTooltipHandler } from '../../../../components/va-charts/external-tooltip'
import { useDashboardStore } from '@/stores/modules/dashboard.module'
import { ref } from 'vue'
import { TDoughnutChartData } from '@/data/types'
const dashboardStore = useDashboardStore()

interface DataEntry {
  date: string
  cancelAnalytic: number
  failAnalytic: number
  successAnalytic: number
}

function groupDataByMonth(data: DataEntry[]): DataEntry[] {
  const result: DataEntry[] = []

  // Duyệt qua dữ liệu và nhóm theo tháng
  data.forEach((item) => {
    const month = item.date.slice(0, 7) // Lấy phần "YYYY-MM" từ ngày

    // Kiểm tra xem tháng đã tồn tại trong kết quả hay chưa
    let monthData = result.find((r) => r.date === month)
    if (!monthData) {
      // Nếu chưa tồn tại, tạo mới đối tượng cho tháng đó
      monthData = {
        date: month, // Đặt 'date' là "YYYY-MM"
        cancelAnalytic: 0,
        failAnalytic: 0,
        successAnalytic: 0,
      }
      result.push(monthData)
    }

    // Cộng dồn các giá trị cho tháng
    monthData.cancelAnalytic += item.cancelAnalytic
    monthData.failAnalytic += item.failAnalytic
    monthData.successAnalytic += item.successAnalytic
  })

  return result
}

const chartData = ref<TDoughnutChartData>({
  datasets: [
    {
      data: [0, 0, 0],
      backgroundColor: [completedBackground, cancelledBackground, failedBackground],
    },
  ],
  labels: ['Completed', 'Cancelled', 'Failed'],
})

const dataReady = ref(false)
const totalCompleted = ref(0)
const changePercentage = ref(0)

dashboardStore.getAnalyticBooking(null).then((data) => {
  data.value = data as DataEntry[]
  const groupedData = groupDataByMonth(data.value)
  // get data current month
  const currentMonth = new Date().toISOString().slice(0, 7)
  const currentMonthData = groupedData.find((item) => item.date === currentMonth)
  if (!currentMonthData) {
    return
  }
  // get last month data
  const lastMonth = new Date()
  lastMonth.setMonth(lastMonth.getMonth() - 1)
  const lastMonthData = groupedData.find((item) => item.date === lastMonth.toISOString().slice(0, 7))
  chartData.value.datasets[0].data = [
    currentMonthData.successAnalytic,
    currentMonthData.cancelAnalytic,
    currentMonthData.failAnalytic,
  ]
  dataReady.value = true
  totalCompleted.value = chartData.value.datasets[0].data[0]
  if (lastMonthData) {
    const lastMonthTotal = lastMonthData.successAnalytic + lastMonthData.cancelAnalytic + lastMonthData.failAnalytic
    const currentMonthTotal =
      currentMonthData.successAnalytic + currentMonthData.cancelAnalytic + currentMonthData.failAnalytic
    changePercentage.value = ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
  }
  console.log('chartData', chartData.value)
})

const options: ChartOptions<'doughnut'> = {
  ...doughnutConfig,
  plugins: {
    ...doughnutConfig.plugins,
    tooltip: {
      // Chart to small to show tooltips
      enabled: false,
      position: 'nearest',
      external: externalTooltipHandler,
    },
  },
  circumference: 360,
}
</script>
