<script lang="ts" setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import {
  ChangeEmailFormData,
  ChangePhoneNumberFormData,
  PasswordDetailFormData,
  SettingProfile,
  UserDetailFormData,
  UserDetailsUpdate,
  // DoctorDetailFormData,
  DoctorDetailsUpdate,
  Rela,
  PatientFamilyUpdate,
  MedicalHistoryUpdate,
  PatientProfileUpdate,
  WorkingType,
  // RoleEnum,
} from './types'
import { VaAvatar, useForm, useToast } from 'vuestic-ui'
import { useAuthStore } from '@/stores/modules/auth.module'
import { AvatarFiles, OTP } from './UserProfile.enum'
import { useUserProfileStore } from '@/stores/modules/user.module'

import { getErrorMessage } from '@/services/utils'
import { useI18n } from 'vue-i18n'
import AddressAutocomplete from '../auth/AddressAutocomplete.vue'

const { t } = useI18n()

interface VaFile {
  name: string
  size: number
  type: string
  lastModified: number
}

const props = defineProps({
  settingOption: {
    type: Object as () => SettingProfile | null,
    default: null,
  },
})
const relationshipOptions = [
  { text: t('auth.father'), value: Rela.Father, id: 1 },
  { text: t('auth.mother'), value: Rela.Mother, id: 2 },
  { text: t('auth.sister'), value: Rela.Sister, id: 3 },
  { text: t('auth.brother'), value: Rela.Brother, id: 4 },
]
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { init: notify } = useToast()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const authStores = useAuthStore()
const userProfileStore = useUserProfileStore()
const isShowProfile = ref(false)
const isMobile = computed(() => window.innerWidth < 768)
const isShowDoctorProfile = ref(false)
const isShowPatientFamily = ref(false)
const isShowMedicalHistory = ref(false)
const isShowPatientProfile = ref(false)
const OTPTime = ref(OTP.TimeOut)
const typesImage = ref(AvatarFiles.Type)
const isPatient = computed(() => authStores.musHaveRole('Patient'))
const isShowModal = ref({
  email: false,
  phoneNumber: false,
  removeAvatar: false,
})
const isShowChangePhoneOTP = ref(false)
const { validate, isValid } = useForm('form')
const {
  validate: validateChangePassword,
  isValid: isValidChangePassword,
  reset: resetChangePassword,
} = useForm('formChangePassword')
const { reset: resetChangeEmail } = useForm('formChangeEmail')
const { reset: resetChangePhone } = useForm('formChangePhone')
const { reset: resetChangePhoneOTP } = useForm('formChangePhoneOTP')
const userDetail = ref<UserDetailFormData>({
  firstName: '',
  lastName: '',
  dob: null,
  gender: null,
  email: '',
  phoneNumber: '',
  imageUrl: '',
  job: '',
  address: '',
  // role: RoleEnum.User,
  doctorProfile: {
    education: '',
    college: '',
    certification: '',
    yearOfExp: '',
    seftDescription: '',
    certificationImage: [],
    workingType: WorkingType.None,
    typeServiceID: '',
    isActive: true,
  },
  patientFamily: {
    name: '',
    phone: '',
    email: '',
    relationship: Rela.Father,
  },
  medicalHistory: {
    medicalName: [],
    note: '',
  },
  PatientProfile: {
    id: '',
    userId: '',
    idCardNumber: '',
    occupation: '',
  },
})

const passwordDetail = ref<PasswordDetailFormData>({
  password: '',
  confirmNewPassword: '',
  newPassword: '',
})
// const doctorDetail = ref<DoctorDetailFormData>({
//   education: '',
//   college: '',
//   certification: '',
//   yearOfExp: '',
//   seftDescription: '',
// })
const fileUploaded = ref(null)

const selectedMedicalItems = reactive<Record<string, boolean>>({})

const updateMedicalName = () => {
  const selectedNames = Object.entries(selectedMedicalItems)
    .filter(([, checked]) => checked)
    .map(([value]) => value)

  // Đảm bảo medicalHistory và medicalName tồn tại
  if (!formData.medicalHistory) {
    formData.medicalHistory = {
      medicalName: [],
      note: '',
    }
  }
  formData.medicalHistory.medicalName = selectedNames
}

const initializeMedicalItems = () => {
  medicalHistoryOptions.forEach((option) => {
    selectedMedicalItems[option.value] = formData.medicalHistory?.medicalName?.includes(option.value) || false
  })
}

const getUserDetail = async () => {
  try {
    await userProfileStore.getUserProfile()
    userDetail.value = {
      firstName: userProfileStore?.userDetails?.firstName,
      lastName: userProfileStore?.userDetails?.lastName,
      dob: userProfileStore?.userDetails?.birthDate,
      gender: userProfileStore?.userDetails?.gender,
      email: userProfileStore?.userDetails?.email,
      phoneNumber: userProfileStore?.userDetails?.phoneNumber,
      imageUrl: userProfileStore?.userDetails?.imageUrl,
      job: userProfileStore?.userDetails?.job,
      address: userProfileStore?.userDetails?.address,
      // role: userProfileStore?.userDetails?.role,
      doctorProfile: {
        education: userProfileStore?.userDetails?.doctorProfile?.education ?? '',
        college: userProfileStore?.userDetails?.doctorProfile?.college ?? '',
        certification: userProfileStore?.userDetails?.doctorProfile?.certification ?? '',
        yearOfExp: userProfileStore?.userDetails?.doctorProfile?.yearOfExp ?? '',
        seftDescription: userProfileStore?.userDetails?.doctorProfile?.seftDescription ?? '',
        certificationImage: userProfileStore?.userDetails?.doctorProfile?.certificationImage ?? [],
        workingType: userProfileStore?.userDetails?.doctorProfile?.workingType ?? WorkingType.None,
        typeServiceID: userProfileStore?.userDetails?.doctorProfile?.typeServiceID ?? '',
        isActive: userProfileStore?.userDetails?.doctorProfile?.isActive ?? true,
      },
      patientFamily: {
        name: userProfileStore?.userDetails?.patientFamily?.name || '', // Thuộc tính `name` ở đây nằm trong `patientFamily`
        phone: userProfileStore?.userDetails?.patientFamily?.phone || '',
        email: userProfileStore?.userDetails?.patientFamily?.email || '',
        relationship: userProfileStore?.userDetails?.patientFamily?.relationship || Rela.Father,
      },
      medicalHistory: {
        medicalName: userProfileStore?.userDetails?.medicalHistory?.medicalName || [],
        note: userProfileStore?.userDetails?.medicalHistory?.note || '',
      },
      PatientProfile: {
        id: userProfileStore?.userDetails?.patientProfile?.id || '',
        userId: userProfileStore?.userDetails?.id || '',
        idCardNumber: userProfileStore?.userDetails?.patientProfile?.idCardNumber || '',
        occupation: userProfileStore?.userDetails?.patientProfile?.occupation || '',
      },
    }
    Object.assign(formData, userDetail.value)
    authStores.updateAvatarUrl(userDetail.value.imageUrl ? userDetail.value.imageUrl : undefined)
    doctorProfile.value = {
      education: userProfileStore?.userDetails?.doctorProfile?.education,
      college: userProfileStore?.userDetails?.doctorProfile?.college,
      certification: userProfileStore?.userDetails?.doctorProfile?.certification,
      yearOfExp: userProfileStore?.userDetails?.doctorProfile?.yearOfExp,
      seftDescription: userProfileStore?.userDetails?.doctorProfile?.seftDescription,
    }
    patientFamily.value = {
      name: userProfileStore?.userDetails?.patientFamily?.name,
      phone: userProfileStore?.userDetails?.patientFamily?.phone,
      email: userProfileStore?.userDetails?.patientFamily?.email,
      relationship: userProfileStore?.userDetails?.patientFamily?.relationship,
    }
    medicalHistory.value = {
      medicalname: userProfileStore?.userDetails?.medicalHistory?.medicalName || [],
      note: userProfileStore?.userDetails?.medicalHistory?.note,
    }
    PatientProfile.value = {
      userId: userProfileStore?.userDetails?.id,
      Id: userProfileStore?.userDetails?.patientProfile?.id || '',
      idCardNumber: userProfileStore?.userDetails?.patientProfile?.idCardNumber,
      occupation: userProfileStore?.userDetails?.patientProfile?.occupation,
    }
    initializeMedicalItems()
  } catch (error) {
    console.error(error)
  }
}

watch(
  () => props.settingOption?.id,
  (id) => {
    const showProfile = id === '1'
    if (showProfile) {
      getUserDetail()
      isShowProfile.value = true
      isShowDoctorProfile.value = false
      isShowMedicalHistory.value = false
      isShowPatientFamily.value = false
      isShowPatientProfile.value = false
    } else if (id === '3') {
      // Tab Doctor
      getUserDetail() // vẫn gọi API để lấy data
      isShowDoctorProfile.value = true
      isShowProfile.value = false
      isShowMedicalHistory.value = false
      isShowPatientFamily.value = false
      isShowPatientProfile.value = false
    } else if (id === '4') {
      // Tab Patient Family
      getUserDetail() // vẫn gọi API để lấy data
      isShowPatientFamily.value = true
      isShowProfile.value = false
      isShowDoctorProfile.value = false
      isShowMedicalHistory.value = false
      isShowPatientProfile.value = false
    } else if (id === '5') {
      // Tab Medical History
      getUserDetail() // vẫn gọi API để lấy data
      isShowMedicalHistory.value = true
      isShowProfile.value = false
      isShowDoctorProfile.value = false
      isShowPatientFamily.value = false
      isShowPatientProfile.value = false
    } else if (id === '6') {
      // Tab Patient Profile
      getUserDetail() // vẫn gọi API để lấy data
      isShowPatientProfile.value = true
      isShowProfile.value = false
      isShowDoctorProfile.value = false
      isShowMedicalHistory.value = false
      isShowPatientFamily.value = false
    } else {
      isShowProfile.value = false
      isShowDoctorProfile.value = false
      isShowMedicalHistory.value = false
      isShowPatientFamily.value = false
      isShowPatientProfile.value = false
    }
  },
  { immediate: true },
)
// watch(() => userDetail.value?.doctorProfile, (newProfile) => {
//   if (newProfile && isDoctor.value) {
//     formData.doctorProfile = {
//       education: newProfile.education ?? null,
//       college: newProfile.college ?? null,
//       certification: newProfile.certification ?? null,
//       yearOfExp: newProfile.yearOfExp ?? null,
//       selfDescription: newProfile.seftDescription ?? null
//     }
//   }
// }, { immediate: true })
onMounted(() => {
  getUserDetail()
  isShowProfile.value = props.settingOption?.id === '1'
  isShowDoctorProfile.value = props.settingOption?.id === '3'
  isShowPatientFamily.value = props.settingOption?.id === '4'
  isShowMedicalHistory.value = props.settingOption?.id === '5'
  isShowPatientProfile.value = props.settingOption?.id === '6'
})

// test
// const isDoctor = computed(() => {
//   return userProfileStore?.userDetails?.role === 'DOCTOR'
// })
//end test

const formData = reactive({
  ...userDetail.value,
  doctorProfile: { ...userDetail.value.doctorProfile },
  patientFamily: { ...userDetail.value.patientFamily },
  medicalHistory: { ...userDetail.value.medicalHistory },
  PatientProfile: { ...userDetail.value.PatientProfile },
})
const doctorProfile = ref<any>({
  education: '',
  college: '',
  certification: '',
  yearOfExp: '',
  seftDescription: '',
})
const patientFamily = ref<any>({
  name: '',
  phone: '',
  email: '',
  relationship: Rela.Father,
})
const medicalHistory = ref<any>({
  medicalname: [],
  note: '',
})
const PatientProfile = ref<any>({
  id: '',
  userId: '',
  idCardNumber: '',
  occupation: '',
})
// const formDataGetDoctor = reactive({ ...doctorDetail.value })
const formDataChangePassword = reactive({ ...passwordDetail.value })
const formDataChangePhoneNumber = reactive({ phoneNumber: '', password: '' })
const formDataChangePhoneOTP = reactive({ otpCode: '' })
const formDataChangeEmail = reactive({ email: '', password: '' })

const phoneNumberRules: ((v: string) => boolean | string)[] = [
  (v) => !!v || t('auth.phone_number_required'),
  (v) => (v && v.length >= 10) || t('auth.phone_number_min_length'),
  (v) => (v && v.length <= 15) || t('auth.phone_number_max_length'),
  (v) => (v && /^\d+$/.test(v)) || t('auth.phone_number_only_numbers'),
]

const phoneOtpRules: ((v: string) => boolean | string)[] = [
  (v) => !!v || t('auth.otp_code_required'),
  (v) => (v && v.length == 6) || t('auth.otp_code_length'),
  (v) => (v && /^\d+$/.test(v)) || t('auth.otp_code_only_numbers'),
]

const emailRules: ((v: string) => boolean | string)[] = [
  (v) => !!v || t('auth.email_required'),
  (v) => /.+@.+\..+/.test(v) || t('auth.email_valid'),
]

const passwordRules: ((v: string) => boolean | string)[] = [
  (v) => !!v || t('auth.password_required'),
  (v) => (v && v.length >= 8) || t('auth.password_min_length'),
  (v) => (v && /[A-Za-z]/.test(v)) || t('auth.password_letter_required'),
  (v) => (v && /\d/.test(v)) || t('auth.password_number_required'),
  (v) => (v && /[!@#$%^&*(),.?":{}|<>]/.test(v)) || t('auth.password_special_character_required'),
]

const genderOptions = reactive([
  {
    text: t('auth.male'),
    value: true,
  },
  {
    text: t('auth.female'),
    value: false,
  },
])

const checkEmptyField = (value: any) => {
  if (value === null || value === undefined) return true
  if (typeof value === 'string' && value.trim() === '') return true
  return false
}
const isInValidField = (value: string, rules: any[]) => {
  return rules.some((rule) => typeof rule(value) === 'string')
}

const shortNameLetter = computed(() => userProfileStore?.userDetails?.firstName?.charAt(0).toUpperCase())

const isFormHasNotChanged = computed(() => {
  return Object.entries(userDetail.value).every(([key, value]) => {
    return (formData as { [key: string]: any })[key] === value
  })
})

const isFormHasNotChangedDoctor = computed(() => {
  const doctorProfiles = userDetail.value.doctorProfile

  if (!doctorProfiles || typeof doctorProfiles !== 'object') {
    return false
  }

  return Object.entries(doctorProfiles).every(([key, value]) => {
    return doctorProfile.value[key] === value
  })
})

const isFormHasNotChangedPatientFamily = computed(() => {
  const patientFamilies = userDetail.value.patientFamily

  if (!patientFamilies || typeof patientFamilies !== 'object') {
    return false
  }

  return Object.entries(patientFamilies).every(([key, value]) => {
    return patientFamily.value[key] === value
  })
})

const isFormHasNotChangedMedicalHistory = computed(() => {
  const medicalHistories = userDetail.value.medicalHistory

  if (!medicalHistories || typeof medicalHistories !== 'object') {
    return false
  }

  return Object.entries(medicalHistories).every(([key, value]) => {
    return medicalHistory.value[key] === value
  })
})

const isFormHasNotChangedPatientProfile = computed(() => {
  const PatientProfiles = userDetail.value.PatientProfile

  if (!PatientProfiles || typeof PatientProfiles !== 'object') {
    return false
  }

  return Object.entries(PatientProfiles).every(([key, value]) => {
    return PatientProfile.value[key] === value
  })
})
// isDisabled button update profile
const isDisabledButtonUpdateProfile = computed(() => {
  if (isFormHasNotChanged.value) return true
  else if (!isValid) return true
  else if (
    checkEmptyField(formData.firstName) ||
    checkEmptyField(formData.lastName) ||
    checkEmptyField(formData.dob) ||
    checkEmptyField(formData.gender)
  ) {
    return true
  }
  return false
})
// isDisabled button change password
const isDisabledButtonChangePassword = computed(() => {
  if (!isValidChangePassword.value) {
    return true
  } else if (
    checkEmptyField(formDataChangePassword.password) ||
    checkEmptyField(formDataChangePassword.confirmNewPassword) ||
    checkEmptyField(formDataChangePassword.newPassword)
  ) {
    return true
  }
  return false
})
//isdisabled button change doctor profile
const isDisabledButtonChangeDoctorProfile = computed(() => {
  if (isFormHasNotChangedDoctor.value) return true
  else if (!isValid) return true
  else if (
    checkEmptyField(formData.doctorProfile.education) ||
    checkEmptyField(formData.doctorProfile.college) ||
    checkEmptyField(formData.doctorProfile.certification) ||
    checkEmptyField(formData.doctorProfile.yearOfExp) ||
    checkEmptyField(formData.doctorProfile.seftDescription)
  ) {
    return true
  }
  return false
})

const isDisabledButtonChangePatientFamily = computed(() => {
  if (!isValid) {
    return true
  } else if (isFormHasNotChangedPatientFamily.value) {
    return true
  } else if (
    checkEmptyField(formData.patientFamily.name) ||
    checkEmptyField(formData.patientFamily.phone) ||
    checkEmptyField(formData.patientFamily.email) ||
    checkEmptyField(formData.patientFamily.relationship)
  ) {
    // get value of relationship
    return true
  }
  return false
})

const validateMedicalName = computed(() => {
  const selectedCount = Object.values(selectedMedicalItems).filter((value) => value === true).length
  return selectedCount > 0
})

const isDisabledButtonChangeMedicalHistory = computed(() => {
  // Kiểm tra form có thay đổi không
  const hasChanges = !isFormHasNotChangedMedicalHistory.value

  // Kiểm tra có ít nhất 1 medical name được chọn
  const hasMedicalNames = validateMedicalName.value

  // Kiểm tra note không được để trống
  const hasNote = !checkEmptyField(formData.medicalHistory.note)

  // Button sẽ enable khi:
  // 1. Form có sự thay đổi
  // 2. Có ít nhất 1 medical name được chọn
  // 3. Note không để trống
  return !(hasChanges && hasMedicalNames && hasNote)
})

const isDisabledButtonChangePatientProfile = computed(() => {
  if (!isValid) {
    return true
  } else if (isFormHasNotChangedPatientProfile.value) {
    return true
  } else if (
    checkEmptyField(formData.PatientProfile.idCardNumber) ||
    checkEmptyField(formData.PatientProfile.occupation)
  ) {
    return true
  }
  return false
})
// isDisabled button change email
const isDisabledButtonChangeEmail = computed(() => {
  if (
    isInValidField(formDataChangeEmail.email, emailRules) ||
    isInValidField(formDataChangeEmail.password, passwordRules)
  ) {
    return true
  } else if (checkEmptyField(formDataChangeEmail.password) || checkEmptyField(formDataChangeEmail.email)) {
    return true
  }
  return false
})

const isDisabledButtonChangePhoneNumber = computed(() => {
  if (
    isInValidField(formDataChangePhoneNumber.phoneNumber, phoneNumberRules) ||
    isInValidField(formDataChangePhoneNumber.password, passwordRules)
  ) {
    return true
  } else if (
    checkEmptyField(formDataChangePhoneNumber.phoneNumber) ||
    checkEmptyField(formDataChangePhoneNumber.password)
  ) {
    return true
  }
  return false
})

const isDisabledButtonChangePhoneOTP = computed(() => {
  if (isInValidField(formDataChangePhoneOTP.otpCode, phoneOtpRules)) {
    return true
  } else if (checkEmptyField(formDataChangePhoneOTP.otpCode)) {
    return true
  }
  return false
})

const getDateFormated = (date: Date) => {
  const year = date?.getFullYear()
  const month = String(date?.getMonth() + 1).padStart(2, '0')
  const day = String(date?.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
//submit user profile
const submit = async () => {
  if (validate()) {
    const dob: any = formData?.dob
    const date = getDateFormated(new Date(dob))
    const userDetailData: UserDetailsUpdate = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      gender: formData.gender,
      birthDate: date,
    }
    await userProfileStore
      .updateProfile(userDetailData)
      .then(() => {
        notify({
          title: t('auth.success'),
          message: t('auth.updated_profile_successfully'),
          color: 'success',
        })
        getUserDetail()
      })
      .catch((error) => {
        const message = getErrorMessage(error)
        notify({
          title: t('auth.error'),
          message: message,
          color: 'danger',
        })
      })
  }
}

// submit doctor profile

const submitDoctorProfile = async () => {
  if (validate()) {
    const doctorProfileData: DoctorDetailsUpdate = {
      education: formData.doctorProfile.education ?? '',
      college: formData.doctorProfile.college ?? '',
      certification: formData.doctorProfile.certification ?? '',
      yearOfExp: formData.doctorProfile.yearOfExp ?? '',
      seftDescription: formData.doctorProfile.seftDescription ?? '',
      workingType: formData.doctorProfile.workingType ?? WorkingType.None,
      typeServiceID: formData.doctorProfile.typeServiceID ?? '',
      isActive: formData.doctorProfile.isActive ?? true,
      certificationImage: formData.doctorProfile.certificationImage ?? [],
    }
    await userProfileStore
      .updateDoctorProfile(doctorProfileData)
      .then(() => {
        notify({
          title: t('auth.success'),
          message: t('auth.updated_doctor_profile_successfully'),
          color: 'success',
        })
        getUserDetail()
      })
      .catch((error) => {
        const message = getErrorMessage(error)
        notify({
          title: t('auth.error'),
          message: message,
          color: 'danger',
        })
      })
  }
}

const getRelationShipValue = (value: Rela | undefined) => {
  return relationshipOptions.find((item) => item.value === value)?.value
}

// const patientFamilyModal = ref<any>({
//   isUpdatePatientFamily: true,
//   patientFamily: {
//     name: '',
//     phone: '',
//     email: '',
//     relationship: 1,
//   },
// })

// submit Patient Family
const submitPatientFamily = async () => {
  if (validate()) {
    // Lấy thông tin từ form
    const value = formData.patientFamily.relationship
    console.log('Value:', userDetail.value.PatientProfile?.id)
    // Dữ liệu cần cập nhật
    const updatedData: PatientFamilyUpdate = {
      patientProfileId: userProfileStore?.userDetails ? userProfileStore?.userDetails?.patientProfile?.id : '', // Dùng ID của PatientProfile hoặc User nếu không có
      isUpdatePatientFamily: true,
      patientFamily: {
        name: formData.patientFamily.name ?? '',
        phone: formData.patientFamily.phone ?? '',
        email: formData.patientFamily.email ?? '',
        relationship: getRelationShipValue(value) ?? 1,
      },
    }

    console.log('Data will be sent:', updatedData)

    await userProfileStore
      .updatePatientFamilyProfile(updatedData)
      .then(() => {
        notify({
          title: t('auth.success'),
          message: t('auth.updated_patient_family_successfully'),
          color: 'success',
        })
        getUserDetail()
        console.log('Data sent successfully' + updatedData)
      })
      .catch((error) => {
        const message = getErrorMessage(error)
        notify({
          title: t('auth.error'),
          message: message,
          color: 'danger',
        })
      })
  }
}

// const medicalHistoryModal = ref<any>({
// isUpdateMedicalHistory: true,
//   medicalHistory: {
//     medicalname: [],
//     note: '',
//   },
// })
// submit Medical History
const submitMedicalHistory = async () => {
  if (validate()) {
    // Cập nhật medicalName từ selectedMedicalItems trước khi submit
    updateMedicalName()

    // Đảm bảo medicalName là một mảng
    const medicalNames = formData.medicalHistory?.medicalName || []

    // Kiểm tra lại sau khi đã cập nhật
    if (medicalNames.length === 0) {
      notify({
        title: t('auth.error'),
        message: t('auth.medical_name_required'),
        color: 'danger',
      })
      return
    }

    const updatedMedicalData: MedicalHistoryUpdate = {
      patientProfileId: userProfileStore?.userDetails?.patientProfile?.id || '',
      isUpdateMedicalHistory: true,
      medicalHistory: {
        medicalName: medicalNames, // Sử dụng mảng đã kiểm tra
        note: formData.medicalHistory?.note || '',
      },
    }

    try {
      await userProfileStore.updateMedicalHistory(updatedMedicalData)
      notify({
        title: t('auth.success'),
        message: t('settings.medical_history_updated_successfully'),
        color: 'success',
      })
      getUserDetail()
    } catch (error) {
      const message = getErrorMessage(error)
      notify({
        title: t('auth.error'),
        message: message,
        color: 'danger',
      })
    }
  }
}

// const PatientProfileModal = ref<any>({
//   patientProfileId: '',
//   isUpdatePatientProfile: true,
//   PatientProfile: {
//     userId : '',
//     idCardNumber: '',
//     occupation: '',
//   },
// })
// submit Patient Profile
const submitPatientProfile = async () => {
  if (validate()) {
    const userId = userProfileStore?.userDetails?.id

    if (!userId) {
      notify({
        title: t('auth.error'),
        message: 'User ID not found',
        color: 'danger',
      })
      return
    }

    // Lấy ID của patient profile t bng patient profile
    const patientProfileId = userProfileStore?.userDetails?.patientProfile?.id

    const updatePatientProfiledData: PatientProfileUpdate = {
      patientProfileId: patientProfileId || '', // ID từ bảng patient profile
      isUpdatePatientProfile: true,
      Patientprofile: {
        id: patientProfileId || '', // ID từ bảng patient profile
        userId: userId, // ID của user
        idCardNumber: formData.PatientProfile.idCardNumber || '',
        occupation: formData.PatientProfile.occupation || '',
      },
    }
    await userProfileStore
      .updatePatientProfile(updatePatientProfiledData)
      .then(() => {
        notify({
          title: t('auth.success'),
          message: t('auth.updated_patient_profile_successfully'),
          color: 'success',
        })
        getUserDetail()
      })
      .catch((error) => {
        const message = getErrorMessage(error)
        notify({
          title: t('auth.error'),
          message: message,
          color: 'danger',
        })
      })
  }
}
const submitChangePassword = async () => {
  if (validateChangePassword()) {
    const passwordDetailData: PasswordDetailFormData = {
      password: formDataChangePassword.password,
      confirmNewPassword: formDataChangePassword.confirmNewPassword,
      newPassword: formDataChangePassword.newPassword,
    }

    await userProfileStore
      .changePassword(passwordDetailData)
      .then(() => {
        notify({
          title: t('auth.success'),
          message: t('auth.change_password_successfully'),
          color: 'success',
        })
      })
      .catch((error) => {
        const message = getErrorMessage(error)
        notify({
          title: t('auth.error'),
          message: message,
          color: 'danger',
        })
      })
      .finally(() => {
        resetChangePassword()
      })
  }
}

const submitChangeEmail = async () => {
  const changeEmailData: ChangeEmailFormData = {
    password: formDataChangeEmail.password,
    email: formDataChangeEmail.email,
  }

  await userProfileStore
    .changeEmail(changeEmailData)
    .then(() => {
      notify({
        title: t('auth.success'),
        message: t('auth.change_email_successfully'),
        color: 'success',
      })
      getUserDetail()
    })
    .catch((error) => {
      const message = getErrorMessage(error)
      notify({
        title: t('auth.error'),
        message: message,
        color: 'danger',
      })
    })
    .finally(() => {
      resetChangeEmail()
      isShowModal.value.email = false
    })
}

let interval: any = null

const startTimer = () => {
  interval = setInterval(() => {
    if (OTPTime.value > 0) {
      OTPTime.value -= 1
    } else {
      clearInterval(interval)
    }
  }, 1000)
}

watch(OTPTime, (newVal) => {
  if (newVal === 0 && interval) {
    clearInterval(interval)
  }
})

const submitChangePhone = async () => {
  const changePhoneData: ChangePhoneNumberFormData = {
    phoneNumber: formDataChangePhoneNumber.phoneNumber,
    password: formDataChangePhoneNumber.password,
  }

  await userProfileStore
    .changePhone(changePhoneData)
    .then(() => {
      notify({
        title: t('auth.success'),
        message: t('auth.otp_code_sent'),
        color: 'success',
      })
      isShowChangePhoneOTP.value = true
      OTPTime.value = OTP.TimeOut
      if (interval) {
        clearInterval(interval)
      }
      startTimer()
      getUserDetail()
    })
    .catch((error) => {
      const message = getErrorMessage(error)
      notify({
        title: t('auth.error'),
        message: message,
        color: 'danger',
      })
    })
}

const validateAvatar = (file: any) => {
  if (file.size > 5 * 1024 * 1024) return false
  return true
}

const handleFileAdded = (files: any) => {
  if (files[0]) {
    fileUploaded.value = files[0]
    if (!validateAvatar(files[0])) {
      notify({
        message: t('auth.file_too_big'),
        color: '#e2eafa',
      })
    } else {
      const formDataAvatar = new FormData()
      formDataAvatar.append('Image', files[0])
      uploadAvatar(formDataAvatar)
    }
  }
}

const uploadAvatar = async (formDataAvatar: FormData) => {
  await userProfileStore
    .uploadAvatar(formDataAvatar)
    .then(() => {
      notify({
        title: t('auth.success'),
        message: t('auth.change_avatar_successfully'),
        color: 'success',
      })
      getUserDetail()
    })
    .catch((error) => {
      const message = getErrorMessage(error)
      notify({
        title: t('auth.error'),
        message: message,
        color: 'danger',
      })
    })
}

const getSrcAvatar = () => {
  const url = import.meta.env.VITE_APP_BASE_URL as string
  const url_without_api = url.slice(0, -3)
  if (formData?.imageUrl) return `${url_without_api}${formData?.imageUrl}`
  return ''
}

const handleRemoveAvatar = async () => {
  const formDataRemoveAvatar = new FormData()
  formDataRemoveAvatar.append('DeleteCurrentImage', 'true')
  await userProfileStore
    .removeAvatar(formDataRemoveAvatar)
    .then(() => {
      notify({
        title: t('auth.success'),
        message: t('auth.remove_avatar_successfully'),
        color: 'success',
      })
      getUserDetail()
      authStores.updateAvatarUrl(undefined)
    })
    .catch((error) => {
      const message = getErrorMessage(error)
      notify({
        title: t('auth.error'),
        message: message,
        color: 'danger',
      })
    })
}

const handleCancelChangePhone = () => {
  isShowModal.value.phoneNumber = false
  isShowChangePhoneOTP.value = false
  if (interval) {
    clearInterval(interval)
  }
  resetChangePhone()
  resetChangePhoneOTP()
}

const submitChangePhoneOTP = async () => {
  await userProfileStore
    .getOTPConfirmation(formDataChangePhoneOTP?.otpCode)
    .then(() => {
      notify({
        title: t('auth.success'),
        message: t('auth.phone_confirmed_successfully'),
        color: 'success',
      })
      getUserDetail()
    })
    .catch((error) => {
      const message = getErrorMessage(error)
      notify({
        title: t('auth.error'),
        message: message,
        color: 'danger',
      })
    })
    .finally(() => {
      resetChangePhoneOTP()
      handleCancelChangePhone()
      resetChangePhone()
    })
}

const verifyPhoneNumber = async () => {
  await userProfileStore
    .sendPhoneOTPCode()
    .then(() => {
      notify({
        title: t('auth.success'),
        message: t('auth.otp_code_sent_verify'),
        color: 'success',
      })
      isShowModal.value.phoneNumber = true
      isShowChangePhoneOTP.value = true
      OTPTime.value = OTP.TimeOut
      if (interval) {
        clearInterval(interval)
      }
      startTimer()
    })
    .catch((error) => {
      const message = getErrorMessage(error)
      notify({
        title: t('auth.error'),
        message: message,
        color: 'danger',
      })
    })
}

const verifyEmail = async () => {
  await userProfileStore
    .sendVerifyEmail()
    .then(() => {
      notify({
        title: t('auth.success'),
        message: t('auth.check_email_verify'),
        color: 'success',
      })
    })
    .catch((error) => {
      const message = getErrorMessage(error)
      notify({
        title: t('auth.error'),
        message: message,
        color: 'danger',
      })
    })
}

// Constants for checkboxes
const medicalHistoryOptions = [
  { value: 'Gingivitis', text: t('auth.gingivitis') }, // Viêm nướu
  { value: 'Periodontitis', text: t('auth.periodontitis') }, // Viêm nha chu
  { value: 'Gum_Recession', text: t('auth.gum_recession') }, // Tụt nướu
  { value: 'Bleeding_Gums', text: t('auth.bleeding_gums') }, // Chảy máu nướu
  { value: 'Gum_Abscess', text: t('auth.gum_abscess') }, // Áp xe nướu

  // Bệnh về răng
  { value: 'Dental_Caries', text: t('auth.dental_caries') }, // Sâu răng
  { value: 'Tooth_Decay', text: t('auth.tooth_decay') }, // Mục răng
  { value: 'Tooth_Abscess', text: t('auth.tooth_abscess') }, // Áp xe răng
  { value: 'Tooth_Sensitivity', text: t('auth.tooth_sensitivity') }, // Ê buốt răng
  { value: 'Cracked_Tooth', text: t('auth.cracked_tooth') }, // Răng nứt
  { value: 'Broken_Tooth', text: t('auth.broken_tooth') }, // Răng vỡ
  { value: 'Tooth_Erosion', text: t('auth.tooth_erosion') }, // Mòn răng
  { value: 'Tooth_Wear', text: t('auth.tooth_wear') }, // Mài mòn răng
  { value: 'Tooth_Discoloration', text: t('auth.tooth_discoloration') }, // Đổi màu răng
  { value: 'Tooth_Loss', text: t('auth.tooth_loss') }, // Mất răng

  // Bệnh về tủy răng
  { value: 'Pulpitis', text: t('auth.pulpitis') }, // Viêm tủy
  { value: 'Root_Canal_Infection', text: t('auth.root_canal_infection') }, // Nhiễm trùng ống tủy
  { value: 'Dental_Pulp_Necrosis', text: t('auth.dental_pulp_necrosis') }, // Hoại tử tủy răng
  { value: 'Periapical_Abscess', text: t('auth.periapical_abscess') }, // Áp xe chân răng
  { value: 'Dental_Granuloma', text: t('auth.dental_granuloma') }, // U hạt răng

  // Bệnh về khớp cắn
  { value: 'Malocclusion', text: t('auth.malocclusion') }, // Sai khớp cắn
  { value: 'Crossbite', text: t('auth.crossbite') }, // Cắn chéo
  { value: 'Overbite', text: t('auth.overbite') }, // Cắn sâu
  { value: 'Underbite', text: t('auth.underbite') }, // Cắn ngược
  { value: 'Open_Bite', text: t('auth.open_bite') }, // Cắn hở

  // Bệnh về khớp thái dương hàm
  { value: 'TMJ_Disorders', text: t('auth.tmj_disorders') }, // Rối loạn khớp thái dương hàm
  { value: 'Bruxism', text: t('auth.bruxism') }, // Nghiến răng
  { value: 'Jaw_Pain', text: t('auth.jaw_pain') }, // Đau hàm
  { value: 'Clicking_Jaw', text: t('auth.clicking_jaw') }, // Hàm kêu lục cục
  { value: 'Limited_Jaw_Movement', text: t('auth.limited_jaw_movement') }, // Hạn chế vận động hàm

  // Bệnh về niêm mạc miệng
  { value: 'Oral_Thrush', text: t('auth.oral_thrush') }, // Nhiễm nấm miệng
  { value: 'Oral_Ulcers', text: t('auth.oral_ulcers') }, // Loét miệng
  { value: 'Oral_Lichen_Planus', text: t('auth.oral_lichen_planus') }, // Bệnh lichen phẳng miệng
  { value: 'Leukoplakia', text: t('auth.leukoplakia') }, // Bạch sản
  { value: 'Oral_Cancer', text: t('auth.oral_cancer') }, // Ung thư miệng

  // Bệnh về răng mọc
  { value: 'Impacted_Teeth', text: t('auth.impacted_teeth') }, // Răng mọc ngầm
  { value: 'Wisdom_Teeth_Problems', text: t('auth.wisdom_teeth_problems') }, // Vấn đề răng khôn
  { value: 'Dental_Crowding', text: t('auth.dental_crowding') }, // Chen chúc răng
  { value: 'Tooth_Eruption_Issues', text: t('auth.tooth_eruption_issues') }, // Rối loạn mọc răng
  { value: 'Supernumerary_Teeth', text: t('auth.supernumerary_teeth') }, // Răng thừa

  // Bệnh về xương hàm
  { value: 'Jaw_Bone_Loss', text: t('auth.jaw_bone_loss') }, // Tiêu xương hàm
  { value: 'Osteonecrosis', text: t('auth.osteonecrosis') }, // Hoại tử xương hàm
  { value: 'Jaw_Cysts', text: t('auth.jaw_cysts') }, // U nang xương hàm
  { value: 'Jaw_Tumors', text: t('auth.jaw_tumors') }, // U xương hàm
  { value: 'Jaw_Fractures', text: t('auth.jaw_fractures') }, // Gãy xương hàm

  // Các vấn đề khác
  { value: 'Bad_Breath', text: t('auth.bad_breath') }, // Hôi miệng
  { value: 'Dry_Mouth', text: t('auth.dry_mouth') }, // Khô miệng
  { value: 'Teeth_Grinding', text: t('auth.teeth_grinding') }, // Nghiến răng
  { value: 'Geographic_Tongue', text: t('auth.geographic_tongue') }, // Lưỡi địa lý
  { value: 'Burning_Mouth_Syndrome', text: t('auth.burning_mouth_syndrome') }, // Hội chứng bỏng rát miệng
]

const workingTypeOptions = [
  { text: t('auth.full_time'), value: WorkingType.FullTime },
  { text: t('auth.part_time'), value: WorkingType.PartTime },
  { text: t('auth.none'), value: WorkingType.None },
]

// Add handler for certification image upload
const handleCertificationImageUpload = async (files: VaFile[]) => {
  if (!files || files.length === 0) return

  const formDataUpload = new FormData()
  files.forEach((file: any) => {
    formDataUpload.append('CertificationImages', file)
  })

  try {
    // Upload certification images
    const response = await userProfileStore.uploadCertificationImages(formDataUpload)
    // Update the certificationImage array with the returned URLs
    if (response && response.data && formData.doctorProfile) {
      formData.doctorProfile.certificationImage = response.data
    }
    notify({
      title: t('auth.success'),
      message: t('auth.certification_images_uploaded'),
      color: 'success',
    })
  } catch (error) {
    const message = getErrorMessage(error)
    notify({
      title: t('auth.error'),
      message: message,
      color: 'danger',
    })
  }
}

const certificationFiles = ref<VaFile[]>([])
</script>

<template>
  <VaInnerLoading :loading="userProfileStore?.isLoading" class="z-50">
    <div :class="{ 'max-w-6xl mx-auto p-10': isPatient && !isMobile }">
      <VaCard v-if="isShowProfile" class="p-2 ml-1 rounded">
        <div class="mt-3 mb-10 flex items-center gap-5">
          <div>
            <VaBadge v-if="formData?.imageUrl" color="danger" overlap placement="top-right" :offset="[-7, 7]">
              <template #text>
                <span class="cursor-pointer" @click="isShowModal.removeAvatar = !isShowModal.removeAvatar">X</span>
              </template>
              <VaModal
                v-model="isShowModal.removeAvatar"
                :ok-text="t('auth.remove')"
                size="small"
                :child-ok-button="{ size: 'small' }"
                :child-cancel-button="{ size: 'small' }"
                @ok="handleRemoveAvatar"
              >
                <p class="text-lg">{{ t('auth.confirm_remove_avatar') }}</p>
              </VaModal>
              <VaAvatar :src="getSrcAvatar()" size="large" />
            </VaBadge>
            <VaAvatar v-if="!formData?.imageUrl" color="warning" size="large" class="font-bold">{{
              shortNameLetter
            }}</VaAvatar>
          </div>
          <div class="relative">
            <VaFileUpload
              class="opacity-0 absolute top-0 left-0 w-full h-full z-10 inset-0"
              type="single"
              :file-types="typesImage"
              @fileAdded="handleFileAdded"
            />
            <VaButton class="flex items-center" preset="secondary" border-color="primary" size="small">
              <VaIcon name="upload" class="mr-2" />
              {{ t('auth.upload') }}
            </VaButton>
          </div>
        </div>
        <VaForm ref="form" @submit.prevent="submit">
          <div class="grid md:grid-cols-2 gap-4 p-3">
            <VaField>
              <VaInput
                v-model="formData.firstName"
                :label="t('auth.first_name')"
                class="mb-3"
                :rules="[(v: any) => !!v || t('auth.first_name_required')]"
                :placeholder="t('auth.enter_first_name')"
              />
            </VaField>

            <VaField>
              <VaInput
                v-model="formData.lastName"
                :label="t('auth.last_name')"
                class="mb-3"
                :rules="[(v: any) => !!v || t('auth.last_name_required')]"
                :placeholder="t('auth.enter_last_name')"
              />
            </VaField>

            <VaField>
              <VaDateInput
                v-model="formData.dob"
                :rules="[(v: any) => !!v || t('auth.birth_date_required')]"
                class="mb-3"
                :label="t('auth.birth_date')"
                :placeholder="t('auth.enter_birth_date')"
              />
            </VaField>
            <VaField>
              <label class="block uppercase text-primary font-bold" style="font-size: 0.57rem">{{
                t('auth.gender')
              }}</label>
              <VaRadio
                v-model="formData.gender"
                :rules="[(v: null | undefined) => (v !== null && v !== undefined) || t('auth.gender_required')]"
                class="mb-3"
                value-by="value"
                name="gender"
                :label="t('auth.choose_gender')"
                :options="genderOptions"
              />
            </VaField>
            <VaField>
              <VaInput
                v-model="formData.phoneNumber"
                :placeholder="t('auth.enter_phone_number')"
                class="mb-3"
                readonly
                preset="solid"
                :label="t('auth.phone_number')"
              >
                <template #messages>
                  <div class="flex justify-between">
                    <p
                      v-if="!userProfileStore?.userDetails?.phoneNumberConfirmed"
                      class="font-semibold text-xs text-orange-500 cursor-pointer mt-1"
                      @click="verifyPhoneNumber"
                    >
                      {{ t('auth.verify_phone_number') }}
                    </p>
                    <p
                      class="font-semibold text-xs text-primary cursor-pointer mt-1"
                      @click="isShowModal.phoneNumber = !isShowModal.phoneNumber"
                    >
                      {{ t('auth.change_phone_number') }}
                    </p>
                  </div>
                </template>
              </VaInput>
            </VaField>

            <VaField>
              <VaInput
                v-model="formData.email"
                :placeholder="t('auth.enter_email')"
                readonly
                preset="solid"
                class="mb-3"
                :label="t('auth.email')"
                type="email"
              >
                <template #messages>
                  <div class="flex justify-between">
                    <p
                      v-if="!userProfileStore?.userDetails?.emailConfirmed"
                      class="font-semibold text-xs text-orange-500 cursor-pointer mt-1"
                      @click="verifyEmail"
                    >
                      {{ t('auth.verify_email') }}
                    </p>
                    <p
                      class="font-semibold text-xs text-primary cursor-pointer mt-1"
                      @click="isShowModal.email = !isShowModal.email"
                    >
                      {{ t('auth.change_email') }}
                    </p>
                  </div>
                </template>
              </VaInput>
            </VaField>
            <!--phần test thử của Tuấn -->
            <VaField>
              <VaInput
                v-model="formData.address"
                :label="t('auth.Address')"
                class="mb-3"
                :placeholder="t('auth.enter_address')"
              />
              <AddressAutocomplete :rules="[(v: any) => !!v || t('auth.address_required')]" />
            </VaField>
            <VaField>
              <VaInput v-model="formData.job" :label="t('auth.Job')" class="mb-3" :placeholder="t('auth.enter_job')" />
            </VaField>

            <!--kết phần test thử của Tuấn -->
          </div>
          <div class="flex justify-end">
            <VaButton class="w-fit rounded mb-3" :disabled="isDisabledButtonUpdateProfile" @click="submit">
              {{ t('auth.update') }}
            </VaButton>
          </div>
        </VaForm>
      </VaCard>

      <!-- Hiển thị form thông tin doctor khi id === 3 -->
      <!-- Tab Doctor Fields -->
      <VaCard v-if="isShowDoctorProfile" class="p-2 ml-1 rounded">
        <VaForm ref="form" @submit.prevent="submitDoctorProfile">
          <div class="grid md:grid-cols-2 gap-4">
            <VaField>
              <VaInput
                v-model="formData.doctorProfile.education"
                :label="t('auth.education')"
                class="mb-3"
                :placeholder="t('auth.enter_education')"
              />
            </VaField>
            <VaField>
              <VaInput
                v-model="formData.doctorProfile.college"
                :label="t('auth.college')"
                class="mb-3"
                :placeholder="t('auth.enter_college')"
              />
            </VaField>
            <VaField>
              <VaInput
                v-model="formData.doctorProfile.certification"
                :label="t('auth.certification')"
                class="mb-3"
                :placeholder="t('auth.enter_certification')"
              />
            </VaField>
            <VaField>
              <VaInput
                v-model="formData.doctorProfile.yearOfExp"
                type="number"
                :label="t('auth.year_of_experience')"
                class="mb-3"
                :placeholder="t('auth.enter_year_of_experience')"
              />
            </VaField>
            <VaField>
              <VaInput
                v-model="formData.doctorProfile.seftDescription"
                :label="t('auth.self_description')"
                class="mb-3"
                :placeholder="t('auth.enter_self_description')"
                textarea
              />
            </VaField>
            <VaField>
              <VaSelect
                v-model="formData.doctorProfile.workingType"
                :label="t('auth.working_type')"
                class="mb-3"
                :placeholder="t('auth.choose_working_type')"
                :options="workingTypeOptions"
                text-by="text"
                value-by="value"
                clearable
              />
            </VaField>
            <VaField>
              <VaFileUpload
                v-model="certificationFiles"
                :label="t('auth.certification_images')"
                class="mb-3"
                multiple
                :placeholder="t('auth.upload_certification_images')"
                @change="handleCertificationImageUpload"
              />
            </VaField>
          </div>

          <div class="flex justify-end">
            <VaButton
              class="w-fit rounded mb-3"
              :disabled="isDisabledButtonChangeDoctorProfile"
              @click="submitDoctorProfile"
            >
              {{ t('auth.update') }}
            </VaButton>
          </div>
        </VaForm>
      </VaCard>

      <!-- Hiển thị form thông tin patienFamily khi id === 4 -->
      <!-- Tab patientFamily Fields -->
      <VaCard v-if="isShowPatientFamily" class="p-2 ml-1 rounded">
        <VaForm ref="form" @submit.prevent="submitPatientFamily">
          <div class="grid md:grid-cols-2 gap-4">
            <VaField>
              <VaInput
                v-model="formData.patientFamily.name"
                :label="t('auth.name')"
                class="mb-3"
                :placeholder="t('auth.enter_name')"
              />
            </VaField>
            <VaField>
              <VaInput
                v-model="formData.patientFamily.phone"
                :label="t('auth.phone')"
                class="mb-3"
                :placeholder="t('auth.enter_phone')"
              />
            </VaField>
            <VaField>
              <VaInput
                v-model="formData.patientFamily.email"
                :label="t('auth.email')"
                class="mb-3"
                :placeholder="t('auth.enter_email')"
              />
            </VaField>
            <VaField>
              <VaSelect
                v-model="formData.patientFamily.relationship"
                :label="t('auth.relationship')"
                class="mb-3"
                :placeholder="t('auth.choose_relationship')"
                :options="relationshipOptions"
                text-by="text"
                clearable
              />
            </VaField>
          </div>

          <div class="flex justify-end">
            <VaButton
              class="w-fit rounded mb-3"
              :disabled="isDisabledButtonChangePatientFamily"
              @click="submitPatientFamily"
            >
              {{ t('auth.update') }}
            </VaButton>
          </div>
        </VaForm>
      </VaCard>
      <!-- Hiển th form thông tin patienFamily khi id === 5 -->
      <!-- Tab MedicalHistory Fields -->
      <VaCard v-if="isShowMedicalHistory" class="p-2 ml-1 rounded">
        <VaForm ref="form" @submit.prevent="submitMedicalHistory">
          <div class="p-4">
            <h3 class="text-lg font-semibold mb-4">{{ t('auth.please_check_items') }}</h3>

            <div class="grid grid-cols-2 gap-4 mb-4">
              <div v-for="option in medicalHistoryOptions" :key="option.value">
                <VaCheckbox
                  v-model="selectedMedicalItems[option.value]"
                  :label="option.text"
                  @change="updateMedicalName"
                />
              </div>
            </div>

            <VaField>
              <VaInput
                v-model="formData.medicalHistory.note"
                :label="t('auth.family_history')"
                class="mb-3"
                :placeholder="t('auth.enter_family_history')"
                textarea
              />
            </VaField>

            <div class="flex justify-end">
              <VaButton
                class="w-fit rounded mb-3"
                :disabled="isDisabledButtonChangeMedicalHistory"
                @click="submitMedicalHistory"
              >
                {{ t('auth.update') }}
              </VaButton>
            </div>
          </div>
        </VaForm>
      </VaCard>
      <!-- Hiển thị form thông tin patienFamily khi id === 6 -->
      <!-- Tab PatientProfile Fields -->
      <VaCard v-if="isShowPatientProfile" class="p-2 ml-1 rounded">
        <VaForm ref="form" @submit.prevent="submitPatientProfile">
          <div class="grid md:grid-cols-2 gap-4">
            <VaField>
              <VaInput
                v-model="formData.PatientProfile.idCardNumber"
                :label="t('auth.id_card_number')"
                class="mb-3"
                :placeholder="t('auth.enter_id_card_number')"
              />
            </VaField>
            <VaField>
              <VaInput
                v-model="formData.PatientProfile.occupation"
                :label="t('auth.occupation')"
                class="mb-3"
                :placeholder="t('auth.enter_occupation')"
              />
            </VaField>
          </div>

          <div class="flex justify-end">
            <VaButton
              class="w-fit rounded mb-3"
              :disabled="isDisabledButtonChangePatientProfile"
              @click="submitPatientProfile"
            >
              {{ t('auth.update') }}
            </VaButton>
          </div>
        </VaForm>
      </VaCard>
      <!--Form change password-->
      <VaCard
        v-if="
          !isShowProfile &&
          !isShowDoctorProfile &&
          !isShowPatientFamily &&
          !isShowMedicalHistory &&
          !isShowPatientProfile
        "
        class="p-2 ml-1 rounded"
      >
        <VaForm ref="formChangePassword" class="mt-4" @submit.prevent="submitChangePassword">
          <div class="grid md:grid-cols-3 gap-4">
            <VaField>
              <VaValue v-slot="isPasswordVisible" :default-value="false">
                <VaInput
                  v-model="formDataChangePassword.password"
                  :rules="passwordRules"
                  :type="isPasswordVisible.value ? 'text' : 'password'"
                  class="mb-4"
                  :label="t('auth.current_password')"
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
            </VaField>

            <VaField>
              <VaValue v-slot="isPasswordVisible" :default-value="false">
                <VaInput
                  ref="password1"
                  v-model="formDataChangePassword.newPassword"
                  :rules="passwordRules"
                  :type="isPasswordVisible.value ? 'text' : 'password'"
                  class="mb-4"
                  :label="t('auth.new_password')"
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
            </VaField>
            <VaField>
              <VaValue v-slot="isPasswordVisible" :default-value="false">
                <VaInput
                  ref="password2"
                  v-model="formDataChangePassword.confirmNewPassword"
                  :rules="[
                    (v: any) => !!v || t('auth.confirm_password_required'),
                    (v: string) => v === formDataChangePassword.newPassword || t('auth.passwords_dont_match'),
                  ]"
                  :type="isPasswordVisible.value ? 'text' : 'password'"
                  class="mb-4"
                  :label="t('auth.confirm_new_password')"
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
            </VaField>
          </div>
          <div class="flex justify-end">
            <VaButton
              class="w-fit rounded mb-3"
              :disabled="isDisabledButtonChangePassword"
              @click="submitChangePassword"
            >
              {{ t('auth.update') }}
            </VaButton>
          </div>
        </VaForm>
      </VaCard>

      <VaModal v-model="isShowModal.email" hide-default-actions size="small">
        <h3 class="va-h3 text-center">{{ t('auth.email') }}</h3>
        <VaForm ref="formChangeEmail" @submit.prevent="submitChangeEmail">
          <VaField>
            <VaInput
              v-model="formDataChangeEmail.email"
              :placeholder="t('auth.enter_new_email')"
              :rules="emailRules"
              class="mb-3"
              :label="t('auth.email')"
              type="email"
            />
          </VaField>
          <VaField>
            <VaValue v-slot="isPasswordVisible" :default-value="false">
              <VaInput
                v-model="formDataChangeEmail.password"
                :rules="passwordRules"
                :type="isPasswordVisible.value ? 'text' : 'password'"
                class="mb-4"
                :placeholder="t('auth.enter_password')"
                :label="t('auth.password')"
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
          </VaField>
          <VaButton class="w-full rounded mb-3" :disabled="isDisabledButtonChangeEmail" @click="submitChangeEmail">
            {{ t('auth.confirm') }}
          </VaButton>
          <p class="text-primary text-sm text-start cursor-pointer" @click="isShowModal.email = false">
            &#60; {{ t('auth.back') }}
          </p>
        </VaForm>
      </VaModal>
      <VaModal v-model="isShowModal.phoneNumber" hide-default-actions size="small">
        <h3 class="va-h3 text-center">
          {{ isShowChangePhoneOTP ? t('auth.otp_confirmation') : t('auth.change_phone_number') }}
        </h3>
        <VaForm v-if="!isShowChangePhoneOTP" ref="formChangePhone" @submit.prevent="submitChangePhone">
          <VaField>
            <VaInput
              v-model="formDataChangePhoneNumber.phoneNumber"
              :placeholder="t('auth.enter_new_phone_number')"
              :rules="phoneNumberRules"
              class="mb-3"
              :label="t('auth.new_phone_number')"
            />
          </VaField>
          <VaField>
            <VaValue v-slot="isPasswordVisible" :default-value="false">
              <VaInput
                v-model="formDataChangePhoneNumber.password"
                :rules="passwordRules"
                :type="isPasswordVisible.value ? 'text' : 'password'"
                class="mb-4"
                :placeholder="t('auth.enter_password')"
                :label="t('auth.password')"
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
          </VaField>
          <VaButton
            class="w-full rounded mb-3"
            :disabled="isDisabledButtonChangePhoneNumber"
            @click="submitChangePhone"
          >
            {{ t('auth.confirm') }}
          </VaButton>
          <p class="text-primary text-sm text-start cursor-pointer" @click="handleCancelChangePhone">
            &#60; {{ t('auth.back') }}
          </p>
        </VaForm>
        <VaForm v-if="isShowChangePhoneOTP" ref="formChangePhoneOTP" @submit.prevent="submitChangePhoneOTP">
          <VaField>
            <VaInput
              v-model="formDataChangePhoneOTP.otpCode"
              :placeholder="t('auth.enter_otp_code')"
              :rules="phoneOtpRules"
              class="mb-3"
              :label="t('auth.otp_code')"
            />
          </VaField>

          <p class="text-primary text-sm text-start">
            <span v-if="OTPTime !== 0" class="mr-2">{{ t('auth.remaining') }} {{ OTPTime }}s</span>
            <span v-if="OTPTime === 0" class="cursor-pointer" @click="verifyPhoneNumber"
              >&#11118; {{ t('auth.resend') }}</span
            >
          </p>
          <VaButton
            class="w-full rounded mb-3"
            :disabled="isDisabledButtonChangePhoneOTP"
            @click="submitChangePhoneOTP"
          >
            {{ t('auth.confirm') }}
          </VaButton>
          <p class="text-primary text-sm text-start cursor-pointer" @click="handleCancelChangePhone">
            &#60; {{ t('auth.back') }}
          </p>
        </VaForm>
      </VaModal>
      <VaModal v-model="isShowModal.email" hide-default-actions size="small">
        <h3 class="va-h3 text-center">{{ t('auth.email') }}</h3>
        <VaForm ref="formChangeEmail" @submit.prevent="submitChangeEmail">
          <VaField>
            <VaInput
              v-model="formDataChangeEmail.email"
              :placeholder="t('auth.enter_new_email')"
              :rules="emailRules"
              class="mb-3"
              :label="t('auth.email')"
              type="email"
            />
          </VaField>
          <VaField>
            <VaValue v-slot="isPasswordVisible" :default-value="false">
              <VaInput
                v-model="formDataChangeEmail.password"
                :rules="passwordRules"
                :type="isPasswordVisible.value ? 'text' : 'password'"
                class="mb-4"
                :placeholder="t('auth.enter_password')"
                :label="t('auth.password')"
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
          </VaField>
          <VaButton class="w-full rounded mb-3" :disabled="isDisabledButtonChangeEmail" @click="submitChangeEmail">
            {{ t('auth.confirm') }}
          </VaButton>
          <p class="text-primary text-sm text-start cursor-pointer" @click="isShowModal.email = false">
            &#60; {{ t('auth.back') }}
          </p>
        </VaForm>
      </VaModal>
      <VaModal v-model="isShowModal.phoneNumber" hide-default-actions size="small">
        <h3 class="va-h3 text-center">
          {{ isShowChangePhoneOTP ? t('auth.otp_confirmation') : t('auth.change_phone_number') }}
        </h3>
        <VaForm v-if="!isShowChangePhoneOTP" ref="formChangePhone" @submit.prevent="submitChangePhone">
          <VaField>
            <VaInput
              v-model="formDataChangePhoneNumber.phoneNumber"
              :placeholder="t('auth.enter_new_phone_number')"
              :rules="phoneNumberRules"
              class="mb-3"
              :label="t('auth.new_phone_number')"
            />
          </VaField>
          <VaField>
            <VaValue v-slot="isPasswordVisible" :default-value="false">
              <VaInput
                v-model="formDataChangePhoneNumber.password"
                :rules="passwordRules"
                :type="isPasswordVisible.value ? 'text' : 'password'"
                class="mb-4"
                :placeholder="t('auth.enter_password')"
                :label="t('auth.password')"
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
          </VaField>
          <VaButton
            class="w-full rounded mb-3"
            :disabled="isDisabledButtonChangePhoneNumber"
            @click="submitChangePhone"
          >
            {{ t('auth.confirm') }}
          </VaButton>
          <p class="text-primary text-sm text-start cursor-pointer" @click="handleCancelChangePhone">
            &#60; {{ t('auth.back') }}
          </p>
        </VaForm>
        <VaForm v-if="isShowChangePhoneOTP" ref="formChangePhoneOTP" @submit.prevent="submitChangePhoneOTP">
          <VaField>
            <VaInput
              v-model="formDataChangePhoneOTP.otpCode"
              :placeholder="t('auth.enter_otp_code')"
              :rules="phoneOtpRules"
              class="mb-3"
              :label="t('auth.otp_code')"
            />
          </VaField>

          <p class="text-primary text-sm text-start">
            <span v-if="OTPTime !== 0" class="mr-2">{{ t('auth.remaining') }} {{ OTPTime }}s</span>
            <span v-if="OTPTime === 0" class="cursor-pointer" @click="verifyPhoneNumber"
              >&#11118; {{ t('auth.resend') }}</span
            >
          </p>
          <VaButton
            class="w-full rounded mb-3"
            :disabled="isDisabledButtonChangePhoneOTP"
            @click="submitChangePhoneOTP"
          >
            {{ t('auth.confirm') }}
          </VaButton>
          <p class="text-primary text-sm text-start cursor-pointer" @click="handleCancelChangePhone">
            &#60; {{ t('auth.back') }}
          </p>
        </VaForm>
      </VaModal>
    </div>
  </VaInnerLoading>
</template>
