<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useToast, VaAlert, VaCard, VaModal } from 'vuestic-ui'

const props = defineProps<{
  showQrCode: boolean
  bankInfo: {
    bankName: string
    accountNumber: string
    accountHolder: string
    amount: number
    description: string
  }
  qrCodeUrl: string
  isMobile: boolean
}>()
const emit = defineEmits(['update:showQrCode', 'update:closeSubmit'])
const { init } = useToast()

const showCopySuccess = ref(false)
const localShowQrCode = ref(props.showQrCode)
const endTime = ref<number | null>(null)
const remainingTime = ref(600)

const copyToClipboard = async (text: any) => {
  try {
    await navigator.clipboard.writeText(text)
    showCopySuccess.value = true
    setTimeout(() => {
      showCopySuccess.value = false
      init({
        title: 'Copied to clipboard!',
        message: 'The description has been copied to your clipboard.',
        color: 'success',
      })
    }, 500)
  } catch (err) {
    console.error('Failed to copy text: ', err)
  }
}

const updateRemainingTime = () => {
  if (endTime.value) {
    const now = Date.now()
    const timeLeft = Math.max(0, Math.floor((endTime.value - now) / 1000))
    remainingTime.value = timeLeft

    if (timeLeft === 0) {
      init({
        title: 'Time is up!',
        message: 'The time to pay the deposit has expired. Please request a new QR code.',
        color: 'danger',
      })
      closeModal()
    } else {
      requestAnimationFrame(updateRemainingTime)
    }
  }
}

const startTimer = () => {
  endTime.value = Date.now() + 600000 // 10 minutes
  updateRemainingTime()
}

const stopTimer = () => {
  endTime.value = null
}

const formattedTime = computed(() => {
  const minutes = Math.floor(remainingTime.value / 60)
  const seconds = remainingTime.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

watch(
  () => props.showQrCode,
  (newVal) => {
    localShowQrCode.value = newVal
    if (newVal) {
      startTimer()
    } else {
      stopTimer()
    }
  },
)

const closeModal = () => {
  localShowQrCode.value = false
  emit('update:showQrCode', false)
  emit('update:closeSubmit', false)
  stopTimer()
}

onMounted(() => {
  if (localShowQrCode.value) {
    startTimer()
  }
})

onUnmounted(() => {
  emit('update:showQrCode', false)
  emit('update:closeSubmit', false)
})
</script>
<template>
  <VaModal v-model="localShowQrCode" size="large" @close="closeModal">
    <VaCard class="w-full max-w-4xl mx-auto p-4">
      <VaAlert color="danger" closeable icon="warning" class="mb-6">
        <template #title>
          <span class="font-bold uppercase">QUY ĐỊNH NẠP TIỀN</span>
        </template>
        <p class="dark:text-gray-300">
          <span class="font-bold">-</span> Vui lòng nạp đúng nội dung như hướng dẫn bên dưới hoặc quét mã QR sẽ tự động
          điền cú pháp.
        </p>
        <p class="dark:text-gray-300">
          <span class="font-bold">-</span> Nếu nạp sai nội dung, chúng tôi không chịu trách nhiệm và không hoàn trả
          tiền.
        </p>
      </VaAlert>

      <!-- Countdown Timer -->
      <div class="text-center mb-4 text-red-500 font-sans font-semibold">
        <p class="text-xl font-bold">Time Remaining: {{ formattedTime }}</p>
      </div>

      <div class="grid md:grid-cols-2 gap-6">
        <!-- Left Column - Bank Information -->
        <div v-if="!isMobile">
          <div class="font-sans p-6">
            <h3 class="text-2xl font-semibold text-white mb-4">Bank Information</h3>
            <div class="space-y-3">
              <div>
                <p class="text-base font-medium dark:text-gray-300">Bank Name</p>
                <p class="text-sm font-medium dark:text-gray-100">
                  {{ bankInfo.bankName }}
                </p>
              </div>
              <div>
                <p class="text-base font-medium dark:text-gray-300">Account Number</p>
                <p class="text-sm font-medium dark:text-gray-200">
                  {{ bankInfo.accountNumber }}
                </p>
              </div>
              <div>
                <p class="text-base font-medium dark:text-gray-300">Account Holder</p>
                <p class="text-sm font-medium dark:text-gray-200">
                  {{ bankInfo.accountHolder }}
                </p>
              </div>
              <div>
                <p class="text-base font-medium dark:text-gray-300">Amount</p>
                <p class="text-sm font-medium dark:text-gray-200">
                  {{ computed(() => new Intl.NumberFormat('vi-VN').format(bankInfo.amount)).value }} VND
                </p>
              </div>
              <div>
                <p class="text-base font-medium dark:text-gray-300">Description</p>
                <button
                  class="mt-3 px-4 py-2 bg-[#F1FAFF] hover:bg-[#009ef7] hover:text-white text-[#55A0F7] rounded transition-colors duration-200 ease-in-out text-base font-sans font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#009ef7] text-left"
                  @click="copyToClipboard(bankInfo.description)"
                >
                  {{ bankInfo.description }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - QR Code -->
        <div class="">
          <div class="p-1">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">QR Code</h3>
            <p class="text-gray-600 dark:text-gray-300 mb-3">Scan the QR code to pay the deposit.</p>
            <div class="flex justify-center">
              <img lazy :src="qrCodeUrl" alt="QR Code" class="w-full h-auto" />
            </div>
          </div>
        </div>

        <!-- Mobile View - Bank Information -->
        <div v-if="isMobile">
          <div class="font-poppins">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">Bank Information</h3>
            <div class="space-y-0">
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Bank Name</p>
                <p class="text-lg font-sans font-medium text-gray-900 dark:text-white">
                  {{ bankInfo.bankName }}
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Account Number</p>
                <p class="text-lg font-sans font-medium text-gray-900 dark:text-white">
                  {{ bankInfo.accountNumber }}
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Account Holder</p>
                <p class="text-lg font-sans font-medium text-gray-900 dark:text-white">
                  {{ bankInfo.accountHolder }}
                </p>
              </div>
              <div>
                <p class="text-sm font-sans text-gray-500 dark:text-gray-400">Amount</p>
                <p class="text-lg font-sans font-medium text-gray-900 dark:text-white">
                  {{ computed(() => new Intl.NumberFormat('vi-VN').format(bankInfo.amount)).value }} VND
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Description</p>
                <button
                  class="mt-3 px-4 py-2 bg-[#F1FAFF] hover:bg-[#009ef7] hover:text-white text-[#55A0F7] rounded transition-colors duration-200 ease-in-out text-base font-sans font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#009ef7] text-left"
                  @click="copyToClipboard(bankInfo.description)"
                >
                  {{ bankInfo.description }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </VaCard>
  </VaModal>
</template>
