<template>
  <VaCard class="bg-gray-50 min-h-screen py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <VaCard class="staff-detail-card">
        <!-- Header Section -->
        <div class="flex justify-end items-center mb-8 border-b pb-6">
          <RouterLink :to="'/user-update/' + userId" class="edit-link">
            <VaIcon name="edit" />
            <span class="ml-2">{{ t('doctor.edit') }}</span>
          </RouterLink>
        </div>

        <VaInnerLoading :loading="loading" :size="60">
          <!-- Profile Card -->
          <div class="profile-section mb-8">
            <VaCard class="flex flex-col md:flex-row gap-8">
              <!-- Profile Image -->
              <VaCard class="profile-image-container">
                <div class="profile-image">
                  <img v-if="user.imageUrl" :src="getSrcAvatar(user.imageUrl)" :alt="user.name" />
                  <div v-else class="placeholder-image">
                    <VaIcon name="person" size="large" />
                  </div>
                </div>
              </VaCard>

              <!-- Basic Info -->
              <VaCard class="flex-grow">
                <h2 class="text-2xl font-bold mb-2">{{ user.name }}</h2>
                <p class="text-blue-600 font-medium mb-4">{{ user.jobTitle }}</p>

                <VaCard class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <VaCard class="info-item">
                    <VaIcon name="email" color="primary" />
                    <VaCard>
                      <label>{{ t('doctor.email') }}</label>
                      <a :href="'mailto:' + user.email" class="info-value">{{ user.email }}</a>
                      <span v-if="user.emailStatus" class="verification-badge">
                        <VaIcon name="check_circle" size="small" />
                        {{ t('doctor.Confirmed') }}
                      </span>
                    </VaCard>
                  </VaCard>

                  <VaCard class="info-item">
                    <VaIcon name="phone" color="primary" />
                    <VaCard>
                      <label>{{ t('doctor.phone') }}</label>
                      <a :href="'tel:' + user.phone" class="info-value">{{ user.phone }}</a>
                      <span v-if="user.phoneStatus" class="verification-badge">
                        <VaIcon name="check_circle" size="small" />
                        {{ t('doctor.Confirmed') }}
                      </span>
                    </VaCard>
                  </VaCard>

                  <VaCard class="info-item">
                    <VaIcon name="location_on" color="primary" />
                    <div>
                      <label>{{ t('doctor.address') }}</label>
                      <span class="info-value">{{ user.address }}</span>
                    </div>
                  </VaCard>

                  <VaCard class="info-item">
                    <VaIcon name="cake" color="primary" />
                    <div>
                      <label>{{ t('doctor.birth_date') }}</label>
                      <span class="info-value">{{ user.birthDate }}</span>
                    </div>
                  </VaCard>

                  <VaCard class="info-item">
                    <VaIcon name="person" color="primary" />
                    <div>
                      <label>{{ t('doctor.gender') }}</label>
                      <span class="info-value">{{ user.gender ? t('doctor.male') : t('doctor.female') }}</span>
                    </div>
                  </VaCard>
                </VaCard>
              </VaCard>
            </VaCard>
          </div>

          <!-- Account Status Section -->
          <VaCard class="status-section">
            <h3 class="text-lg font-semibold mb-4">{{ t('doctor.Account_Status') }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <VaCard class="status-card" :class="{ active: user.status }">
                <VaIcon name="account_circle" />
                <VaCard>
                  <label>{{ t('doctor.Status') }}</label>
                  <span class="status">{{ user.status ? t('doctor.Active') : t('doctor.Inactive') }}</span>
                </VaCard>
              </VaCard>

              <VaCard class="status-card" :class="{ active: user.emailStatus }">
                <VaIcon name="email" />
                <div>
                  <label>{{ t('doctor.Email_Status') }}</label>
                  <span class="status">{{ user.emailStatus ? t('doctor.Confirmed') : t('doctor.UnConfirmed') }}</span>
                </div>
              </VaCard>

              <VaCard class="status-card" :class="{ active: user.phoneStatus }">
                <VaIcon name="phone" />
                <div>
                  <label>{{ t('doctor.Phone_Status') }}</label>
                  <span class="status">{{ user.phoneStatus ? t('doctor.Confirmed') : t('doctor.UnConfirmed') }}</span>
                </div>
              </VaCard>
            </div>
          </VaCard>
        </VaInnerLoading>

        <!-- History Tabs Section -->
        <VaCard class="mt-6">
          <VaCard class="tab-container">
            <VaTabs v-model="activeTab" class="custom-tabs">
              <VaTab name="appointments" class="custom-tab" :class="{ 'active-tab': activeTab === 'appointments' }">
                <div class="tab-content">
                  <VaIcon name="event" />
                  <span>{{ t('payment.Appointments_history') }}</span>
                  <div class="tab-badge">{{ totalAppointments }}</div>
                </div>
              </VaTab>
              <VaTab name="payments" class="custom-tab" :class="{ 'active-tab': activeTab === 'payments' }">
                <div class="tab-content">
                  <VaIcon name="payments" />
                  <span>{{ t('payment.history') }}</span>
                  <div class="tab-badge">{{ totalPayments }}</div>
                </div>
              </VaTab>
            </VaTabs>
          </VaCard>

          <!-- Appointments Tab -->
          <VaCard v-if="activeTab === 'appointments'" custom-tab active-tab>
            <VaInnerLoading :loading="appointmentsLoading">
              <div v-if="appointments.length > 0" class="space-y-4">
                <VaCard
                  v-for="appointment in paginatedAppointments"
                  :key="appointment.id"
                  class="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div class="flex justify-between items-start">
                    <div class="space-y-2">
                      <div class="flex items-center space-x-2">
                        <VaIcon name="event" color="primary" />
                        <span class="font-medium">{{ formatDate(appointment.appointmentDate) }}</span>
                        <span class="">{{ appointment.time }}</span>
                      </div>
                      <div class="flex items-center space-x-2">
                        <VaIcon name="medical_services" color="primary" />
                        <span class="">{{ appointment.serviceName }}</span>
                      </div>
                      <div class="flex items-center space-x-2">
                        <VaIcon name="person" color="primary" />
                        <span class="">{{ appointment.dentistName }}</span>
                      </div>
                    </div>
                  </div>
                </VaCard>
                <!-- Appointments Pagination -->
                <div v-if="totalAppointmentPages > 1" class="flex justify-center mt-6">
                  <VaPagination
                    v-model="appointmentPage"
                    :pages="totalAppointmentPages"
                    :visible-pages="5"
                    class="justify-center"
                  />
                </div>
              </div>
              <div v-else class="text-center py-8 text-gray-500">
                {{ t('payment.no_appointments') }}
              </div>
            </VaInnerLoading>
          </VaCard>

          <!-- Payments Tab -->
          <div v-if="activeTab === 'payments'">
            <VaInnerLoading :loading="paymentsLoading">
              <div v-if="payments.length" class="space-y-4">
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Service
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr v-for="payment in payments" :key="payment.id" class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ payment.serviceName }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {{ formatDate(payment.createdAt) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${{ payment.amount }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!-- Pagination -->
                <div class="flex justify-between items-center mt-4">
                  <div class="text-sm text-gray-700">
                    Showing {{ (currentPage - 1) * pageSize + 1 }} to
                    {{ Math.min(currentPage * pageSize, totalPayments) }} of {{ totalPayments }} entries
                  </div>
                  <VaPagination
                    v-model="currentPage"
                    :pages="totalPages"
                    :visible-pages="5"
                    class="pagination-nav"
                    @update:modelValue="getPayments"
                  />
                </div>
              </div>
              <div v-else class="text-center py-8 text-gray-500">No payment records found</div>
            </VaInnerLoading>
          </div>
        </VaCard>

        <!-- Back Button -->
        <div class="mt-8 text-center">
          <VaButton class="back-button" preset="secondary" @click="$router.go(-1)">
            <VaIcon name="arrow_back" />
            <span class="ml-2">{{ t('doctor.back') }}</span>
          </VaButton>
        </div>
      </VaCard>
    </div>
  </VaCard>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserProfileStore } from '@/stores/modules/user.module'
import { useAppointmentStore } from '@/stores/modules/appointment.module'
import { usePaymentStore } from '@/stores/modules/payment.module'
import { getSrcAvatar } from '@/services/utils'
import { VaCard } from 'vuestic-ui'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
interface User {
  imageUrl?: string
  name: string
  userName: string
  jobTitle: string
  email: string
  emailStatus: boolean
  phone: string
  phoneStatus: boolean
  address: string
  birthDate: string
  gender: boolean
  status: boolean
  appointments?: Array<{ medicalName: string[]; note: string }>
}

interface Appointment {
  id: string
  appointmentDate: string
  time: string
  serviceName: string
  dentistName: string
}

interface PaymentDTO {
  id: string
  createdAt: string
  amount: number
  status: string
  serviceName: string
  patientid: string
}

const route = useRoute()
const userId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
const user = ref<User>({} as User)
const loading = ref(true)
const appointmentStore = useAppointmentStore()
const appointments = ref<Appointment[]>([])
const appointmentsLoading = ref(false)
const appointmentPage = ref(1)
const appointmentsPerPage = ref(5)
const totalAppointments = ref(0)

const paymentStore = usePaymentStore()
const payments = ref<PaymentDTO[]>([])
const paymentsLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const totalPayments = ref(0)
const totalPages = computed(() => Math.ceil(totalPayments.value / pageSize.value))

const activeTab = ref('appointments')

const totalAppointmentPages = computed(() => Math.ceil(appointments.value.length / appointmentsPerPage.value))

const paginatedAppointments = computed(() => {
  const start = (appointmentPage.value - 1) * appointmentsPerPage.value
  const end = start + appointmentsPerPage.value
  return appointments.value.slice(start, end)
})

const getUserDetail = async () => {
  const userStore = useUserProfileStore()
  try {
    const response = await userStore.getUserDetail(userId)

    user.value = {
      imageUrl: response.imageUrl || '',
      name: response.userName,
      userName: response.userName,
      jobTitle: response.job || '',
      email: response.email,
      emailStatus: response.emailConfirmed || false,
      phone: response.phoneNumber || '',
      phoneStatus: response.phoneNumberConfirmed || false,
      address: response.address || '',
      birthDate: response.birthDate || '',
      gender: response.gender,
      status: response.isActive || false,
    }
  } catch (error) {
    console.error('Error fetching user details:', error)
  } finally {
    loading.value = false
  }
}

const getAppointments = async () => {
  try {
    appointmentsLoading.value = true
    const response = await appointmentStore.getAppointments({
      patientId: userId,
      page: appointmentPage.value,
      limit: appointmentsPerPage.value,
    })
    appointments.value = response.data || []
    totalAppointments.value = response.total || appointments.value.length
  } catch (error) {
    console.error('Error fetching appointments:', error)
  } finally {
    appointmentsLoading.value = false
  }
}

const getPayments = async () => {
  try {
    paymentsLoading.value = true
    const filter = {
      pageNumber: currentPage.value,
      pageSize: pageSize.value,
    }
    // Get first day of current month
    const startDate = new Date()
    startDate.setDate(1)
    startDate.setHours(0, 0, 0, 0)

    // Get last day of current month
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + 1)
    endDate.setDate(0)
    endDate.setHours(23, 59, 59, 999)

    const response = await paymentStore.getAllPayments(
      filter,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0],
    )
    payments.value = response.data
      .map((payment) => ({
        id: payment.paymentId,
        createdAt: payment.depositDate || new Date().toISOString(),
        amount: payment.totalAmount,
        status: payment.status.toString(),
        serviceName: payment.serviceName,
        patientid: payment.patientProfileId,
      }))
      .filter((payment) => payment.patientid === userId)
    console.log('paymentss', payments.value)
    totalPayments.value = payments.value.length
  } catch (error) {
    console.error('Error fetching payments:', error)
  } finally {
    paymentsLoading.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

onMounted(() => {
  getUserDetail()
  getAppointments()
  getPayments()
})

watch(appointmentPage, () => {
  getAppointments()
})

watch(activeTab, (newTab) => {
  if (newTab === 'payments') {
    getPayments()
  }
})
</script>

<style scoped>
.staff-detail-card {
  background: white;
  border-radius: 1rem;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.edit-link {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  color: var(--va-primary);
  font-weight: 500;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.edit-link:hover {
  background-color: rgba(var(--va-primary-rgb), 0.1);
  transform: translateY(-1px);
}

.profile-section {
  background: white;
  border-radius: 1rem;
  overflow: hidden;
}

.profile-image-container {
  position: relative;
  text-align: center;
}

.profile-image {
  width: 160px;
  height: 160px;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.profile-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-image {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #e6e9f0 0%, #eef1f5 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-indicator {
  position: absolute;
  bottom: -0.5rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.25rem 1rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  background: #f3f4f6;
  color: #6b7280;
}

.status-indicator.active {
  background: #dcfce7;
  color: #166534;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.75rem;
}

.info-item label {
  display: block;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.info-value {
  display: block;
  font-weight: 500;
}

.verification-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: #ecfdf5;
  color: #059669;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-section {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  margin-top: 2rem;
}

.status-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
}

.status-card.active {
  background: #18b948;
}

.status-card label {
  display: block;
  font-size: 0.875rem;
}

.status-card .status {
  display: block;
  font-weight: 500;
}

.tab-container {
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
  background: #f9fafb;
  border-radius: 0.5rem 0.5rem 0 0;
  padding: 0 1rem;
}

.custom-tabs {
  margin-bottom: -1px;
}

.custom-tab {
  padding: 1rem 1.5rem;
  position: relative;
  transition: all 0.3s ease;
  border-bottom: 2px solid transparent;
  min-width: 150px;
}

.tab-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
}

.active-tab {
  border-bottom: 2px solid var(--va-primary);
  background: white;
  color: var(--va-primary);
}

.tab-badge {
  background: var(--va-primary);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.custom-tab:hover:not(.active-tab) {
  background: #f3f4f6;
  border-bottom: 2px solid #e5e7eb;
}

:deep(.va-tabs__line) {
  display: none;
}

.back-button {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
}

.back-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .profile-image {
    width: 120px;
    height: 120px;
    margin: 0 auto;
  }

  .info-item {
    padding: 0.75rem;
  }

  .status-card {
    padding: 0.75rem;
  }
}
</style>
