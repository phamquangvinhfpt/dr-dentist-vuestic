<script setup lang="ts">
import { computed, ref } from 'vue'
import { ContactForm } from './types'
import { useContactStore } from '@/stores/modules/contact.module'
import { useToast } from 'vuestic-ui/web-components'
import { useI18n } from 'vue-i18n'
import { getErrorMessage } from '@/services/utils'
import { VaCard } from 'vuestic-ui'

const { init } = useToast()
const { t } = useI18n()
const message = ref<ContactForm>({
  title: '',
  email: '',
  phone: '',
  content: '',
})

const store = useContactStore()

const createMessage = async (message: any) => {
  store
    .sendContactMessage(message)
    .then(() => {
      init({
        title: 'Success',
        message: t('settings.success'),
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
}

const messageIsSending = ref(false)
const isSendButtonDisabled = computed(() => {
  if (messageIsSending.value) return true
  if (message.value.title.trim() === '') return true
  if (message.value.email.trim() === '') return true
  if (message.value.phone.trim() === '') return true
  if (message.value.content.trim() === '') return true
  return false
})

const onSendButton = async () => {
  if (!isSendButtonDisabled.value) {
    messageIsSending.value = true
    await createMessage(message.value)
    messageIsSending.value = false
    message.value.title = ''
    message.value.email = ''
    message.value.phone = ''
    message.value.content = ''
    console.log('sending:', message)
    messageIsSending.value = false
  }
}
</script>

<template>
  <VaCard class="shadow-lg rounded-lg p-8 dark:bg-gray-800 w-full max-w-2xl mx-auto">
    <div>
      <h2 class="text-3xl lg:text-4xl font-bold leading-tight mb-8 text-sky-700 dark:text-sky-300">
        {{ t('contact.send-message') }}
      </h2>

      <input
        v-model="message.title"
        class="w-full mt-2 p-4 rounded-full focus:outline-none focus:shadow-outline transition duration-200 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 bg-gray-100 text-sky-700 border-sky-700"
        type="text"
        :placeholder="t('contact.title')"
        :class="{
          'bg-gray-300': messageIsSending,
          'pointer-events-none': messageIsSending,
        }"
      />
    </div>
    <div class="mt-8">
      <input
        v-model="message.email"
        class="w-full mt-2 p-4 rounded-full focus:outline-none focus:shadow-outline transition duration-200 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 bg-gray-100 text-sky-700 border-sky-700"
        type="email"
        :placeholder="t('contact.email')"
        :class="{
          'bg-gray-300': messageIsSending,
          'pointer-events-none': messageIsSending,
        }"
      />
    </div>
    <div class="mt-8">
      <input
        v-model="message.phone"
        class="w-full mt-2 p-4 rounded-full focus:outline-none focus:shadow-outline transition duration-200 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 bg-gray-100 text-sky-700 border-sky-700"
        type="text"
        :placeholder="t('contact.phone')"
        :class="{
          'bg-gray-300': messageIsSending,
          'pointer-events-none': messageIsSending,
        }"
      />
    </div>
    <div class="mt-8">
      <textarea
        v-model="message.content"
        class="w-full h-40 min-h-40 mt-2 p-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 bg-gray-100 text-sky-700 border-sky-700"
        :placeholder="t('contact.message')"
        :class="{
          'bg-gray-300': messageIsSending,
          'pointer-events-none': messageIsSending,
        }"
      ></textarea>
    </div>
    <div class="mt-8 flex justify-between items-center">
      <button
        type="button"
        class="uppercase text-sm font-bold tracking-wide p-4 rounded-lg w-full focus:outline-none focus:shadow-outline transition duration-100 dark:bg-sky-300 dark:text-gray-500 bg-sky-700 text-gray-100 hover:bg-sky-500"
        :class="{
          'bg-sky-300': isSendButtonDisabled,
          'pointer-events-none': isSendButtonDisabled,
        }"
        @click="onSendButton()"
      >
        {{ messageIsSending ? t('contact.sending') : t('contact.send') }}
      </button>
    </div>
  </VaCard>
</template>
