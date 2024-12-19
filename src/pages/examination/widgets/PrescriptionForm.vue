<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Pharmaceutical, Prescription, PrescriptionItem } from '../types'
import { usePharmaceuticalStore } from '@/stores/modules/pharmaceutical.module'
import { getErrorMessage, notifications } from '@/services/utils'
import { defineVaDataTableColumns, useToast, VaDataTable, VaInput } from 'vuestic-ui/web-components'
import { debounce } from 'lodash'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const searchKeyword = ref('')
const isLoadingSelect = ref(false)
const { init: notify } = useToast()
const pharmaceuticals = ref<Pharmaceutical[]>([])
const pharmaceuticalStore = usePharmaceuticalStore()

const newPrescription = ref<Prescription>({
  treatmentID: '',
  notes: '',
  itemRequests: [],
})

const columns = defineVaDataTableColumns([
  { label: t('prescriptions.medicine'), key: 'medicineName', sortable: true },
  { label: t('prescriptions.dosage'), key: 'dosage', sortable: true },
  { label: t('prescriptions.frequency'), key: 'frequency', sortable: true },
  { label: ' ', key: 'actions' },
])

const props = defineProps<{
  prescription: Prescription | null
  saveButtonLabel: string
}>()

defineEmits<{
  (event: 'save', prescription: Prescription): void
  (event: 'close'): void
}>()

const isFormHasUnsavedChanges = computed(() => {
  return Object.keys(newPrescription.value).some((key) => {
    return (
      newPrescription.value[key as keyof Prescription] !==
      (props.prescription ?? {
        treatmentID: '',
        notes: '',
        itemRequests: [],
      })?.[key as keyof Prescription]
    )
  })
})

defineExpose({
  isFormHasUnsavedChanges,
})

const dataFilter = computed(() => ({
  keyword: searchKeyword.value,
  KeywordSuggestSize: 2,
  CatEcomSuggestSize: 2,
  ProductSuggestSize: 100,
}))

const getPharmaceuticals = () => {
  isLoadingSelect.value = true
  pharmaceuticalStore
    .getPharmaceuticals(dataFilter.value)
    .then((response) => {
      pharmaceuticals.value = response.products
        .filter((product: any) => product.name.toLowerCase().includes(searchKeyword.value.toLowerCase()))
        .slice(0, dataFilter.value.ProductSuggestSize)
        .map((product: any) => ({
          sku: product.sku,
          webName: product.webName,
          image: product.image,
          price: product.price?.price || 0,
          measureUnitName: product.price?.measureUnitName || 'N/A',
        }))
    })
    .catch((error) => {
      notify({
        message: notifications.getFailed(t('phamarceutials.phamarceutial')) + getErrorMessage(error),
        color: 'danger',
      })
    })
    .finally(() => {
      isLoadingSelect.value = false
    })
}

const debouncedGetPharmaceuticals = debounce(getPharmaceuticals, 500)

watch(
  () => props.prescription,
  () => {
    if (props.prescription) {
      newPrescription.value = { ...props.prescription }
    }
  },
  { immediate: true },
)

watch(searchKeyword, (newValue) => {
  if (newValue) {
    debouncedGetPharmaceuticals()
  } else {
    pharmaceuticals.value = []
  }
})

const selectPharmaceutical = (pharmaceutical: Pharmaceutical) => {
  if (!newPrescription.value.itemRequests.find((item) => item.medicineName === pharmaceutical.webName)) {
    newPrescription.value.itemRequests.push({
      medicineName: pharmaceutical.webName,
      dosage: '',
      frequency: '',
    })
    // clear search
    searchKeyword.value = ''
  }
}

const removeItem = (rowData: PrescriptionItem) => {
  const index = newPrescription.value.itemRequests.findIndex((item) => item.medicineName === rowData.medicineName)
  if (index !== -1) {
    newPrescription.value.itemRequests.splice(index, 1)
  }
}
</script>

<template>
  <div>
    <VaInput
      v-model="searchKeyword"
      class="col-span-1"
      :loading="isLoadingSelect"
      placeholder="Find medicine...."
      clearable
    >
      <template #appendInner>
        <VaIcon color="secondary" class="material-icons">search</VaIcon>
      </template>
    </VaInput>
    <div v-if="pharmaceuticals.length">
      <VaList>
        <template v-for="option in pharmaceuticals" :key="option.sku">
          <VaListItem class="hover:cursor-pointer" @click="selectPharmaceutical(option)">
            <div class="flex items-center space-x-3 py-2">
              <img :src="option.image" alt="Product image" class="w-12 h-12 object-cover rounded" />
              <div class="flex-1">
                <div class="text-sm font-semibold">{{ option.webName }}</div>
                <div class="text-xs text-gray-500">{{ option.price }} / {{ option.measureUnitName }}</div>
              </div>
            </div>
          </VaListItem>
        </template>
      </VaList>
    </div>
  </div>
  <VaForm v-slot="{ validate }" class="flex flex-col gap-2">
    <div class="max-h-[400px] overflow-auto">
      <VaDataTable
        v-model="newPrescription.itemRequests"
        hoverable
        clickable
        :items="newPrescription.itemRequests"
        :columns="columns"
        sticky-header
      >
        <template #cell(dosage)="{ rowData }">
          <VaInput v-model="rowData.dosage" :placeholder="t('prescriptions.dosage')" />
        </template>
        <template #cell(frequency)="{ rowData }">
          <VaInput v-model="rowData.frequency" :placeholder="t('prescriptions.frequency')" />
        </template>
        <template #cell(actions)="{ rowData }">
          <VaButton icon="delete" @click="removeItem(rowData as PrescriptionItem)" />
        </template>
      </VaDataTable>
    </div>

    <VaInput
      v-model="newPrescription.notes"
      :label="$t('prescriptions.note')"
      type="textarea"
      :placeholder="$t('prescriptions.prescription')"
    />
    <VaCard class="flex justify-end flex-col-reverse sm:flex-row mt-4 gap-2">
      <VaButton preset="secondary" color="secondary" @click="$emit('close')">{{ $t('settings.cancel') }}</VaButton>
      <VaButton @click="validate() && $emit('save', newPrescription as Prescription)">{{ saveButtonLabel }}</VaButton>
    </VaCard>
  </VaForm>
</template>
<style scoped>
.prescription-form {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.fixed-search {
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 10;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-results {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  margin-top: 0.5rem;
}

.prescription-content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 1rem;
}
</style>
