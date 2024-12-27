import {
  ChangeEmailFormData,
  ChangePhoneNumberFormData,
  FilterUser,
  PasswordDetailFormData,
  UserDetail,
  UserDetailsUpdate,
  ListUserPagination,
  DoctorDetailsUpdate,
  PatientFamilyUpdate,
  MedicalHistoryUpdate,
  PatientProfileUpdate,
} from '@/pages/user/types'
import { defineStore } from 'pinia'
import userService from '@services/user.service'
import { useAuthStore } from './auth.module'

export const useUserProfileStore = defineStore('userProfile', {
  state: () => ({
    id: '' as string,
    userList: {} as ListUserPagination,
    userDetails: {} as UserDetail,
    isLoading: false as boolean,
    patientList: [] as any[],
  }),
  actions: {
    async getUserProfile(): Promise<any> {
      try {
        this.isLoading = true
        const response = await userService.getUserProfile()
        this.isLoading = false
        this.userDetails = { ...response?.data }
        useAuthStore().setUserDetails({ ...response?.data })
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async updateProfile(data: UserDetailsUpdate): Promise<any> {
      try {
        this.isLoading = true
        const response = await userService.updateProfile(data)
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async changePassword(data: PasswordDetailFormData): Promise<any> {
      try {
        this.isLoading = true
        const response = await userService.changePassword(data)
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async sendPhoneOTPCode(): Promise<any> {
      try {
        this.isLoading = true
        const response = await userService.sendPhoneOTPCode()
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async changeEmail(data: ChangeEmailFormData): Promise<any> {
      try {
        this.isLoading = true
        const response = await userService.changeEmail(data)
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async changePhone(data: ChangePhoneNumberFormData): Promise<any> {
      try {
        this.isLoading = true
        const response = await userService.changePhone(data)
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async uploadAvatar(data: FormData): Promise<any> {
      try {
        this.isLoading = true
        const response = await userService.uploadAvatar(data)
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async removeAvatar(data: FormData): Promise<any> {
      try {
        this.isLoading = true
        const response = await userService.removeAvatar(data)
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async getOTPConfirmation(data: string): Promise<any> {
      try {
        this.isLoading = true
        const response = await userService.getOTPConfirmation(data)
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async sendVerifyEmail(): Promise<any> {
      try {
        this.isLoading = true
        const response = await userService.sendVerifyEmail()
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async getUserDetail(id: string): Promise<UserDetail> {
      return await userService
        .getUserDetail(id)
        .then((response) => {
          return Promise.resolve(response)
        })
        .catch((error) => {
          return Promise.reject(error)
        })
    },
    async getUsers(filter: FilterUser): Promise<ListUserPagination> {
      try {
        this.isLoading = true
        const response = await userService.getAllUsers(filter)
        this.isLoading = false
        this.userList = response
        return await Promise.resolve(this.userList)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },

    //doctor
    async updateDoctorProfile(data: DoctorDetailsUpdate): Promise<any> {
      try {
        this.isLoading = true
        const response = await userService.updateDoctorProfile(data) // Thay đổi để gọi API riêng cho doctor
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },

    // update patient family profile
    async updatePatientFamilyProfile(data: PatientFamilyUpdate): Promise<any> {
      try {
        this.isLoading = true
        const response = await userService.updatePatientFamilyProfile(data) // Thay đổi để gọi API riêng cho patient family
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },

    // update medical history
    async updateMedicalHistory(data: MedicalHistoryUpdate): Promise<any> {
      try {
        this.isLoading = true
        const response = await userService.updateMedicalHistory(data) // Thay đổi để gọi API riêng cho medical history
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },

    // update patient profile
    async updatePatientProfile(data: PatientProfileUpdate): Promise<any> {
      try {
        this.isLoading = true
        const response = await userService.updatePatientProfile(data) // Thay đổi để gọi API riêng cho patient
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async getPatients(data: any): Promise<any> {
      try {
        this.isLoading = true
        const response = await userService.getPatients(data)
        this.patientList = response.data
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },

    async getAllPatients(filter: FilterUser): Promise<ListUserPagination> {
      try {
        this.isLoading = true
        const response = await userService.getAllPatients(filter)
        this.isLoading = false
        console.log('API Response:', response) // Log the response
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async getAllStaff(filter: FilterUser): Promise<ListUserPagination> {
      try {
        this.isLoading = true
        const response = await userService.getAllStaff(filter)
        this.isLoading = false
        console.log('API Response:', response) // Log the response
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },

    async getAllDoctors(): Promise<any> {
      try {
        this.isLoading = true
        const response = await userService.getAllDoctors()
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },

    async updateTreatmentPlanDetail(data: { appointmentID: string; message: string; rating: number }): Promise<any> {
      try {
        this.isLoading = true
        const response = await userService.updateTreatmentPlanDetail(data) // Gọi API để cập nhật kế hoạch điều trị
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },

    async updateFeedbackDetail(data: { feedbackID: string; message: string; rating: number }): Promise<any> {
      try {
        this.isLoading = true
        const response = await userService.updateFeedbackDetail(data) // Gọi API để cập nhật phản hồi
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },

    async uploadCertificationImages(data: FormData): Promise<any> {
      try {
        this.isLoading = true
        const response = await userService.uploadCertificationImages(data)
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
  },
})
