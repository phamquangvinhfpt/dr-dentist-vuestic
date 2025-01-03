<template>
  <div class="user-detail">
    <h1>User Details</h1>

    <!-- Personal Information Section -->
    <div class="section personal-info">
      <div class="header">
        <h2>Personal Information</h2>
        <RouterLink to="/edit-user" class="edit-button">Edit User</RouterLink>
      </div>
      <div class="card">
        <div class="profile-picture">
          <img :src="getSrcAvatar(user.imageUrl) || defaultProfilePicture" alt="Profile Picture" />
        </div>
        <div class="details">
          <h3>{{ user.name }}</h3>
          <p class="username">@{{ user.userName }}</p>
          <p class="job">{{ user.jobTitle }}</p>
          <ul>
            <li>
              <strong>Email:</strong> <a :href="'mailto:' + user.email">{{ user.email }}</a>
              <span v-if="user.emailStatus" class="status confirmed">Confirmed</span>
            </li>
            <li>
              <strong>Phone:</strong> <a :href="'tel:' + user.phone">{{ user.phone }}</a>
              <span v-if="user.phoneStatus" class="status confirmed">Confirmed</span>
            </li>
            <li><strong>Address:</strong> {{ user.address }}</li>
            <li><strong>Born:</strong> {{ user.birthDate }}</li>
            <li><strong>Gender:</strong> {{ user.gender ? 'Male' : 'Female' }}</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Account Status Section -->
    <div class="section account-status">
      <h2>Account Status</h2>
      <ul>
        <li><strong>Status:</strong> <span v-if="user.status" class="status active">Active</span></li>
        <li><strong>Email Status:</strong> <span v-if="user.emailStatus" class="status confirmed">Confirmed</span></li>
        <li><strong>Phone Status:</strong> <span v-if="user.phoneStatus" class="status confirmed">Confirmed</span></li>
      </ul>
    </div>

    <!-- Activity History Section -->
    <div class="section activity-history">
      <h2>Activity History</h2>
      <div class="tabs">
        <button :class="{ active: showTransactionHistory }" @click="showTransactions">Transaction History</button>
        <button :class="{ active: !showTransactionHistory }" @click="showAppointments">Appointment History</button>
      </div>
      <div class="content">
        <div v-if="showTransactionHistory">
          <ul class="transactions">
            <li v-for="transaction in user.transactions" :key="transaction.id">
              <span class="type">{{ transaction.type }}</span>
              <span class="date">{{ transaction.date }}</span>
              <span class="amount" :class="transaction.amount > 0 ? 'positive' : 'negative'">
                {{ transaction.amount > 0 ? '+' : '' }}{{}}
              </span>
            </li>
          </ul>
        </div>
        <div v-else>
          <ul class="appointments">
            <li v-for="appointment in user.appointments" :key="appointment.id">
              <span class="details">{{ appointment.doctor }} - {{ appointment.specialty }}</span>
              <span class="date-time">{{ appointment.date }} at {{ appointment.time }}</span>
              <span class="status" :class="appointment.status.toLowerCase()">{{ appointment.status }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <VaButton
      class="w-full sm:w-auto mt-6 bg-gray-200 font-semibold py-1 px-3 rounded-lg shadow-md hover:bg-gray-300 transition-colors duration-200"
      @click="$router.go(-1)"
    >
      Quay Về
    </VaButton>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserProfileStore } from '@/stores/modules/user.module'
import { getSrcAvatar } from '@/services/utils'

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

const route = useRoute()
const userId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
const user = ref<User>({} as User)
const showTransactionHistory = ref(true)
const defaultProfilePicture = '/assets/default-profile.png'

const getUserDetail = async () => {
  const userStore = useUserProfileStore()
  try {
    const response = await userStore.getUserDetail(userId)

    user.value = {
      imageUrl: response.imageUrl || defaultProfilePicture,
      name: response.userName,
      userName: response.userName,
      jobTitle: response.job || '',
      email: response.email,
      emailStatus: response.emailConfirmed || false,
      phone: response.phoneNumber || '',
      phoneStatus: response.phoneNumberConfirmed || false,
      address: response.address || '',
      birthDate: response.birthDate || '',
      gender: response.gender || 'Unknown',
      status: response.isActive || false,
      transactions: response.transactions || [],
      appointments: response.appointments || [],
    }
  } catch (error) {
    console.error('Error fetching user details:', error)
  }
}

const showTransactions = () => {
  showTransactionHistory.value = true
}

const showAppointments = () => {
  showTransactionHistory.value = false
}

onMounted(() => {
  getUserDetail()
})
</script>

<style scoped>
.user-detail {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.section {
  margin-bottom: 20px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card {
  display: flex;
  gap: 16px;
}

.profile-picture img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.details ul {
  list-style: none;
  padding: 0;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.tabs button {
  padding: 10px 20px;
  border: none;
  background: #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
}

.tabs button.active {
  background: #007bff;
  color: #fff;
}

.transactions,
.appointments {
  list-style: none;
  padding: 0;
}

.transactions li,
.appointments li {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #ddd;
}

.edit-button {
  padding: 8px 16px;
  background-color: #007bff;
  color: #fff;
  text-decoration: none;
  border-radius: 4px;
}

.status {
  margin-left: 8px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  font-weight: bold;
}

.status.confirmed {
  background-color: #d4edda;
  color: #155724;
}

.status.active {
  background-color: #cce5ff;
  color: #004085;
}

.status.cancelled {
  background-color: #f8d7da;
  color: #721c24;
}
</style>
