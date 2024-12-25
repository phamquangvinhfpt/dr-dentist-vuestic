<script lang="ts" setup>
import { computed, reactive, ref } from 'vue'
import { useForm, useToast } from 'vuestic-ui'
import { useAuthStore } from '@/stores/modules/auth.module'
import { Register } from '@/pages/auth/types'
import { getErrorMessage } from '@/services/utils'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const { validate } = useForm('form')
const { init } = useToast()
const store = useAuthStore()

const isLoading = ref(false)

const formData = reactive({
  firstName: '',
  lastName: '',
  email: '',
  isMale: {
    value: true,
    text: '',
  },
  birthDay: '',
  username: '',
  password: '123Pa$$word!',
  repeatPassword: '123Pa$$word!',
  phoneNumber: '',
  job: '',
  address: '',
  role: 'Staff',
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

const submit = () => {
  if (validate()) {
    const registerData: Register = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      userName: formData.username,
      password: formData.password,
      confirmPassword: formData.repeatPassword,
      phoneNumber: formData.phoneNumber,
      isMale: formData.isMale.value,
      birthDay: formatDate(formData.birthDay),
      job: formData.job,
      address: formData.address,
      role: formData.role,
    }

    isLoading.value = true

    store
      .register(registerData)
      .then(() => {
        init({
          title: 'Success',
          message: t('auth.account_created'),
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
  (v: any) => (v && /^[a-zA-Z0-9_]*$/.test(v)) || t('validation.username.pattern'),
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

const genderOptions = [
  { value: true, text: t('auth.male') },
  { value: false, text: t('auth.female') },
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
</script>
<template>
  <div class="form-wrapper min-h-screen flex items-center justify-center bg-gray-100">
    <VaInnerLoading :loading="isLoading" :size="60" style="width: 60%">
      <VaCard class="form-container p-6 max-w-lg w-full shadow-md rounded-lg bg-white">
        <VaForm ref="form" @submit.prevent="submit">
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
          />
          <VaInput v-model="formData.address" :rules="addressRules" class="mb-4" :label="t('address')" type="text">
          </VaInput>
          <VaInput v-model="formData.email" :rules="emailRules" class="mb-4" :label="t('auth.email')" type="email" />

          <div class="mb-4">
            <VaRadio
              v-model="formData.isMale"
              :options="genderOptions"
              class="flex gap-4"
              :rules="[(v: any) => !!v || t('auth.gender_required')]"
            />
          </div>
          <VaDateInput
            v-model="formData.birthDay"
            :rules="birthDayRules"
            class="w-full mb-4"
            :label="t('auth.birthDay')"
            clearable
          />
          <VaInput v-model="formData.job" :rules="jobRules" class="mb-4" :label="t('auth.job')" />
          <div class="flex justify-center mt-4">
            <VaButton class="w-full" @click="submit">{{ t('auth.staff_created') }}</VaButton>
          </div>
        </VaForm>
      </VaCard>
    </VaInnerLoading>
  </div>
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
