<template>
  <div class="bg-gray-50 min-h-screen py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <VaCard class="staff-detail-card">
        <!-- Header Section -->
        <div class="flex justify-end items-center mb-8 border-b pb-6">
          <RouterLink :to="'/user-update/' + userId" class="edit-link">
            <VaIcon name="edit" />
            <span class="ml-2">{{ t('doctor.Edit_staff') }}</span>
          </RouterLink>
        </div>

        <VaInnerLoading :loading="loading" :size="60">
          <!-- Profile Card -->
          <div class="profile-section mb-8">
            <div class="flex flex-col md:flex-row gap-8">
              <!-- Profile Image -->
              <div class="profile-image-container">
                <div class="profile-image">
                  <img v-if="user.imageUrl" :src="getSrcAvatar(user.imageUrl)" :alt="user.name" />
                  <div v-else class="placeholder-image">
                    <VaIcon name="person" size="large" />
                  </div>
                </div>
              </div>

              <!-- Basic Info -->
              <div class="flex-grow">
                <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ user.name }}</h2>
                <p class="text-blue-600 font-medium mb-4">{{ user.jobTitle }}</p>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="info-item">
                    <VaIcon name="email" color="primary" />
                    <div>
                      <label>{{ t('doctor.email') }}</label>
                      <a :href="'mailto:' + user.email" class="info-value">{{ user.email }}</a>
                      <span v-if="user.emailStatus" class="verification-badge">
                        <VaIcon name="check_circle" size="small" />
                        {{ t('doctor.Confirmed') }}
                      </span>
                    </div>
                  </div>

                  <div class="info-item">
                    <VaIcon name="phone" color="primary" />
                    <div>
                      <label>{{ t('doctor.phone') }}</label>
                      <a :href="'tel:' + user.phone" class="info-value">{{ user.phone }}</a>
                      <span v-if="user.phoneStatus" class="verification-badge">
                        <VaIcon name="check_circle" size="small" />
                        {{ t('doctor.Confirmed') }}
                      </span>
                    </div>
                  </div>

                  <div class="info-item">
                    <VaIcon name="location_on" color="primary" />
                    <div>
                      <label>{{ t('doctor.address') }}</label>
                      <span class="info-value">{{ user.address }}</span>
                    </div>
                  </div>

                  <div class="info-item">
                    <VaIcon name="cake" color="primary" />
                    <div>
                      <label>{{ t('doctor.birth_date') }}</label>
                      <span class="info-value">{{ user.birthDate }}</span>
                    </div>
                  </div>

                  <div class="info-item">
                    <VaIcon name="person" color="primary" />
                    <div>
                      <label>{{ t('doctor.gender') }}</label>
                      <span class="info-value">{{ user.gender ? t('doctor.male') : t('doctor.female') }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Account Status Section -->
          <div class="status-section">
            <h3 class="text-lg font-semibold mb-4">{{ t('doctor.Account_Status') }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="status-card" :class="{ active: user.status }">
                <VaIcon name="account_circle" />
                <div>
                  <label>{{ t('doctor.Status') }}</label>
                  <span class="status">{{ user.status ? t('doctor.Active') : t('doctor.Inactive') }}</span>
                </div>
              </div>

              <div class="status-card" :class="{ active: user.emailStatus }">
                <VaIcon name="email" />
                <div>
                  <label>{{ t('doctor.Email_Status') }}</label>
                  <span class="status">{{ user.emailStatus ? t('doctor.Confirmed') : t('doctor.UnConfirmed') }}</span>
                </div>
              </div>

              <div class="status-card" :class="{ active: user.phoneStatus }">
                <VaIcon name="phone" />
                <div>
                  <label>{{ t('doctor.Phone_Status') }}</label>
                  <span class="status">{{ user.phoneStatus ? t('doctor.Confirmed') : t('doctor.UnConfirmed') }}</span>
                </div>
              </div>
            </div>
          </div>
        </VaInnerLoading>

        <!-- Back Button -->
        <div class="mt-8 text-center">
          <VaButton class="back-button" preset="secondary" @click="$router.go(-1)">
            <VaIcon name="arrow_back" />
            <span class="ml-2">{{ t('doctor.back') }}</span>
          </VaButton>
        </div>
      </VaCard>
    </div>
  </div>
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
  color: #64748b;
  margin-bottom: 0.25rem;
}

.info-value {
  display: block;
  font-weight: 500;
  color: #1e293b;
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
  background: #f0fdf4;
}

.status-card label {
  display: block;
  font-size: 0.875rem;
  color: #64748b;
}

.status-card .status {
  display: block;
  font-weight: 500;
  color: #1e293b;
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
