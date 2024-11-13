<script lang="ts" setup>
import { computed, ref } from 'vue'
import { ContactForm } from './types'
import { useContactStore } from '@/stores/modules/contact.module'
import { useToast } from 'vuestic-ui/web-components'
import { useI18n } from 'vue-i18n'
import { getErrorMessage } from '@/services/utils'

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
  <div
    class="flex items-center justify-center min-h-screen transition-colors duration-300 dark:text-gray-100 dark:bg-gray-900"
  >
    <div
      class="max-w-screen-2xl px-8 grid gap-8 grid-cols-1 md:grid-cols-2 md:px-12 lg:px-16 xl:px-32 py-16 text-gray-900 bg-white dark:text-gray-100 dark:bg-gray-900"
    >
      <div class="flex flex-col justify-between mr-5 text-sky-700">
        <div>
          <h2 class="text-4xl lg:text-5xl font-bold leading-tight">{{ t('contact.get-in-touch') }}</h2>
          <div class="mt-3 font-semibold text-sky-700 dark:text-gray-100">
            <span class="font-bold">{{ t('contact.address') }}: </span>01 Y Bith Buôn mê
          </div>
          <div class="mt-4 mb-5 font-semibold text-sky-700 dark:text-gray-100">
            <span class="font-bold">{{ t('contact.phone') }}: </span>
            0942705605 <br />
          </div>
          <div class="border-2 border-sky-700 rounded-lg w-full dark:border-gray-600" style="height: 325px">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3893.439727827215!2d107.9466010243488!3d12.61913241073587!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMTLCsDM3JzA5LjAiTiAxMDfCsDU2JzQ3LjQiRQ!5e0!3m2!1svi!2s!4v1730916059097!5m2!1svi!2s"
              width="450"
              height="325"
              style="border: 0"
              class="border-2 border-sky-700 rounded-lg w-full"
              allowfullscreen
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
      <div class="shadow-lg rounded-lg p-6 border-2 dark:border-sky-700 dark:bg-gray-800 border-sky-700">
        <div>
          <h2 class="text-3xl lg:text-4xl font-bold leading-tight mb-5 text-sky-700">
            {{ t('contact.send-message') }}
          </h2>

          <input
            v-model="message.title"
            class="sm:w-[350px] mt-2 p-3 rounded-full focus:outline-none focus:shadow-outline transition duration-200 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 bg-gray-100 text-sky-700 border-sky-700"
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
            class="w-full mt-2 p-3 rounded-full focus:outline-none focus:shadow-outline transition duration-200 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 bg-gray-100 text-sky-700 border-sky-700"
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
            class="w-full mt-2 p-3 rounded-full focus:outline-none focus:shadow-outline transition duration-200 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 bg-gray-100 text-sky-700 border-sky-700"
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
            class="w-full h-32 min-h-32 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 bg-gray-100 text-sky-700 border-sky-700"
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
            class="uppercase text-sm font-bold tracking-wide p-3 rounded-lg w-full focus:outline-none focus:shadow-outline transition duration-100 dark:bg-sky-300 dark:text-gray-500 bg-sky-700 text-gray-100 hover:bg-sky-500"
            :class="{
              'bg-sky-300': isSendButtonDisabled,
              'pointer-events-none': isSendButtonDisabled,
            }"
            @click="onSendButton()"
          >
            {{ messageIsSending ? t('contact.sending') : t('contact.send') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
