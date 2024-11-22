<script lang="ts" setup>
import { Appointment } from '@/pages/appointment/types'
import { onMounted, ref, computed } from 'vue'
import { useToast, VaInnerLoading, VaCollapse, VaCard, VaCardContent, VaIcon, VaButton, VaCheckbox } from 'vuestic-ui'
import { getStatusClass, getStatusText, TreatmentPlanResponse } from '../types'
import { useTreatmentStore } from '@/stores/modules/treatment.module'
import { getErrorMessage } from '@/services/utils'

const loading = ref(false)
const props = defineProps<{
  appointment: Appointment | undefined
}>()

const { init } = useToast()
const storeTreatment = useTreatmentStore()
const appointmentStatus = props.appointment?.status
const treatmentplans = ref<TreatmentPlanResponse[]>([])

// Computed properties for totals
const totalExpectedCost = computed(() => {
  return Array.isArray(treatmentplans.value) ? treatmentplans.value.reduce((sum, plan) => sum + plan.price, 0) : 0
})

const totalDiscount = computed(() => {
  return Array.isArray(treatmentplans.value)
    ? treatmentplans.value.reduce((sum, plan) => sum + plan.discountAmount, 0)
    : 0
})

const totalFinalCost = computed(() => {
  return totalExpectedCost.value - totalDiscount.value
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN').format(value)
}

const toogleAppointmentStatus = async () => {
  loading.value = true
  await storeTreatment
    .toogleAppointment(props.appointment?.appointmentId)
    .then((response) => {
      treatmentplans.value = response
    })
    .catch((error) => {
      const errorMessage = getErrorMessage(error)
      init({
        message: errorMessage,
        color: 'error',
        title: 'Error',
      })
    })
    .finally(() => {
      loading.value = false
    })
}

const getTreatmentPlans = async () => {
  loading.value = true
  await storeTreatment
    .getTreatmentList(props.appointment?.appointmentId)
    .then((response) => {
      console.log(props.appointment?.status)
      treatmentplans.value = response
    })
    .catch((error) => {
      const errorMessage = getErrorMessage(error)
      init({
        message: errorMessage,
        color: 'error',
        title: 'Error',
      })
    })
    .finally(() => {
      loading.value = false
    })
}

onMounted(() => {
  if (appointmentStatus === 2) {
    toogleAppointmentStatus()
  } else {
    getTreatmentPlans()
  }
})
</script>

<template>
  <VaCard>
    <VaCardContent>
      <VaCollapse>
        <template #header="{ value, attrs, iconAttrs }">
          <div
            v-bind="attrs"
            class="w-full flex items-center justify-between border-2 border-solid border-[var(--va-background-border)] p-4 bg-[var(--va-background-element)] rounded"
          >
            <div class="flex items-center">
              <VaIcon name="expand_more" :class="value ? '' : '-rotate-90'" v-bind="iconAttrs" />
              <span class="ml-2 font-medium">KẾ HOẠCH ĐIỀU TRỊ</span>
            </div>
            <VaButton color="primary"> Thêm kế hoạch điều trị </VaButton>
          </div>
        </template>

        <template #default>
          <VaInnerLoading :loading="loading">
            <div class="p-6 border-2 border-t-0 border-solid border-[var(--va-background-border)]">
              <!-- Treatment Plans Table -->
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Răng số</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tình trạng răng</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên thủ thuật</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">KH đồng ý</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.L</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đơn giá</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thành tiền</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giảm giá (%)</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tiền giảm giá</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng chi phí</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tình trạng</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="plan in treatmentplans" :key="plan.treatmentPlanID">
                      <td class="px-6 py-4 whitespace-nowrap">{{ plan.procedureID }}</td>
                      <td class="px-6 py-4 whitespace-nowrap">-</td>
                      <td class="px-6 py-4">{{ plan.procedureName }}</td>
                      <td class="px-6 py-4">
                        <VaCheckbox readonly />
                      </td>
                      <td class="px-6 py-4">{{ plan.step }}</td>
                      <td class="px-6 py-4">{{ formatCurrency(plan.price) }}</td>
                      <td class="px-6 py-4">{{ formatCurrency(plan.price * plan.step) }}</td>
                      <td class="px-6 py-4">{{ ((plan.discountAmount / plan.price) * 100).toFixed(0) }}%</td>
                      <td class="px-6 py-4">{{ formatCurrency(plan.discountAmount) }}</td>
                      <td class="px-6 py-4">{{ formatCurrency(plan.planCost) }}</td>
                      <td class="px-6 py-4">
                        <span class="px-2 py-1 text-xs rounded-full" :class="getStatusClass(plan.status)">
                          {{ getStatusText(plan.status) }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <div class="flex space-x-2">
                          <VaButton icon="edit" color="primary" small />
                          <VaButton icon="delete" color="danger" small />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Summary Section -->
              <div class="mt-6 space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">Chi phí dự kiến:</span>
                  <span class="font-medium">{{ formatCurrency(totalExpectedCost) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Giảm giá:</span>
                  <span class="font-medium">{{ formatCurrency(totalDiscount) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Tổng chi phí dự kiến:</span>
                  <span class="font-medium">{{ formatCurrency(totalFinalCost) }}</span>
                </div>
              </div>
            </div>
          </VaInnerLoading>
        </template>
      </VaCollapse>
    </VaCardContent>
  </VaCard>
</template>

<style scoped>
.va-inner-loading {
  min-height: 200px;
}

table {
  border-collapse: collapse;
  width: 100%;
}

th,
td {
  border: 1px solid var(--va-background-border);
}

thead {
  background-color: var(--va-background-secondary);
}
</style>
