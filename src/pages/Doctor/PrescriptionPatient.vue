<template>
  <div class="prescription-list">
    <h1>Prescription List</h1>

    <!-- Search by Date -->
    <div class="search-container">
      <label for="search-date">Search by Date:</label>
      <input id="search-date" v-model="searchDate" type="date" class="search-input" @change="filterByDate" />
    </div>

    <div v-if="filteredPrescriptions.length > 0">
      <ul class="prescription-grid">
        <li
          v-for="(prescription, index) in paginatedPrescriptions"
          :key="index"
          class="prescription-card"
          @click="viewPrescriptionDetail(prescription)"
        >
          <p><strong>Doctor:</strong> {{ prescription.doctorName }}</p>
          <p><strong>Created on:</strong> {{ prescription.createDate }}</p>
        </li>
      </ul>
      <div class="pagination">
        <button :disabled="currentPage === 1" class="pagination-btn" @click="prevPage">Previous</button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button :disabled="currentPage === totalPages" class="pagination-btn" @click="nextPage">Next</button>
      </div>
    </div>
    <div v-else>
      <p>No prescriptions found</p>
    </div>

    <!-- Popup Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button class="close-btn" @click="closeModal">✕</button>
        <h2 class="modal-title">Prescription Details</h2>
        <div class="prescription-details">
          <p><strong>Date:</strong> {{ selectedPrescription?.createDate }}</p>
          <p><strong>Doctor:</strong> {{ selectedPrescription?.doctorName }}</p>
          <p><strong>Patient:</strong> {{ selectedPrescription?.patientName }}</p>
          <p><strong>Notes:</strong> {{ selectedPrescription?.notes }}</p>
          <h3 class="medicine-section-title">Prescribed Medicines</h3>
          <div v-for="(item, index) in selectedPrescription?.items" :key="index" class="medicine-card">
            <div class="medicine-info">
              <p class="medicine-name">{{ item.medicineName }}</p>
              <p class="medicine-details">{{ item.dosage }} - {{ item.frequency }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useDoctorProfileStore } from '@/stores/modules/doctor.module'
import { useAuthStore } from '@/stores/modules/auth.module'

interface PrescriptionItem {
  medicineName: string
  dosage: string
  frequency: string
}

interface Prescription {
  id: string
  createDate: string
  doctorName: string
  patientName: string
  notes: string
  items: PrescriptionItem[]
}

export default defineComponent({
  setup() {
    const store = useDoctorProfileStore()
    const authStore = useAuthStore()

    const prescriptions = ref<Prescription[]>([])
    const filteredPrescriptions = ref<Prescription[]>([])
    const selectedPrescription = ref<Prescription | null>(null)
    const searchDate = ref<string | null>(null)
    const showModal = ref(false)
    const currentPage = ref(1)
    const itemsPerPage = 5

    const fetchPrescriptions = async (userId: string) => {
      try {
        const response = await store.getPrescriptionDetailByPatient(userId)
        prescriptions.value = response
        filteredPrescriptions.value = response
      } catch (error) {
        console.error('Error fetching prescriptions:', error)
      }
    }

    const totalPages = computed(() => Math.ceil(filteredPrescriptions.value.length / itemsPerPage))

    const paginatedPrescriptions = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage
      const end = start + itemsPerPage
      return filteredPrescriptions.value.slice(start, end)
    })

    const prevPage = () => {
      if (currentPage.value > 1) currentPage.value--
    }

    const nextPage = () => {
      if (currentPage.value < totalPages.value) currentPage.value++
    }

    const filterByDate = () => {
      if (searchDate.value) {
        filteredPrescriptions.value = prescriptions.value.filter((prescription) => {
          // Chuyển đổi createDate về định dạng 'YYYY-MM-DD'
          const formattedDate = new Date(prescription.createDate).toISOString().split('T')[0]
          return formattedDate === searchDate.value
        })
        currentPage.value = 1 // Reset lại trang đầu tiên
      } else {
        filteredPrescriptions.value = prescriptions.value
      }
    }

    const viewPrescriptionDetail = (prescription: Prescription) => {
      selectedPrescription.value = prescription
      showModal.value = true
    }

    const closeModal = () => {
      selectedPrescription.value = null
      showModal.value = false
    }

    onMounted(() => {
      const userId = authStore.user?.id
      if (userId) {
        fetchPrescriptions(userId)
      } else {
        console.error('No user ID found in auth store')
      }
    })

    return {
      prescriptions,
      filteredPrescriptions,
      selectedPrescription,
      searchDate,
      showModal,
      currentPage,
      totalPages,
      paginatedPrescriptions,
      viewPrescriptionDetail,
      closeModal,
      prevPage,
      nextPage,
      filterByDate,
    }
  },
})
</script>

<style scoped>
.prescription-list {
  padding: 20px;
  background-color: #ffffff;
  border: 1px solid #e6e6e6;
  border-radius: 10px;
  max-width: 2000px;
  margin: auto;
  font-family: Arial, sans-serif;
}

.prescription-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.prescription-card {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
  transition: transform 0.2s ease;
  cursor: pointer;
}

.prescription-card:hover {
  transform: scale(1.02);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: #ffffff;
  padding: 30px;
  border-radius: 10px;
  width: 600px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.medicine-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.medicine-name {
  font-weight: bold;
}
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.pagination-btn {
  margin: 0 10px;
  padding: 10px 20px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.pagination-btn:disabled {
  background-color: #cccccc;
}
.search-container {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
}

.prescription-list {
  padding: 20px;
  background-color: #ffffff;
  border: 1px solid #e6e6e6;
  border-radius: 10px;
  max-width: 1200px;
  margin: auto;
  font-family: Arial, sans-serif;
}

.prescription-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.prescription-card {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
  transition: transform 0.2s ease;
  cursor: pointer;
}

.prescription-card:hover {
  transform: scale(1.02);
}
/* Overlay styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Modal styling */
.modal-content {
  background-color: #f9fcff;
  padding: 30px;
  border-radius: 12px;
  width: 600px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  position: relative;
  font-family: 'Arial', sans-serif;
}

.modal-title {
  color: #007bff;
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: bold;
}

/* Close button styling */
.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #ff4c4c;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  font-size: 18px;
  cursor: pointer;
}

.close-btn:hover {
  background-color: #ff1c1c;
}

/* Prescription details styling */
.prescription-details p {
  margin: 10px 0;
  font-size: 16px;
  color: #333;
}

.medicine-section-title {
  margin-top: 20px;
  margin-bottom: 10px;
  font-size: 20px;
  color: #0056b3;
  border-bottom: 2px solid #007bff;
  padding-bottom: 5px;
}

/* Medicine card styling */
.medicine-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  margin: 10px 0;
  background-color: #eaf3ff;
  border-radius: 8px;
  border: 1px solid #b3d7ff;
}

.medicine-info {
  display: flex;
  flex-direction: column;
}

.medicine-name {
  font-weight: bold;
  font-size: 16px;
  color: #004085;
}

.medicine-details {
  font-size: 14px;
  color: #555;
}
</style>
