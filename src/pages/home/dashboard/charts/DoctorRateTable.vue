<script setup lang="ts">
import { defineVaDataTableColumns } from 'vuestic-ui'
import { computed, ref } from 'vue'
import { useDashboardStore } from '@/stores/modules/dashboard.module'
const dashboardStore = useDashboardStore()

const columns = defineVaDataTableColumns([
  { label: 'Avatar', key: 'avatar', sortable: false },
  { label: 'Name', key: 'doctorName', sortable: true },
  { label: 'Rating', key: 'totalRating', sortable: true },
])

interface DoctorDataTable {
  doctorId: string
  doctorName: string
  totalRating: number
}

const doctorData = ref<DoctorDataTable[]>([])

dashboardStore.getRateDoctor(null).then((data) => {
  doctorData.value = data
})

const currentPage = ref(1)
const pages = computed(() => Math.ceil(doctorData.value.length / 3))
</script>

<template>
  <VaCard class="h-[400px]">
    <VaCardTitle class="flex items-start justify-between">
      <h1 class="card-title text-secondary font-bold uppercase">Doctor Rate</h1>
    </VaCardTitle>
    <VaCardContent>
      <div v-if="doctorData.length > 0">
        <VaDataTable :items="doctorData" :columns="columns" :per-page="3" :current-page="currentPage">
          <template #footer>
            <tr>
              <td colspan="6">
                <div class="flex justify-center mt-4">
                  <VaPagination v-model="currentPage" :pages="pages" />
                </div>
              </td>
            </tr>
          </template>
          <template #cell(avatar)="{ row }">
            <VaAvatar>
              {{ row?.rowData?.doctorName?.charAt(0) }}
            </VaAvatar>
          </template>
          <template #cell(totalRating)="{ row }">
            {{ row?.rowData?.totalRating }} <VaIcon name="star" class="text-warning" />
          </template>
        </VaDataTable>
      </div>
      <div v-else class="p-4 flex justify-center items-center text-[var(--va-secondary)]">No data</div>
    </VaCardContent>
  </VaCard>
</template>
