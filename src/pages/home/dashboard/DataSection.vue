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
import { useI18n } from 'vue-i18n'

interface DashboardMetric {
  id: string
  title: string
  value: string
  icon?: string
  changeText?: string
  since?: string
  changeDirection: 'up' | 'down'
  iconBackground: string
  iconColor: string
}

const { getColor } = useColors()
const { t } = useI18n()

const calculateChange = (current: number, previous: number) => {
  if (previous === 0) return 100 // Avoid division by zero error
  const change = ((current - previous) / previous) * 100
  return change.toFixed(2)
}

interface DataEntry {
  date: string
  total: number
}

interface Data {
  value: number
  percent: number
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
const bookingData = ref<Data>({
  value: 0,
  percent: 0,
})
const revenueData = ref<Data>({
  value: 0,
  percent: 0,
})
const currentMonth = new Date().getMonth()

dashboardStore.getChartMemberGrowth(null).then((res) => {
  const data = res as DataEntry[]
  const mdata = transformData(data).datasets
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

dashboardStore.getBookingPercent(new Date().toISOString().split('T')[0]).then((res) => {
  bookingData.value = res
})

dashboardStore.getRevenuePercent(new Date().toISOString().split('T')[0]).then((res) => {
  revenueData.value = res
})

const dashboardMetrics = computed<DashboardMetric[]>(() => [
  {
    id: 'openInvoices',
    title: t('dashboard.this_month_earnings'),
    value: formatMoney(dashboardStore.dataMonthlyEarnings[currentMonth]?.earning ?? 0) as string,
    icon: 'mso-attach_money',
    changeText: (calculateChange(
      dashboardStore.dataMonthlyEarnings[currentMonth]?.earning ?? 0,
      dashboardStore.dataMonthlyEarnings[currentMonth - 1]?.earning ?? 0,
    ) + '%') as string,
    since: t('dashboard.last_month'),
    changeDirection:
      currentMonth === 0
        ? 'up'
        : (dashboardStore.dataMonthlyEarnings[currentMonth]?.earning ?? 0) >
            (dashboardStore.dataMonthlyEarnings[currentMonth - 1]?.earning ?? 0)
          ? 'up'
          : 'down',
    iconBackground: getColor('success'),
    iconColor: getColor('on-success'),
  },
  // Fake data
  {
    id: 'ongoingProjects',
    title: t('dashboard.booking_services'),
    value: bookingData.value?.value + '',
    icon: 'mso-folder_open',
    changeText: (bookingData.value?.percent + '%') as string,
    since: t('dashboard.last_week'),
    changeDirection: bookingData.value?.percent > 0 ? 'up' : 'down',
    iconBackground: getColor('info'),
    iconColor: getColor('on-info'),
  },
  {
    id: 'employees',
    title: t('dashboard.members'),
    value: currentMonthMemberGrowth.value + '',
    icon: 'mso-account_circle',
    changeText: (calculateChange(currentMonthMemberGrowth.value, previousMonthMemberGrowth.value) + '%') as string,
    since: t('dashboard.last_month'),
    changeDirection: currentMonthMemberGrowth.value > previousMonthMemberGrowth.value ? 'up' : 'down',
    iconBackground: getColor('danger'),
    iconColor: getColor('on-danger'),
  },
  // Fake data
  {
    id: 'newProfit',
    title: t('dashboard.new_profit'),
    value: formatMoney(revenueData.value?.value),
    icon: 'mso-grade',
    changeText: (revenueData.value?.percent + '%') as string,
    since: t('dashboard.last_week'),
    changeDirection: revenueData.value?.percent > 0 ? 'up' : 'down',
    iconBackground: getColor('warning'),
    iconColor: getColor('on-warning'),
  },
])
</script>
