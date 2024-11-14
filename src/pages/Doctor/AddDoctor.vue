<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDoctorProfileStore } from '@/stores/modules/doctor.module'
import { useToast } from 'vuestic-ui'
import '@mdi/font/css/materialdesignicons.css'

const router = useRouter()
const doctorStore = useDoctorProfileStore()
const { init: toast } = useToast()

const goBack = () => router.back()

interface DoctorForm {
  userName: string
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  phoneNumber: string
  gender: boolean | null
  imageUrl?: string
  address: string
  birthDate: string
  role: string
  specialization: string
  experience: number
  qualification: string
  consultationFee: number
  availableTime: string
  description: string
}

const doctor = reactive<DoctorForm>({
  userName: '',
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  phoneNumber: '',
  gender: null,
  imageUrl: '',
  address: '',
  birthDate: '',
  role: 'Dentist',
  specialization: '',
  experience: 0,
  qualification: '',
  consultationFee: 0,
  availableTime: '',
  description: '',
})

const errors = reactive<Record<string, string>>({})
const isSubmitting = ref(false)
const showConfirmation = ref(false)
const avatarPreview = ref<string | null>(null)
const showSuccess = ref(false)

// Add these refs for validation states
const validFields = reactive<Record<string, boolean>>({
  email: false,
  password: false,
  confirmPassword: false,
  phoneNumber: false,
  userName: false,
  firstName: false,
  lastName: false,
})

const validateEmail = (email: string) => {
  if (!email?.trim()) {
    errors.email = 'Email is required'
    validFields.email = false
    return false
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Invalid email format'
    validFields.email = false
    return false
  }
  errors.email = ''
  validFields.email = true
  return true
}

const validatePassword = (password: string) => {
  if (!password) {
    errors.password = 'Password is required'
    validFields.password = false
    return false
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/
  if (!passwordRegex.test(password)) {
    errors.password =
      'Password must be at least 8 characters and include: 1 number, 1 lowercase letter, 1 uppercase letter, and 1 special character'
    validFields.password = false
    return false
  }

  errors.password = ''
  validFields.password = true
  return true
}

const validateConfirmPassword = () => {
  if (!doctor.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
    validFields.confirmPassword = false
    return false
  }
  if (doctor.password !== doctor.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
    validFields.confirmPassword = false
    return false
  }
  errors.confirmPassword = ''
  validFields.confirmPassword = true
  return true
}

const validatePhoneNumber = (phone: string) => {
  if (!phone) {
    errors.phoneNumber = 'Phone number is required'
    validFields.phoneNumber = false
    return false
  }
  if (!/^\d{10,}$/.test(phone)) {
    errors.phoneNumber = 'Phone number must contain at least 10 digits only'
    validFields.phoneNumber = false
    return false
  }
  errors.phoneNumber = ''
  validFields.phoneNumber = true
  return true
}

const validateUserName = (userName: string) => {
  if (!userName) {
    errors.userName = 'Username is required'
    validFields.userName = false
    return false
  }
  errors.userName = ''
  validFields.userName = true
  return true
}

const validateFirstName = (firstName: string) => {
  if (!firstName) {
    errors.firstName = 'First name is required'
    validFields.firstName = false
    return false
  }
  errors.firstName = ''
  validFields.firstName = true
  return true
}

const validateLastName = (lastName: string) => {
  if (!lastName) {
    errors.lastName = 'Last name is required'
    validFields.lastName = false
    return false
  }
  errors.lastName = ''
  validFields.lastName = true
  return true
}

watch(
  () => doctor.email,
  (newValue) => {
    if (validateEmail(newValue)) {
      errors.email = ''
    }
  },
)

watch(
  () => doctor.password,
  (newValue) => {
    if (validatePassword(newValue)) {
      errors.password = ''
    }
    if (doctor.confirmPassword) {
      validateConfirmPassword()
    }
  },
)

watch(
  () => doctor.confirmPassword,
  () => {
    if (validateConfirmPassword()) {
      errors.confirmPassword = ''
    }
  },
)

watch(
  () => doctor.phoneNumber,
  (newValue) => {
    if (validatePhoneNumber(newValue)) {
      errors.phoneNumber = ''
    }
  },
)

watch(
  () => doctor.birthDate,
  (newValue) => {
    if (!newValue) {
      errors.birthDate = 'Birth date is required'
    } else {
      errors.birthDate = ''
    }
  },
)

watch(
  () => doctor.userName,
  (newValue) => {
    if (validateUserName(newValue)) {
      errors.userName = ''
    }
  },
)

watch(
  () => doctor.firstName,
  (newValue) => {
    if (validateFirstName(newValue)) {
      errors.firstName = ''
    }
  },
)

watch(
  () => doctor.lastName,
  (newValue) => {
    if (validateLastName(newValue)) {
      errors.lastName = ''
    }
  },
)

const handleAvatarUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target?.result as string
      doctor.imageUrl = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const submitForm = async () => {
  if (
    !validateEmail(doctor.email) ||
    !validatePassword(doctor.password) ||
    !validateConfirmPassword() ||
    !validatePhoneNumber(doctor.phoneNumber) ||
    !validateFirstName(doctor.firstName) ||
    !validateLastName(doctor.lastName) ||
    !validateUserName(doctor.userName) ||
    !validateForm()
  ) {
    toast({ message: 'Please correct the errors in the form', color: 'danger' })
    return
  }
  showConfirmation.value = true
}

const confirmAddDoctor = async () => {
  try {
    isSubmitting.value = true

    // Validate required fields first
    if (
      !validateEmail(doctor.email) ||
      !validatePassword(doctor.password) ||
      !validateConfirmPassword() ||
      !validatePhoneNumber(doctor.phoneNumber) ||
      !validateFirstName(doctor.firstName) ||
      !validateLastName(doctor.lastName) ||
      !validateUserName(doctor.userName)
    ) {
      throw new Error('Please fill in all required fields correctly')
    }

    // Format the data exactly as required by the API
    const formattedData = {
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      email: doctor.email,
      isMale: doctor.gender === true,
      birthDay: doctor.birthDate,
      userName: doctor.userName,
      password: doctor.password,
      confirmPassword: doctor.confirmPassword,
      phoneNumber: doctor.phoneNumber,
      job: 'Dentist',
      address: doctor.address,
      doctorProfile: {
        doctorID: '',
        education: doctor.qualification || '',
        college: doctor.specialization || '',
        certification: doctor.qualification || '',
        yearOfExp: doctor.experience.toString(),
        seftDescription: doctor.description || '',
      },
      role: 'Dentist', // Changed from "Doctor" to "Dentist"
    }

    // Debug log
    console.log('Sending doctor data:', JSON.stringify(formattedData, null, 2))

    const response = await doctorStore.createDoctor({ request: formattedData })

    if (!response) {
      throw new Error('No response from server')
    }

    showConfirmation.value = false
    showSuccess.value = true
  } catch (error: any) {
    console.error('Error details:', error)

    // Handle validation errors
    if (error.response?.data?.errors) {
      const firstError = Object.values(error.response.data.errors)[0]
      toast({
        message: Array.isArray(firstError) ? firstError[0] : 'Validation error',
        color: 'danger',
        duration: 5000,
      })
    } else {
      toast({
        message: error.message || 'Failed to add doctor. Please try again.',
        color: 'danger',
        duration: 5000,
      })
    }
  } finally {
    isSubmitting.value = false
  }
}

const closeSuccessModal = () => {
  showSuccess.value = false
  router.push({ name: 'doctors-list' })
}

const genderOptions = [
  { value: null, text: 'Select Gender' },
  { value: true, text: 'Male' },
  { value: false, text: 'Female' },
]

const validateForm = () => {
  let isValid = true

  // Add validation for required fields
  if (!doctor.userName) {
    errors.userName = 'Username is required'
    isValid = false
  }
  if (!doctor.birthDate) {
    errors.birthDate = 'Birth date is required'
    isValid = false
  }
  if (doctor.gender === null) {
    errors.gender = 'Please select a gender'
    isValid = false
  }

  return isValid && Object.values(errors).every((error) => error === '')
}

// Update watch handlers to trigger on blur
const handleBlur = (field: string, value: any) => {
  switch (field) {
    case 'email':
      validateEmail(value)
      break
    case 'password':
      validatePassword(value)
      break
    case 'userName':
      validateUserName(value)
      break
    case 'firstName':
      validateFirstName(value)
      break
    case 'lastName':
      validateLastName(value)
      break
    // Add cases for other fields...
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
    <form class="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow" @submit.prevent="submitForm">
      <div class="flex justify-between mb-6">
        <VaButton @click="goBack">
          <template #prepend>
            <i class="mdi mdi-arrow-left mr-2"></i>
          </template>
          Back
        </VaButton>
      </div>

      <div class="grid grid-cols-2 gap-8">
        <!-- Left Column: Basic Information -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold mb-4">Basic Information</h3>

          <!-- Avatar Upload -->
          <div class="mb-6 text-center">
            <div class="mb-4">
              <img v-if="avatarPreview" :src="avatarPreview" class="w-32 h-32 rounded-full mx-auto" />
              <div v-else class="w-32 h-32 rounded-full bg-gray-200 mx-auto flex items-center justify-center">
                <span class="text-gray-400">No Image</span>
              </div>
            </div>
            <input type="file" accept="image/*" class="mb-4" @change="handleAvatarUpload" />
          </div>

          <!-- First Name Input -->
          <div class="input-group">
            <VaInput
              v-model="doctor.firstName"
              label="First Name"
              :error="errors.firstName"
              :success="!errors.firstName && validFields.firstName"
              :class="{
                'input-success': !errors.firstName && validFields.firstName,
                'input-error': errors.firstName,
              }"
              @blur="validateFirstName(doctor.firstName)"
            />
            <div v-if="errors.firstName" class="error-message">
              {{ errors.firstName }}
            </div>
          </div>

          <!-- Last Name Input -->
          <div class="input-group">
            <VaInput
              v-model="doctor.lastName"
              label="Last Name"
              :error="errors.lastName"
              :success="!errors.lastName && validFields.lastName"
              :class="{
                'input-success': !errors.lastName && validFields.lastName,
                'input-error': errors.lastName,
              }"
              @blur="validateLastName(doctor.lastName)"
            />
            <div v-if="errors.lastName" class="error-message">
              {{ errors.lastName }}
            </div>
          </div>

          <!-- Username Input -->
          <div class="input-group">
            <VaInput
              v-model="doctor.userName"
              label="Username"
              :error="errors.userName"
              :success="!errors.userName && validFields.userName"
              :class="{
                'input-success': !errors.userName && validFields.userName,
                'input-error': errors.userName,
              }"
              @blur="validateUserName(doctor.userName)"
            />
            <div v-if="errors.userName" class="error-message">
              {{ errors.userName }}
            </div>
          </div>

          <div class="input-group">
            <VaInput
              v-model="doctor.email"
              label="Email"
              :error="errors.email"
              :success="!errors.email && validFields.email"
              @blur="handleBlur('email', doctor.email)"
            />
            <div v-if="errors.email" class="error-message">
              {{ errors.email }}
            </div>
          </div>

          <div class="input-group">
            <VaInput
              v-model="doctor.password"
              label="Password"
              type="password"
              :error="errors.password"
              :success="!errors.password && validFields.password"
              @blur="handleBlur('password', doctor.password)"
            />
            <div v-if="errors.password" class="error-message">
              {{ errors.password }}
            </div>
          </div>

          <div class="input-group">
            <VaInput
              v-model="doctor.confirmPassword"
              label="Confirm Password"
              type="password"
              :error="errors.confirmPassword"
              :success="!errors.confirmPassword && validFields.confirmPassword"
              @blur="validateConfirmPassword"
            />
            <div v-if="errors.confirmPassword" class="error-message">
              {{ errors.confirmPassword }}
            </div>
          </div>

          <!-- Phone Number Input -->
          <div class="input-group">
            <VaInput
              v-model="doctor.phoneNumber"
              label="Phone Number"
              :error="errors.phoneNumber"
              :success="!errors.phoneNumber && validFields.phoneNumber"
              :class="{
                'input-success': !errors.phoneNumber && validFields.phoneNumber,
                'input-error': errors.phoneNumber,
              }"
              @blur="validatePhoneNumber(doctor.phoneNumber)"
            />
            <div v-if="errors.phoneNumber" class="error-message">
              {{ errors.phoneNumber }}
            </div>
          </div>

          <VaInput v-model="doctor.address" label="Address" :error="errors.address" />

          <div class="va-input">
            <label
              class="va-input__label"
              style="color: var(--va-primary); text-transform: uppercase; font-size: 0.75rem; font-weight: 600"
              >Birth Date</label
            >
            <input
              v-model="doctor.birthDate"
              type="date"
              class="va-input__input w-full px-3 py-2 border rounded-md"
              :max="new Date().toISOString().split('T')[0]"
              style="height: 40px; color: var(--va-text-primary); background-color: var(--va-background-primary)"
            />
            <span v-if="errors.birthDate" class="va-input__error">{{ errors.birthDate }}</span>
          </div>

          <VaSelect
            v-model="doctor.gender"
            label="Gender"
            :options="genderOptions"
            :error="errors.gender"
            @update:modelValue="validateForm"
          />
        </div>

        <!-- Right Column: Professional Information -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold mb-4">Professional Information</h3>

          <VaInput v-model="doctor.specialization" label="Specialization" :error="errors.specialization" />

          <VaInput
            v-model.number="doctor.experience"
            label="Years of Experience"
            type="number"
            min="0"
            :error="errors.experience"
          />

          <VaInput v-model="doctor.qualification" label="Qualification" :error="errors.qualification" />

          <VaInput
            v-model.number="doctor.consultationFee"
            label="Consultation Fee"
            type="number"
            min="0"
            :error="errors.consultationFee"
          />

          <VaInput
            v-model="doctor.availableTime"
            label="Available Time"
            placeholder="e.g., Mon-Fri 9:00-17:00"
            :error="errors.availableTime"
          />

          <VaTextarea v-model="doctor.description" label="Description" :error="errors.description" rows="4" />
        </div>
      </div>

      <!-- Submit Button - Full Width -->
      <div class="mt-6">
        <VaButton type="submit" color="primary" :loading="isSubmitting" block> Add Doctor </VaButton>
      </div>
    </form>

    <!-- Confirmation Modal -->
    <VaModal v-model="showConfirmation" class="text-center" hide-default-actions>
      <div class="confirmation-modal">
        <!-- Icon Section -->
        <div class="text-center mb-6">
          <i class="mdi mdi-help-circle-outline text-6xl text-primary"></i>
        </div>

        <!-- Content Section -->
        <h3 class="text-2xl font-semibold mb-4">Confirm Action</h3>
        <p class="text-gray-600 mb-8">Are you sure you want to add this doctor?</p>

        <!-- Divider -->
        <VaDivider class="mb-6" />

        <!-- Buttons Section -->
        <div class="flex justify-end space-x-4">
          <VaButton color="gray" class="px-6" @click="showConfirmation = false"> Cancel </VaButton>
          <VaButton :loading="isSubmitting" class="px-6" @click="confirmAddDoctor"> Confirm </VaButton>
        </div>
      </div>
    </VaModal>

    <!-- Add Success Modal -->
    <VaModal v-model="showSuccess" class="text-center" hide-default-actions>
      <div class="success-modal">
        <!-- Success Icon -->
        <div class="text-center mb-6">
          <i class="mdi mdi-check-circle-outline text-6xl text-success"></i>
        </div>

        <!-- Success Message -->
        <h3 class="text-2xl font-semibold mb-4">Success!</h3>
        <p class="text-gray-600 mb-8">Doctor has been successfully added</p>

        <!-- Divider -->
        <VaDivider class="mb-6" />

        <!-- Close Button -->
        <div class="flex justify-end">
          <VaButton class="px-6" @click="closeSuccessModal"> Close </VaButton>
        </div>
      </div>
    </VaModal>
  </div>
</template>

<style scoped>
.va-input {
  margin-bottom: 1rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

h3 {
  color: var(--va-primary);
  border-bottom: 2px solid var(--va-primary);
  padding-bottom: 0.5rem;
}

.va-input__input {
  border: 1px solid var(--va-input-border);
  border-radius: var(--va-input-border-radius);
  background-color: var(--va-background);
  transition: all 0.2s ease;
}

.va-input__input:focus {
  outline: none;
  border-color: var(--va-primary);
}

.confirmation-modal,
.success-modal {
  padding: 2rem;
  min-width: 400px;
}

.mdi {
  line-height: 1;
}

.confirmation-modal .text-center,
.success-modal .text-center {
  margin-bottom: 2rem;
}

.confirmation-modal .text-6xl,
.success-modal .text-6xl {
  margin-bottom: 1rem;
}

.confirmation-modal .text-2xl,
.success-modal .text-2xl {
  margin-bottom: 0.5rem;
}

.confirmation-modal .text-gray-600,
.success-modal .text-gray-600 {
  margin-bottom: 1rem;
}

.confirmation-modal .va-button,
.success-modal .va-button {
  margin-top: 1rem;
}

.input-success {
  animation: flash-success 0.5s ease;
}

.input-error {
  animation: flash-error 0.5s ease;
}

@keyframes flash-success {
  0% {
    box-shadow: 0 0 0 0 rgba(72, 187, 120, 0.5);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(72, 187, 120, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(72, 187, 120, 0);
  }
}

@keyframes flash-error {
  0% {
    box-shadow: 0 0 0 0 rgba(245, 101, 101, 0.5);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(245, 101, 101, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(245, 101, 101, 0);
  }
}

.va-input {
  transition: all 0.3s ease;
}

.va-input.input-success :deep(.va-input__content) {
  border-color: var(--va-success);
}

.va-input.input-error :deep(.va-input__content) {
  border-color: var(--va-danger);
}

/* Add these CSS rules to handle icon display */
:deep(.va-input-wrapper__icon--success) {
  display: none !important;
}

:deep(.va-input-wrapper__icon--error) {
  display: none !important;
}

:deep(.va-input--success) .va-input-wrapper__icon--success {
  display: flex !important;
}

:deep(.va-input--error) .va-input-wrapper__icon--error {
  display: flex !important;
}

.input-group {
  position: relative;
  margin-bottom: 1.5rem;
}

.error-message {
  color: var(--va-danger);
  font-size: 0.875rem;
  margin-top: 0.25rem;
  padding: 0.25rem 0;
  background-color: rgba(var(--va-danger-rgb), 0.1);
  border-radius: 4px;
  padding-left: 0.5rem;
}
</style>
