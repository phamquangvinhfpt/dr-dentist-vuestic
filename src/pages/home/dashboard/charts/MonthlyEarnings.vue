<template>
  <VaCard>
    <VaCardTitle>
      <h1 class="card-title text-tag text-secondary font-bold uppercase">{{ t('dashboard.yearly_deposit') }}</h1>
    </VaCardTitle>
    <VaCardContent>
      <VaInnerLoading :loading="!dataReady">
        <div class="p-1 bg-black rounded absolute right-4 top-4">
          <VaIcon name="mso-attach_money" color="#fff" size="large" />
        </div>
        <section>
          <div class="text-xl font-bold mb-2">{{ formatMoney(total) }}</div>
          <p class="text-xs" :class="{ 'text-success': percentage > 0, 'text-danger': percentage < 0 }">
            <VaIcon :name="percentage > 0 ? 'arrow_upward' : 'arrow_downward'" />
            {{ percentage }}%
            <span class="text-secondary"> {{ t('dashboard.last_month') }}</span>
          </p>
        </section>
        <div class="w-full flex items-center">
          <VaChart :data="chartData" class="h-24" type="line" :options="options" />
        </div>
      </VaInnerLoading>
    </VaCardContent>
  </VaCard>
</template>

<script setup lang="ts">
import { VaCard } from 'vuestic-ui'
import VaChart from '../../../../components/va-charts/VaChart.vue'
import { useChartData } from '../../../../data/charts/composables/useChartData'
import { lineChartData } from '../../../../data/charts/lineChartData'
import { ChartOptions } from 'chart.js'
import { formatMoney } from '../../../../data/charts/revenueChartData'
import { useDashboardStore } from '@/stores/modules/dashboard.module'
import { TLineChartData } from '@/data/types'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const dashboardStore = useDashboardStore()

const currentYear = new Date().getFullYear()
const startYear = `${currentYear}-01-01`
const endYear = `${currentYear}-12-31`

type DataEntry = {
  date: string
  total: number
}

// Process the data
const transformData = (data: DataEntry[]): TLineChartData => {
  const monthTotals = new Array(12).fill(0) // Initialize array for monthly totals

  data.forEach((entry) => {
    const date = new Date(entry.date)
    const month = date.getMonth() // Get month (0-11)
    monthTotals[month] += entry.total
  })

  return {
    labels: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
    datasets: [
      {
        label: 'Monthly Earnings',
        backgroundColor: 'rgba(75,192,192,0.4)',
        data: monthTotals.map((total) => total), // Convert to millions
      },
    ],
  }
}

const chartDataA = useChartData(lineChartData)
const chartData = ref<TLineChartData>(chartDataA.value)

// compared to last month
const percentage = ref(0)
const total = ref(0)
const dataReady = ref(false)

dashboardStore.getChartDeposit({ start: startYear, end: endYear }).then((res) => {
  const data = res as DataEntry[]
  chartData.value.datasets = transformData(data).datasets

  const currentMonthNumber = new Date().getMonth()
  const currentMonthTotal = chartData.value.datasets[0].data[currentMonthNumber]
  const lastMonthTotal = chartData.value.datasets[0].data[currentMonthNumber - 1]

  percentage.value = !lastMonthTotal
    ? 100
    : Number((((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100).toFixed(2))

  // calculate total
  total.value = chartData.value.datasets[0].data.reduce((acc: any, val: any) => acc + val, 0)
  dataReady.value = true
})

const options: ChartOptions<'line'> = {
  scales: {
    x: {
      display: false,
      grid: {
        display: false, // Disable X-axis grid lines ("net")
      },
    },
    y: {
      display: false,
      grid: {
        display: false, // Disable Y-axis grid lines ("net")
      },
      ticks: {
        display: false, // Hide Y-axis values
      },
    },
  },
  interaction: {
    intersect: false,
    mode: 'index',
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
    },
  },
}
</script>
