<script setup lang="ts">
import { VaCard, VaCardContent, VaCollapse, VaIcon, VaCheckbox, useToast } from 'vuestic-ui'
import { MedicalRecordResponse } from '@/pages/examination/types'
import { onMounted, ref } from 'vue'
import { useMedicalRecordStore } from '@/stores/modules/medicalrecord.module'
import { getErrorMessage } from '@/services/utils'

const props = defineProps<{
  patientId: string
}>()
const { init } = useToast()

const loading = ref(false)
const storeMedicalRecord = useMedicalRecordStore()
const medicalRecords = ref<MedicalRecordResponse[]>([])

const toothConditions = [
  { code: 'Hàm giả tháo lắp', label: 'Hàm giả tháo lắp' },
  { code: 'Implant', label: 'Implant' },
  { code: 'Sâu Răng', label: 'Sâu răng' },
  { code: 'Răng khấp khểnh', label: 'Răng khấp khểnh' },
  { code: 'RĂNG VIÊM', label: 'RĂNG VIÊM' },
  { code: 'Răng siêu khôn', label: 'Răng siêu khôn' },
  { code: 'Khác', label: 'Khác' },
]

const indicationTypes = [
  { code: 'Cephalometric', label: 'Cephalometric' },
  { code: 'Panorama', label: 'Panorama' },
  { code: '3D 5x5', label: '3D 5x5' },
  { code: '3D', label: '3D' },
  { code: 'Ảnh (ext)', label: 'Ảnh (ext)' },
  { code: 'Khác', label: 'Khác' },
  { code: 'Cắn chụp', label: 'Cắn chụp' },
  { code: 'Ảnh (int)', label: 'Ảnh (int)' },
  { code: 'Xét nghiệm huyết học', label: 'Xét nghiệm huyết học' },
  { code: 'Xét nghiệm sinh hóa', label: 'Xét nghiệm sinh hóa' },
]

const formatDate = (date: string | Date) => {
  if (typeof date === 'string') {
    date = new Date(date)
  }
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
}

const getMedicalRecord = async () => {
  loading.value = true
  storeMedicalRecord
    .getMedicalRecord(props.patientId)
    .then((response) => {
      medicalRecords.value = response
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
  getMedicalRecord()
})
</script>

<template>
  <div class="medical-records">
    <main class="p-6">
      <div v-for="record in medicalRecords" :key="record.recordId" class="mb-6">
        <VaCard>
          <VaCardContent>
            <!-- Main Examination Date Collapse -->
            <VaCollapse>
              <template #header="{ value, attrs, iconAttrs }">
                <div
                  v-bind="attrs"
                  class="w-full flex items-center justify-between border-2 border-solid border-[var(--va-background-border)] p-4 bg-[var(--va-background-element)] rounded"
                >
                  <div class="flex items-center">
                    <VaIcon name="expand_more" :class="value ? '' : '-rotate-90'" v-bind="iconAttrs" />
                    <span class="ml-2 font-medium">NGÀY KHÁM: {{ formatDate(record.date) }}</span>
                  </div>
                  <VaIcon name="edit_note" />
                </div>
              </template>

              <template #default>
                <div class="p-4 border-2 border-t-0 border-solid border-[var(--va-background-border)]">
                  <!-- General Examination Section -->
                  <VaCard>
                    <VaCardContent>
                      <VaCollapse>
                        <template #header="{ value, attrs, iconAttrs }">
                          <div
                            v-bind="attrs"
                            class="w-full flex items-center border-2 border-solid border-[var(--va-background-border)] p-4 bg-[var(--va-background-element)] rounded"
                          >
                            <VaIcon name="expand_more" :class="value ? '' : '-rotate-90'" v-bind="iconAttrs" />
                            <span class="ml-2 font-medium">KHÁM TỔNG QUÁT</span>
                          </div>
                        </template>

                        <template #default>
                          <div class="p-6 border-2 border-t-0 border-solid border-[var(--va-background-border)]">
                            <!-- Doctor Information -->
                            <div class="mb-6">
                              <span class="font-medium">Bác sĩ: {{ record.dentistName }}</span>
                            </div>

                            <!-- Examination Content -->
                            <div class="grid grid-cols-2 gap-6 mb-6">
                              <div>
                                <h4 class="font-medium mb-3">Nội dung khám</h4>
                                <p>{{ record.basicExamination.examinationContent }}</p>
                              </div>
                              <div>
                                <h4 class="font-medium mb-3">Kế hoạch điều trị</h4>
                                <p>{{ record.basicExamination.treatmentPlanNote }}</p>
                              </div>
                            </div>
                          </div>
                        </template>
                      </VaCollapse>
                    </VaCardContent>
                  </VaCard>

                  <!-- Tooth Conditions Section -->
                  <VaCard>
                    <VaCardContent>
                      <VaCollapse>
                        <template #header="{ value, attrs, iconAttrs }">
                          <div
                            v-bind="attrs"
                            class="w-full flex items-center border-2 border-solid border-[var(--va-background-border)] p-4 bg-[var(--va-background-element)] rounded"
                          >
                            <VaIcon name="expand_more" :class="value ? '' : '-rotate-90'" v-bind="iconAttrs" />
                            <span class="ml-2 font-medium">TÌNH TRẠNG RĂNG</span>
                          </div>
                        </template>

                        <template #default>
                          <div class="p-6 border-2 border-t-0 border-solid border-[var(--va-background-border)]">
                            <h4 class="font-medium mb-3">Tình trạng răng {{ record.diagnosis.toothNumber }}</h4>
                            <div class="grid grid-cols-2 gap-4">
                              <div v-for="condition in toothConditions" :key="condition.code" class="flex items-start">
                                <VaCheckbox
                                  :model-value="record.diagnosis.teethConditions.includes(condition.code)"
                                  :label="condition.label"
                                  :value="condition.code"
                                  :disabled="!record.diagnosis.teethConditions.includes(condition.code)"
                                  readonly
                                />
                              </div>
                            </div>
                          </div>
                        </template>
                      </VaCollapse>
                    </VaCardContent>
                  </VaCard>

                  <!-- Indications Section -->
                  <VaCard>
                    <VaCardContent>
                      <VaCollapse>
                        <template #header="{ value, attrs, iconAttrs }">
                          <div
                            v-bind="attrs"
                            class="w-full flex items-center border-2 border-solid border-[var(--va-background-border)] p-4 bg-[var(--va-background-element)] rounded"
                          >
                            <VaIcon name="expand_more" :class="value ? '' : '-rotate-90'" v-bind="iconAttrs" />
                            <span class="ml-2 font-medium">CHỈ ĐỊNH</span>
                          </div>
                        </template>

                        <template #default>
                          <div class="p-6 border-2 border-t-0 border-solid border-[var(--va-background-border)]">
                            <h4 class="font-medium mb-3">Chỉ định (Thêm chỉ định như Chụp X-Quang, xét nghiệm máu)</h4>
                            <div class="grid grid-cols-2 gap-4">
                              <div
                                v-for="indication in indicationTypes"
                                :key="indication.code"
                                class="flex items-start"
                              >
                                <VaCheckbox
                                  :model-value="record.indication.indicationType.includes(indication.code)"
                                  :label="indication.label"
                                  :value="indication.code"
                                  :disabled="!record.indication.indicationType.includes(indication.code)"
                                  readonly
                                />
                              </div>
                            </div>

                            <!-- Preview Section -->
                            <div
                              v-if="record.indication.indicationType.includes('Ảnh (int)')"
                              class="mt-6 border border-dashed border-gray-300 p-4 rounded"
                            >
                              <div class="text-center text-sm text-gray-500 mb-2">Ảnh (int) (1)</div>
                              <img
                                src="/placeholder.svg?height=300&width=400"
                                alt="X-ray preview"
                                class="w-full h-auto"
                              />
                            </div>

                            <div
                              v-if="record.indication.indicationType.includes('Xét nghiệm huyết học')"
                              class="mt-6 border border-dashed border-gray-300 p-4 rounded"
                            >
                              <div class="text-center text-sm text-gray-500 mb-2">
                                Xét nghiệm huyết học (Tải mẫu xét nghiệm)
                              </div>
                              <img
                                src="/placeholder.svg?height=300&width=400"
                                alt="Blood test form"
                                class="w-full h-auto"
                              />
                            </div>
                          </div>
                        </template>
                      </VaCollapse>
                    </VaCardContent>
                  </VaCard>
                </div>
              </template>
            </VaCollapse>
          </VaCardContent>
        </VaCard>
      </div>
    </main>
  </div>
</template>

<style scoped>
:deep(.va-checkbox__label) {
  white-space: nowrap;
}
</style>
