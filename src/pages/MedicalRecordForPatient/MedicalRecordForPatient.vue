<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/modules/auth.module'
import { useMedicalRecordStore } from '@/stores/modules/medicalrecord1.module'
import type { MedicalRecordDTO } from './types'
import { useToast } from 'vuestic-ui'
import DiagnosisDentalChart from '@/components/DiagnosisDentalChart.vue'
//có gì xóa sau
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
      throw new Error('User not authenticated')
    }

    const formattedStartDate = formatDate(startDate.value)
    const formattedEndDate = formatDate(endDate.value)

    const response = await medicalRecordStore.getMedicalRecord(userId, formattedStartDate, formattedEndDate)
    records.value = response || []
  } catch (error: any) {
    init({
      message: error.message || 'Error fetching medical records',
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
            <h1>Medical Records</h1>
            <span class="total-badge">{{ records.length }}</span>
          </div>
          <p class="subtitle">View and manage your dental history</p>
        </div>
        <div class="header-right">
          <div class="date-filters">
            <VaDateInput
              v-model="startDate"
              placeholder="From"
              class="date-input"
              @update:modelValue="handleDateChange"
            />
            <VaDateInput v-model="endDate" placeholder="To" class="date-input" @update:modelValue="handleDateChange" />
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
            <p>No medical records found</p>
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
            <!-- Basic Examination Section - bao gồm cả Treatment Plan -->
            <div class="detail-section">
              <div class="section-header">
                <div class="header-icon">
                  <i class="fas fa-clipboard-check"></i>
                </div>
                <h3>Basic Examination</h3>
              </div>
              <div class="section-content">
                <div class="info-grid">
                  <div class="info-label">Examination Result:</div>
                  <div class="info-value">{{ selectedRecord.basicExamination.examinationContent }}</div>

                  <div class="info-label">Treatment Plan:</div>
                  <div class="info-value">{{ selectedRecord.basicExamination.treatmentPlanNote }}</div>
                </div>
              </div>
            </div>

            <!-- Diagnosis Section - giữ nguyên -->
            <div class="detail-section">
              <div class="section-header">
                <div class="header-icon">
                  <i class="fas fa-stethoscope"></i>
                </div>
                <h3>Diagnosis</h3>
              </div>
              <div class="section-content">
                <!-- Thêm dental chart, có gì sai thì xóa DiagnosisDentalChart -->
                <DiagnosisDentalChart :diagnosis="selectedRecord.diagnosis" />

                <!-- Giữ lại phần hiển thị danh sách -->
                <div class="info-grid">
                  <div class="info-label">Affected Teeth:</div>
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

            <!-- Treatment Indications Section - bao gồm cả Indication Images -->
            <div class="detail-section">
              <div class="section-header">
                <div class="header-icon">
                  <i class="fas fa-list-ul"></i>
                </div>
                <h3>Treatment Indications</h3>
              </div>
              <div class="section-content">
                <div class="info-grid">
                  <div class="info-label">Types:</div>
                  <div class="info-value">
                    <div class="indications-list">
                      <span v-for="type in selectedRecord.indication.indicationType" :key="type" class="indication-tag">
                        {{ type }}
                      </span>
                    </div>
                  </div>

                  <div class="info-label">Description:</div>
                  <div class="info-value">{{ selectedRecord.indication.description }}</div>

                  <!-- Thêm Indication Images vào đây nếu có -->
                  <template v-if="selectedRecord.indicationImages?.length">
                    <div class="info-label">Images:</div>
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
.medical-records-container {
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
}

.records-card {
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-header {
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #e2e8f0;
}

.header-left h1 {
  margin: 0;
  font-size: 1.8rem;
  color: #1e293b;
}

.subtitle {
  color: #64748b;
  margin: 0.5rem 0 0;
}

.date-filters {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #f8fafc;
  padding: 0.75rem;
  border-radius: 12px;
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
  background: #6366f1;
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
  background: #e2e8f0;
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
  color: #64748b;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.timeline-card {
  background: linear-gradient(145deg, #ffffff, #f3f4f6);
  border-radius: 20px;
  box-shadow:
    5px 5px 15px rgba(0, 0, 0, 0.05),
    -5px -5px 15px rgba(255, 255, 255, 0.8);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.timeline-card:hover {
  transform: translateX(8px);
  box-shadow:
    8px 8px 20px rgba(0, 0, 0, 0.08),
    -8px -8px 20px rgba(255, 255, 255, 0.9);
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.patient-name {
  margin: 0;
  font-size: 1.1rem;
  color: #1e293b;
}

.dentist {
  color: #64748b;
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
  background: linear-gradient(145deg, #f3f4f6, #ffffff);
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

.treatment-tag:hover,
.condition-tag:hover,
.indication-tag:hover {
  transform: translateY(-2px);
  box-shadow:
    4px 4px 10px rgba(0, 0, 0, 0.08),
    -4px -4px 10px rgba(255, 255, 255, 0.9);
}

.loading-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.no-records {
  text-align: center;
  padding: 3rem;
  color: #64748b;
}

.no-records i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* Custom scrollbar */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
}

.custom-scrollbar {
  scroll-behavior: smooth;
}

.detail-modal {
  background: #f8fafc;
}

.detail-header {
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
  padding: 2.5rem;
  color: white;
  border-radius: 0 0 40px 40px;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
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
  opacity: 0.9;
}

.detail-content {
  padding: 2rem;
  max-height: calc(85vh - 200px);
  overflow-y: auto;
}

.detail-section {
  background: linear-gradient(145deg, #ffffff, #f3f4f6);
  border-radius: 20px;
  padding: 1.8rem;
  margin-bottom: 1.8rem;
  box-shadow:
    5px 5px 15px rgba(0, 0, 0, 0.05),
    -5px -5px 15px rgba(255, 255, 255, 0.8);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.detail-section:hover {
  transform: translateX(8px);
  box-shadow:
    8px 8px 20px rgba(0, 0, 0, 0.08),
    -8px -8px 20px rgba(255, 255, 255, 0.9);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.section-header i {
  color: #6366f1;
  font-size: 1.25rem;
}

.section-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.2rem;
}

.tooth-info {
  margin-bottom: 1rem;
}

.tooth-number {
  background: #eef2ff;
  color: #6366f1;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
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
  background: linear-gradient(145deg, #f3f4f6, #ffffff);
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
  color: #6b7280;
  font-weight: 500;
  font-size: 0.95rem;
  padding: 0.5rem 0;
}

.info-value {
  color: #1f2937;
  font-size: 0.95rem;
  line-height: 1.6;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(99, 102, 241, 0.1);
}

.detail-section {
  background: white;
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
  color: #374151;
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
  background: #f3f4f6;
  color: #4b5563;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.9rem;
  border: 1px solid #e5e7eb;
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
  background: rgba(255, 255, 255, 0.5);
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
  background: #eef2ff;
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
</style>
