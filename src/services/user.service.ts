import {
  ChangeEmailFormData,
  ChangePhoneNumberFormData,
  DoctorDetailsUpdate,
  FilterUser,
  MedicalHistoryUpdate,
  PasswordDetailFormData,
  PatientFamilyUpdate,
  PatientProfileUpdate,
  UserDetail,
  UserDetailsUpdate,
} from '@/pages/user/types'
import apiService from '@services/api.service'

class UserService {
  async getUserProfile(): Promise<any> {
    return apiService
      .get(`/personal/profile`)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }

  async updateProfile(data: UserDetailsUpdate): Promise<any> {
    return apiService
      .put(`/personal/profile`, data)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }

  async changePassword(data: PasswordDetailFormData): Promise<any> {
    return apiService
      .put(`/personal/update-password`, data)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }

  async changeEmail(data: ChangeEmailFormData): Promise<any> {
    return apiService
      .put(`/personal/update-email`, data)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }

  async changePhone(data: ChangePhoneNumberFormData): Promise<any> {
    return apiService
      .put(`/personal/update-phone`, data)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }

  async sendPhoneOTPCode(): Promise<any> {
    return apiService
      .get(`/users/resend-phone-number-code`)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }

  async uploadAvatar(data: FormData): Promise<any> {
    const axiosInstance = apiService.getAxiosInstance()
    return axiosInstance
      .put(`/personal/update-avatar`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }

  async removeAvatar(data: FormData): Promise<any> {
    const axiosInstance = apiService.getAxiosInstance()
    return axiosInstance
      .put(`/personal/update-avatar`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }

  async getOTPConfirmation(data: string): Promise<any> {
    return apiService
      .get(`/users/confirm-phone-number?code=${data}`)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }

  async sendVerifyEmail(): Promise<any> {
    return apiService
      .get(`/users/resend-email-confirm`)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }

  async getUserDetail(id: string): Promise<UserDetail> {
    return apiService
      .get(`/users/${id}`)
      .then((response) => {
        return Promise.resolve(response.data)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }

  async getAllUsers(filter: FilterUser): Promise<any> {
    return apiService
      .post(`/users/get-users`, filter)
      .then((response) => {
        return Promise.resolve(response.data)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }

  // update doctor profile
  async updateDoctorProfile(data: DoctorDetailsUpdate): Promise<any> {
    return apiService
      .put(`/personal/update-doctor-profile`, data)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }

  // update patient family profile
  async updatePatientFamilyProfile(data: PatientFamilyUpdate): Promise<any> {
    return apiService
      .put(`/personal/patient/update-profile`, data)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }

  // update medical history
  async updateMedicalHistory(data: MedicalHistoryUpdate): Promise<any> {
    return apiService
      .put(`/personal/patient/update-profile`, data)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }

  // update patient profile
  async updatePatientProfile(data: PatientProfileUpdate): Promise<any> {
    return apiService
      .put(`/personal/patient/update-profile`, data)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }

  async getPatients(data: any): Promise<any> {
    return apiService
      .post(`/users/get-patients`, data)
      .then((response) => {
        return Promise.resolve(response.data)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
}
export default new UserService()
