<template>
  <VaDateInput v-model="value" :readonly="false" :format-date="formatDate" :parse-date="parseDate" class="p-5" />
  <div class="medical-records h-screen overflow-y-auto">
    <div class="timeline-container">
      <div class="timeline"></div>
      <div v-for="record in medicalRecords" :key="record.recordId" class="record-container">
        <div class="timeline-dot"></div>
        <VaCard class="mb-6">
          <VaCardContent class="p-0">
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
                            <DentalChart
                              ref="dentalChartRef"
                              :is-view="true"
                              :tooths="record.diagnosis.map((item) => item.toothNumber)"
                              @toothHover="handleToothHover"
                            />
                            <div
                              v-if="hoveredTooth && getToothConditions(hoveredTooth).length > 0"
                              class="tooth-popup"
                              :style="popupStyle"
                            >
                              <div v-if="getToothConditions(hoveredTooth).length > 0">
                                <p v-for="condition in getToothConditions(hoveredTooth)" :key="condition">
                                  {{ condition }}
                                </p>
                              </div>
                              <p v-else>No conditions</p>
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
                            <div class="grid grid-cols-3 gap-4 mt-4">
                              <div v-for="image in record.indicationImages" :key="image.imageType" class="relative">
                                <img
                                  :src="getSrcAvatar(image.imageUrl)"
                                  :alt="image.imageType"
                                  class="w-full h-64 object-cover border-2 border-dashed"
                                />
                                <div class="text-center">{{ image.imageType }}</div>
                              </div>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { VaCard, VaCardContent, VaCollapse, VaIcon, useToast } from 'vuestic-ui'
import { MedicalRecordResponse } from '@/pages/examination/types'
import { useMedicalRecordStore } from '@/stores/modules/medicalrecord.module'
import { getErrorMessage, getSrcAvatar } from '@/services/utils'
import { watch } from 'vue'
import DentalChart from './DentalChart.vue'

const props = defineProps<{
  patientId: string
}>()

const { init } = useToast()
const loading = ref(false)
const storeMedicalRecord = useMedicalRecordStore()
const medicalRecords = ref<MedicalRecordResponse[]>([])

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
      medicalRecords.value = medicalRecords.value.filter(
        (record: any) =>
          record.date <= formatDateForm(value.value.end) && record.date >= formatDateForm(value.value.start),
      )
    })
    .catch((error) => {
      const errorMessage = getErrorMessage(error)
      init({
        message: errorMessage,
        color: 'danger',
        title: 'Error',
      })
    })
    .finally(() => {
      loading.value = false
    })
}

const dateMinusDay = (date: any, days: any) => {
  const d = new Date(date)
  d.setDate(d.getDate() - days)
  return d
}
const preWeek = dateMinusDay(new Date(), 7)

const value = ref<any>({
  start: preWeek,
  end: new Date(),
})

const parseDate = (text: any) => {
  console.log(text)
  const [day, month, year] = text.split('/')

  return new Date(Number(year), Number(month) - 1, Number(day))
}

const formatDateForm = (date: string | Date): string => {
  if (!date) return ''
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) return ''

  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0')
  const day = dateObj.getDate().toString().padStart(2, '0')
  const year = dateObj.getFullYear()

  return `${year}-${month}-${day}`
}

const dentalChartRef = ref()
const hoveredTooth = ref<number | null>(null)
const popupStyle = ref({})

const handleToothHover = ({
  toothNumber,
  event,
  isHovered,
}: {
  toothNumber: number
  event: MouseEvent | null
  isHovered: boolean
}) => {
  if (isHovered && event) {
    hoveredTooth.value = toothNumber
    popupStyle.value = {
      position: 'fixed',
      left: `${event.clientX}px`,
      top: `${event.clientY + 10}px`,
    }
  } else {
    hoveredTooth.value = null
  }
}

const getToothConditions = (toothNumber: number): string[] => {
  const recordWithTooth = medicalRecords.value.find((record) =>
    record.diagnosis.some((diagnose) => diagnose.toothNumber === toothNumber),
  )

  if (recordWithTooth) {
    const matchedDiagnosis = recordWithTooth.diagnosis.find((diagnose) => diagnose.toothNumber === toothNumber)
    return matchedDiagnosis ? matchedDiagnosis.teethConditions : []
  }

  return []
}

watch(
  value,
  () => {
    getMedicalRecord()
  },
  { deep: true },
)

onMounted(() => {
  getMedicalRecord()
})
</script>

<style scoped>
.medical-records {
  padding: 1.5rem;
  position: relative;
}

.timeline-container {
  position: relative;
  padding-left: 2rem;
}

.timeline {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: var(--va-primary);
}

.record-container {
  position: relative;
  padding-bottom: 2rem;
}

.timeline-dot {
  position: absolute;
  left: -2.5rem;
  top: 1.5rem;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background-color: var(--va-primary);
}

:deep(.va-checkbox__label) {
  white-space: nowrap;
}

.va-inner-loading {
  min-height: 200px;
}

.tooth-popup {
  position: fixed;
  background-color: white;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}
</style>
