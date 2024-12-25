<template>
  <div class="dashboard-staff">
    <!-- Top Stats Cards -->
    <div class="stats-container mb-6">
      <VaCard class="stats-card">
        <VaCardContent>
          <div class="stats-header">Total Appointments</div>
          <div class="stats-value-container">
            <span class="stats-number">{{ totalAppointments }}</span>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard class="stats-card">
        <VaCardContent>
          <div class="stats-header">New Contacts</div>
          <div class="stats-value-container">
            <span class="stats-number">{{ newContacts }}</span>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard class="stats-card">
        <VaCardContent>
          <div class="stats-header">Pending Payments</div>
          <div class="stats-value-container">
            <span class="stats-number">{{ pendingPayments }}</span>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard class="stats-card">
        <VaCardContent>
          <div class="stats-header">Total Doctors</div>
          <div class="stats-value-container">
            <span class="stats-number">{{ totalDoctors }}</span>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard class="stats-card">
        <VaCardContent>
          <div class="stats-header">Total Patients</div>
          <div class="stats-value-container">
            <span class="stats-number">{{ totalPatients }}</span>
          </div>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Upcoming Appointments -->
    <div class="dashboard-bottom mt-6">
      <VaCard class="appointments-card">
        <VaCardTitle>Upcoming Appointments</VaCardTitle>
        <VaCardContent>
          <div class="appointments-grid">
            <div v-for="day in weekDays" :key="day.name" class="day-column">
              <div class="day-header">
                <h3 class="day-name">{{ day.name }}</h3>
                <span class="day-date">{{ day.date }}</span>
              </div>
              <div class="appointments-list">
                <div v-if="day.appointments && day.appointments.length > 0" class="appointment-items">
                  <div v-for="apt in day.appointments" :key="apt.id" class="appointment-item">
                    <span class="appointment-time">{{ apt.time }}</span>
                    <span class="appointment-patient">{{ apt.patientName }}</span>
                  </div>
                </div>
                <div v-else class="no-appointments">No Appointments</div>
              </div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import appointmentService from '@/services/appointment.service'
import { useDoctorProfileStore } from '@/stores/modules/doctor.module'
import { usePaymentStore } from '@/stores/modules/payment.module'
import { useUserProfileStore } from '@/stores/modules/user.module'

// Create an instance of the store
const doctorStore = useDoctorProfileStore()
const paymentStore = usePaymentStore()
const userStore = useUserProfileStore()

// Define interfaces for the data
interface Appointment {
  id: number
  time: string
  patientName: string
  date: string
  status: string
}

interface DaySchedule {
  name: string
  date: string
  appointments: Appointment[]
}
// Reactive variables for dashboard data
const totalAppointments = ref(0)
const newContacts = ref(0)
const pendingPayments = ref(0)
const totalDoctors = ref(0)
const totalPatients = ref(0)
const weekDays = ref<DaySchedule[]>([])

// Helper function to format appointments into weekly schedule
const formatWeeklySchedule = (appointments: any) => {
  const today = new Date()
  const weekDaysData: DaySchedule[] = []

  // Ensure appointments is an array and handle nested data structure
  const appointmentsArray = Array.isArray(appointments)
    ? appointments
    : Array.isArray(appointments?.data)
      ? appointments.data
      : []

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(today)
    currentDate.setDate(today.getDate() + i)

    const dayData: DaySchedule = {
      name: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
      date: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      appointments: appointmentsArray
        .filter(
          (apt: any) =>
            apt?.appointmentDate && new Date(apt.appointmentDate).toDateString() === currentDate.toDateString(),
        )
        .map((apt: any) => ({
          id: apt.id || 0,
          time: apt.appointmentDate
            ? new Date(apt.appointmentDate).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '',
          patientName: apt.patientName || 'Unknown',
          date: apt.appointmentDate || '',
          status: apt.status || '',
        })),
    }
    weekDaysData.push(dayData)
  }
  return weekDaysData
}

// Fetch data on component mount
onMounted(async () => {
  // Fetch appointments
  try {
    const appointments = await appointmentService.listAppointments() // Đây đã là mảng
    console.log('Appointments:', appointments) // Kiểm tra xem appointments có dữ liệu không

    totalAppointments.value = Array.isArray(appointments) ? appointments.length : 0 // Đảm bảo là mảng
    weekDays.value = formatWeeklySchedule(appointments)
  } catch (error) {
    console.error('Error fetching appointments:', error)
    totalAppointments.value = 0
    weekDays.value = formatWeeklySchedule([])
  }

  // Set default values for now
  newContacts.value = 0
  totalDoctors.value = 0
  totalPatients.value = 0
  pendingPayments.value = 0

  // Fetch total doctors
  try {
    const doctors = await doctorStore.getDoctors({ isActive: true })
    totalDoctors.value = doctors.length || 0
  } catch (error) {
    console.error('Error fetching doctors:', error)
    totalDoctors.value = 0
  }

  // Fetch total patients
  try {
    const patients = await userStore.getAllPatients({ pageNumber: 1, pageSize: 20, isActive: true })
    totalPatients.value = patients.data.length
  } catch (error) {
    console.error('Error fetching patients:', error)
    totalPatients.value = 0
  }

  // Fetch pending payments with filter, page, limit, and date range
  try {
    const filter = { page: 1, limit: 500 } // Example pagination filter, adjust as needed
    const startDate = '2024-01-01' // Start date for payments filter (example)
    const endDate = '2024-12-31' // End date for payments filter
    // Adjusted filter to match PaginationFilter type
    const adjustedFilter = { pageNumber: filter.page, pageSize: filter.limit }
    // Call store action with adjusted filter, startDate, and endDate
    const response = await paymentStore.getAllPayments(adjustedFilter, startDate, endDate)
    pendingPayments.value = response.data.length || 0
  } catch (error) {
    console.error('Error fetching payments:', error)
    pendingPayments.value = 0 // Default value in case of error
  }
})
</script>

<style scoped>
.dashboard-staff {
  padding: 24px;
  background-color: #f8f9fa;
}

/* Stats Cards Styling */
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stats-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  overflow: hidden;
  border-top: 4px solid #4caf50; /* Default color */
}

.stats-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.stats-header {
  color: #4a4a4a;
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 12px;
}

.stats-value-container {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.stats-number {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(45deg, #333, #666);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Appointments Section */
.appointments-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.appointments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  padding: 20px;
}

.day-column {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  transition: transform 0.2s;
}

.day-column:hover {
  transform: translateY(-2px);
}

.day-header {
  text-align: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e9ecef;
}

.day-name {
  font-size: 18px;
  font-weight: 600;
  color: #2196f3;
  margin-bottom: 4px;
}

.day-date {
  font-size: 14px;
  color: #666;
}

.appointment-item {
  background: white;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s;
  border-left: 4px solid #2196f3;
}

.appointment-item:hover {
  transform: scale(1.02);
}

.appointment-time {
  font-size: 14px;
  font-weight: 600;
  color: #2196f3;
  margin-bottom: 6px;
}

.appointment-patient {
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.no-appointments {
  text-align: center;
  color: #666;
  padding: 20px;
  font-style: italic;
}

/* Utility Classes */
.mb-6 {
  margin-bottom: 24px;
}
.mt-6 {
  margin-top: 24px;
}
</style>
