<script lang="ts" setup>
import { computed, reactive, ref, onMounted } from 'vue'
import { useForm, useToast, VaCard, VaSelect } from 'vuestic-ui'
import { getErrorMessage } from '@/services/utils'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useUserProfileStore } from '@/stores/modules/user.module'
import { UserDetailsUpdate } from '@/pages/auth/types'

const { t } = useI18n()

const { validate } = useForm('form')
const { init } = useToast()
const route = useRoute()
const id = route.params.id as string
const router = useRouter()

const userProfileStore = useUserProfileStore()

const isLoading = ref(true)

const formData = reactive({
  id: '',
  firstName: '',
  lastName: '',
  email: '',
  isMale: {
    value: true,
    text: '',
  }, // true for male, false for female
  birthDay: '',
  username: '',
  phoneNumber: '',
  job: '',
  address: '',
})
const goBack = () => router.back()

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}
const genderOptions = ref([
  { value: true, text: t('doctor.male') },
  { value: false, text: t('doctor.female') },
])
const tooltipMessage = ref('')

const showTooltip = (message: string) => {
  tooltipMessage.value = message
  setTimeout(() => {
    tooltipMessage.value = ''
  }, 2000) // 2 seconds duration
}

const submit = () => {
  if (validate()) {
    const registerData: UserDetailsUpdate = {
      userId: formData.id,
      firstName: formData.firstName,
      lastName: formData.lastName,
      gender: formData.isMale.value,
      birthDate: formatDate(formData.birthDay) || '',
      job: formData.job || '',
      address: formData.address || '',
    }
    console.log('user gửi về', registerData)
    isLoading.value = true

    userProfileStore
      .updateProfileForAdmin(registerData)
      .then(() => {
        init({
          title: 'Success',
          message: t('doctor.update_user'),
          color: 'success',
        })
      })
      .catch((error) => {
        const message = getErrorMessage(error)
        init({
          title: 'Error',
          message: message,
          color: 'danger',
        })
      })
      .finally(() => {
        isLoading.value = false
      })
  }
}

const usernameRules = [
  (v: any) => !!v || t('validation.username.required'),
  (v: any) => (v && v.length >= 3) || t('validation.username.minLength'),
  (v: any) => (v && v.length <= 20) || t('validation.username.maxLength'),
]

const phoneNumberRules = [
  (v: any) => !!v || t('validation.phoneNumber.required'),
  (v: any) => (v && v.length >= 10) || t('validation.phoneNumber.minLength'),
  (v: any) => (v && v.length <= 15) || t('validation.phoneNumber.maxLength'),
  (v: any) => (v && /^\d+$/.test(v)) || t('validation.phoneNumber.pattern'),
]

const emailRules = [
  (v: any) => !!v || t('validation.email.required'),
  (v: any) => /.+@.+\..+/.test(v) || t('validation.email.pattern'),
]

const jobRules = [
  (v: any) => !!v || t('validation.job.required'),
  (v: any) => (v && v.length >= 2) || t('validation.job.minLength'),
  (v: any) => (v && v.length <= 20) || t('validation.job.maxLength'),
]

const addressRules = [
  (v: any) => !!v || t('validation.address.required'),
  (v: any) => (v && v.length >= 5) || t('validation.address.minLength'),
  (v: any) => (v && v.length <= 200) || t('validation.address.maxLength'),
]

const checkBirthDayValid = (date: Date): boolean => {
  if (!date) return false

  const today = new Date()
  const birthDate = new Date(date)
  let yearDiff = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    yearDiff--
  }

  return yearDiff >= 18
}

const birthDayRules = computed(() => [
  (v: any) => !!v || t('validation.birthDay.required'),
  (v: any) => checkBirthDayValid(v) || t('validation.birthDay.invalid'),
])

onMounted(async () => {
  try {
    const userDetails = await userProfileStore.getUserDetail(id)
    formData.firstName = userDetails.firstName || ''
    formData.lastName = userDetails.lastName || ''
    formData.email = userDetails.email || ''
    formData.username = userDetails.userName || ''
    formData.phoneNumber = userDetails.phoneNumber || ''
    formData.isMale.value = userDetails.gender
    formData.birthDay = userDetails.birthDate || ''
    formData.job = userDetails.job || ''
    formData.address = userDetails.address || ''
    formData.id = userDetails.id
    if (userDetails.gender) {
      formData.isMale.text = t('doctor.male')
    } else {
      formData.isMale.text = t('doctor.female')
    }
  } catch (error) {
    console.error('Error fetching user details:', error)
  } finally {
    isLoading.value = false
  }
})
</script>
<template>
  <VaCard class="form-wrapper min-h-screen flex items-center justify-center">
    <VaInnerLoading :loading="isLoading" :size="60" style="width: 10%; height: 10%">
      <VaCard class="form-container p-6 max-w-lg w-full shadow-md rounded-lg bg-white">
        <VaForm ref="form" @submit.prevent="submit">
          <div class="flex justify-between mb-6">
            <VaButton @click="goBack">
              <template #prepend>
                <i class="mdi mdi-arrow-left mr-2"></i>
              </template>
              {{ t('doctor.back') }}
            </VaButton>
          </div>
          <div class="grid grid-cols-2 gap-4 mb-4">
            <VaInput
              v-model="formData.firstName"
              :rules="[(v: any) => !!v || t('auth.first_name_required')]"
              :label="t('auth.first_name')"
            />
            <VaInput
              v-model="formData.lastName"
              :rules="[(v: any) => !!v || t('auth.last_name_required')]"
              :label="t('auth.last_name')"
            />
          </div>
          <VaInput v-model="formData.username" :rules="usernameRules" class="mb-4" :label="t('auth.username')" />
          <VaInput
            v-model="formData.phoneNumber"
            :rules="phoneNumberRules"
            class="mb-4"
            :label="t('auth.phone_number')"
            readonly
            @mouseover="showTooltip('Không được phép chỉnh sửa')"
            @click="showTooltip('Không được phép chỉnh sửa')"
          />
          <VaInput
            v-model="formData.address"
            :rules="addressRules"
            class="mb-4"
            :label="t('doctor.address')"
            type="text"
          >
          </VaInput>
          <VaInput
            v-model="formData.email"
            :rules="emailRules"
            class="mb-4"
            :label="t('auth.email')"
            type="email"
            readonly
            @mouseover="showTooltip('Không được phép chỉnh sửa')"
            @click="showTooltip('Không được phép chỉnh sửa')"
          />

          <VaCard class="mb-4">
            <label
              for="gender"
              style="color: var(--va-primary)"
              class="va-input-label va-input-wrapper__label va-input-wrapper__label--outer"
            >
              {{ t('doctor.gender') }}</label
            >
            <VaSelect
              id="gender"
              v-model="formData.isMale"
              :options="genderOptions"
              item-value="value"
              item-text="text"
              class="va-input__input w-full"
            />
          </VaCard>

          <VaDateInput
            v-model="formData.birthDay"
            :rules="birthDayRules"
            class="w-full mb-4"
            :label="t('auth.birthDay')"
            clearable
          />
          <VaInput v-model="formData.job" :rules="jobRules" class="mb-4" :label="t('auth.job')" />
          <div class="flex justify-center mt-4">
            <VaButton class="w-full" @click="submit">{{ t('auth.user_update') }}</VaButton>
          </div>
        </VaForm>
      </VaCard>
    </VaInnerLoading>
  </VaCard>
</template>
<style scoped>
.min-h-screen {
  min-height: 100vh;
}

.VaCard {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
}
.form-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh; /* Chiều cao bao phủ toàn màn hình */
}

.form-container {
  width: 100%;
  max-width: 600px; /* Đặt giới hạn chiều rộng cho form */
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Hiệu ứng bóng */
}
</style>
