<template>
  <VaCard>
    <VaCardTitle>
      <h1 class="card-title text-tag text-secondary font-bold uppercase">{{ t('dashboard.monthly_revenue') }}</h1>
    </VaCardTitle>
    <VaCardContent>
      <div class="p-1 bg-black rounded absolute right-4 top-4">
        <VaIcon name="mso-attach_money" color="#fff" size="large" />
      </div>
      <section>
        <div class="text-xl font-bold mb-2">{{ formatMoney(total) }}</div>
        <p class="text-xs text-success">
          <VaIcon name="arrow_upward" />
          {{ percentage }}%
          <span class="text-secondary"> {{ t('dashboard.last_month') }}</span>
        </p>
      </section>
      <div class="w-full flex items-center">
        <VaChart :data="chartData" class="h-24" type="line" :options="options" />
      </div>
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
const currentMonth = new Date().getMonth() + 1 // Get current month (1-12)
// get last day of the month
const lastDay = new Date(currentYear, currentMonth, 0).getDate()
const startYear = `${currentYear}-${currentMonth}-01`
const endYear = `${currentYear}-${currentMonth}-${lastDay}`

type DataEntry = {
  date: string
  total: number
}

// Process the data
const transformData = (data: DataEntry[]): TLineChartData => {
  const monthTotals = new Array(lastDay).fill(0) // Initialize array for daily totals

  data.forEach((entry) => {
    const date = new Date(entry.date)
    const day = date.getDate() // Get day (1-31)
    monthTotals[day - 1] += entry.total
  })

  return {
    labels: Array.from({ length: lastDay }, (_, i) => (i + 1).toString()),
    datasets: [
      {
        label: 'Revenue',
        data: monthTotals,
        fill: false,
        borderColor: '#FFC107',
        tension: 0.4,
      },
    ],
  }
}

const chartDataA = useChartData(lineChartData)
const chartData = ref<TLineChartData>(chartDataA.value)

// compared to last month
const percentage = ref(0)
const total = ref(0)

dashboardStore.getChartRevenue({ start: startYear, end: endYear }).then((res) => {
  const data = res as DataEntry[]
  chartData.value.datasets = transformData(data).datasets
  chartData.value.labels = transformData(data).labels
  console.log(chartData)
  // calculate percentage
  const currentDayNumber = new Date().getDate()
  const currentDayTotal = chartData.value.datasets[0].data[currentDayNumber - 1]
  const lastDayTotal = chartData.value.datasets[0].data[currentDayNumber - 2]
  total.value = currentDayTotal
  percentage.value = ((currentDayTotal - lastDayTotal) / lastDayTotal) * 100 || 0
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
