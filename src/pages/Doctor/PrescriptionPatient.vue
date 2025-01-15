<template>
  <div class="prescription-details">
    <h1>Prescription Details</h1>
    <p class="created-date">
      Created on: <span>{{ prescription.createDate }}</span>
    </p>
    <p class="patient"><strong>Patient:</strong> {{ prescription.patientName }}</p>
    <p class="doctor"><strong>Doctor:</strong> {{ prescription.doctorName }} (ID: {{ prescription.doctorID }})</p>
    <p class="notes"><strong>Notes:</strong> {{ prescription.notes }}</p>

    <h2>Prescribed Medicines</h2>
    <div class="medicines-container">
      <div v-for="(item, index) in prescription.items" :key="index" class="medicine-item">
        <h3>{{ item.medicineName }}</h3>
        <p class="dosage">{{ item.dosage }}</p>
        <p class="frequency">{{ item.frequency }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router' // Import useRoute
import { useDoctorProfileStore } from '@/stores/modules/doctor.module'

interface PrescriptionItem {
  medicineName: string
  dosage: string
  frequency: string
}

interface Prescription {
  createDate: string
  patientID: string
  patientName: string
  doctorID: string
  doctorName: string
  notes: string
  items: PrescriptionItem[]
}

export default defineComponent({
  setup() {
    const store = useDoctorProfileStore()
    const route = useRoute() // Lấy thông tin route
    const prescription = ref<Prescription>({
      createDate: '',
      patientID: '',
      patientName: '',
      doctorID: '',
      doctorName: '',
      notes: '',
      items: [],
    })

    const fetchPrescriptionDetail = async (id: string) => {
      try {
        const response = await store.getPrescriptionDetailByPatient(id)
        prescription.value = response
      } catch (error) {
        console.error('Error fetching prescription details:', error)
      }
    }

    onMounted(() => {
      const prescriptionId = route.params.treatmentID as string // Lấy prescriptionId từ route params
      if (prescriptionId) {
        fetchPrescriptionDetail(prescriptionId)
      } else {
        console.error('No prescription ID found in route parameters')
      }
    })

    return {
      prescription,
    }
  },
})
</script>

<style scoped>
.prescription-details {
  padding: 20px;
  background-color: #ffffff;
  border: 1px solid #e6e6e6;
  border-radius: 10px;
  max-width: 600px;
  margin: auto;
  font-family: Arial, sans-serif;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
}

.created-date {
  font-size: 14px;
  color: #555;
}

.prescription-id {
  color: #4a90e2;
  font-weight: bold;
  margin-left: 5px;
}

.patient,
.doctor,
.notes {
  font-size: 16px;
  margin: 10px 0;
}

h2 {
  font-size: 18px;
  color: #444;
  margin-top: 20px;
}

.medicines-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.medicine-item {
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
}

.medicine-item h3 {
  font-size: 16px;
  color: #333;
  margin: 0;
}

.medicine-item .dosage {
  font-size: 14px;
  color: #666;
  margin: 5px 0;
}

.medicine-item .frequency {
  font-size: 14px;
  color: #888;
}
</style>
