<template>
  <VaCard class="my-4 rounded p-5 mx-3">
    <AuditLogsForm :handle-trigger-filter="handleTriggerFilter" />
    <AuditLogsTable :filter-queries="filterQueries" />
  </VaCard>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import AuditLogsForm from './AuditLogsForm.vue'
import AuditLogsTable from './AuditLogsTable.vue'

const filterQueries = ref({ action: '', resource: '' })

const handleTriggerFilter = (filterQuery: any) => {
  filterQueries.value = { ...filterQuery }
}
</script>
