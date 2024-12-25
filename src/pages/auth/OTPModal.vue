<script setup lang="ts">
import { getErrorMessage } from '@/services/utils'
import { useAuthStore } from '@/stores/modules/auth.module'
import { ref, onUnmounted, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useToast } from 'vuestic-ui/web-components'

const otp = ref(['', '', '', '', '', ''])
const inputs = ref<(HTMLInputElement | null)[]>([])
const authStore = useAuthStore()
const router = useRouter()
const { init } = useToast()
const remainingTime = ref(180)
const timer = ref<NodeJS.Timeout | null>(null)
const showResend = ref(false)
const { t } = useI18n()

const focusNext = (index: number) => {
  if (index < 5 && inputs.value[index + 1]) {
    inputs.value[index + 1]?.focus()
  }
}

const focusPrev = (index: number) => {
  if (index > 0 && inputs.value[index - 1]) {
    inputs.value[index - 1]?.focus()
    otp.value[index] = ''
  }
}

const handleInput = (event: Event, index: number) => {
  const input = event.target as HTMLInputElement
  const value = input.value

  if (!/^\d*$/.test(value)) {
    otp.value[index] = ''
    return
  }

  if (value.length > 1) {
    const digits = value.split('')
    digits.forEach((digit, i) => {
      if (index + i < 4) {
        otp.value[index + i] = digit
        if (inputs.value[index + i]) {
          inputs.value[index + i]!.value = digit
        }
      }
    })
    const nextIndex = Math.min(index + digits.length, 3)
    if (inputs.value[nextIndex]) {
      inputs.value[nextIndex]?.focus()
    }
    return
  }

  otp.value[index] = value
  if (value) {
    focusNext(index)
  }

  if (otp.value.every((digit) => digit !== '')) {
    verify()
  }
}

const handleKeydown = (event: KeyboardEvent, index: number) => {
  if (event.key === 'Backspace') {
    event.preventDefault()
    if (otp.value[index]) {
      otp.value[index] = ''
    } else {
      if (index > 0) {
        otp.value[index - 1] = ''
        focusPrev(index)
      }
    }
  }
}

const startTimer = () => {
  timer.value = setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value -= 1
    } else {
      clearInterval(timer.value as NodeJS.Timeout)
      showResend.value = true
    }
  }, 1000)
}

const resetTimer = () => {
  remainingTime.value = 180
  showResend.value = false
  startTimer()
}

const handleResend = () => {
  resetTimer()
  isLoading.value = true
  authStore
    .resendPhoneConfirm(props.phone)
    .then(() => {
      isLoading.value = false
    })
    .catch((error) => {
      const errorMessage = getErrorMessage(error)
      init({
        title: 'error',
        message: errorMessage,
        color: 'danger',
      })
      isLoading.value = false
    })
    .finally(() => {
      isLoading.value = false
    })
}

const props = defineProps<{
  loading: boolean
  phone: string
}>()

const emit = defineEmits<{
  'update:loading': [value: boolean]
}>()

const isLoading = computed({
  get: () => props.loading,
  set: (value) => emit('update:loading', value),
})

const verify = () => {
  isLoading.value = true
  authStore
    .verifyByPhone(props.phone, otp.value.join(''))
    .then(() => {
      isLoading.value = false
      router.push({ name: 'login' })
    })
    .catch((error) => {
      const errorMessage = getErrorMessage(error)
      init({
        title: 'error',
        message: errorMessage,
        color: 'danger',
      })
    })
}

onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})
</script>
<template>
  <div class="mx-auto flex w-full max-w-md flex-col space-y-16 dark:text-gray-200">
    <div class="flex flex-col items-center justify-center text-center space-y-2">
      <div class="font-semibold text-3xl">
        <p>{{ t('auth.verify') }}</p>
      </div>
      <div class="flex flex-row text-sm font-medium text-gray-400 dark:text-gray-500">
        <p>{{ t('auth.verify_message') }} {{ props.phone }}</p>
      </div>
    </div>

    <div>
      <form @submit.prevent>
        <div class="flex flex-col space-y-16">
          <div class="flex flex-row items-center justify-between mx-auto w-full max-w-xs">
            <template v-for="(digit, index) in otp" :key="index">
              <div class="w-12 h-16">
                <input
                  ref="inputs"
                  v-model="otp[index]"
                  class="w-full h-full flex flex-col items-center justify-center text-center px-2 outline-none rounded-xl border border-gray-200 text-lg bg-white focus:bg-gray-50 focus:ring-1 ring-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-500 dark:focus:bg-gray-600 text-gray-900 dark:text-gray-100"
                  type="tel"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  maxlength="1"
                  @input="handleInput($event, index)"
                  @keydown="handleKeydown($event, index)"
                />
              </div>
            </template>
          </div>

          <div class="flex flex-col space-y-5">
            <div
              class="flex flex-row items-center justify-center text-center text-sm font-medium space-x-1 text-gray-500 dark:text-gray-400"
            >
              <p v-if="remainingTime > 0">{{ t('auth.verify_ask') }} {{ t('auth.remaining') }} {{ remainingTime }}s</p>
              <div v-else>
                {{ t('auth.verify_ask') }}
                <a class="text-blue-600 dark:text-blue-400" href="#" @click.prevent="handleResend">
                  {{ t('auth.resend') }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
