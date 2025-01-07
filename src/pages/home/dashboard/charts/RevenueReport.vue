<template>
  <VaCard class="flex flex-col">
    <VaCardTitle class="flex items-start justify-between">
      <h1 class="card-title text-secondary font-bold uppercase">{{ t('dashboard.revenue_report') }}</h1>
      <div class="flex gap-2">
        <VaSelect v-model="selectedMonth" preset="small" :options="monthsWithBothYears" class="w-24" />
        <VaButton class="h-2" size="small" preset="primary" @click="exportAsCSV">{{ t('dashboard.export') }}</VaButton>
      </div>
    </VaCardTitle>

    <!-- Nội dung của card -->
    <VaCardContent class="flex flex-col-reverse md:flex-row md:items-center justify-between gap-5 h-full">
      <!-- Phần thông tin thu nhập -->
      <section class="flex flex-col items-start w-full sm:w-1/3 md:w-2/5 lg:w-1/4 gap-2 md:gap-8 pl-4">
        <VaInnerLoading :loading="!dataReady">
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
        </VaInnerLoading>
      </section>
      <!-- Phần biểu đồ -->
      <div class="flex justify-center w-full h-full overflow-hidden relative">
        <VaInnerLoading :loading="!dataReady">
          <canvas ref="canvas" style="max-width: 100%"></canvas>
        </VaInnerLoading>
      </div>
    </VaCardContent>
  </VaCard>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useToast, VaCard } from 'vuestic-ui'
import { Chart, registerables } from 'chart.js'
import { useI18n } from 'vue-i18n'
import {
  earningsColor,
  months,
  getRevenuePerMonth,
  formatMoney,
  Revenues,
  expensesColor,
} from '../../../../data/charts/revenueChartData'

import { useDashboardStore } from '@/stores/modules/dashboard.module'
import { usePaymentStore } from '@/stores/modules/payment.module'
import { getErrorMessage } from '@/services/utils'

const dashboardStore = useDashboardStore()
const paymentStore = usePaymentStore()

const dataReady = ref(false)
const { t } = useI18n()
const { notify } = useToast()

interface DataItem {
  date: string
  total: number
}

const monthNames: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

Chart.register(...registerables)

const BR_THICKNESS = 4
const canvas = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

const convertToMonthlyEarnings = (data: DataItem[], year: number): Revenues[] => {
  const monthlyTotals: { [key: string]: number } = monthNames.reduce(
    (acc, month) => {
      acc[month] = 0
      return acc
    },
    {} as { [key: string]: number },
  )

  // Filter data for specific year and aggregate totals
  data.forEach((item) => {
    const date = new Date(item.date)
    if (date.getFullYear() === year) {
      const month = monthNames[date.getMonth()]
      monthlyTotals[month] += item.total
    }
  })

  return monthNames.map((month) => ({
    month,
    earning: monthlyTotals[month],
    expenses: 0,
  }))
}

const data = ref<DataItem[]>([])
const dataMonthlyEarnings = ref<{ [key: number]: Revenues[] }>({})

const currentYear = new Date().getFullYear()
const previousYear = currentYear - 1
const monthsWithCurrentYear = months.map((month) => `${month} ${currentYear}`)
const monthsWithPreviousYear = months.map((month) => `${month} ${previousYear}`)
const monthsWithBothYears = [...monthsWithPreviousYear, ...monthsWithCurrentYear]

const selectedMonth = ref(monthsWithCurrentYear[0])

const selectedYear = computed(() => parseInt(selectedMonth.value.split(' ')[1]))

const updateChart = () => {
  if (!canvas.value || !dataMonthlyEarnings.value[selectedYear.value]) return

  const ctx = canvas.value.getContext('2d')
  if (!ctx) return

  if (chart) {
    chart.destroy()
  }

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [
        {
          data: dataMonthlyEarnings.value[selectedYear.value].map(({ earning, expenses }) => earning - expenses),
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

// Watch for changes in selected month/year
watch(selectedMonth, () => {
  updateChart()
})

dashboardStore.getChartRevenue(null).then((revenue) => {
  data.value = revenue
  // Convert data for both years
  dataMonthlyEarnings.value = {
    [currentYear]: convertToMonthlyEarnings(data.value, currentYear),
    [previousYear]: convertToMonthlyEarnings(data.value, previousYear),
  }
  dashboardStore.dataMonthlyEarnings = dataMonthlyEarnings.value[currentYear]
  dataReady.value = true
  updateChart()
})

const earningsForSelectedMonth = computed(() => {
  const [month, year] = selectedMonth.value.split(' ')
  const yearData = dataMonthlyEarnings.value[parseInt(year)]
  if (!yearData) return { earning: 0, expenses: 0 }
  return getRevenuePerMonth(month, yearData)
})

const totalEarnings = computed(() => {
  return earningsForSelectedMonth.value.earning + earningsForSelectedMonth.value.expenses
})

const exportAsCSV = () => {
  const year = selectedYear.value
  const firstDayOfYear = `${year}-01-01`
  const lastDayOfYear = `${year}-12-31`
  const request = {
    startDate: firstDayOfYear,
    endDate: lastDayOfYear,
    paymentStatus: 2,
    paymentMethod: 0,
  }
  paymentStore
    .exportPayments(request)
    .then((response) => {
      const url = window.URL.createObjectURL(
        new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      )
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `revenue-report-${year}.xlsx`)
      document.body.appendChild(link)
      link.click()

      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    })
    .catch((error) => {
      const errorMessage = getErrorMessage(error)
      notify({
        title: 'error',
        message: errorMessage,
        color: 'danger',
      })
    })
}
</script>
