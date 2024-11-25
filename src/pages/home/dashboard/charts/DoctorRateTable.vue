<script setup lang="ts">
import { defineVaDataTableColumns } from 'vuestic-ui'
import { computed, ref } from 'vue'
import { useDashboardStore } from '@/stores/modules/dashboard.module'
const dashboardStore = useDashboardStore()

const columns = defineVaDataTableColumns([
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
const pages = computed(() => Math.ceil(doctorData.value.length / 5))
</script>

<template>
  <VaCard>
    <VaCardTitle class="flex items-start justify-between">
      <h1 class="card-title text-secondary font-bold uppercase">Doctor Rate</h1>
    </VaCardTitle>
    <VaCardContent>
      <div v-if="doctorData.length > 0">
        <VaDataTable :items="doctorData" :columns="columns" :per-page="5" :current-page="currentPage">
          <template #bodyAppend>
            <tr>
              <td colspan="6">
                <div class="flex justify-center mt-4">
                  <VaPagination v-model="currentPage" :pages="pages" />
                </div>
              </td>
            </tr>
          </template>
        </VaDataTable>
      </div>
      <div v-else class="p-4 flex justify-center items-center text-[var(--va-secondary)]">No data</div>
    </VaCardContent>
  </VaCard>
</template>
