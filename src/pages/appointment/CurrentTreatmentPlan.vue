<script setup lang="ts">
import { useAuthStore } from '@/stores/modules/auth.module'
import { useTreatmentStore } from '@/stores/modules/treatment.module'
import type { TreatmentPlanResponse } from '../examination/types'
import { TreatmentPlanStatus } from '../examination/types'
import { onMounted, ref, computed } from 'vue'
import { getErrorMessage } from '@/services/utils'
import { useToast } from 'vuestic-ui'

const auth = useAuthStore()
const treatmentStore = useTreatmentStore()
const isLoading = ref(true)
const { init } = useToast()
const treatment = ref<TreatmentPlanResponse[]>([])

const sortedTreatment = computed(() => {
  if (!treatment.value) return []
  return [...treatment.value].sort((a, b) => a.step - b.step)
})

const totalCost = computed((): number => {
  console.log(treatment.value)
  return treatment.value.reduce((sum, item) => sum + (item.planCost || 0), 0)
})

const progress = computed(() => {
  if (!treatment.value.length) return 0
  const completed = treatment.value.filter((item) => item.status === TreatmentPlanStatus.Completed).length
  return Math.round((completed / treatment.value.length) * 100)
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN').format(amount)
}

const getStatusColor = (status: TreatmentPlanStatus) => {
  switch (status) {
    case TreatmentPlanStatus.Completed:
      return 'success'
    case TreatmentPlanStatus.Active:
      return 'primary'
    case TreatmentPlanStatus.Pending:
      return 'warning'
    case TreatmentPlanStatus.Cancelled:
      return 'danger'
    case TreatmentPlanStatus.Rescheduled:
      return 'info'
    default:
      return 'gray'
  }
}

const getStatusClass = (status: TreatmentPlanStatus) => {
  return {
    'border-l-4': true,
    'border-success': status === TreatmentPlanStatus.Completed,
    'border-primary': status === TreatmentPlanStatus.Active,
    'border-warning': status === TreatmentPlanStatus.Pending,
    'border-danger': status === TreatmentPlanStatus.Cancelled,
    'border-info': status === TreatmentPlanStatus.Rescheduled,
  }
}

const getTreatmentStatusText = (status: TreatmentPlanStatus) => {
  switch (status) {
    case TreatmentPlanStatus.Completed:
      return 'Completed'
    case TreatmentPlanStatus.Active:
      return 'Active'
    case TreatmentPlanStatus.Pending:
      return 'Pending'
    case TreatmentPlanStatus.Cancelled:
      return 'Cancelled'
    case TreatmentPlanStatus.Rescheduled:
      return 'Rescheduled'
    default:
      return 'Unknown'
  }
}

onMounted(async () => {
  try {
    if (auth.user?.id) {
      const response = await treatmentStore.getCurrentPlan(auth.user.id)
      treatment.value = response
    }
  } catch (error) {
    const message = getErrorMessage(error)
    init({
      title: 'error',
      message: message,
      color: 'danger',
    })
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <VaInnerLoading :loading="isLoading">
    <div v-if="sortedTreatment && sortedTreatment.length > 0" class="p-6 max-w-6xl mx-auto">
      <!-- Overview Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <VaCard class="bg-gradient-to-br from-primary-50 to-primary-100">
          <VaCardContent>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm mb-1">Tổng chi phí điều trị</p>
                <p class="text-2xl font-bold text-primary">{{ formatCurrency(totalCost) }} VND</p>
              </div>
              <VaIcon name="payments" size="large" color="primary" />
            </div>
          </VaCardContent>
        </VaCard>

        <VaCard class="bg-gradient-to-br from-success-50 to-success-100">
          <VaCardContent>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm mb-1">Tiến độ điều trị</p>
                <p class="text-2xl font-bold text-success">{{ progress }}%</p>
              </div>
              <VaIcon name="trending_up" size="large" color="success" />
            </div>
          </VaCardContent>
        </VaCard>

        <VaCard class="bg-gradient-to-br from-info-50 to-info-100">
          <VaCardContent>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm mb-1">Bác sĩ điều trị</p>
                <p class="text-lg font-semibold text-info">{{ sortedTreatment[0]?.doctorName }}</p>
              </div>
              <VaIcon name="person" size="large" color="info" />
            </div>
          </VaCardContent>
        </VaCard>
      </div>

      <!-- Treatment Timeline -->
      <VaCard class="mb-6">
        <VaCardTitle class="flex items-center gap-2">
          <VaIcon name="timeline" color="primary" />
          <span>Lộ Trình Điều Trị Chi Tiết</span>
        </VaCardTitle>

        <VaCardContent>
          <div class="space-y-8">
            <template v-for="(item, index) in sortedTreatment" :key="item.treatmentPlanID">
              <div class="relative">
                <!-- Timeline Connector -->
                <div
                  v-if="index < sortedTreatment.length - 1"
                  class="absolute left-5 top-10 bottom-0 w-0.5 bg-gray-200"
                ></div>

                <!-- Treatment Step Card -->
                <div class="flex gap-6">
                  <!-- Step Circle with Status -->
                  <div
                    class="relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                    :class="{
                      'bg-success': item.status === TreatmentPlanStatus.Completed,
                      'bg-primary': item.status === TreatmentPlanStatus.Active,
                      'bg-gray-400': item.status === TreatmentPlanStatus.Pending,
                    }"
                  >
                    {{ item.step }}
                  </div>

                  <!-- Content Card -->
                  <div class="flex-grow">
                    <VaCard class="transition-all duration-300 hover:shadow-lg" :class="getStatusClass(item.status)">
                      <VaCardContent>
                        <div class="space-y-4">
                          <!-- Header -->
                          <div class="flex justify-between items-start">
                            <div>
                              <h3 class="sm:text-xs md:text-lg font-semibold">
                                {{ item.procedureName }}
                              </h3>
                              <div class="flex items-center gap-2 mt-1">
                                <VaIcon name="event" size="small" />
                                <span class="text-sm">{{ formatDate(item.startDate) }}</span>
                              </div>
                            </div>
                            <VaChip :color="getStatusColor(item.status)" class="shadow-sm" size="small">
                              {{ getTreatmentStatusText(item.status) }}
                            </VaChip>
                          </div>

                          <!-- Footer -->
                          <div class="flex justify-between items-center pt-2 border-t border-gray-100">
                            <div class="text-primary font-medium flex items-center gap-2">
                              <VaIcon name="attach_money" />
                              {{ formatCurrency(item.price) }} VND
                            </div>
                            <div class="flex gap-2">
                              <!-- <VaButton
                                v-if="item.hasPrescription"
                                size="small"
                                color="info"
                                icon="medical_services"
                                class="hover:shadow-md transition-shadow"
                              >
                                Đơn thuốc
                              </VaButton> -->
                            </div>
                          </div>
                        </div>
                      </VaCardContent>
                    </VaCard>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Empty State -->
    <div v-else-if="!isLoading" class="p-6">
      <VaCard class="max-w-lg mx-auto">
        <VaCardContent>
          <div class="text-center py-12 space-y-4">
            <VaIcon name="medical_information" size="96" color="gray" class="opacity-50" />
            <h3 class="text-xl font-semibold text-gray-700">Chưa có lộ trình điều trị</h3>
            <p class="text-gray-500">
              Hiện tại bạn chưa có lộ trình điều trị nào. Vui lòng liên hệ với bác sĩ để được tư vấn.
            </p>
          </div>
        </VaCardContent>
      </VaCard>
    </div>
  </VaInnerLoading>
</template>
