<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDoctorProfileStore } from '@/stores/modules/doctor.module'
import { useServiceStore } from '@/stores/modules/service.module'

import { useToast, VaButton, VaCard, VaForm, VaSelect } from 'vuestic-ui'
import '@mdi/font/css/materialdesignicons.css'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const router = useRouter()
const doctorStore = useDoctorProfileStore()
const { init: toast } = useToast()
const serviceStore = useServiceStore()

const goBack = () => router.back()

interface DoctorForm {
  userName: string
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  phoneNumber: string
  gender: {
    value: true
    text: ''
  }
  imageUrl: File[]
  address: string
  typeServiceId: {
    value: string
    text: ''
  }
  birthDate: string
  role: string
  specialization: string
  experience: number
  qualification: string
  consultationFee: number
  description: string
  WorkingType: {
    value: number
    text: ''
  }
}

const doctor = reactive<DoctorForm>({
  userName: '',
  firstName: '',
  lastName: '',
  email: '',
  password: '123Pa$$word!',
  confirmPassword: '123Pa$$word!',
  phoneNumber: '',
  gender: {
    value: true,
    text: '',
  },
  typeServiceId: {
    value: '',
    text: '',
  },
  imageUrl: [] as File[],
  address: '',
  birthDate: '',
  role: 'Bác Sĩ',
  specialization: '',
  experience: 0,
  qualification: '',
  consultationFee: 0,
  description: '',
  WorkingType: {
    value: 0,
    text: '',
  },
})

const errors = reactive({
  firstName: { error: false, message: '' },
  lastName: { error: false, message: '' },
  email: { error: false, message: '' },
  phoneNumber: { error: false, message: '' },
  userName: { error: false, message: '' },
  birthDate: { error: false, message: '' },
  gender: { error: false, message: '' },
  typeServiceId: { error: false, message: '' },
  WorkingType: { error: false, message: '' },
  specialization: { error: false, message: '' },
  experience: { error: false, message: '' },
  qualification: { error: false, message: '' },
  consultationFee: { error: false, message: '' },
  description: { error: false, message: '' },
})
const fileName = ref('')
const isSubmitting = ref(false)
const showConfirmation = ref(false)
const showSuccess = ref(false)
const serviceTypes = ref<{ id: string; typeName: string }[]>([])
const fetchServiceTypes = async () => {
  try {
    const response = await serviceStore.getServiceType({})
    serviceTypes.value = response.data.map((service: { id: string; typeName: string }) => ({
      id: service.id,
      typeName: service.typeName,
    }))
  } catch (error) {
    console.error('Error fetching service types:', error)
    toast({ message: 'Không thể tải loại dịch vụ', color: 'danger' })
  }
}
onMounted(() => {
  fetchServiceTypes()
})
// Thêm các ref này cho trạng thái xác thực
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
    errors.email = { error: true, message: 'Email là bắt buộc' }
    validFields.email = false
    return false
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = { error: true, message: 'Định dạng email không hợp lệ' }
    validFields.email = false
    return false
  }
  errors.email = { error: false, message: '' }
  validFields.email = true
  return true
}

const validatePhoneNumber = (phone: string) => {
  if (!phone) {
    errors.phoneNumber = { error: true, message: 'Số điện thoại là bắt buộc' }
    validFields.phoneNumber = false
    return false
  }
  if (!/^\d{10,}$/.test(phone)) {
    errors.phoneNumber = { error: true, message: 'Số điện thoại phải chứa  10 chữ số' }
    validFields.phoneNumber = false
    return false
  }
  errors.phoneNumber = { error: false, message: '' }
  validFields.phoneNumber = true
  return true
}

const validateUserName = (userName: string) => {
  if (!userName) {
    errors.userName = { error: true, message: 'Tên đăng nhập là bắt buộc' }
    validFields.userName = false
    return false
  }
  errors.userName = { error: false, message: '' }
  validFields.userName = true
  return true
}

const validateName = (name: string): boolean => {
  const trimmedName = name.trim() // Loại bỏ khoảng trắng ở đầu và cuối
  const namePattern = /^[a-zA-ZÀ-ỹ\s]+$/u
  return namePattern.test(trimmedName)
}

const validateFirstName = (firstName: string) => {
  if (!firstName?.trim()) {
    errors.firstName = { error: true, message: 'Họ là bắt buộc' }
    validFields.firstName = false
    return false
  }
  if (!validateName(firstName)) {
    errors.firstName = { error: true, message: 'Họ chỉ được chứa chữ cái' }
    validFields.firstName = false
    return false
  }
  errors.firstName = { error: false, message: '' }
  validFields.firstName = true
  return true
}

const validateLastName = (lastName: string) => {
  if (!lastName?.trim()) {
    errors.lastName = { error: true, message: 'Tên là bắt buộc' }
    validFields.lastName = false
    return false
  }
  if (!validateName(lastName)) {
    errors.lastName = { error: true, message: 'Tên chỉ được chứa chữ cái' }
    validFields.lastName = false
    return false
  }
  errors.lastName = { error: false, message: '' }
  validFields.lastName = true
  return true
}

watch(
  () => doctor.email,
  (newValue) => {
    if (validateEmail(newValue)) {
      errors.email = { error: false, message: '' }
    }
  },
)

watch(
  () => doctor.phoneNumber,
  (newValue) => {
    if (validatePhoneNumber(newValue)) {
      errors.phoneNumber = { error: false, message: '' }
    }
  },
)

watch(
  () => doctor.birthDate,
  (newValue) => {
    validateAge(newValue)
  },
)

watch(
  () => doctor.userName,
  (newValue) => {
    if (validateUserName(newValue)) {
      errors.userName = { error: false, message: '' }
    }
  },
)

watch(
  () => doctor.firstName,
  (newValue) => {
    if (validateFirstName(newValue)) {
      errors.firstName = { error: false, message: '' }
    }
  },
)

watch(
  () => doctor.lastName,
  (newValue) => {
    if (validateLastName(newValue)) {
      errors.lastName = { error: false, message: '' }
    }
  },
)

const newImage = ref<string | null>(null) // New reactive property for the image preview
const emptyImage = 'path/to/placeholder/image.png' // Placeholder image path

const handleAvatarUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = input.files

  if (files && files.length > 0) {
    const file = files[0] // Get the first selected file
    const theReader = new FileReader()

    theReader.onloadend = async () => {
      newImage.value = (await theReader.result) as string // Set the new image for review
    }

    theReader.readAsDataURL(file) // Read the file as a data URL
    doctor.imageUrl = [file] // Store the file in doctor.imageUrl for later use
    fileName.value = files.length > 1 ? `${files.length} files selected` : files[0].name // Update fileName
  } else {
    doctor.imageUrl = []
    newImage.value = null // Reset newImage if no files are selected
    fileName.value = ''
  }
}

const submitForm = async () => {
  console.log('Working Type:', doctor.WorkingType) // Kiểm tra giá trị
  if (
    !validateEmail(doctor.email) ||
    !validatePhoneNumber(doctor.phoneNumber) ||
    !validateFirstName(doctor.firstName) ||
    !validateLastName(doctor.lastName) ||
    !validateUserName(doctor.userName) ||
    !validateForm()
  ) {
    toast({ message: t('doctor.fill_form'), color: 'danger' })
    return
  }
  showConfirmation.value = true
}

// ... existing code ...
// ... existing code ...
const confirmAddDoctor = async () => {
  try {
    isSubmitting.value = true

    // Validate required fields
    if (
      !validateEmail(doctor.email) ||
      !validatePhoneNumber(doctor.phoneNumber) ||
      !validateFirstName(doctor.firstName) ||
      !validateLastName(doctor.lastName) ||
      !validateUserName(doctor.userName) ||
      !validateTypeService() ||
      !validateEducation() ||
      !validateCollege() ||
      !validateCertification() ||
      !validateYearOfExp() ||
      !validateSelfDescription()
    ) {
      throw new Error('Vui lòng điền đúng tất cả các trường bắt buộc')
    }

    // Format data for API
    const formattedData = {
      FirstName: doctor.firstName,
      LastName: doctor.lastName,
      Email: doctor.email,
      IsMale: doctor.gender.value || true,
      BirthDay: doctor.birthDate,
      UserName: doctor.userName,
      Password: doctor.password,
      ConfirmPassword: doctor.confirmPassword,
      PhoneNumber: doctor.phoneNumber,
      Job: 'Bác Sĩ',
      Address: doctor.address,
      DoctorProfile: {
        DoctorID: '', // Set appropriate value if needed
        TypeServiceID: doctor.typeServiceId.value || '', // Use a fallback value if null
        Education: doctor.qualification || '',
        College: doctor.qualification || '',
        Certification: doctor.qualification || '',
        CertificationImage: doctor.imageUrl || 'url',
        YearOfExp: doctor.experience.toString(),
        SeftDescription: doctor.description || '',
        WorkingType: doctor.WorkingType.value,
      },
      Role: 'Dentist',
    }

    // Log the formatted data for debugging
    console.log('Đang gửi dữ liệu bác sĩ:', JSON.stringify(formattedData, null, 2))

    const response = await doctorStore.createDoctor({ request: formattedData })

    if (!response) {
      throw new Error('Không có phản hồi từ máy chủ')
    }

    showConfirmation.value = false
    showSuccess.value = true
  } catch (error: any) {
    console.error('Chi tiết lỗi:', error)
    // Thay đổi thông báo lỗi cho trường hợp 400
    if (error.response && error.response.status === 400) {
      toast({ message: 'Email hoặc số điện thoại đã tồn tại', color: 'danger' })
    }
    if ((error.response && error.response.status === 405) || error.response.status === 500) {
      toast({ message: 'máy chủ đang không hoạt động', color: 'danger' })
    } else {
      toast({ message: error.message || 'Thêm thất bại', color: 'danger' }) // Hiển thị thông báo thêm thất bại
    }
  } finally {
    isSubmitting.value = false
  }
}
// ... existing code ...
// ... existing code ...

const closeSuccessModal = () => {
  showSuccess.value = false
  router.push({ name: 'doctor-create' })
}

const validateForm = () => {
  let isValid = true

  if (!doctor.userName) {
    errors.userName = { error: true, message: 'Tên đăng nhập là bắt buộc' }
    isValid = false
  }
  if (!doctor.birthDate) {
    errors.birthDate = { error: true, message: 'Ngày sinh là bắt buộc' }
    isValid = false
  }
  if (doctor.gender === null) {
    errors.gender = { error: true, message: 'Vui lòng chọn giới tính' }
    isValid = false
  }

  if (!validateAge(doctor.birthDate)) {
    isValid = false
  }

  if (!validateExperience(doctor.experience)) {
    isValid = false
  }

  return isValid && Object.values(errors).every((error) => !error.error)
}
// Cập nhật các trình xử lý để kích hoạt khi mất tiêu điểm

// Thêm hàm xác thực này
const validateAge = (birthDate: string): boolean => {
  if (!birthDate) {
    errors.birthDate = { error: true, message: 'Ngày sinh là bắt buộc' }
    return false
  }

  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  if (age < 25) {
    errors.birthDate = { error: true, message: 'Bác sĩ phải ít nhất 25 tuổi' }
    return false
  }

  errors.birthDate = { error: false, message: '' }
  return true
}

const validateSpecialization = (specialization: string) => {
  if (!specialization?.trim()) {
    errors.specialization = { error: true, message: 'Chuyên khoa là bắt buộc' }
    return false
  }
  errors.specialization = { error: false, message: '' }
  return true
}

watch(
  () => doctor.specialization,
  (newValue) => {
    validateSpecialization(newValue)
  },
)

const validateExperience = (experience: number): boolean => {
  const age = new Date().getFullYear() - new Date(doctor.birthDate).getFullYear()
  if (experience > age - 18) {
    errors.experience = { error: true, message: 'Kinh nghiệm không hợp lí với độ tuổi' }
    return false
  }
  errors.experience = { error: false, message: '' }
  return true
}

watch(
  () => doctor.experience,
  (newValue) => {
    validateExperience(newValue)
  },
)

// Validation functions for new fields
const validateTypeService = () => {
  if (!doctor.typeServiceId) {
    errors.typeServiceId = { error: true, message: 'Type service is unavailable.' }
    return false
  }
  errors.typeServiceId = { error: false, message: '' }
  return true
}

const validateEducation = () => {
  if (!doctor.qualification) {
    errors.qualification = { error: true, message: 'Education is required for Doctor.' }
    return false
  }
  errors.qualification = { error: false, message: '' }
  return true
}

const validateCollege = () => {
  if (!doctor.qualification) {
    errors.qualification = { error: true, message: 'College is required for Doctor.' }
    return false
  }
  errors.qualification = { error: false, message: '' }
  return true
}

const validateCertification = () => {
  if (!doctor.qualification) {
    errors.qualification = { error: true, message: 'Certification is required for Doctor.' }
    return false
  }
  errors.qualification = { error: false, message: '' }
  return true
}

const validateYearOfExp = () => {
  if (!doctor.experience) {
    errors.experience = { error: true, message: 'YearOfExp is required for Doctor.' }
    return false
  }
  errors.experience = { error: false, message: '' }
  return true
}

const validateSelfDescription = () => {
  if (!doctor.description) {
    errors.description = { error: true, message: 'SeftDescription is required for Doctor.' }
    return false
  }
  errors.description = { error: false, message: '' }
  return true
}
</script>

<template>
  <VaCard class="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
    <VaForm class="form-container max-w-6xl mx-auto p-6 rounded-lg shadow" @submit.prevent="submitForm">
      <VaCard class="flex justify-between mb-6">
        <VaButton @click="goBack">
          <template #prepend>
            <i class="mdi mdi-arrow-left mr-2"></i>
          </template>
          {{ t('doctor.back') }}
        </VaButton>
      </VaCard>

      <VaCard class="grid grid-cols-2 gap-8">
        <div class="space-y-4">
          <h3 class="text-lg font-semibold mb-4">{{ t('doctor.Basic_information') }}</h3>

          <div class="input-group">
            <VaInput
              v-model="doctor.firstName"
              :label="t('doctor.first_Name')"
              :error="errors.firstName.error"
              :error-messages="errors.firstName.message"
              :success="validFields.firstName"
              @blur="validateFirstName(doctor.firstName)"
            />
          </div>

          <div class="input-group">
            <VaInput
              v-model="doctor.lastName"
              :label="t('doctor.last_Name')"
              :error="errors.lastName.error"
              :error-messages="errors.lastName.message"
              :success="validFields.lastName"
              @blur="validateLastName(doctor.lastName)"
            />
          </div>

          <div class="input-group">
            <VaInput
              v-model="doctor.userName"
              :label="t('doctor.name')"
              :error="errors.userName.error"
              :error-messages="errors.userName.message"
              :success="validFields.userName"
              @blur="validateUserName(doctor.userName)"
            />
          </div>

          <div class="input-group">
            <VaInput
              v-model="doctor.email"
              :label="t('doctor.email')"
              :error="errors.email.error"
              :error-messages="errors.email.message"
              :success="validFields.email"
              @blur="validateEmail(doctor.email)"
            />
          </div>

          <div class="input-group">
            <VaInput
              v-model="doctor.phoneNumber"
              :label="t('doctor.phone')"
              :error="errors.phoneNumber.error"
              :error-messages="errors.phoneNumber.message"
              :success="validFields.phoneNumber"
              @blur="validatePhoneNumber(doctor.phoneNumber)"
            />
          </div>

          <div class="va-input">
            <label
              style="color: var(--va-primary)"
              class="va-input-label va-input-wrapper__label va-input-wrapper__label--outer"
            >
              {{ t('doctor.birth_date') }}
            </label>
            <VaInput
              v-model="doctor.birthDate"
              type="date"
              :max="new Date(new Date().setFullYear(new Date().getFullYear() - 25)).toISOString().split('T')[0]"
            />
            <span v-if="errors.birthDate.error" class="text-red-500 text-sm">{{ errors.birthDate.message }}</span>
          </div>

          <div class="input-group">
            <label
              for="gender"
              style="color: var(--va-primary)"
              class="va-input-label va-input-wrapper__label va-input-wrapper__label--outer"
            >
              {{ t('doctor.gender') }}
            </label>
            <VaSelect
              id="gender"
              v-model="doctor.gender"
              :options="[
                { value: true, text: t('doctor.male') },
                { value: false, text: t('doctor.female') },
              ]"
              @input="validateForm"
            />
            <span v-if="errors.gender.error" class="text-red-500 text-sm">{{ errors.gender.message }}</span>
          </div>
        </div>

        <div class="space-y-4">
          <h3 class="text-lg font-semibold mb-4">{{ t('doctor.Professional_Information') }}</h3>
          <label
            for="serviceType"
            style="color: var(--va-primary)"
            class="va-input-label va-input-wrapper__label va-input-wrapper__label--outer"
            >{{ t('doctor.certification_image') }}
          </label>
          <!-- File Upload Container -->
          <VaCard
            class="flex flex-col items-center justify-center w-full p-6 bg-white border-2 border-dashed border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition"
          >
            <!-- Instructions -->
            <div class="text-center mb-4">
              <p class="text-gray-600 text-sm font-medium">{{ t('doctor.Upload_File') }}</p>
              <p class="text-gray-500 text-xs">{{ t('doctor.Upload_File_2') }}</p>
            </div>

            <!-- File Input -->
            <label
              for="fileUpload"
              class="relative cursor-pointer bg-indigo-500 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-indigo-600 transition focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {{ t('doctor.Select_File') }}
              <input id="fileUpload" type="file" class="sr-only" @change="handleAvatarUpload($event)" />
            </label>

            <!-- Display selected file name -->
            <div v-if="fileName" class="mt-4 text-sm text-gray-600">
              {{ t('doctor.Select_File') }}: <span class="font-medium text-indigo-600">{{ fileName }}</span>
            </div>

            <!-- Image Review Section -->
            <!-- Image Review Section -->
            <div v-if="newImage" class="image-review">
              <!-- Overlay to blur the background -->
              <div class="overlay"></div>

              <!-- Image with zoom effect -->
              <img
                alt="Preview"
                :src="newImage || emptyImage"
                class="w-32 h-32 object-cover border border-gray-300 rounded-lg shadow hover:zoom-image"
              />
            </div>
          </VaCard>
          <label
            for="serviceType"
            style="color: var(--va-primary)"
            class="va-input-label va-input-wrapper__label va-input-wrapper__label--outer"
            >{{ t('doctor.specialty') }}</label
          >
          <VaSelect
            id="serviceType"
            v-model="doctor.typeServiceId"
            :options="serviceTypes.map((service) => ({ value: service.id, text: service.typeName }))"
            class="w-full"
            @input="validateForm"
          />

          <div class="input-group">
            <label
              for="workingType"
              style="color: var(--va-primary)"
              class="va-input-label va-input-wrapper__label va-input-wrapper__label--outer"
              >{{ t('doctor.Job_Type') }}</label
            >
            <VaSelect
              id="workingType"
              v-model="doctor.WorkingType"
              :options="[
                { value: 1, text: t('doctor.part_time') },
                { value: 2, text: t('doctor.full_time') },
              ]"
              class="w-full"
              @input="validateForm"
            />
          </div>

          <div class="input-group">
            <VaInput
              v-model.number="doctor.experience"
              :label="t('doctor.experience')"
              type="number"
              min="0"
              :error="errors.experience.error"
            />
            <span v-if="errors.experience.error" class="text-red-500 text-sm">{{ errors.experience.message }}</span>
          </div>

          <VaInput
            v-model="doctor.qualification"
            :label="t('doctor.certification')"
            :error="errors.qualification.error"
          />

          <VaTextarea
            v-model="doctor.description"
            :autosize="true"
            style="
              height: auto;
              width: 520px;
              overflow: hidden;
              min-height: 50px; /* Chiều cao tối thiểu */
              resize: none; /* Vô hiệu hóa kéo thủ công */
            "
            :label="t('doctor.Description')"
            class="auto-resize"
          />
        </div>
      </VaCard>

      <VaCard class="flex justify-end mt-6">
        <VaButton type="submit" color="primary">{{ t('doctor.add_doctor') }}</VaButton>
      </VaCard>
    </VaForm>

    <!-- Modal xác nhận -->
    <VaModal v-model="showConfirmation" class="text-center" overlay hide-default-actions>
      <div class="confirmation-modal">
        <h3 class="text-2xl font-semibold mb-4">{{ t('doctor.Confirm_action') }}</h3>
        <p class="text-gray-600 mb-8">{{ t('doctor.question_comfirm') }}</p>
        <VaDivider class="mb-6" />
        <div class="flex justify-end space-x-4">
          <VaButton color="danger" :disabled="isSubmitting" @click="confirmAddDoctor">{{
            t('doctor.Confirm')
          }}</VaButton>
          <VaButton @click="showConfirmation = false">{{ t('doctor.cancel') }}</VaButton>
        </div>
      </div>
    </VaModal>

    <!-- Success Modal -->
    <VaModal v-model="showSuccess" class="text-center" hide-default-actions>
      <div class="confirmation-modal">
        <h3 class="text-2xl font-semibold mb-4">{{ t('doctor.Success') }}</h3>
        <p class="text-gray-600 mb-8">{{ t('doctor.added') }}</p>
        <VaButton @click="closeSuccessModal">{{ t('doctor.close') }}</VaButton>
      </div>
    </VaModal>
  </VaCard>
</template>

<style scoped>
.min-h-screen {
  min-height: 100vh;
}
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

/* Thêm các quy tắc CSS này để xử lý hiển thị biểu tượng */
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
.va-input__input {
  border: 0.5px solid #dfe6f2;
  /* Example for a green border */
  border-radius: 8px;
  padding: 10px;
  font-size: 16px;
}
.va-button:hover {
  background: #1cc88a;
  transform: translateY(-2px);
  transition: all 0.3s ease;
}
.image-review {
  position: relative; /* Đảm bảo container này quản lý các phần tử con */
}

.hover\:zoom-image {
  transition:
    transform 0.3s ease,
    filter 0.3s ease; /* Hiệu ứng mượt */
  position: relative;
  z-index: 1;
}

.hover\:zoom-image:hover {
  transform: scale(4); /* Phóng to hình ảnh khi hover */
  z-index: 2; /* Đưa hình ảnh lên trên overlay */
}

/* Overlay styling */
.image-review .overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7); /* Màu nền mờ */
  z-index: 1;
  pointer-events: none; /* Không chặn thao tác chuột */
  transition:
    opacity 0.3s ease,
    filter 0.3s ease;
  filter: blur(0px); /* Không làm mờ mặc định */
  opacity: 0;
}

.image-review:hover .overlay {
  filter: blur(5px); /* Làm mờ nền */
  opacity: 1; /* Hiển thị overlay */
}
@media (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(1, 1fr); /* Một cột trên màn hình nhỏ */
  }

  .form-container {
    padding: 4px;
  }

  .input-group,
  .va-input {
    margin-bottom: 1rem; /* Giảm khoảng cách giữa các trường nhập */
  }

  h3 {
    font-size: 18px; /* Điều chỉnh kích thước tiêu đề cho dễ đọc trên thiết bị nhỏ */
  }

  .va-input__input {
    font-size: 14px; /* Giảm kích thước font để vừa vặn hơn */
  }

  .confirmation-modal,
  .success-modal {
    min-width: 300px;
    padding: 1rem;
  }
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr; /* Chỉ một cột trên các thiết bị nhỏ hơn */
  }

  .input-group,
  .va-input {
    margin-bottom: 1rem; /* Giảm khoảng cách giữa các trường nhập */
  }

  .va-button {
    width: 100%; /* Đảm bảo nút có độ rộng 100% trên màn hình nhỏ */
  }

  .va-card {
    padding: 20px; /* Điều chỉnh padding cho card trên các thiết bị nhỏ */
  }

  .form-container {
    padding: 4px; /* Điều chỉnh padding để phù hợp với không gian */
  }
}

/* Media Query cho các thiết bị cực nhỏ */
@media (max-width: 480px) {
  .va-input__input {
    font-size: 12px; /* Giảm kích thước font cho thiết bị di động */
  }

  .va-button {
    padding: 10px; /* Điều chỉnh padding cho nút */
  }

  h3 {
    font-size: 16px; /* Kích thước tiêu đề nhỏ hơn */
  }

  .input-group {
    margin-bottom: 0.8rem; /* Giảm khoảng cách giữa các trường nhập */
  }
}
</style>
