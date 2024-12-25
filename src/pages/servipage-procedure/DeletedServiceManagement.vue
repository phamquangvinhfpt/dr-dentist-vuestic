<template>
  <VaDataTable
    class="my-table va-table--hoverable"
    :items="serviceList"
    :columns="columns"
    hoverable
    select-mode="multiple"
    :disable-client-side-sorting="false"
    :style="{
      '--va-data-table-thead-background': 'var(--va-background-element)',
      '--va-data-table-grid-tr-border': '1px solid var(--va-background-border)',
    }"
    sticky-header
    no-data-html="<div class='text-center'>No deleted services found</div>"
  >
    <template #cell(id)="{ row }">
      <div class="flex items-center gap-2 ellipsis max-w-[230px]">
        <span class="w-24">{{ row.rowData.serviceID }}</span>
      </div>
    </template>

    <template #cell(serviceName)="{ row }">
      <div class="flex items-center gap-2 ellipsis max-w-[230px]">
        <span class="w-24">{{ row.rowData.name }}</span>
      </div>
    </template>

    <template #cell(serviceDescription)="{ row }">
      <div class="flex items-center gap-2 ellipsis max-w-[230px]">
        <span class="w-24">{{ row.rowData.description }}</span>
      </div>
    </template>

    <template #cell(totalPrice)="{ row }">
      <div class="flex items-center gap-2 ellipsis max-w-[230px]">
        <span class="w-24">{{ formatPrice(row.rowData.totalPrice) }}</span>
      </div>
    </template>

    <template #cell(deletedOn)="{ row }">
      <div class="flex items-center gap-2 ellipsis max-w-[230px]">
        <span class="w-24">{{ formatDate(row.rowData.deletedOn) }}</span>
      </div>
    </template>

    <template #cell(deletedBy)="{ row }">
      <div class="flex items-center gap-2 ellipsis max-w-[230px]">
        <span class="w-24">{{ row.rowData.deletedBy }}</span>
      </div>
    </template>

    <template #cell(action)="{ row }">
      <VaButton
        color="success"
        class="mr-6 mb-2 transition ease-in-out delay-150 bg-green-500 hover:-translate-y-1 hover:scale-110 hover:bg-green-600 duration-300"
        @click="restoreService(row.rowData.serviceID)"
      >
        {{ t('common.restore') }}
      </VaButton>
    </template>
  </VaDataTable>

  <VaCardContent>
    <div v-if="serviceListResponse" class="flex flex-col-reverse md:flex-row gap-2 justify-between items-center p-2">
      <div>
        <b>{{ serviceListResponse.totalCount }} {{ t('common.result') }}.</b>
        {{ t('common.resultPerPage') }}
        <VaSelect v-model="formData.pageSize" class="!w-20" :options="[10, 50, 100]" />
      </div>
      <div v-if="serviceListResponse.totalPages > 1" class="flex">
        <VaPagination
          v-model="serviceListResponse.currentPage"
          buttons-preset="secondary"
          :pages="serviceListResponse.totalPages"
          :visible-pages="5"
          :boundary-links="true"
          :direction-links="true"
        />
      </div>
    </div>
  </VaCardContent>
</template>

<script lang="ts" setup>
import { useServiceStore } from '@/stores/modules/service.module'
import { onMounted, Ref, ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ListServicePagination, ServiceDTO } from './types'
import { VaButton } from 'vuestic-ui'
import { useToast } from 'vuestic-ui'

const { t } = useI18n()
const serviceStore = useServiceStore()
const { init } = useToast()

const formData = reactive({
  pageNumber: 1,
  pageSize: 10,
  isActive: true,
  orderBy: [],
})

const serviceListResponse: Ref<ListServicePagination | null> = ref(null)
const serviceList: Ref<ServiceDTO[]> = ref([])

const getDeletedServicesPagination = async () => {
  try {
    const res = await serviceStore.getDeletedServices(formData)
    serviceListResponse.value = res
    serviceList.value = serviceListResponse.value.data
  } catch (error) {
    console.error('Error fetching deleted services:', error)
    serviceListResponse.value = null
  }
}

const restoreService = async (id: string) => {
  try {
    await serviceStore.restoreService(id)
    init({ message: t('service.restoreSuccess'), color: 'success' })
    await getDeletedServicesPagination() // Refresh list after restore
  } catch (error) {
    console.error('Error restoring service:', error)
    init({ message: t('service.restoreError'), color: 'danger' })
  }
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('vi-VN')
}

const columns = computed(() => [
  { key: 'id', label: t('service.id') },
  { key: 'serviceName', label: t('service.name') },
  { key: 'serviceDescription', label: t('service.description') },
  { key: 'totalPrice', label: t('service.price') },
  { key: 'deletedOn', label: t('service.deletedOn') },
  { key: 'deletedBy', label: t('service.deletedBy') },
  { key: 'action', label: t('common.actions') },
])

onMounted(() => {
  getDeletedServicesPagination()
})
</script>

<style scoped>
.va-table-responsive {
  overflow: auto;
}
</style>
