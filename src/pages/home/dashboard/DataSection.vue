<template>
  <div class="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 gap-4">
    <DataSectionItem
      v-for="metric in dashboardMetrics"
      :key="metric.id"
      :title="metric.title"
      :value="metric.value"
      :change-text="metric.changeText"
      :since="metric.since"
      :up="metric.changeDirection === 'up'"
      :icon-background="metric.iconBackground"
      :icon-color="metric.iconColor"
    >
      <template #icon>
        <VaIcon :name="metric.icon" size="large" />
      </template>
    </DataSectionItem>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useColors } from 'vuestic-ui'
import DataSectionItem from './DataSectionItem.vue'
import { useDashboardStore } from '@/stores/modules/dashboard.module'
const dashboardStore = useDashboardStore()
import { formatMoney } from '../../../data/charts/revenueChartData'
import { TLineChartData } from '@/data/types'

interface DashboardMetric {
  id: string
  title: string
  value: string
  icon: string
  changeText: string
  since: string
  changeDirection: 'up' | 'down'
  iconBackground: string
  iconColor: string
}

const { getColor } = useColors()

const calculateChange = (current: number, previous: number) => {
  if (previous === 0) return 100 // Avoid division by zero error
  const change = ((current - previous) / previous) * 100
  return change.toFixed(2)
}

interface DataEntry {
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

const currentMonthMemberGrowth = ref(0)
const previousMonthMemberGrowth = ref(0)

dashboardStore.getChartMemberGrowth(null).then((res) => {
  const data = res as DataEntry[]
  const mdata = transformData(data).datasets
  console.log('mdata', mdata)
  // current month
  const currentMonth = new Date().getMonth()
  currentMonthMemberGrowth.value = mdata[0].data[currentMonth]
  // previous month
  if (currentMonth === 0) {
    previousMonthMemberGrowth.value = mdata[0].data[11]
  } else {
    previousMonthMemberGrowth.value = mdata[0].data[currentMonth - 1]
  }
})

const dashboardMetrics = computed<DashboardMetric[]>(() => [
  {
    id: 'openInvoices',
    title: 'This Month Earnings',
    value: formatMoney(dashboardStore.dataMonthlyEarnings[11]?.earning ?? 0) as string,
    icon: 'mso-attach_money',
    changeText: (calculateChange(
      dashboardStore.dataMonthlyEarnings[11]?.earning ?? 0,
      dashboardStore.dataMonthlyEarnings[10]?.earning ?? 0,
    ) + '%') as string,
    since: 'last month',
    changeDirection: 'down',
    iconBackground: getColor('success'),
    iconColor: getColor('on-success'),
  },
  // Fake data
  {
    id: 'ongoingProjects',
    title: 'Booking services',
    value: '15',
    icon: 'mso-folder_open',
    changeText: '25.36%',
    since: 'last week',
    changeDirection: 'up',
    iconBackground: getColor('info'),
    iconColor: getColor('on-info'),
  },
  {
    id: 'employees',
    title: 'Members',
    value: currentMonthMemberGrowth.value + '',
    icon: 'mso-account_circle',
    changeText: (calculateChange(currentMonthMemberGrowth.value, previousMonthMemberGrowth.value) + '%') as string,
    since: 'last month',
    changeDirection: 'up',
    iconBackground: getColor('danger'),
    iconColor: getColor('on-danger'),
  },
  // Fake data
  {
    id: 'newProfit',
    title: 'New profit',
    value: '27%',
    icon: 'mso-grade',
    changeText: '4%',
    since: 'last week',
    changeDirection: 'up',
    iconBackground: getColor('warning'),
    iconColor: getColor('on-warning'),
  },
])
</script>
