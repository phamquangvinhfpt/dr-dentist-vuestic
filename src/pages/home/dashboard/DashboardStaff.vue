<template>
  <VaInnerLoading :loading="isLoading" class="mx-3">
    <div class="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-6 gap-4">
      <div class="data-section col-span-2">
        <div class="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 gap-4">
          <DataSectionItem
            v-for="metric in dashboardMetrics"
            :key="metric.id"
            :title="metric.title"
            :value="metric.value"
            :icon-background="metric.iconBackground"
            :icon-color="metric.iconColor"
          >
            <template #icon>
              <VaIcon :name="metric.icon" size="large" />
            </template>
          </DataSectionItem>
        </div>
      </div>
    </div>
  </VaInnerLoading>
</template>
<script lang="ts" setup>
import { getErrorMessage } from '@/services/utils'
import { useDashboardStore } from '@/stores/modules/dashboard.module'
import { computed, onBeforeMount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useColors, useToast } from 'vuestic-ui'
import DataSectionItem from './DataSectionItem.vue'

const isLoading = ref(false)
const dashboardStore = useDashboardStore()
const current_date = ref<string>()

interface DashboardMetric {
  id: string
  title: string
  value: string
  icon: string
  iconBackground: string
  iconColor: string
}

const { getColor } = useColors()
const { t } = useI18n()
const { init } = useToast()

// const calculateChange = (current: number, previous: number) => {
//   if (previous === 0) return 100 // Avoid division by zero error
//   const change = ((current - previous) / previous) * 100
//   return change.toFixed(2)
// }

const dashboardMetrics = computed(() => {
  return [
    {
      id: 'appointments',
      title: t('dashboard.total_appointments'),
      value: String(dashboardStore.total_appointment) as string,
      icon: 'book_online',
      iconBackground: getColor('success'),
      iconColor: getColor('on-success'),
    },
    {
      id: 'new_contacts',
      title: t('dashboard.new_contacts'),
      value: String(dashboardStore.new_contacts),
      icon: 'contact_support',
      iconBackground: getColor('info'),
      iconColor: getColor('on-info'),
    },
    {
      id: 'follow_up',
      title: t('dashboard.follow_up'),
      value: String(dashboardStore.follow_up),
      icon: 'change_circle',
      iconBackground: getColor('danger'),
      iconColor: getColor('on-danger'),
    },
    {
      id: 'unassign',
      title: t('dashboard.unassign'),
      value: String(dashboardStore.unassign),
      icon: 'add_circle',
      iconBackground: getColor('warning'),
      iconColor: getColor('on-warning'),
    },
  ] satisfies DashboardMetric[]
})

onBeforeMount(() => {
  const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0]
  }
  current_date.value = getCurrentDate()
})

onMounted(async () => {
  isLoading.value = true
  await Promise.all([
    dashboardStore.getTotalAppointments(current_date.value),
    dashboardStore.getNewContacts(current_date.value),
    dashboardStore.getFollowUp(current_date.value),
    dashboardStore.getUnassign(current_date.value),
  ])
    .then(() => {
      isLoading.value = false
    })
    .catch((error) => {
      const errorMessage = getErrorMessage(error)
      init({
        title: 'error',
        message: errorMessage,
        color: 'danger',
      })
      isLoading.value = false
    })
})
</script>
