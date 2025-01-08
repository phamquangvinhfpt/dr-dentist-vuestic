<template>
  <VaForm class="flex flex-row justify-between items-center">
    <div class="flex flex-row gap-4">
      <VaSelect
        v-model="formData.resource"
        :options="resourceType"
        text-by="label"
        value-by="value"
        :label="t('auditLogs.form.resourceType')"
        @update:modelValue="handleChangeResource"
      />
      <VaSelect
        v-model="formData.action"
        :options="optionsAction"
        text-by="label"
        value-by="value"
        :label="t('auditLogs.form.actionType')"
        @update:modelValue="handleChangeAction"
      />
    </div>
    <VaButton class="col-strart-4" preset="primary" @click="handleExport">
      {{ t('auditLogs.form.export') }}
    </VaButton>
  </VaForm>
</template>

<script setup lang="ts">
import { useAuditLogsStore } from '@/stores/modules/auditLogs.module'
import { onMounted, reactive, ref } from 'vue'
import { optionsAction } from './audit-logs.enum'
import { optionsActionType } from './types'
import { useI18n } from 'vue-i18n'
import { getErrorMessage } from '@/services/utils'
import { useToast } from 'vuestic-ui/web-components'

const props = defineProps<{
  handleTriggerFilter: (filterQuery: any) => void
}>()
const { notify } = useToast()
const auditLogsStore = useAuditLogsStore()
const formData = reactive({ action: '', resource: '' })
const resourceType = ref<optionsActionType[]>([])
const { t } = useI18n()
const getResourceType = async () => {
  await auditLogsStore.getResourceType().then((response) => {
    const optionsResource = response?.data?.map((item: any) => ({
      label: item,
      value: item,
    }))
    optionsResource.unshift({ label: 'All', value: '' })
    resourceType.value = [...(optionsResource || [])]
  })
}
const handleExport = () => {
  auditLogsStore
    .exportAuditLogs()
    .then((response) => {
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      )
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'logs.xlsx')
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
onMounted(() => {
  getResourceType()
})

const handleChangeResource = () => {
  props.handleTriggerFilter(formData)
}

const handleChangeAction = () => {
  props.handleTriggerFilter(formData)
}
</script>
