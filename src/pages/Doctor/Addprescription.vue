<template>
  <VaCard class="prescription-form">
    <h1 class="form-title">Prescription</h1>
    <VaForm class="form" @submit.prevent="submitPrescription">
      <VaCard class="medicines-section">
        <h2>Medicines</h2>
        <VaCard v-for="(item, index) in prescription.itemRequests" :key="index" class="medicine-item">
          <div class="medicine-header">
            <h3>Medicine #{{ index + 1 }}</h3>
            <button type="button" class="remove-button" @click="removeItem(index)">✕ Remove</button>
          </div>
          <VaCard class="medicine-fields">
            <div class="form-group">
              <label>Medicine Name</label>
              <VaInput v-model="item.medicineName" type="text" required placeholder="e.g., Paracetamol" />
            </div>
            <div class="form-group">
              <label>Dosage</label>
              <VaInput v-model="item.dosage" type="text" required placeholder="e.g., 500mg" />
            </div>
            <div class="form-group">
              <label>Frequency</label>
              <VaInput v-model="item.frequency" type="text" required placeholder="e.g., Twice a day" />
            </div>
          </VaCard>
        </VaCard>
        <button type="button" class="add-button" @click="addItem">+ Add Medicine</button>
      </VaCard>

      <div class="form-group">
        <label for="notes">Notes</label>
        <VaTextarea
          id="notes"
          v-model="prescription.notes"
          :autosize="true"
          style="
            height: auto;
            width: 850px;
            overflow: hidden;
            min-height: 50px; /* Chiều cao tối thiểu */
            resize: none; /* Vô hiệu hóa kéo thủ công */
          "
          required
          placeholder="Additional notes for the patient..."
        ></VaTextarea>
      </div>

      <button type="submit" class="submit-button">Save Prescription</button>
    </VaForm>

    <div v-if="isLoading" class="loading">Saving...</div>
    <div v-if="error" class="error">{{ error }}</div>
  </VaCard>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router' // Import router
import { useDoctorProfileStore } from '@/stores/modules/doctor.module'

export default defineComponent({
  setup() {
    const store = useDoctorProfileStore()
    const router = useRouter() // Khởi tạo router
    const route = useRoute() // Lấy thông tin từ route

    // Lấy treatmentID từ route params
    const treatmentID = (route.params.treatmentID as string) || ''

    // Tạo state prescription
    const prescription = ref({
      treatmentID, // Gán treatmentID từ router
      notes: '',
      itemRequests: [{ medicineName: '', dosage: '', frequency: '' }],
    })

    const isLoading = ref(false)
    const error = ref('')

    const addItem = () => {
      prescription.value.itemRequests.push({ medicineName: '', dosage: '', frequency: '' })
    }

    const removeItem = (index: number) => {
      prescription.value.itemRequests.splice(index, 1)
    }

    const submitPrescription = async () => {
      isLoading.value = true
      error.value = ''
      try {
        await store.addPrescription(prescription.value)
        alert('Prescription saved successfully!')
        router.push('/success') // Điều hướng sau khi thành công (nếu cần)
      } catch (err) {
        const errorMessage = (err as Error).message || 'An unknown error occurred'
        error.value = 'Failed to save prescription: ' + errorMessage
      } finally {
        isLoading.value = false
      }
    }

    return {
      prescription,
      isLoading,
      error,
      addItem,
      removeItem,
      submitPrescription,
    }
  },
})
</script>

<style scoped>
.prescription-form {
  max-width: 900px;
  margin: 40px auto;
  padding: 30px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background-color: #f9f9f9;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  font-family: 'Arial', sans-serif;
}

.form-title {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 30px;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #2c3e50;
}

.form-input {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  border-color: #3498db;
  outline: none;
  box-shadow: 0 0 5px rgba(52, 152, 219, 0.3);
}

.medicines-section {
  margin-top: 30px;
}

.medicine-item {
  padding: 15px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #ffffff;
}

.medicine-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.remove-button {
  background-color: #e74c3c;
  color: #fff;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.remove-button:hover {
  background-color: #c0392b;
}

.add-button {
  background-color: #27ae60;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  margin-top: 20px;
  display: block;
  margin-left: auto;
}

.add-button:hover {
  background-color: #229954;
}

.submit-button {
  background-color: #3498db;
  color: white;
  padding: 14px 20px;
  font-size: 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  width: 100%;
}

.submit-button:hover {
  background-color: #2980b9;
}

.loading {
  text-align: center;
  font-size: 16px;
  color: #7f8c8d;
  margin-top: 20px;
}

.error {
  color: #e74c3c;
  text-align: center;
  margin-top: 20px;
}
</style>
