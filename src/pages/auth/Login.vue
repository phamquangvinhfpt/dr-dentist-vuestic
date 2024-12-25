<script lang="ts" setup>
import { onBeforeMount, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useForm, useToast } from 'vuestic-ui'
import { validators, getErrorMessage } from '@services/utils'
import { useAuthStore } from '@modules/auth.module'
import { useReCaptcha } from 'vue-recaptcha-v3'
import { useI18n } from 'vue-i18n'
import { NativeBiometric, BiometryType } from '@capgo/capacitor-native-biometric'
import { Capacitor } from '@capacitor/core'

const { t } = useI18n()
const { validate } = useForm('form')
const { push } = useRouter()
const { init } = useToast()
const reCaptcha = useReCaptcha()

const isLoading = ref(false)
const isBiometricAvailable = ref(false)
const platform = Capacitor.getPlatform()
const formData = reactive({
  email: '',
  password: '',
  keepLoggedIn: false,
})

const store = useAuthStore()

// Check biometric availability on component mount
onBeforeMount(async () => {
  // Check if user is already logged in
  if (store.isAuthenticated) {
    push({ name: 'dashboard' })
    init({ message: 'You are already logged in', color: 'success', position: 'bottom-right' })
    return
  }

  // Check biometric availability
  try {
    if (platform === 'android' || platform === 'ios') {
      const result = await NativeBiometric.isAvailable()
      isBiometricAvailable.value = result.isAvailable
    }
  } catch (error) {
    console.error('Biometric check failed', error)
    isBiometricAvailable.value = false
  }
})

// Standard email/password login
const submit = async () => {
  if (validate()) {
    isLoading.value = true
    await reCaptcha?.recaptchaLoaded()
    const captchaToken = await reCaptcha?.executeRecaptcha('login')

    try {
      await store.login(formData.email, formData.password, captchaToken ?? '', formData.keepLoggedIn)

      // Save credentials for biometric login if keep logged in is true
      if (platform === 'android' || platform === 'ios') {
        await saveCredentialsForBiometrics()
      }

      init({
        message: t('auth.login_success'),
        color: 'success',
        position: 'bottom-right',
      })
      push({ name: 'dashboard' })
    } catch (error: any) {
      const message = getErrorMessage(error)
      init({ message, color: 'danger' })
    } finally {
      isLoading.value = false
    }
  }
}

// Save credentials securely for biometric login
const saveCredentialsForBiometrics = async () => {
  try {
    await NativeBiometric.setCredentials({
      username: formData.email,
      password: formData.password,
      server: window.location.origin, // Use current domain as server
    })
  } catch (error) {
    console.error('Failed to save biometric credentials', error)
  }
}

// Perform biometric authentication
const performBiometricLogin = async () => {
  if (!isBiometricAvailable.value) {
    init({
      message: t('auth.biometric_not_available'),
      color: 'warning',
    })
    return
  }

  try {
    // Determine biometry type for custom messaging
    const result = await NativeBiometric.isAvailable()
    const isFaceID = result.biometryType === BiometryType.FACE_ID

    // Verify identity
    await NativeBiometric.verifyIdentity({
      reason: t('auth.biometric_reason'),
      title: t('auth.login'),
      subtitle: isFaceID ? t('auth.use_face_id') : t('auth.use_fingerprint'),
      description: t('auth.biometric_description'),
    })

    // Retrieve saved credentials
    const credentials = await NativeBiometric.getCredentials({
      server: window.location.origin,
    })

    // Perform login with saved credentials
    isLoading.value = true
    await store.login(
      credentials.username,
      credentials.password,
      '9PA}rTVa^9*1tCyiNTk?ix=.dq)6kW', // Develop captcha token
      true, // Always keep logged in for biometric
    )

    init({
      message: t('auth.login_success'),
      color: 'success',
      position: 'bottom-right',
    })
    push({ name: 'dashboard' })
  } catch (error) {
    init({
      message: t('auth.biometric_failed'),
      color: 'danger',
    })
  } finally {
    isLoading.value = false
  }
}

const handleEnter = (e: KeyboardEvent) => {
  e.preventDefault()
  submit()
}
</script>

<template>
  <VaInnerLoading :loading="isLoading" :size="60">
    <VaForm ref="form" @submit.prevent="submit">
      <h1 class="font-semibold text-4xl mb-4">{{ t('auth.login') }}</h1>

      <p class="text-base mb-4 leading-5">
        {{ t('auth.new_to_geo') }}
        <RouterLink :to="{ name: 'signup' }" class="font-semibold text-primary">
          {{ t('auth.sign_up') }}
        </RouterLink>
      </p>

      <VaInput
        v-model="formData.email"
        :rules="[validators.required, validators.email]"
        class="mb-4"
        label="Email"
        type="email"
        @keydown.enter="handleEnter"
      />

      <VaValue v-slot="isPasswordVisible" :default-value="false">
        <VaInput
          v-model="formData.password"
          :rules="[validators.required]"
          :type="isPasswordVisible.value ? 'text' : 'password'"
          class="mb-4"
          :label="t('auth.password')"
          @clickAppendInner.stop="isPasswordVisible.value = !isPasswordVisible.value"
          @keydown.enter="handleEnter"
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

      <div class="auth-layout__options flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <VaCheckbox v-model="formData.keepLoggedIn" class="mb-2 sm:mb-0" :label="t('auth.keep_signed_in')" />
        <RouterLink :to="{ name: 'recover-password' }" class="mt-2 sm:mt-0 sm:ml-1 font-semibold text-primary">
          {{ t('auth.forgot_password') }}
        </RouterLink>
      </div>

      <div class="flex flex-row justify-center mt-4 gap-4">
        <VaButton class="w-full" @click="submit">
          {{ t('auth.login') }}
        </VaButton>

        <!-- Biometric Login Button (conditionally rendered) v-if="isBiometricAvailable" @click="performBiometricLogin"-->
        <VaButton
          v-if="isBiometricAvailable"
          round
          class="mr-3"
          preset="secondary"
          border-color="primary"
          icon="fingerprint"
          color="primary"
          size="large"
          @click="performBiometricLogin"
        />
      </div>
    </VaForm>
  </VaInnerLoading>
</template>
