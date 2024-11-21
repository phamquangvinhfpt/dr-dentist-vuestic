<template>
  <VaInput
    v-model="searchKeyword"
    class="col-span-1"
    :loading="isLoadingSelect"
    placeholder="Search pharmaceuticals"
    clearable
  >
    <template #appendInner>
      <VaIcon color="secondary" class="material-icons">search</VaIcon>
    </template>
  </VaInput>

  <div v-if="pharmaceuticals.length">
    <VaScrollContainer vertical size="small" class="max-h-[200px]">
      <div v-for="option in pharmaceuticals" :key="option.sku" class="flex items-center space-x-3 py-2">
        <img :src="option.image" alt="Product image" class="w-12 h-12 object-cover rounded" />
        <div class="flex-1">
          <div class="text-sm font-semibold">{{ option.webName }}</div>
          <div class="text-xs text-gray-500">{{ option.price }} / {{ option.measureUnitName }}</div>
        </div>
      </div>
    </VaScrollContainer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { usePharmaceuticalStore } from '@/stores/modules/pharmaceutical.module'
import { useToast, VaInput } from 'vuestic-ui'
import { getErrorMessage, notifications } from '@/services/utils'
const isLoadingSelect = ref(false)

interface Pharmaceutical {
  sku: string
  webName: string
  image: string
  price: number
  measureUnitName: string
}

const { init: notify } = useToast()
const pharmaceuticals = ref<Pharmaceutical[]>([])
const searchKeyword = ref('')
const pharmaceuticalStore = usePharmaceuticalStore()

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
        message: notifications.getFailed('ngu') + getErrorMessage(error),
        color: 'error',
      })
    })
    .finally(() => {
      isLoadingSelect.value = false
    })
}

watch(searchKeyword, (newValue) => {
  if (newValue) {
    getPharmaceuticals()
  } else {
    pharmaceuticals.value = []
  }
})
</script>
<!-- <template>
  <VaSelect
    v-model="pharmaceutical"
    v-model:search="searchKeyword"
    searchable
    class="col-span-1"
    :loading="isLoadingSelect"
    :track-by="(option: any) => option.sku"
    :text-by="(option: any) => option.webName"
    :options="pharmaceuticals"
  >
    <template #appendInner>
      <VaIcon name="fas-search" />
    </template>
    <template #option="{ option }: { option: any }">
      <div class="flex items-center space-x-3">
        <img :src="option.image" alt="Product image" class="w-12 h-12 object-cover rounded" />
        <div class="flex-1">
          <div class="text-sm font-semibold">{{ option.webName }}</div>
          <div class="text-xs text-gray-500">{{ option.price }} / {{ option.measureUnitName }}</div>
        </div>
      </div>
    </template>
  </VaSelect>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { usePharmaceuticalStore } from '@/stores/modules/pharmaceutical.module'
import { useToast, VaSelect } from 'vuestic-ui'
import { getErrorMessage, notifications } from '@/services/utils'
const isLoadingSelect = ref(false)

interface Pharmaceutical {
  sku: string
  webName: string
  image: string
  price: number
  measureUnitName: string
}

const { init: notify } = useToast()
const pharmaceuticals = ref<Pharmaceutical[]>([])
const searchKeyword = ref('')
const pharmaceuticalStore = usePharmaceuticalStore()
const pharmaceutical = ref<Pharmaceutical | null>(null)

const dataFilter = computed(() => ({
  keyword: searchKeyword.value,
  KeywordSuggestSize: 2,
  CatEcomSuggestSize: 2,
  ProductSuggestSize: 3,
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

      console.log('search: ', pharmaceuticals.value)
    })
    .catch((error) => {
      notify({
        message: notifications.getFailed('ngu') + getErrorMessage(error),
        color: 'error',
      })
    })
    .finally(() => {
      isLoadingSelect.value = false
    })
}

watch(searchKeyword, (newValue) => {
  if (newValue) {
    getPharmaceuticals()
  } else {
    pharmaceuticals.value = []
  }
})
</script> -->
