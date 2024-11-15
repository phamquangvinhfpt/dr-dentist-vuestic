import apiService from './api.service'

class DoctorService {
  async getDoctors(data: any): Promise<any> {
    return apiService
      .post(`/users/get-doctors`, data)
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        console.error('Service error:', error)
        return Promise.reject(error)
      })
  }

  async getTopDoctors(): Promise<any> {
    return apiService
      .get(`/users/get-top-doctors`)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }

  async getAvailableTime(data: any): Promise<any> {
    return apiService
      .post(`/calendar/available-time`, data)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }

  async getDoctorDetail(id: string): Promise<any> {
    return apiService
      .get(`/users/${id}`)
      .then((response) => {
        return Promise.resolve(response.data)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }

  async createDoctor(doctorData: {
    request: {
      firstName: string
      lastName: string
      email: string
      isMale: boolean
      birthDay: string
      userName: string
      password: string
      confirmPassword: string
      phoneNumber: string
      job: string
      address: string
      doctorProfile: {
        doctorID: string
        education: string
        college: string
        certification: string
        yearOfExp: string
        seftDescription: string
      }
      role: string
    }
  }): Promise<any> {
    return apiService
      .post('/users/create-user', doctorData.request)
      .then((response) => Promise.resolve(response.data))
      .catch((error) => Promise.reject(error))
  }
}

export default new DoctorService()
