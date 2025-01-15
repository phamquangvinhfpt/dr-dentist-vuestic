<script lang="ts" setup>
import { computed, reactive, ref } from 'vue'
import { useForm, useToast } from 'vuestic-ui'
import { useAuthStore } from '@/stores/modules/auth.module'
import { Register } from './types'
import { getErrorMessage } from '@/services/utils'
import { useI18n } from 'vue-i18n'
import AddressAutocomplete from './AddressAutocomplete.vue'
import { Capacitor } from '@capacitor/core'
import OTPModal from './OTPModal.vue'
import { useRouter } from 'vue-router'
import { DateInputModelValue, DateInputValue } from 'vuestic-ui/dist/types/components/va-date-input/types'

const { t } = useI18n()

const { validate } = useForm('form')
const { push } = useRouter()
const { init } = useToast()
const store = useAuthStore()
const showModal = ref(false)
const isLoading = ref(false)

const formData = reactive({
  firstName: '',
  lastName: '',
  email: '',
  isMale: {
    value: true,
    text: '',
  },
  birthDay: new Date().toISOString(),
  username: '',
  password: '',
  repeatPassword: '',
  phoneNumber: '',
  job: '',
  address: '',
  role: 'Patient',
})

const formatDate2 = (dateString: string) => {
  const date = new Date(dateString)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

const formatDate = (date: DateInputModelValue): string => {
  if (date === null || date === undefined) return ''

  const dateObj =
    date instanceof Date
      ? date
      : typeof date === 'string'
        ? new Date(date)
        : date instanceof Number
          ? new Date(Number(date))
          : new Date()

  if (isNaN(dateObj.getTime())) return ''

  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0')
  const day = dateObj.getDate().toString().padStart(2, '0')
  const year = dateObj.getFullYear()

  return `${day}/${month}/${year}`
}

const parseDate = (dateStr: string): DateInputValue => {
  if (!dateStr) return null

  const date = new Date(dateStr)
  return isNaN(date.getTime()) ? null : date
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
      birthDay: formatDate2(formData.birthDay),
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
        if (Capacitor.getPlatform() === 'android' || Capacitor.getPlatform() === 'ios') {
          showModal.value = true
        } else {
          push({ name: 'login' })
        }
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

const passwordRules = [
  (v: any) => !!v || t('validation.password.required'),
  (v: any) => (v && v.length >= 8) || t('validation.password.minLength'),
  (v: any) => (v && /[A-Za-z]/.test(v)) || t('validation.password.letter'),
  (v: any) => (v && /\d/.test(v)) || t('validation.password.number'),
  (v: any) => (v && /[!@#$%^&*(),.?":{}|<>]/.test(v)) || t('validation.password.specialCharacter'),
]

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

const handleEnter = (e: KeyboardEvent) => {
  e.preventDefault()
  submit()
}
</script>

<template>
  <VaInnerLoading :loading="isLoading" :size="60">
    <VaCard class="-mx-4 p-3 -my-4">
      <VaForm ref="form" @submit.prevent="submit">
        <h1 class="font-semibold text-4xl mb-4">{{ t('auth.sign_up') }}</h1>
        <p class="text-base mb-4 leading-5">
          {{ t('auth.have_account') }}
          <RouterLink :to="{ name: 'login' }" class="font-semibold text-primary">{{ t('auth.login') }}</RouterLink>
        </p>
        <div class="grid grid-cols-2 gap-4 items-start">
          <VaInput
            v-model="formData.firstName"
            :rules="[(v: any) => !!v || t('auth.first_name_required')]"
            class="mb-4"
            :label="t('auth.first_name')"
          />
          <VaInput
            v-model="formData.lastName"
            :rules="[(v: any) => !!v || t('auth.last_name_required')]"
            class="mb-4"
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
        <VaInput v-model="formData.email" :rules="emailRules" class="mb-4" :label="t('auth.email')" type="email" />
        <VaValue v-slot="isPasswordVisible" :default-value="false">
          <VaInput
            ref="password1"
            v-model="formData.password"
            :rules="passwordRules"
            :type="isPasswordVisible.value ? 'text' : 'password'"
            class="mb-4"
            :label="t('auth.password')"
            :messages="t('auth.password_hint')"
            @clickAppendInner.stop="isPasswordVisible.value = !isPasswordVisible.value"
          >
            <template #appendInner>
              <VaIcon
                :name="isPasswordVisible.value ? 'mso-visibility_off' : 'mso-visibility'"
                class="cursor-pointer"
                color="secondary"
                tabindex="-1"
              />
            </template>
          </VaInput>
          <VaInput
            ref="password2"
            v-model="formData.repeatPassword"
            :rules="[
              (v: any) => !!v || t('auth.repeat_password_required'),
              (v: string) => v === formData.password || t('auth.password_match'),
            ]"
            :type="isPasswordVisible.value ? 'text' : 'password'"
            class="mb-4"
            :label="t('auth.repeat_password')"
            @clickAppendInner.stop="isPasswordVisible.value = !isPasswordVisible.value"
          >
            <template #appendInner>
              <VaIcon
                :name="isPasswordVisible.value ? 'mso-visibility_off' : 'mso-visibility'"
                class="cursor-pointer"
                color="secondary"
              />
            </template>
          </VaInput>
        </VaValue>
        <div class="mb-4">
          <VaRadio
            v-model="formData.isMale"
            :options="genderOptions"
            class="flex gap-4"
            :rules="[(v: any) => !!v || t('auth.gender_required')]"
          />
        </div>
        <AddressAutocomplete v-model="formData.address" :rules="addressRules" />
        <VaDateInput
          v-model="formData.birthDay"
          :rules="birthDayRules"
          :format="formatDate"
          :parse="parseDate"
          class="w-full"
          :label="t('auth.birthDay')"
          clearable
        />

        <VaInput
          v-model="formData.job"
          :rules="jobRules"
          class="mb-4"
          :label="t('auth.job')"
          @keydown.enter="handleEnter"
        />
        <div class="flex justify-center mt-4">
          <VaButton class="w-full" @click="submit">{{ t('auth.create_account') }}</VaButton>
        </div>
      </VaForm>
    </VaCard>
    <VaModal v-model="showModal" close-button hide-default-actions>
      <OTPModal :loading="isLoading" :phone="formData.phoneNumber" @update:loading="(val) => (isLoading = val)" />
    </VaModal>
  </VaInnerLoading>
</template>
