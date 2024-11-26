<template>
  <VaCard class="mb-6">
    <VaCardTitle>Create Contact Request</VaCardTitle>
    <VaCardContent>
      <div class="contact-request-form">
        <VaForm ref="form" @submit.prevent="submit">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <VaField>
              <VaInput
                v-model="formData.title"
                :rules="[titleRule]"
                label="Title *"
                class="mb-3"
                placeholder="Enter title"
              />
            </VaField>

            <VaField>
              <VaInput
                v-model="formData.email"
                type="email"
                :rules="emailRules"
                label="Email *"
                class="mb-3"
                placeholder="Enter your email"
              />
            </VaField>

            <VaField>
              <VaInput
                v-model="formData.phone"
                :rules="phoneRules"
                label="Phone *"
                class="mb-3"
                placeholder="Enter your phone number"
              />
            </VaField>

            <VaField class="md:col-span-2">
              <VaTextarea
                v-model="formData.content"
                :rules="[contentRule]"
                label="Content *"
                class="mb-3"
                placeholder="Enter your message"
                rows="4"
              />
            </VaField>

            <div class="flex justify-end gap-2 md:col-span-2">
              <VaButton class="w-fit rounded mb-3" preset="secondary" @click="handleReset"> Reset </VaButton>
              <VaButton class="w-fit rounded mb-3" :disabled="isSubmitting" preset="primary" @click="submit">
                Submit Request
              </VaButton>
            </div>
          </div>
        </VaForm>
      </div>
    </VaCardContent>
  </VaCard>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useToast } from 'vuestic-ui'
import { useContactStaffStore } from '@/stores/modules/contact-staff.module'
import { useRouter } from 'vue-router'

const router = useRouter()
const { init } = useToast()
const contactStaffStore = useContactStaffStore()
const form = ref()
const isSubmitting = ref(false)

const formData = reactive({
  title: '',
  email: '',
  phone: '',
  content: '',
})

const titleRule = (v: string) => !!v || 'Title is required'

const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid',
]

const phoneRules = [
  (v: string) => !!v || 'Phone is required',
  (v: string) => /^\d{10}$/.test(v) || 'Phone must be 10 digits',
]

const contentRule = (v: string) => !!v || 'Content is required'

const handleReset = () => {
  formData.title = ''
  formData.email = ''
  formData.phone = ''
  formData.content = ''
  form.value?.reset()
}

const submit = async () => {
  try {
    const isValid = await form.value?.validate()
    if (!isValid) return

    isSubmitting.value = true
    const response = await contactStaffStore.addContact(formData)

    if (response) {
      init({
        message: 'Contact request sent successfully',
        color: 'success',
        duration: 3000,
      })

      handleReset()
      router.push({ name: 'home-page' })
    }
  } catch (error: any) {
    init({
      message: error.message || 'Failed to send contact request',
      color: 'danger',
      duration: 3000,
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.contact-request-form {
  padding: 24px;
}

:deep(.va-input-wrapper),
:deep(.va-textarea-wrapper) {
  width: 100%;
}
</style>
