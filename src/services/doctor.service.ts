import {
  DoctorDetail,
  DoctorDetailsUpdate,
  FilterDoctor,
  // DoctorDetailFormData,
} from '@/pages/user/types'
import apiService from '@services/api.service'

class DoctorService {
  async getDoctorProfile(): Promise<any> {
    return apiService
      .get(`/doctor/profile`)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }

  async updateProfile(data: DoctorDetailsUpdate): Promise<any> {
    return apiService
      .put(`/doctor/profile`, data)
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
      .put(`/doctor/update-avatar`, data, {
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
      .put(`/doctor/update-avatar`, data, {
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

  async getDoctorDetail(id: string): Promise<DoctorDetail> {
    return apiService
      .get(`/doctors/${id}`)
      .then((response) => {
        return Promise.resolve(response.data)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }

  async getAllDoctors(filter: FilterDoctor): Promise<any> {
    return apiService
      .post(`/doctors/get-doctors`, filter)
      .then((response) => {
        return Promise.resolve(response.data)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
}

export default new DoctorService()
