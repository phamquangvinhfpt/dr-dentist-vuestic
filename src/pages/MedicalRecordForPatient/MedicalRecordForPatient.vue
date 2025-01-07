<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/modules/auth.module'
import { useMedicalRecordStore } from '@/stores/modules/medicalrecord1.module'
import type { MedicalRecordDTO } from './types'
import { useToast } from 'vuestic-ui'
import { useI18n } from 'vue-i18n'
import DiagnosisDentalChart from '@/components/DiagnosisDentalChart.vue'

const { t } = useI18n()
const authStore = useAuthStore()
const medicalRecordStore = useMedicalRecordStore()
const { init } = useToast()

const records = ref<MedicalRecordDTO[]>([])
const isLoading = ref(false)
const selectedRecord = ref<MedicalRecordDTO | null>(null)
const showModal = ref(false)
const startDate = ref('')
const endDate = ref('')

const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toISOString().split('T')[0]
}

const fetchMedicalRecords = async () => {
  try {
    isLoading.value = true
    const userId = authStore.user?.id
    if (!userId) {
      throw new Error(t('medicalRecord.error.userNotAuth'))
    }

    const formattedStartDate = formatDate(startDate.value)
    const formattedEndDate = formatDate(endDate.value)

    const response = await medicalRecordStore.getMedicalRecord(userId, formattedStartDate, formattedEndDate)
    records.value = response || []
  } catch (error: any) {
    init({
      message: error.message || t('medicalRecord.error.fetchFailed'),
      color: 'danger',
      duration: 3000,
    })
  } finally {
    isLoading.value = false
  }
}

const viewRecord = (record: MedicalRecordDTO) => {
  selectedRecord.value = record
  showModal.value = true
}

const handleDateChange = () => {
  if (startDate.value && endDate.value) {
    fetchMedicalRecords()
  }
}

onMounted(() => {
  // Set default date range to current month
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  startDate.value = firstDay.toISOString().split('T')[0]
  endDate.value = lastDay.toISOString().split('T')[0]

  fetchMedicalRecords()
})
</script>

<template>
  <div class="medical-records-container">
    <VaCard class="records-card">
      <div class="card-header">
        <div class="header-left">
          <div class="title-wrapper">
            <h1>{{ t('medicalRecord.title') }}</h1>
            <span class="total-badge">{{ records.length }}</span>
          </div>
          <p class="subtitle">{{ t('medicalRecord.subtitle') }}</p>
        </div>
        <div class="header-right">
          <div class="date-filters">
            <VaDateInput
              v-model="startDate"
              :placeholder="t('medicalRecord.dateRange.from')"
              class="date-input"
              @update:modelValue="handleDateChange"
            />
            <VaDateInput
              v-model="endDate"
              :placeholder="t('medicalRecord.dateRange.to')"
              class="date-input"
              @update:modelValue="handleDateChange"
            />
          </div>
        </div>
      </div>

      <div class="table-container custom-scrollbar">
        <div class="timeline">
          <div v-if="isLoading" class="loading-overlay">
            <VaSpinner />
          </div>

          <div v-else-if="records.length === 0" class="no-records">
            <i class="fas fa-folder-open"></i>
            <p>{{ t('medicalRecord.noRecords') }}</p>
          </div>

          <template v-else>
            <div v-for="record in records" :key="record.recordId" class="timeline-item">
              <div class="timeline-point">
                <div class="point"></div>
                <div class="line"></div>
              </div>

              <div class="timeline-content" @click="viewRecord(record)">
                <div class="timeline-date">
                  <i class="fas fa-calendar"></i>
                  {{ formatDate(record.date) }}
                </div>

                <div class="timeline-card">
                  <div class="card-header">
                    <div class="header-left">
                      <h3 class="patient-name">{{ record.patientName }}</h3>
                    </div>
                    <div class="header-right">
                      <span class="dentist">
                        <i class="fas fa-user-md"></i>
                        Dr. {{ record.dentistName }}
                      </span>
                    </div>
                  </div>

                  <div class="card-body">
                    <div class="treatment-tags">
                      <template v-for="(diagnosis, diagIndex) in record.diagnosis" :key="diagIndex">
                        <span
                          v-for="condition in diagnosis.teethConditions"
                          :key="`${diagIndex}-${condition}`"
                          class="treatment-tag"
                        >
                          {{ condition }}
                        </span>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </VaCard>

    <!-- Medical Record Details Modal -->
    <VaModal v-model="showModal" size="large" hide-default-actions class="medical-record-modal">
      <template v-if="selectedRecord">
        <div class="detail-modal">
          <!-- Header Section -->
          <div class="detail-header">
            <div class="patient-info">
              <div class="patient-avatar">
                <i class="fas fa-user-circle"></i>
              </div>
              <div class="info-main">
                <h2>{{ selectedRecord.patientName }}</h2>
                <div class="info-meta">
                  <span class="meta-item">
                    <i class="fas fa-user-md"></i>
                    Dr. {{ selectedRecord.dentistName }}
                  </span>
                  <span class="meta-item">
                    <i class="fas fa-calendar"></i>
                    {{ formatDate(selectedRecord.date) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Content Section -->
          <div class="detail-content custom-scrollbar">
            <!-- Basic Examination Section -->
            <div class="detail-section">
              <div class="section-header">
                <div class="header-icon">
                  <i class="fas fa-clipboard-check"></i>
                </div>
                <h3>{{ t('medicalRecord.basicExamination.title') }}</h3>
              </div>
              <div class="section-content">
                <div class="info-grid">
                  <div class="info-label">{{ t('medicalRecord.basicExamination.result') }}</div>
                  <div class="info-value">{{ selectedRecord.basicExamination.examinationContent }}</div>

                  <div class="info-label">{{ t('medicalRecord.basicExamination.treatmentPlan') }}</div>
                  <div class="info-value">{{ selectedRecord.basicExamination.treatmentPlanNote }}</div>
                </div>
              </div>
            </div>

            <!-- Diagnosis Section -->
            <div class="detail-section">
              <div class="section-header">
                <div class="header-icon">
                  <i class="fas fa-stethoscope"></i>
                </div>
                <h3>{{ t('medicalRecord.diagnosis.title') }}</h3>
              </div>
              <div class="section-content">
                <DiagnosisDentalChart :diagnosis="selectedRecord.diagnosis" />

                <div class="info-grid">
                  <div class="info-label">{{ t('medicalRecord.diagnosis.affectedTeeth') }}</div>
                  <div class="info-value">
                    <div v-for="(diagnosis, index) in selectedRecord.diagnosis" :key="index" class="tooth-diagnosis">
                      <span class="tooth-number">
                        <i class="fas fa-tooth"></i>
                        #{{ diagnosis.toothNumber }}
                      </span>
                      <div class="conditions-list">
                        <span v-for="condition in diagnosis.teethConditions" :key="condition" class="condition-tag">
                          {{ condition }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Treatment Indications Section -->
            <div class="detail-section">
              <div class="section-header">
                <div class="header-icon">
                  <i class="fas fa-list-ul"></i>
                </div>
                <h3>{{ t('medicalRecord.treatment.title') }}</h3>
              </div>
              <div class="section-content">
                <div class="info-grid">
                  <div class="info-label">{{ t('medicalRecord.treatment.types') }}</div>
                  <div class="info-value">
                    <div class="indications-list">
                      <span v-for="type in selectedRecord.indication.indicationType" :key="type" class="indication-tag">
                        {{ type }}
                      </span>
                    </div>
                  </div>

                  <div class="info-label">{{ t('medicalRecord.treatment.description') }}</div>
                  <div class="info-value">{{ selectedRecord.indication.description }}</div>

                  <template v-if="selectedRecord.indicationImages?.length">
                    <div class="info-label">{{ t('medicalRecord.treatment.images') }}</div>
                    <div class="info-value">
                      <div class="images-grid">
                        <div v-for="(image, index) in selectedRecord.indicationImages" :key="index" class="image-item">
                          <img :src="image.imageUrl" :alt="image.imageType" />
                          <span class="image-type">{{ image.imageType }}</span>
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </VaModal>
  </div>
</template>

<style scoped>
/* Base container */
.medical-records-container {
  padding: 2rem;
  background: var(--va-background-primary);
  min-height: 100vh;
}

/* Main card */
.records-card {
  border-radius: 20px;
  background: var(--va-background-secondary);
  box-shadow: var(--va-box-shadow);
  overflow: hidden;
  border: 1px solid var(--va-border-color);
}

/* Card header */
.card-header {
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid var(--va-border-color);
  background: var(--va-background-secondary);
}

.header-left h1 {
  margin: 0;
  font-size: 1.8rem;
  color: var(--va-text-primary);
}

.subtitle {
  color: var(--va-text-secondary);
  margin: 0.5rem 0 0;
}

.date-filters {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--va-background-primary);
  padding: 0.75rem;
  border-radius: 12px;
  border: 1px solid var(--va-border-color);
}

.table-container {
  max-height: calc(100vh - 350px);
  overflow-y: auto;
  margin: 0 2rem 2rem;
  border-radius: 12px;
  position: relative;
}

.timeline {
  position: relative;
  padding: 2rem;
}

.timeline-item {
  display: flex;
  margin-bottom: 2rem;
  position: relative;
  animation: fadeIn 0.5s ease-out forwards;
  animation-delay: calc(var(--index) * 0.1s);
}

.timeline-point {
  position: relative;
  width: 40px;
  margin-right: 2rem;
}

.point {
  width: 16px;
  height: 16px;
  background: var(--va-primary);
  border-radius: 50%;
  position: relative;
  z-index: 2;
}

.line {
  position: absolute;
  top: 16px;
  left: 7px;
  width: 2px;
  height: calc(100% + 2rem);
  background: var(--va-background-primary);
}

.timeline-item:last-child .line {
  display: none;
}

.timeline-content {
  flex: 1;
  cursor: pointer;
}

.timeline-date {
  margin-bottom: 0.5rem;
  color: var(--va-text-secondary);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.timeline-card {
  background: var(--va-background-secondary);
  border-radius: 20px;
  box-shadow: var(--va-box-shadow);
  transition: all 0.3s ease;
  border: 1px solid var(--va-border-color);
  cursor: pointer;
}

.timeline-card:hover {
  transform: translateX(8px);
  box-shadow: var(--va-box-shadow-lg);
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--va-border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.patient-name {
  margin: 0;
  font-size: 1.1rem;
  color: var(--va-text-primary);
}

.dentist {
  color: var(--va-text-secondary);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-body {
  padding: 1.5rem;
}

.treatment-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0;
}

.treatment-tag,
.condition-tag,
.indication-tag {
  background: var(--va-background-primary);
  color: var(--va-text-primary);
  padding: 0.6rem 1.2rem;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 500;
  border: 1px solid var(--va-border-color);
  transition: all 0.3s ease;
}

.treatment-tag:hover,
.condition-tag:hover,
.indication-tag:hover {
  transform: translateY(-2px);
  background: var(--va-background-secondary);
}

.loading-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  background: var(--va-background-secondary);
}

.no-records {
  text-align: center;
  padding: 3rem;
  color: var(--va-text-secondary);
  background: var(--va-background-secondary);
}

.no-records i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--va-text-secondary);
}

/* Custom scrollbar */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: var(--va-scrollbar-thumb) var(--va-scrollbar-track);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: var(--va-scrollbar-track);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--va-scrollbar-thumb);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: var(--va-scrollbar-thumb-hover);
}

.custom-scrollbar {
  scroll-behavior: smooth;
}

.detail-modal {
  background: var(--va-background-primary);
}

.detail-header {
  background: var(--va-primary);
  padding: 2.5rem;
  color: white;
  border-radius: 20px 20px 40px 40px;
}

.patient-info {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.patient-avatar {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
}

.info-main h2 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
  color: white;
}

.info-meta {
  margin-top: 0.5rem;
  display: flex;
  gap: 1.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
}

.detail-content {
  padding: 2rem;
  max-height: calc(85vh - 200px);
  overflow-y: auto;
  background: var(--va-background-primary);
}

.detail-section {
  background: var(--va-background-secondary);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--va-box-shadow);
  border: 1px solid var(--va-border-color);
  transition: all 0.3s ease;
}

.detail-section:hover {
  transform: translateX(8px);
  box-shadow: var(--va-box-shadow-lg);
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--va-border-color);
}

.header-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--va-primary);
  color: white;
  margin-right: 1rem;
}

.section-header h3 {
  color: var(--va-text-primary);
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.tooth-info {
  margin-bottom: 1rem;
}

.tooth-number {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--va-primary);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.conditions-list,
.indications-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.condition-tag,
.indication-tag {
  background: #f3f4f6;
  color: #4b5563;
  padding: 0.6rem 1.2rem;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow:
    3px 3px 8px rgba(0, 0, 0, 0.05),
    -3px -3px 8px rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

.indication-desc {
  color: #475569;
  line-height: 1.6;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modern-table :deep(.va-data-table__loading) {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
}

/* Thêm styles mới cho layout grid */
.info-grid {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 1rem;
  align-items: start;
}

.info-label {
  color: var(--va-text-secondary);
  font-weight: 500;
  font-size: 0.95rem;
  padding: 0.5rem 0;
}

.info-value {
  color: var(--va-text-primary);
  font-size: 0.95rem;
  line-height: 1.6;
  padding: 0.5rem;
  background: var(--va-background-primary);
  border-radius: 8px;
  border: 1px solid var(--va-border-color);
}

.detail-section {
  background: var(--va-background-secondary);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(99, 102, 241, 0.1);
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #f3f4f6;
}

.header-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eef2ff;
  color: #6366f1;
  margin-right: 1rem;
}

.section-header h3 {
  color: var(--va-text-primary);
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.tooth-number {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #eef2ff;
  color: #6366f1;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 500;
}

.conditions-list,
.indications-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.condition-tag,
.indication-tag {
  background: var(--va-background-secondary);
  color: var(--va-text-primary);
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.9rem;
  border: 1px solid var(--va-border-color);
}

/* Cập nhật scrollbar styles */
.detail-content {
  padding: 1.5rem;
  max-height: calc(85vh - 200px);
  overflow-y: auto;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f3f4f6;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Add these new styles */
.tooth-diagnosis {
  margin-bottom: 1rem;
  padding: 1rem;
  background: var(--va-background-secondary);
  border-radius: 8px;
  border: 1px solid rgba(99, 102, 241, 0.1);
}

.tooth-diagnosis:last-child {
  margin-bottom: 0;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.image-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.image-item img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.image-type {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.5rem;
  font-size: 0.875rem;
  text-align: center;
}

/* Update existing styles */
.tooth-number {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--va-background-secondary);
  color: #6366f1;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.conditions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* Thêm styles mới */
.title-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.total-badge {
  background: #eef2ff;
  color: #6366f1;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 1rem;
  font-weight: 600;
}

/* Responsive Styles */
@media screen and (max-width: 1200px) {
  .card-header {
    flex-direction: column;
    gap: 1rem;
  }

  .header-right {
    width: 100%;
  }

  .date-filters {
    width: 100%;
    justify-content: space-between;
  }
}

@media screen and (max-width: 768px) {
  .medical-records-container {
    padding: 1rem;
  }

  .timeline {
    padding: 1rem;
  }

  .timeline-point {
    width: 30px;
    margin-right: 1rem;
  }

  .timeline-card {
    width: 100%;
  }

  .card-header {
    padding: 1rem;
  }

  .treatment-tags {
    gap: 0.25rem;
  }

  .treatment-tag {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }

  .detail-header {
    padding: 1.5rem;
  }

  .patient-info {
    gap: 1rem;
  }

  .patient-avatar {
    width: 60px;
    height: 60px;
    font-size: 2rem;
  }

  .info-main h2 {
    font-size: 1.5rem;
  }

  .info-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
}

@media screen and (max-width: 576px) {
  .date-filters {
    flex-direction: column;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .images-grid {
    grid-template-columns: 1fr;
  }

  .detail-content {
    padding: 1rem;
  }

  .detail-section {
    padding: 1rem;
  }

  .tooth-diagnosis {
    padding: 0.75rem;
  }
}
</style>
