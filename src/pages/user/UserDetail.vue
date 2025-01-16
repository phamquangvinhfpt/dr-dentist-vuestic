<template>
  <VaCard class="user-detail">
    <VaInnerLoading :loading="loading" :size="60">
      <!-- Personal Information Section -->
      <VaCard class="section personal-info">
        <div class="header">
          <h2>{{ t('doctor.Professional_Information') }}</h2>
          <RouterLink :to="'/user-update/' + userId" class="edit-button">{{ t('doctor.edit') }}</RouterLink>
        </div>

        <VaCard class="card">
          <div class="profile-picture">
            <img v-if="user.imageUrl" :src="getSrcAvatar(user.imageUrl)" />
            <span v-else class="text-sm">No image available</span>
          </div>
          <VaCard class="details">
            <h3 class="name">{{ user.name }}</h3>
            <p class="username">@{{ user.userName }}</p>
            <p class="job">{{ user.jobTitle }}</p>
            <ul>
              <li>
                <strong>{{ t('doctor.email') }}:</strong>
                <a :href="'mailto:' + user.email">{{ user.email }}</a>
                <span v-if="user.emailStatus" class="status confirmed">{{ t('doctor.Confirmed') }}</span>
              </li>
              <li>
                <strong>{{ t('doctor.phone') }}:</strong>
                <a :href="'tel:' + user.phone">{{ user.phone }}</a>
              </li>
              <li>
                <strong>{{ t('doctor.address') }}:</strong> {{ user.address }}
              </li>
              <li>
                <strong>{{ t('doctor.birth_date') }}:</strong> {{ user.birthDate }}
              </li>
              <li>
                <strong>{{ t('doctor.gender') }}:</strong> {{ user.gender ? t('doctor.male') : t('doctor.female') }}
              </li>
            </ul>
          </VaCard>
        </VaCard>
      </VaCard>

      <!-- Account Status Section -->
      <VaCard class="section account-status">
        <h2>{{ t('doctor.Account_Status') }}</h2>
        <ul>
          <li>
            <strong>{{ t('doctor.Status') }}:</strong>
            <span v-if="user.status" class="status active">{{ t('doctor.Active') }}</span>
          </li>
          <li>
            <strong>{{ t('doctor.Email_Status') }}:</strong>
            <span v-if="user.emailStatus" class="status confirmed">{{ t('doctor.Confirmed') }}</span>
            <span v-else class="status not-confirmed">{{ t('doctor.UnConfirmed') }}</span>
          </li>
          <li>
            <strong>{{ t('doctor.Phone_Status') }}:</strong>
            <span v-if="user.phoneStatus" class="status confirmed">{{ t('doctor.Confirmed') }}</span>
            <span v-else class="status not-confirmed">{{ t('doctor.UnConfirmed') }}</span>
          </li>
        </ul>
      </VaCard>
    </VaInnerLoading>
    <VaButton class="btn-back" @click="$router.go(-1)"> {{ t('doctor.back') }} </VaButton>
  </VaCard>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserProfileStore } from '@/stores/modules/user.module'
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

const route = useRoute()
const userId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
const user = ref<User>({} as User)
const loading = ref(true)

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

onMounted(() => {
  getUserDetail()
})
</script>

<style scoped>
.user-detail {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background-color: #eaf3fc;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.section {
  margin-bottom: 20px;
  background: #ffffff;
  border: 1px solid #d0e3ff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
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
  border: 2px solid #007bff;
}

.details ul {
  list-style: none;
  padding: 0;
}

.edit-button {
  padding: 8px 16px;
  background-color: #007bff;
  text-decoration: none;
  border-radius: 4px;
  color: white;
  font-weight: bold;
}

.status {
  margin-left: 8px;
  padding: 4px 10px;
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

.status.not-confirmed {
  background-color: #f8d7da;
  color: #721c24;
}

.btn-back {
  display: block;
  margin: 20px auto 0;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  font-weight: bold;
  border-radius: 8px;
}
</style>
