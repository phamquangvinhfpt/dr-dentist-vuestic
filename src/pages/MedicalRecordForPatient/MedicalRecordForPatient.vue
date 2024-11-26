<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/modules/auth.module'
import { useMedicalRecordStore } from '@/stores/modules/medicalrecord1.module'
import type { MedicalRecordDTO } from './types'
import { useToast } from 'vuestic-ui'

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
      <VaCardTitle class="card-title">
        <i class="fas fa-notes-medical title-icon"></i>
        My Medical Records
      </VaCardTitle>

      <VaCardContent>
        <div class="date-filters">
          <VaDateInput
            v-model="startDate"
            label="Start Date"
            class="date-input"
            @update:modelValue="handleDateChange"
          />
          <VaDateInput v-model="endDate" label="End Date" class="date-input" @update:modelValue="handleDateChange" />
        </div>

        <VaDataTable
          :items="records"
          :loading="isLoading"
          :columns="[
            { key: 'patientCode', sortable: true, title: 'Patient Code' },
            { key: 'patientName', sortable: true, title: 'Patient Name' },
            { key: 'dentistName', sortable: true, title: 'Dentist' },
            { key: 'date', sortable: true, title: 'Date' },
            { key: 'actions', width: '100px', title: 'Actions' },
          ]"
          :hover="true"
          striped
          class="custom-table"
        >
          <template #cell(actions)="{ rowData }">
            <div class="action-buttons">
              <VaButton
                color="info"
                size="small"
                class="view-button"
                preset="primary"
                round
                @click="viewRecord(rowData as MedicalRecordDTO)"
              >
                <VaIcon name="visibility" />
              </VaButton>
            </div>
          </template>
        </VaDataTable>

        <div class="table-footer">
          <p class="record-count">Total Records: {{ records.length }}</p>
        </div>
      </VaCardContent>
    </VaCard>

    <VaModal v-model="showModal" title="Medical Record Details" size="large" hide-default-actions>
      <template v-if="selectedRecord">
        <div class="record-details">
          <div class="detail-section">
            <h3>Patient Information</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <strong>Patient Code:</strong>
                <span>{{ selectedRecord.patientCode }}</span>
              </div>
              <div class="detail-item">
                <strong>Patient Name:</strong>
                <span>{{ selectedRecord.patientName }}</span>
              </div>
              <div class="detail-item">
                <strong>Dentist:</strong>
                <span>{{ selectedRecord.dentistName }}</span>
              </div>
              <div class="detail-item">
                <strong>Date:</strong>
                <span>{{ selectedRecord.date }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Basic Examination</h3>
            <div class="detail-content">
              <div class="detail-item">
                <strong>Examination Content:</strong>
                <p>{{ selectedRecord.basicExamination.examinationContent }}</p>
              </div>
              <div class="detail-item">
                <strong>Treatment Plan:</strong>
                <p>{{ selectedRecord.basicExamination.treatmentPlanNote }}</p>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Diagnosis</h3>
            <div class="detail-content">
              <div class="detail-item">
                <strong>Tooth Number:</strong>
                <span>{{ selectedRecord.diagnosis.toothNumber }}</span>
              </div>
              <div class="detail-item">
                <strong>Teeth Conditions:</strong>
                <ul>
                  <li v-for="(condition, index) in selectedRecord.diagnosis.teethConditions" :key="index">
                    {{ condition }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Indication</h3>
            <div class="detail-content">
              <div class="detail-item">
                <strong>Indication Types:</strong>
                <ul>
                  <li v-for="(type, index) in selectedRecord.indication.indicationType" :key="index">
                    {{ type }}
                  </li>
                </ul>
              </div>
              <div class="detail-item">
                <strong>Description:</strong>
                <p>{{ selectedRecord.indication.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <VaButton color="primary" @click="showModal = false"> Close </VaButton>
        </div>
      </template>
    </VaModal>
  </div>
</template>

<style scoped>
.medical-records-container {
  padding: 2rem;
  background: linear-gradient(to bottom right, #f8f9fa 0%, #e9ecef 100%);
  min-height: 100vh;
}

.records-card {
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  background: white;
  transition: transform 0.3s ease;
}

.records-card:hover {
  transform: translateY(-5px);
}

.card-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #2c3e50;
  padding: 1.5rem;
  border-bottom: 2px solid #edf2f7;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.title-icon {
  color: var(--va-primary);
  font-size: 1.5rem;
}

.date-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.date-input {
  min-width: 200px;
}

.custom-table {
  margin-top: 1rem;
}

.custom-table :deep(th) {
  background-color: #f8fafc !important;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
}

.custom-table :deep(tr:hover) {
  background-color: #f1f5f9 !important;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.view-button {
  transition: all 0.2s ease;
  width: 40px !important;
  height: 40px !important;
  padding: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0396ff 0%, #42b0ff 100%);
  border: none;
  box-shadow: 0 2px 10px rgba(3, 150, 255, 0.2);
}

.view-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(3, 150, 255, 0.4);
  background: linear-gradient(135deg, #42b0ff 0%, #0396ff 100%);
}

.view-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(3, 150, 255, 0.4);
}

.view-button :deep(i) {
  font-size: 1.2rem;
  margin: 0;
}

.table-footer {
  display: flex;
  justify-content: flex-end;
  padding: 1rem 0;
  color: #64748b;
  font-size: 0.9rem;
}

.record-count {
  margin: 0;
  font-weight: 500;
}

.record-details {
  padding: 1rem;
}

.detail-section {
  margin-bottom: 2rem;
}

.detail-section h3 {
  color: var(--va-primary);
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #edf2f7;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.detail-item {
  margin-bottom: 1rem;
}

.detail-item strong {
  display: block;
  color: #4a5568;
  margin-bottom: 0.25rem;
}

.detail-item span,
.detail-item p {
  color: #2d3748;
}

.detail-item ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.detail-item ul li {
  padding: 0.25rem 0;
  color: #2d3748;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 1rem;
  border-top: 1px solid #edf2f7;
}
</style>
