<template>
  <VaCard class="flex flex-col">
    <!-- Title của card -->
    <VaCardTitle class="flex items-start justify-between">
      <h1 class="card-title text-secondary font-bold uppercase">{{ t('dashboard.revenue_report') }}</h1>
      <div class="flex gap-2">
        <VaSelect v-model="selectedMonth" preset="small" :options="monthsWithCurrentYear" class="w-24" />
        <!-- Nút Export -->
        <VaButton class="h-2" size="small" preset="primary" @click="exportAsCSV">{{ t('dashboard.export') }}</VaButton>
      </div>
    </VaCardTitle>

    <!-- Nội dung của card -->
    <VaCardContent class="flex flex-col-reverse md:flex-row md:items-center justify-between gap-5 h-full">
      <!-- Phần thông tin thu nhập -->
      <section class="flex flex-col items-start w-full sm:w-1/3 md:w-2/5 lg:w-1/4 gap-2 md:gap-8 pl-4">
        <div>
          <p class="text-xl font-semibold">{{ formatMoney(totalEarnings) }}</p>
          <p class="whitespace-nowrap mt-2">{{ t('dashboard.total_earnings') }}</p>
        </div>
        <div class="flex flex-col sm:flex-col gap-2 md:gap-8 w-full">
          <div>
            <div class="flex items-center">
              <span class="inline-block w-2 h-2 mr-2 -ml-4" :style="{ backgroundColor: earningsColor }"></span>
              <span class="text-secondary">{{ t('dashboard.earnings_this_month') }}</span>
            </div>
            <div class="mt-2 text-xl font-semibold">{{ formatMoney(earningsForSelectedMonth.earning) }}</div>
          </div>
        </div>
      </section>
      <!-- Phần biểu đồ -->
      <div class="flex justify-center w-full h-full overflow-hidden relative">
        <canvas ref="canvas" style="max-width: 100%"></canvas>
      </div>
    </VaCardContent>
  </VaCard>
</template>

<script lang="ts" setup>
import { ref, nextTick, computed } from 'vue'
import { VaCard } from 'vuestic-ui'
import { Chart, registerables } from 'chart.js'
import { useI18n } from 'vue-i18n'
import { downloadAsCSV } from '../../../../services/toCSV'
import {
  earningsColor,
  months,
  getRevenuePerMonth,
  formatMoney,
  Revenues,
  expensesColor,
} from '../../../../data/charts/revenueChartData'

import { useDashboardStore } from '@/stores/modules/dashboard.module'
const dashboardStore = useDashboardStore()

const dataReady = ref(false)
const { t } = useI18n()

interface DataItem {
  date: string
  total: number
}

const monthNames: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

Chart.register(...registerables)

const BR_THICKNESS = 4

Chart.register([])

const canvas = ref<HTMLCanvasElement | null>(null)

const doShowChart = ref(false)

const convertToMonthlyEarnings = (data: DataItem[]): Revenues[] => {
  // Initialize all months with 0 earnings
  const monthlyTotals: { [key: string]: number } = monthNames.reduce(
    (acc, month) => {
      acc[month] = 0
      return acc
    },
    {} as { [key: string]: number },
  )

  // Aggregate totals for months that have data
  data.forEach((item) => {
    const date = new Date(item.date)
    const month = monthNames[date.getMonth()]
    monthlyTotals[month] += item.total
  })

  // Convert the result to an array of MonthlyEarning
  return Object.entries(monthlyTotals).map(([month, total]) => ({
    month,
    earning: total,
    expenses: 0,
  }))
}

const data = ref<DataItem[]>([])
const dataMonthlyEarnings = ref<Revenues[]>([])

dashboardStore.getChartRevenue(null).then((revenue) => {
  data.value = revenue
  dataMonthlyEarnings.value = convertToMonthlyEarnings(data.value)
  dashboardStore.dataMonthlyEarnings = dataMonthlyEarnings.value
  dataReady.value = true
  if (canvas.value) {
    const ctx = canvas.value.getContext('2d')
    if (ctx) {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: months,
          datasets: [
            {
              // Show relative expenses ratio
              data: dataMonthlyEarnings.value.map(({ earning, expenses }) => earning - expenses),
              backgroundColor: expensesColor,
              barThickness: BR_THICKNESS,
            },
          ],
        },
        options: {
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            x: {
              stacked: true,
              grid: {
                display: false,
              },
              border: {
                width: 0,
              },
            },
            y: {
              display: false,
              beginAtZero: true,
              ticks: {
                callback: function (value) {
                  return formatMoney(Number(value))
                },
              },
            },
          },
        },
        plugins: [
          {
            id: 'background-color',
            beforeDatasetDraw: function (chart) {
              const ctx = chart.ctx
              const config = chart.config

              config.data.datasets.forEach(function (dataset, datasetIndex) {
                const meta = chart.getDatasetMeta(datasetIndex)
                if (meta.type === 'bar') {
                  const bgColor = earningsColor

                  // Loop through each bar in the dataset
                  meta.data.forEach(function (bar) {
                    ctx.fillStyle = bgColor
                    ctx.fillRect(bar.x - BR_THICKNESS / 2, 0, BR_THICKNESS, chart.chartArea.bottom)
                  })
                }
              })
            },
          },
        ],
      })
    }
  }
  nextTick(() => {
    doShowChart.value = true
  })
})

const currentYear = new Date().getFullYear()
const monthsWithCurrentYear = months.map((month) => `${month} ${currentYear}`)

const selectedMonth = ref(monthsWithCurrentYear[0])

const earningsForSelectedMonth = computed(() =>
  getRevenuePerMonth(selectedMonth.value.split(' ')[0], dataMonthlyEarnings.value),
)
const totalEarnings = computed(() => {
  return earningsForSelectedMonth.value.earning + earningsForSelectedMonth.value.expenses
})

const exportAsCSV = () => {
  downloadAsCSV(dataMonthlyEarnings.value, 'revenue-report')
}
</script>
